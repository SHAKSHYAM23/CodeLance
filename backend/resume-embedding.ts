import { Queue } from 'bullmq';
import prisma from './src/lib/prisma';
import { bullRedisOptions } from './src/lib/redis';

const embeddingQueue = new Queue('embedding-queue', { connection: bullRedisOptions });
const TARGET_DOCUMENT_ID = 'cmr1usxet0002obco3f2a6ron';

async function resume() {
  console.log('Checking for un-embedded chunks...');

  const remainingChunks = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Chunk"
    WHERE "documentId" = ${TARGET_DOCUMENT_ID} AND "embedding" IS NULL
  `;

  if (!remainingChunks || remainingChunks.length === 0) {
    console.log('All chunks are already embedded!');
    process.exit(0);
  }

  console.log(`Found ${remainingChunks.length} remaining chunks. Re-queuing...`);

  const batchSize = 50;
  for (let i = 0; i < remainingChunks.length; i += batchSize) {
    const batchIds = remainingChunks.slice(i, i + batchSize).map((c) => c.id);
    await embeddingQueue.add('embedding-job', {
      documentId: TARGET_DOCUMENT_ID,
      chunkIds: batchIds,
    });
  }

  console.log('Queuing complete. Ready to process.');
  process.exit(0);
}

resume().catch((err) => {
  console.error(err);
  process.exit(1);
});