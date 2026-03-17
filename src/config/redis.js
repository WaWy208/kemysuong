const Redis = require('ioredis');
const env = require('./env');

let redisClient = null;

function getRedis() {
  if (!env.redisUrl) return null;
  if (redisClient) return redisClient;
  redisClient = new Redis(env.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
  redisClient.connect().catch(() => {
    redisClient = null;
  });
  return redisClient;
}

module.exports = { getRedis };
