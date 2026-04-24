import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import ms from "ms";

const JWT_SECRET = process.env.JWT_SECRET || "abc123";
const ACCESS_TOKEN_EXPIRED = (process.env.ACCESS_TOKEN_EXPIRED || "1h") as ms.StringValue;
const REFRESH_TOKEN_EXPIRED = (process.env.REFRESH_TOKEN_EXPIRED || "7d") as ms.StringValue;

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

export const jwtService = {
  signAccessToken(payload: Omit<AccessTokenPayload, "type">): string {
    return jwt.sign({ ...payload, type: "access" }, JWT_SECRET, {
      expiresIn: ms(ACCESS_TOKEN_EXPIRED) / 1000,
    });
  },

  signRefreshToken(payload: Omit<RefreshTokenPayload, "type">): string {
    return jwt.sign({ ...payload, type: "refresh" }, JWT_SECRET, {
      expiresIn: ms(REFRESH_TOKEN_EXPIRED) / 1000,
    });
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
  },

  decodeToken(token: string): AccessTokenPayload | RefreshTokenPayload | null {
    return jwt.decode(token) as AccessTokenPayload | RefreshTokenPayload | null;
  },

  isAccessToken(token: string): boolean {
    const payload = this.decodeToken(token);
    return payload?.type === "access";
  },

  isRefreshToken(token: string): boolean {
    const payload = this.decodeToken(token);
    return payload?.type === "refresh";
  },
};