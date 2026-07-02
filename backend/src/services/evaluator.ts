import logger from '../lib/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
// UPDATE: Replaced the deprecated 1.5 model with Gemini 2.5 Flash
const GENERATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const DELAY_BEFORE_START_MS = 5000;   // wait after agent finishes before starting RAGAS
const DELAY_BETWEEN_CALLS_MS = 4000;  // wait between each of the 3 RAGAS calls

export interface RAGASScore {
  faithfulness:     number;
  answerRelevancy:  number;
  contextPrecision: number;
  overall:          number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(GENERATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 100, temperature: 0 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`RAGAS call failed: HTTP ${response.status} - ${errText.slice(0, 300)}`);
  }

  const data = await response.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('RAGAS call returned empty text');
  return text;
}

// UPDATE: Implemented Exponential Backoff with Jitter
async function callGeminiWithExponentialBackoff(prompt: string, maxRetries = 4): Promise<string> {
  const baseDelay = 2000; // Start with a 2-second delay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callGemini(prompt);
    } catch (err: any) {
      if (attempt === maxRetries) throw err; // Exhausted retries

      const isRateLimitOrServerErr = err?.message?.includes('429') || err?.message?.includes('503') || err?.message?.includes('500');
      
      // If the error is a 400 Bad Request, retrying won't fix it. Fail fast.
      if (!isRateLimitOrServerErr && !err?.message?.includes('fetch failed')) {
        throw err;
      }

      // Calculate exponential delay: 2s, 4s, 8s, 16s...
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      
      // Add random jitter (up to 1 second) to prevent synchronized retries
      const jitter = Math.random() * 1000;
      const delayMs = Math.round(exponentialDelay + jitter);

      logger.warn('RAGAS call failed, applying exponential backoff', {
        attempt: attempt + 1,
        delayMs,
        error: err?.message?.slice(0, 150),
      });
      
      await sleep(delayMs);
    }
  }
  throw new Error('RAGAS call exhausted retries');
}

// UPDATE: Added Regex to safely extract the score even if the LLM adds text
async function scoreFaithfulness(answer: string, context: string): Promise<number> {
  const prompt = `Score from 0.0 to 1.0: Does this answer contain ONLY information present in the context?
Penalize heavily for any claims not supported by the context.

Context: ${context.slice(0, 1500)}

Answer: ${answer.slice(0, 500)}

Return ONLY a decimal number between 0.0 and 1.0. Nothing else.`;

  const resultText = await callGeminiWithExponentialBackoff(prompt);
  const match = resultText.match(/0\.\d+|1\.0|1|0/);
  const score = match ? parseFloat(match[0]) : 0;
  return Math.min(1, Math.max(0, score));
}

// UPDATE: Added Regex to safely extract the score even if the LLM adds text
async function scoreAnswerRelevancy(question: string, answer: string): Promise<number> {
  const prompt = `Score from 0.0 to 1.0: How relevant is this answer to the question?
1.0 = perfectly answers the question
0.0 = completely irrelevant

Question: ${question}

Answer: ${answer.slice(0, 500)}

Return ONLY a decimal number between 0.0 and 1.0. Nothing else.`;

  const resultText = await callGeminiWithExponentialBackoff(prompt);
  const match = resultText.match(/0\.\d+|1\.0|1|0/);
  const score = match ? parseFloat(match[0]) : 0;
  return Math.min(1, Math.max(0, score));
}

// UPDATE: Added Regex to safely extract the score even if the LLM adds text
async function scoreContextPrecision(question: string, context: string): Promise<number> {
  const prompt = `Score from 0.0 to 1.0: How useful is this retrieved context for answering the question?
1.0 = perfectly relevant context
0.0 = completely irrelevant context

Question: ${question}

Retrieved Context: ${context.slice(0, 1500)}

Return ONLY a decimal number between 0.0 and 1.0. Nothing else.`;

  const resultText = await callGeminiWithExponentialBackoff(prompt);
  const match = resultText.match(/0\.\d+|1\.0|1|0/);
  const score = match ? parseFloat(match[0]) : 0;
  return Math.min(1, Math.max(0, score));
}

export async function evaluateRAG(
  question: string,
  answer:   string,
  sources:  { content: string }[]
): Promise<RAGASScore> {
  try {
    logger.debug('RAGAS waiting before start', { delayMs: DELAY_BEFORE_START_MS });
    await sleep(DELAY_BEFORE_START_MS);

    const context = sources.map((s) => s.content).join('\n\n');

    const faithfulness = await scoreFaithfulness(answer, context);
    await sleep(DELAY_BETWEEN_CALLS_MS);

    const answerRelevancy = await scoreAnswerRelevancy(question, answer);
    await sleep(DELAY_BETWEEN_CALLS_MS);

    const contextPrecision = await scoreContextPrecision(question, context);

    const overall = (
      faithfulness     * 0.4 +
      answerRelevancy  * 0.35 +
      contextPrecision * 0.25
    );

    const scores: RAGASScore = {
      faithfulness,
      answerRelevancy,
      contextPrecision,
      overall: parseFloat(overall.toFixed(3)),
    };

    logger.info('RAGAS evaluation complete', { question: question.slice(0, 50), scores });

    return scores;
  } catch (err: any) {
    logger.warn('RAGAS evaluation failed', { error: err?.message });
    return { faithfulness: 0, answerRelevancy: 0, contextPrecision: 0, overall: 0 };
  }
}