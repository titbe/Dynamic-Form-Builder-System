import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { jwtService, AccessTokenPayload } from "../services/jwt.service";
import { cacheService } from "../services/cache.service";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  jti: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

const sendUnauthorized = (res: Response, code: string, message: string) => {
  return res.status(401).json({
    success: false,
    error: { code, message, details: null },
  });
};

const sendForbidden = (res: Response, message = "You do not have permission") => {
  return res.status(403).json({
    success: false,
    error: { code: "AUTH_FORBIDDEN", message, details: null },
  });
};

export const requireAuth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken || extractBearerToken(req);

    if (!token) {
      return sendUnauthorized(res, "AUTH_UNAUTHORIZED", "Missing access token");
    }

    try {
      const payload = jwtService.verifyAccessToken(token);

      const sessionValid = await cacheService.isSessionValid(payload.jti);
      if (!sessionValid) {
        return sendUnauthorized(res, "AUTH_SESSION_EXPIRED", "Session has expired");
      }

      await cacheService.updateSessionActivity(payload.jti);

      req.authUser = {
        id: Number(payload.sub),
        email: payload.email,
        role: payload.role,
        jti: payload.jti,
      };

      if (roles.length > 0 && !roles.includes(req.authUser.role)) {
        return sendForbidden(res);
      }

      return next();
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === "TokenExpiredError") {
        return sendUnauthorized(res, "AUTH_TOKEN_EXPIRED", "Token has expired");
      }
      if (err.name === "JsonWebTokenError") {
        return sendUnauthorized(res, "AUTH_INVALID_TOKEN", "Invalid token");
      }
      return sendUnauthorized(res, "AUTH_FAILED", "Authentication failed");
    }
  };
};

export const requireRefreshToken = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.refreshToken || extractBearerToken(req);

    if (!token) {
      return sendUnauthorized(res, "AUTH_UNAUTHORIZED", "Missing refresh token");
    }

    try {
      const payload = jwtService.verifyRefreshToken(token);

      if (payload.type !== "refresh") {
        return sendUnauthorized(res, "AUTH_INVALID_TOKEN", "Invalid token type");
      }

      const sessionValid = await cacheService.isSessionValid(payload.jti);
      if (!sessionValid) {
        return sendUnauthorized(res, "AUTH_SESSION_EXPIRED", "Session has expired");
      }

      req.authUser = {
        id: Number(payload.sub),
        email: "",
        role: "SW",
        jti: payload.jti,
      };

      return next();
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === "TokenExpiredError") {
        return sendUnauthorized(res, "AUTH_TOKEN_EXPIRED", "Refresh token has expired");
      }
      return sendUnauthorized(res, "AUTH_INVALID_TOKEN", "Invalid refresh token");
    }
  };
};

const extractBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
};

export const getDeviceInfo = (req: Request): string => {
  const ua = req.headers["user-agent"] || "";
  if (ua.includes("Chrome")) return ua.includes("Mac") ? "Chrome on macOS" : "Chrome on Windows";
  if (ua.includes("Firefox")) return ua.includes("Mac") ? "Firefox on macOS" : "Firefox on Windows";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown Device";
};