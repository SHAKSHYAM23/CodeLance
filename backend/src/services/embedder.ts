import logger from '../lib/logger';

import { embeddingRequests } from '../lib/metrics';



const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${GEMINI_API_KEY}`;

const QUERY_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;



const MAX_RETRIES = 3;



async function sleep(ms: number): Promise<void> {

  return new Promise((resolve) => setTimeout(resolve, ms));

}



export async function embedTextBatch(texts: string[]): Promise<number[][]> {

  let attempt = 0;



  const requests = texts.map((text) => ({

    model: 'models/gemini-embedding-001',

    content: { parts: [{ text }], role: 'user' },

    taskType: 'RETRIEVAL_DOCUMENT',

  }));



  while (attempt < MAX_RETRIES) {

    try {

      const response = await fetch(EMBED_URL, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ requests }),

      });



      if (!response.ok) {

        const error = await response.text();

        throw new Error(`HTTP ${response.status}: ${error}`);

      }



      const data = await response.json() as { embeddings: { values: number[] }[] };

      embeddingRequests.inc({ status: 'success' }, texts.length);

      return data.embeddings.map((e) => e.values);



    } catch (err: any) {

      attempt++;

     



      let delayMs = 2000 * attempt;

     

      if (err?.message?.includes('429')) {

         const retryMatch = err.message.match(/retry in (\d+\.?\d*)s/i);

         if (retryMatch) {

         

            delayMs = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;

         } else {

           

            delayMs = 30000;

         }

      }



      logger.warn('Batch embedding attempt failed', {

        attempt,

        delayMs,

        error: err?.message,

        batchSize: texts.length

      });



      if (attempt < MAX_RETRIES) {

        await sleep(delayMs);

      }

    }

  }



  embeddingRequests.inc({ status: 'failure' }, texts.length);

  throw new Error(`Failed to embed batch of ${texts.length} chunks after ${MAX_RETRIES} attempts.`);

}



export async function embedQuery(text: string): Promise<number[]> {

  let attempt = 0;



  while (attempt < MAX_RETRIES) {

    try {

      const response = await fetch(QUERY_URL, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          model: 'models/gemini-embedding-001',

          content: { parts: [{ text }], role: 'user' },

          taskType: 'RETRIEVAL_QUERY',

        }),

      });



      if (!response.ok) {

        const error = await response.text();

        throw new Error(`HTTP ${response.status}: ${error}`);

      }



      const data = await response.json() as { embedding: { values: number[] } };

      return data.embedding.values;



    } catch (err: any) {

      attempt++;

     



      let delayMs = 1000 * attempt;

     

      if (err?.message?.includes('429')) {

         const retryMatch = err.message.match(/retry in (\d+\.?\d*)s/i);

         if (retryMatch) {

            delayMs = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;

         } else {

            delayMs = 30000;

         }

      }



      logger.warn('Query embedding attempt failed', {

        attempt,

        delayMs,

        error: err?.message,

      });



      if (attempt < MAX_RETRIES) {

        await sleep(delayMs);

      }

    }

  }



  throw new Error('Failed to embed query after all retries.');

} 

