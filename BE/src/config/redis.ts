import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6380";

export const redis = new Redis(redisUrl, {
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on("error", (err: Error) => {
  console.error("Redis connection error:", err.message);
});

redis.on("connect", () => {
  console.log("Redis connected");
});

export const cacheKeys = {
  session: (jti: string) => `session:${jti}`,
  userSessions: (userId: number) => `user_sessions:${userId}`,
} as const;