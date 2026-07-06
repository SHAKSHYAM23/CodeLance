import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import logger from '../lib/logger';
import { RetrievedChunk } from './retriever';
import { ChatTurn } from './queryRewriter';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
model: 'gemini-2.5-flash',
  systemInstruction: `You are an expert senior developer analyzing a GitHub repository codebase.
You will be given relevant code chunks retrieved from the repository and a question about the code.

RULES:
- Always explain HOW things work, not just WHERE they are
- Mention specific function names, line numbers, and values from the code
- Explain design decisions visible in the code
- Mention error handling and precautions present in the code
- If the information is not in the provided chunks, say so honestly — never guess
- Always cite which file and function answered each point
- Format your answer in clear markdown with code blocks where relevant

ANSWER STYLE:
- Be direct and technical
- Lead with the most important finding
- Use bullet points for multiple related items
- Include actual code snippets when they add clarity`,
});

function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      const meta = chunk.metadata;
      const location = meta?.functionName
        ? `${meta.fileName} → ${meta.functionName} (lines ${meta.startLine}-${meta.endLine})`
        : `${meta?.fileName} (lines ${meta?.startLine}-${meta?.endLine})`;

      return `[CHUNK ${index + 1}] ${location}\n\`\`\`\n${chunk.content}\n\`\`\``;
    })
    .join('\n\n');
}

export async function generateAnswer(
  question: string,
  chunks: RetrievedChunk[],
  history: ChatTurn[]
): Promise<string> {
  try {
    const context = buildContext(chunks);

    
    const contents: Content[] = [];

  
    const recentHistory = history.slice(-3);
    recentHistory.forEach((turn) => {
      contents.push({
        role: 'user',
        parts: [{ text: turn.question }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: turn.answer }], 
      });
    });


    const currentPrompt = `Retrieved code chunks:\n${context}\n\nQuestion: ${question}`;
    contents.push({
      role: 'user',
      parts: [{ text: currentPrompt }],
    });

    const result = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.2,
      },
    });

    const answer = result.response.text().trim();

    if (!answer) throw new Error('Empty response from Gemini');

    return answer;
  } catch (err: any) {
    logger.error('LLM answer generation failed', { error: err?.message });
    throw err;
  }
}