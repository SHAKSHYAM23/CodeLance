import { Queue } from 'bullmq';
import { bullRedisOptions } from '../lib/redis';
import logger from '../lib/logger';

export interface IngestionJob {
  documentId: string;
  githubUrl: string;
  userId: string;
}

export const ingestionQueue = new Queue<IngestionJob>('ingestion-queue', {
  connection: bullRedisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: 50,
  },
});

logger.info('Ingestion queue initialized');