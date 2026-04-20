import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";
import { authRepository } from "./auth.repository";

export const authService = {
  async ensureDefaultUsers() {
    const adminHash = await bcrypt.hash(env.adminPassword, 10);
    const swHash = await bcrypt.hash(env.swPassword, 10);

    await authRepository.upsertUser({
      email: env.adminEmail,
      passwordHash: adminHash,
      role: UserRole.ADMIN
    });

    await authRepository.upsertUser({
      email: env.swEmail,
      passwordHash: swHash,
      role: UserRole.SW
    });
  },

  async login(payload: { email: string; password: string }) {
    const user = await authRepository.findByEmail(payload.email);
    if (!user) {
      throw new AppError(401, "AUTH_INVALID_CREDENTIALS", "Email or password is incorrect");
    }

    const matched = await bcrypt.compare(payload.password, user.passwordHash);
    if (!matched) {
      throw new AppError(401, "AUTH_INVALID_CREDENTIALS", "Email or password is incorrect");
    }

    const token = jwt.sign(
      {
        sub: String(user.id),
        email: user.email,
        role: user.role
      },
      env.jwtSecret,
      { expiresIn: "8h" }
    );

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  },

  async me(userId: number) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError(401, "AUTH_USER_NOT_FOUND", "User no longer exists");
    }
    return user;
  }
};
