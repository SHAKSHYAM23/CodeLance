import prisma from './src/lib/prisma';
import logger from './src/lib/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;
const TARGET_DOCUMENT_ID = 'cmr1usxet0002obco3f2a6ron';
const DELAY_BETWEEN_CALLS_MS = 4000; // 4 seconds between each single call

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedOne(text: string): Promise<number[]> {
  const response = await fetch(EMBED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text }], role: 'user' },
      taskType: 'RETRIEVAL_DOCUMENT',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  const data = await response.json() as { embedding: { values: number[] } };
  return data.embedding.values;
}

async function run() {
  console.log('Fetching remaining un-embedded chunks...');

  const remaining = await prisma.$queryRaw<{ id: string; content: string }[]>`
    SELECT id, content FROM "Chunk"
    WHERE "documentId" = ${TARGET_DOCUMENT_ID} AND "embedding" IS NULL
  `;

  console.log(`Found ${remaining.length} chunks to embed one by one.`);

  let success = 0;
  let failed = 0;

  for (const chunk of remaining) {
    try {
      const vector = await embedOne(chunk.content);
      const vectorString = `[${vector.join(',')}]`;

      await prisma.$executeRaw`
        UPDATE "Chunk"
        SET
          "embedding" = ${vectorString}::vector,
          "contentTsv" = to_tsvector('english', ${chunk.content})
        WHERE "id" = ${chunk.id}
      `;

      success++;
      console.log(`[${success}/${remaining.length}] Embedded chunk ${chunk.id}`);

      await prisma.document.update({
        where: { id: TARGET_DOCUMENT_ID },
        data: { embeddedChunks: { increment: 1 } },
      });

    } catch (err: any) {
      failed++;
      console.log(`FAILED chunk ${chunk.id}: ${err.message.slice(0, 150)}`);
    }

    // Wait between each call regardless of success/failure
    await sleep(DELAY_BETWEEN_CALLS_MS);
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);

  // Check if fully complete now
  const doc = await prisma.document.findUnique({
    where: { id: TARGET_DOCUMENT_ID },
    select: { totalChunks: true, embeddedChunks: true },
  });

  console.log(`Progress: ${doc?.embeddedChunks}/${doc?.totalChunks}`);

  if (doc && doc.embeddedChunks >= doc.totalChunks) {
    await prisma.document.update({
      where: { id: TARGET_DOCUMENT_ID },
      data: { status: 'READY' },
    });
    console.log('Document marked READY - fully embedded!');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});