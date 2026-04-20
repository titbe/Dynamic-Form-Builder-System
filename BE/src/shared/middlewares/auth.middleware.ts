import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../../config/env";

type TokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export const requireAuth = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_UNAUTHORIZED",
          message: "Missing Bearer token",
          details: null
        }
      });
    }

    const token = authHeader.slice("Bearer ".length);

    try {
      const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
      req.authUser = {
        id: Number(payload.sub),
        email: payload.email,
        role: payload.role
      };

      if (roles.length > 0 && !roles.includes(req.authUser.role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: "AUTH_FORBIDDEN",
            message: "You do not have permission",
            details: null
          }
        });
      }

      return next();
    } catch {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_INVALID_TOKEN",
          message: "Invalid or expired token",
          details: null
        }
      });
    }
  };
};
