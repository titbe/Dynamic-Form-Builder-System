import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.redisUrl, {
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