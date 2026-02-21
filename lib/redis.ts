import Redis from "ioredis";

const getRedisUrl = () => process.env.REDIS_URL ?? null;

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

function createRedis(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;
  try {
    return new Redis(url);
  } catch {
    return null;
  }
}

export const redis: Redis | null =
  typeof window === "undefined"
    ? (globalThis.redis ?? createRedis())
    : null;

if (typeof window === "undefined" && redis && !globalThis.redis) {
  globalThis.redis = redis;
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const val = await redis.get(key);
  return val ? (JSON.parse(val) as T) : null;
}

export async function setCached(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  if (!redis) return;
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}
