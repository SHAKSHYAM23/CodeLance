import { Queue } from 'bullmq';
import { bullRedisOptions } from '../lib/redis';
import logger from '../lib/logger';

export interface EmbeddingJob {
  documentId: string;
  chunkIds: string[];
}

export const embeddingQueue = new Queue<EmbeddingJob>('embedding-queue', {
  connection: bullRedisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: true,
    removeOnFail: 50,
  },
});

logger.info('Embedding queue initialized');