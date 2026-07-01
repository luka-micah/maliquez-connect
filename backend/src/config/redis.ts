import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<void> => {
  if (process.env.REDIS_URL) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    console.log('Redis Connected');
  }
};

export const getRedisClient = (): RedisClientType | null => redisClient;

export const cacheData = async (key: string, data: unknown, ttl = 3600): Promise<void> => {
  if (!redisClient) return;
  await redisClient.setEx(key, ttl, JSON.stringify(data));
};

export const getCachedData = async <T = unknown>(key: string): Promise<T | null> => {
  if (!redisClient) return null;
  const data = await redisClient.get(key);
  return data ? (JSON.parse(data) as T) : null;
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  if (!redisClient) return;
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};
