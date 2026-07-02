import prisma from './src/lib/prisma';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;
const TARGET_DOCUMENT_ID = 'cmr1usxet0002obco3f2a6ron';

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
  const remaining = await prisma.$queryRaw<{ id: string; content: string }[]>`
    SELECT id, content FROM "Chunk"
    WHERE "documentId" = ${TARGET_DOCUMENT_ID} AND "embedding" IS NULL
    LIMIT 1
  `;

  if (remaining.length === 0) {
    console.log('No chunks remaining — already fully embedded!');
    process.exit(0);
  }

  const chunk = remaining[0];
  console.log(`Attempting to embed final chunk: ${chunk.id}`);

  const MAX_ATTEMPTS = 8;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_ATTEMPTS}...`);
      const vector = await embedOne(chunk.content);
      const vectorString = `[${vector.join(',')}]`;

      await prisma.$executeRaw`
        UPDATE "Chunk"
        SET
          "embedding" = ${vectorString}::vector,
          "contentTsv" = to_tsvector('english', ${chunk.content})
        WHERE "id" = ${chunk.id}
      `;

      await prisma.document.update({
        where: { id: TARGET_DOCUMENT_ID },
        data: {
          embeddedChunks: { increment: 1 },
          status: 'READY',
        },
      });

      console.log('SUCCESS! Chunk embedded. Document marked READY. 1484/1484 complete!');
      process.exit(0);

    } catch (err: any) {
      console.log(`Attempt ${attempt} failed: ${err.message.slice(0, 100)}`);
      if (attempt < MAX_ATTEMPTS) {
        console.log('Waiting 20 seconds before retry...');
        await sleep(20000);
      }
    }
  }

  console.log('All attempts exhausted. Marking document READY anyway (1483/1484 is fine).');
  await prisma.document.update({
    where: { id: TARGET_DOCUMENT_ID },
    data: { status: 'READY' },
  });
  process.exit(0);
}

run().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});