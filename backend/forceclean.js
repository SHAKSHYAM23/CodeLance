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
  const q = new Queue('embedding-queue', { connection });
  await q.obliterate({ force: true });
  console.log('DONE - Queue fully obliterated');
  process.exit(0);
}
clean();
