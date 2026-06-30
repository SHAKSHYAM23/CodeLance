import { Redis as UpstashRedis } from '@upstash/redis';
import logger from './logger';

// Upstash — for cache and rate limiting 
export const upstash = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

logger.info('Upstash Redis client initialized');

// Redis Cloud connection options — for BullMQ queues
// BullMQ creates its own ioredis instance internally using these options
export const bullRedisOptions = {
  host: process.env.REDIS_CLOUD_HOST!,
  port: parseInt(process.env.REDIS_CLOUD_PORT || '6379'),
  password: process.env.REDIS_CLOUD_PASSWORD!,
  maxRetriesPerRequest: null as null,
  enableReadyCheck: false,
};