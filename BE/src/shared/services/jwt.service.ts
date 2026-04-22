import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../../config/env";

const JWT_SECRET = env.jwtPrivateKey;

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
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15m",
    });
  },

  signRefreshToken(payload: Omit<RefreshTokenPayload, "type">): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d",
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