import { Worker, Job } from 'bullmq';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { bullRedisOptions } from '../lib/redis';
import { ingestionDuration } from '../lib/metrics';
import { fetchRepoFiles } from '../services/zipFetcher';
import { parseFile } from '../services/codeParser';
import { buildChunks } from '../services/chunker';
import { embeddingQueue } from '../queues/embedding.queue';
import { IngestionJob } from '../queues/ingestion.queue';
import { generateSummary } from '../services/summarizer';

const BATCH_INSERT_SIZE = 50;
const EMBEDDING_BATCH = 100;

async function processIngestion(job: Job<IngestionJob>): Promise<void> {
  const { documentId, githubUrl } = job.data;
  const startTime = Date.now();

  logger.info('Ingestion job started', { documentId, githubUrl });

  try {

    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FETCHING' },
    });
    await job.updateProgress(10);

    // Step 2 — PARSING
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PARSING' },
    });

    let totalFiles = 0;
    const allChunkIds: string[] = [];
    let pendingChunks: { content: string; metadata: any; documentId: string }[] = [];

    async function flushChunks(): Promise<void> {
      if (pendingChunks.length === 0) return;

      const inserted = await prisma.chunk.createManyAndReturn({
        data: pendingChunks.map((chunk) => ({
          content:    chunk.content,
          metadata:   chunk.metadata,
          documentId: chunk.documentId,
        })),
        select: { id: true },
      });

      inserted.forEach((c) => allChunkIds.push(c.id));
      pendingChunks = [];
    }

    for await (const file of fetchRepoFiles(githubUrl)) {
      totalFiles++;

      const parsedChunks = parseFile(file.content, file.language, file.fileName);
      const dbChunks     = buildChunks(parsedChunks, file.fileName, file.language, documentId);

      pendingChunks.push(...dbChunks);

      if (pendingChunks.length >= BATCH_INSERT_SIZE) {
        await flushChunks();
      }

      await job.updateProgress(Math.min(10 + totalFiles * 2, 70));
    }

    await flushChunks();

    logger.info('Parsing complete', {
      documentId,
      totalFiles,
      totalChunks: allChunkIds.length,
    });

   
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status:      'EMBEDDING',
        totalFiles,
        totalChunks: allChunkIds.length,
      },
    });
    await job.updateProgress(75);

    
    generateSummary(documentId).catch((err) => {
      logger.error('Early summary generation failed', {
        documentId,
        error: err?.message,
      });
    });


    for (let i = 0; i < allChunkIds.length; i += EMBEDDING_BATCH) {
      const batch = allChunkIds.slice(i, i + EMBEDDING_BATCH);
      await embeddingQueue.add(
        `embed-${documentId}-${i}`,
        { documentId, chunkIds: batch },
        { jobId: `embed-${documentId}-${i}` }
      );
    }

    await job.updateProgress(100);

    const duration = (Date.now() - startTime) / 1000;
    ingestionDuration.observe(duration);

    logger.info('Ingestion complete', {
      documentId,
      totalFiles,
      totalChunks: allChunkIds.length,
      duration,
    });

  } catch (err: any) {
    logger.error('Ingestion job failed', {
      documentId,
      error: err?.message,
      stack: err?.stack,
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    });

    throw err;
  }
}

export const ingestionWorker = new Worker<IngestionJob>(
  'ingestion-queue',
  processIngestion,
  {
    connection: bullRedisOptions,
    concurrency: 1,
  }
);

ingestionWorker.on('completed', (job) => {
  logger.info('Ingestion job completed', { jobId: job.id });
});

ingestionWorker.on('failed', (job, err) => {
  logger.error('Ingestion job failed permanently', {
    jobId: job?.id,
    error: err.message,
  });
});
