import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../lib/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
model: 'gemini-3.1-flash-lite',
  systemInstruction: `You are a search query rewriter for a code search system.
Your job is to rewrite follow-up questions into standalone search queries.

RULES:
- If the question is already self-contained, return it unchanged
- If the question references prior context ("it", "that", "why not", "how about"), rewrite it into a complete standalone query
- Return ONLY the rewritten query — no explanation, no punctuation, no quotes
- Maximum 15 words
- Focus on technical terms that will match code

EXAMPLES:
History: Q="What database is used?" A="PostgreSQL via Prisma"
Follow-up: "Why not MongoDB?"
Output: reasons PostgreSQL was chosen over MongoDB in this codebase

History: Q="How does auth work?" A="JWT tokens verified in middleware"
Follow-up: "Where is that middleware?"
Output: JWT authentication middleware file location and implementation

History: Q="What is the main entry point?" A="src/index.ts"
Follow-up: "Show me what it imports"
Output: imports and dependencies in src/index.ts entry point`,
});

export interface ChatTurn {
  question: string;
  answer: string;
}

export async function rewriteQuery(
  question: string,
  history: ChatTurn[]
): Promise<string> {
  if (history.length === 0) {
    return question;
  }

  const referenceWords = ['it', 'that', 'this', 'they', 'them', 'there',
    'why', 'how about', 'what about', 'and', 'also', 'too', 'instead'];

  const referencePattern = new RegExp(`\\b(${referenceWords.join('|')})\\b`, 'i');

  if (!referencePattern.test(question)) {
    return question;
  }


  try {
    // Build history context — last 3 turns max
    const recentHistory = history.slice(-3);
    const historyText = recentHistory
      .map((turn) => `Q: ${turn.question}\nA: ${turn.answer.slice(0, 200)}`)
      .join('\n\n');

    const prompt = `Conversation history:\n${historyText}\n\nFollow-up question: ${question}\n\nRewritten query:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.1,
      },
    });

    const rewritten = result.response.text().trim();

    if (!rewritten || rewritten.length === 0) return question;

    logger.debug('Query rewritten', { original: question, rewritten });

    return rewritten;
  } catch (err: any) {
    // On failure — return original question, never block the pipeline
    logger.warn('Query rewrite failed, using original', { error: err?.message });
    return question;
  }
}