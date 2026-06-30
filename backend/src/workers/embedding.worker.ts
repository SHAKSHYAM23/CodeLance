import { Worker, Job } from 'bullmq';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { bullRedisOptions } from '../lib/redis';
import { embedTextBatch } from '../services/embedder';

export interface EmbeddingJob {
  documentId: string;
  chunkIds: string[];
}

async function processEmbedding(job: Job<EmbeddingJob>): Promise<void> {
  const { documentId, chunkIds } = job.data;

  logger.info('Embedding job started', { documentId, batchSize: chunkIds.length });

  try {
    const chunks = await prisma.chunk.findMany({
      where: { id: { in: chunkIds } },
      select: { id: true, content: true },
    });

    if (chunks.length === 0) {
      logger.warn('No chunks found for IDs', { documentId, chunkIds });
      return;
    }

    const textsToEmbed = chunks.map((c) => c.content);
    const embeddings = await embedTextBatch(textsToEmbed);

    await prisma.$transaction(
      chunks.map((chunk, index) => {
        const vectorString = `[${embeddings[index].join(',')}]`;

        return prisma.$executeRaw`
          UPDATE "Chunk"
          SET
            "embedding" = ${vectorString}::vector,
            "contentTsv" = to_tsvector('english', ${chunk.content})
          WHERE "id" = ${chunk.id}
        `;
      })
    );

    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        embeddedChunks: { increment: chunks.length },
      },
      select: { totalChunks: true, embeddedChunks: true },
    });

    logger.info('Batch embedded successfully', {
      documentId,
      progress: `${document.embeddedChunks}/${document.totalChunks}`,
    });

 
    if (document.embeddedChunks >= document.totalChunks) {
      logger.info('All chunks embedded, finalizing document', { documentId });

      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'READY' },
      });

    }

  } catch (err: any) {
    logger.error('Embedding job failed', {
      documentId,
      error: err?.message,
    });

    throw err;
  }
}

export const embeddingWorker = new Worker<EmbeddingJob>(
  'embedding-queue',
  processEmbedding,
  {
    connection: bullRedisOptions,
    concurrency: 3,
    limiter: {
      max: 14,
      duration: 60000,
    },
  }
);

embeddingWorker.on('completed', (job) => {
  logger.debug('Embedding batch completed', { jobId: job.id });
});

embeddingWorker.on('failed', (job, err) => {
  logger.error('Embedding job failed permanently', {
    jobId: job?.id,
    error: err.message,
  });
});
