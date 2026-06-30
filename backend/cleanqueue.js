require('dotenv').config();
const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_CLOUD_HOST,
  port: parseInt(process.env.REDIS_CLOUD_PORT || '6379'),
  password: process.env.REDIS_CLOUD_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

async function clean() {
  const ingestion = new Queue('ingestion-queue', { connection });
  const embedding = new Queue('embedding-queue', { connection });
  await ingestion.obliterate({ force: true });
  await embedding.obliterate({ force: true });
  console.log('All queues cleared');
  process.exit(0);
}

clean().catch(console.error);