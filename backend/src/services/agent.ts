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
        description: 'Search the codebase using semantic and keyword search. Use this for general questions about how something works, or to discover which files are relevant before reading them directly. Use SPECIFIC, multi-word queries — single generic words like "listen" return noisy, irrelevant results.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description: 'A specific, multi-word search query (e.g. "app.listen server creation" not just "listen")',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_function',
        description: 'Get the complete source code of a specific function by name. Only use this AFTER you have confirmed the exact file path via search_codebase or list_functions.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            functionName: {
              type: SchemaType.STRING,
              description: 'The exact name of the function to retrieve',
            },
            fileName: {
              type: SchemaType.STRING,
              description: 'The exact file path where the function is located, as confirmed by search_codebase',
            },
          },
          required: ['functionName', 'fileName'],
        },
      },
      {
        name: 'get_file',
        description: 'Get the complete contents of a specific file. Only use this AFTER you have confirmed the exact file path via search_codebase — never guess a file path.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            fileName: {
              type: SchemaType.STRING,
              description: 'The exact file path to retrieve, as confirmed by search_codebase',
            },
          },
          required: ['fileName'],
        },
      },
      {
        name: 'list_functions',
        description: 'List all functions in a specific file with their line numbers. Only use this AFTER you have confirmed the exact file path via search_codebase.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            fileName: {
              type: SchemaType.STRING,
              description: 'The exact file path to list functions from, as confirmed by search_codebase',
            },
          },
          required: ['fileName'],
        },
      },
    ],
  },
];

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  tools,
  systemInstruction: `You are an expert senior developer analyzing a GitHub repository codebase.
You have 4 tools to search and read code. Use them intelligently based on question complexity.

CRITICAL RULE — GROUNDING (MOST IMPORTANT):
- Your answer MUST be based STRICTLY on the code chunks you retrieved via tool calls in THIS conversation.
- NEVER use your own general/training knowledge about how a framework "typically" works, even if
  you recognize the library. Only describe what the retrieved code chunks actually show.
- If the retrieved chunks are insufficient to fully answer, explicitly say so: "Based on the
  retrieved code, I can confirm X, but I don't have enough retrieved context to explain Y in detail."
  Do NOT fill that gap with assumed/general knowledge.

CRITICAL RULE — SEARCH QUALITY:
- Your FIRST search_codebase query must be specific and multi-word (e.g. "app.listen server
  creation http" not just "listen"). Generic single-word queries return noisy, irrelevant chunks
  and hurt answer quality.
- search_codebase does semantic/keyword search on file CONTENT, not file paths.
  Do NOT try filters like "file:lib/x.js" in your query — this does not work.
- After ONE search_codebase call, look at the fileName values in the results' metadata.
  Use those exact fileName values directly with get_file or list_functions.
- Do NOT call search_codebase more than twice before trying get_file or list_functions
  with a file path you've already seen in results.

TOOL USAGE GUIDE:
- Simple factual question → 1 tool call (search_codebase)
- Specific function question → 1 specific search_codebase call to find the file, then get_function
- File overview → 1 search_codebase call, then list_functions, then get key functions
- Complex flow question → specific search_codebase call, then 2-3 targeted follow-up calls

RULES:
- Always explain HOW things work, not just WHERE they are, based on the actual retrieved code
- Mention specific function names, line numbers, and values FROM THE RETRIEVED CHUNKS
- Explain design decisions visible in the retrieved code
- Mention error handling and precautions present in the retrieved code
- If information not found in retrieved chunks: say so honestly, never guess or use general knowledge
- Always cite which file and function answered each point
- ALWAYS end your response with a clear, complete final answer in plain text —
  never end on a tool call or mid-reasoning sentence
- MAX 4 tool calls per question — be efficient, don't repeat similar searches`,
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
        if (!content) {
          return `Function "${args.functionName}" not found in "${args.fileName}". This file path may be incorrect — try search_codebase again to find the correct path.`;
        }
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
        if (!content) {
          return `File "${args.fileName}" not found. This file path may be incorrect — try search_codebase again to find the correct path (e.g. check for nested folders).`;
        }

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
        if (functions.length === 0) {
          return `No functions found in "${args.fileName}". This file path may be incorrect — try search_codebase again to find the correct path.`;
        }
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

    // DEBUG — log raw response structure when no candidate
    if (!result.response.candidates || result.response.candidates.length === 0) {
      logger.error('Empty candidates in Gemini response', {
        promptFeedback: result.response.promptFeedback,
        fullResponse: JSON.stringify(result.response).slice(0, 500),
      });
    }

    let iterations = 0;
    let hitMaxIterations = false;

 while (iterations < MAX_ITERATIONS) {
  const candidate = result.response.candidates?.[0];
  if (!candidate) break;

  const parts = candidate.content?.parts;
  if (!parts) {
    logger.warn('Candidate has no parts, breaking loop', { question });
    break;
  }

  const toolCalls = parts.filter((p: any) => p.functionCall);

  if (toolCalls.length === 0) break;
  

      iterations++;
      if (iterations >= MAX_ITERATIONS) hitMaxIterations = true;

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

      result = await withExponentialBackoff(() => chat.sendMessage(toolResults));
    }

    let finalParts = result.response.candidates?.[0]?.content?.parts || [];
    let finalText  = finalParts
      .filter((p: any) => p.text)
      .map((p: any) => p.text)
      .join('\n')
      .trim();

    // If we hit max iterations and the model is still trying to call tools,
    // force one more turn asking explicitly for a GROUNDED final answer only
    if (hitMaxIterations && !finalText) {
      logger.warn('Agent hit max iterations, forcing final answer', { question });
      try {
        const forcedResult = await withExponentialBackoff(() =>
          chat.sendMessage(
            'Based ONLY on the code chunks you have retrieved so far via tool calls, provide your ' +
            'best final answer now in plain text. Do NOT use any general knowledge about this ' +
            'framework beyond what you actually retrieved — if the retrieved chunks are insufficient ' +
            'to answer confidently, say so explicitly rather than guessing or filling gaps with ' +
            'assumed knowledge. Do not call any more tools.'
          )
        );
        const forcedParts = forcedResult.response.candidates?.[0]?.content?.parts || [];
        finalText = forcedParts
          .filter((p: any) => p.text)
          .map((p: any) => p.text)
          .join('\n')
          .trim();
      } catch (forceErr: any) {
        logger.warn('Forced final answer also failed', { error: forceErr?.message });
      }
    }

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