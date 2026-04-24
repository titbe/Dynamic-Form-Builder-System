import { redis, cacheKeys } from "../../config/redis";

export interface SessionData {
  userId: number;
  email: string;
  role: string;
  device: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
}

const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export const cacheService = {
  async setSession(
    jti: string,
    data: Omit<SessionData, "createdAt" | "lastActiveAt">
  ): Promise<void> {
    const now = new Date().toISOString();
    const sessionData: SessionData = {
      ...data,
      createdAt: now,
      lastActiveAt: now,
    };
    await redis.setex(cacheKeys.session(jti), SESSION_TTL, JSON.stringify(sessionData));
  },

  async getSession(jti: string): Promise<SessionData | null> {
    const data = await redis.get(cacheKeys.session(jti));
    return data ? JSON.parse(data) : null;
  },

  async updateSessionActivity(jti: string): Promise<void> {
    const session = await this.getSession(jti);
    if (session) {
      session.lastActiveAt = new Date().toISOString();
      const ttl = await redis.ttl(cacheKeys.session(jti));
      if (ttl > 0) {
        await redis.setex(
          cacheKeys.session(jti),
          ttl,
          JSON.stringify(session)
        );
      }
    }
  },

  async deleteSession(jti: string): Promise<void> {
    await redis.del(cacheKeys.session(jti));
  },

  async deleteUserSessions(userId: number): Promise<void> {
    const keys = await redis.keys(cacheKeys.userSessions(userId));
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  async isSessionValid(jti: string): Promise<boolean> {
    const exists = await redis.exists(cacheKeys.session(jti));
    return exists === 1;
  },
};