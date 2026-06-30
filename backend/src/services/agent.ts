import { GoogleGenerativeAI, Tool, SchemaType } from '@google/generative-ai';
import logger from '../lib/logger';
import { retrieve, getFunctionByName, getFileChunks, listFileFunctions, RetrievedChunk } from './retriever';
import { ChatTurn } from './queryRewriter';
import { generateAnswer } from './llm'; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 8000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota exceeded')) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        logger.warn(`[429 Rate Limit] Retrying in ${delay}ms`, { attempt, maxRetries });
        
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}


const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'search_codebase',
        description: 'Search the codebase using semantic and keyword search. Use this for general questions about how something works.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description: 'The search query to find relevant code chunks',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_function',
        description: 'Get the complete source code of a specific function by name. Use this when you know the exact function name.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            functionName: {
              type: SchemaType.STRING,
              description: 'The exact name of the function to retrieve',
            },
            fileName: {
              type: SchemaType.STRING,
              description: 'The file path where the function is located',
            },
          },
          required: ['functionName', 'fileName'],
        },
      },
      {
        name: 'get_file',
        description: 'Get the complete contents of a specific file. Use this when you need to see an entire file.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            fileName: {
              type: SchemaType.STRING,
              description: 'The file path to retrieve',
            },
          },
          required: ['fileName'],
        },
      },
      {
        name: 'list_functions',
        description: 'List all functions in a specific file with their line numbers. Use this to explore what a file contains before getting specific functions.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            fileName: {
              type: SchemaType.STRING,
              description: 'The file path to list functions from',
            },
          },
          required: ['fileName'],
        },
      },
    ],
  },
];

const model = genAI.getGenerativeModel({
  model:  'gemini-2.5-flash',
  tools,
  systemInstruction: `You are an expert senior developer analyzing a GitHub repository codebase.
You have 4 tools to search and read code. Use them intelligently based on question complexity.

TOOL USAGE GUIDE:
- Simple factual question → 1 tool call (search_codebase)
- Specific function question → get_function directly
- File overview → list_functions first, then get key functions
- Complex flow question → multiple tools to build complete picture

RULES:
- Always explain HOW things work, not just WHERE they are
- Mention specific function names, line numbers, and values
- Explain design decisions visible in the code
- Mention error handling and precautions present
- If information not found: say so honestly, never guess
- Always cite which file and function answered each point
- MAX 5 tool calls per question`,
});

export interface AgentStep {
  tool: string;
  input: Record<string, string>;
  resultSummary: string;
}

export interface AgentResult {
  answer: string;
  sources: RetrievedChunk[];
  agentSteps: AgentStep[];
}

async function executeTool(
  toolName: string,
  args: Record<string, string>,
  documentId: string,
  allSources: RetrievedChunk[]
): Promise<string> {
  try {
    switch (toolName) {
      case 'search_codebase': {
        const results = await retrieve(args.query, documentId);
        allSources.push(...results);
        if (results.length === 0) return 'No relevant code found for this query.';
        return results
          .map((r, i) => {
            const meta = r.metadata;
            const loc  = meta?.functionName
              ? `${meta.fileName} → ${meta.functionName} (lines ${meta.startLine}-${meta.endLine})`
              : `${meta?.fileName} (lines ${meta?.startLine}-${meta?.endLine})`;
            return `[${i + 1}] ${loc}\n\`\`\`\n${r.content}\n\`\`\``;
          })
          .join('\n\n');
      }

      case 'get_function': {
        const content = await getFunctionByName(
          args.functionName,
          args.fileName,
          documentId
        );
        if (!content) return `Function "${args.functionName}" not found in ${args.fileName}.`;
        allSources.push({
          id:       `fn-${args.functionName}`,
          content,
          metadata: { fileName: args.fileName, functionName: args.functionName },
          score:    1,
        });
        return `\`\`\`\n${content}\n\`\`\``;
      }

      case 'get_file': {
        const content = await getFileChunks(args.fileName, documentId);
        if (!content) return `File "${args.fileName}" not found.`;
        
        allSources.push({
          id:       `file-${args.fileName}`,
          content:  content.slice(0, 500),
          metadata: { fileName: args.fileName },
          score:    1,
        });

        const MAX_FILE_CHARS = 15000;
        if (content.length > MAX_FILE_CHARS) {
          logger.warn('File too large for agent, truncating', { fileName: args.fileName });
          const truncated = content.slice(0, MAX_FILE_CHARS);
          return `\`\`\`\n${truncated}\n\`\`\`\n\n...[FILE TRUNCATED FOR LENGTH. Use search_codebase or list_functions to explore further]`;
        }

        return `\`\`\`\n${content}\n\`\`\``;
      }

      case 'list_functions': {
        const functions = await listFileFunctions(args.fileName, documentId);
        if (functions.length === 0) return `No functions found in "${args.fileName}".`;
        return functions
          .map((f) => `- ${f.functionName} (lines ${f.startLine}-${f.endLine})`)
          .join('\n');
      }

      default:
        return `Unknown tool: ${toolName}`;
    }
  } catch (err: any) {
    logger.error('Tool execution failed', { toolName, args, error: err?.message });
    return `Tool "${toolName}" failed: ${err?.message}`;
  }
}

export async function runAgent(
  question: string,
  documentId: string,
  history: ChatTurn[]
): Promise<AgentResult> {
  const allSources: RetrievedChunk[] = [];
  const agentSteps: AgentStep[]      = [];
  const MAX_ITERATIONS               = 5;

  logger.info('Agent started', { question, documentId });

  try {
    const contents: any[] = history.slice(-3).flatMap((turn) => [
      { role: 'user',  parts: [{ text: turn.question }] },
      { role: 'model', parts: [{ text: turn.answer    }] },
    ]);

    contents.push({ role: 'user', parts: [{ text: question }] });

    const chat = model.startChat({ history: contents.slice(0, -1) });

  
    let result = await withExponentialBackoff(() => chat.sendMessage(question));
    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
      const candidate = result.response.candidates?.[0];
      if (!candidate) break;

      const parts = candidate.content.parts;
      const toolCalls = parts.filter((p: any) => p.functionCall);

      if (toolCalls.length === 0) break;

      iterations++;

      const toolResults: any[] = [];

      for (const part of toolCalls) {
  
        if (!part.functionCall) continue;
        
      const { name, args } = part.functionCall as { name: string; args: Record<string, string> };
        logger.debug('Agent tool call', { tool: name, args });

        const toolResult = await executeTool(name, args, documentId, allSources);

        agentSteps.push({
          tool:          name,
          input:         args,
          resultSummary: toolResult.slice(0, 150) + (toolResult.length > 150 ? '...' : ''),
        });

        toolResults.push({
          functionResponse: {
            name,
            response: { content: toolResult },
          },
        });
      }

      // --- UPDATED: Wrapped in backoff ---
      result = await withExponentialBackoff(() => chat.sendMessage(toolResults));
    }

    const finalParts = result.response.candidates?.[0]?.content?.parts || [];
    const finalText  = finalParts
      .filter((p: any) => p.text)
      .map((p: any) => p.text)
      .join('\n')
      .trim();

    if (!finalText && allSources.length > 0) {
      logger.warn('Agent produced no text, falling back to direct LLM');
      const fallbackAnswer = await generateAnswer(question, allSources, history);
      return { answer: fallbackAnswer, sources: allSources, agentSteps };
    }

    if (!finalText) {
      return {
        answer:     'I could not find relevant information in this repository to answer your question.',
        sources:    [],
        agentSteps,
      };
    }

    const uniqueSources = allSources.filter(
      (source, index, self) => index === self.findIndex((s) => s.id === source.id)
    );

    logger.info('Agent completed', {
      question,
      iterations,
      toolCallCount: agentSteps.length,
      sourceCount:   uniqueSources.length,
    });

    return { answer: finalText, sources: uniqueSources, agentSteps };

  } catch (err: any) {
    logger.error('Agent failed', { question, error: err?.message });
    throw err;
  }
}