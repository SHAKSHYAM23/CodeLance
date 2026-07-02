require('dotenv').config();
const { Redis } = require('@upstash/redis');
const upstash = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

async function clear() {
  const keys = await upstash.keys('chat:*');
  if (keys.length > 0) {
    await upstash.del(...keys);
    console.log(`Cleared ${keys.length} cached chat entries`);
  } else {
    console.log('No cached entries found');
  }
}
clear();