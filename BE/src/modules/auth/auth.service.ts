import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { env, generateJti } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";
import { jwtService } from "../../shared/services/jwt.service";
import { cacheService } from "../../shared/services/cache.service";
import { authRepository } from "./auth.repository";

export const authService = {
  async ensureDefaultUsers() {
    const adminHash = await bcrypt.hash(env.adminPassword, 10);
    const swHash = await bcrypt.hash(env.swPassword, 10);

    await authRepository.upsertUser({
      email: env.adminEmail,
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    });

    await authRepository.upsertUser({
      email: env.swEmail,
      passwordHash: swHash,
      role: UserRole.SW,
    });
  },

  async login(
    payload: { email: string; password: string },
    deviceInfo: string
  ) {
    const user = await authRepository.findByEmail(payload.email);
    if (!user) {
      throw new AppError(401, "AUTH_INVALID_CREDENTIALS", "Email or password is incorrect");
    }

    const matched = await bcrypt.compare(payload.password, user.passwordHash);
    if (!matched) {
      throw new AppError(401, "AUTH_INVALID_CREDENTIALS", "Email or password is incorrect");
    }

    const jti = generateJti();

    const accessToken = jwtService.signAccessToken({
      sub: String(user.id),
      email: user.email,
      role: user.role,
      jti,
    });

    const refreshToken = jwtService.signRefreshToken({
      sub: String(user.id),
      jti,
    });

    await cacheService.setSession(jti, {
      userId: user.id,
      email: user.email,
      role: user.role,
      device: deviceInfo,
      ip: "",
      userAgent: "",
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  },

  async refresh(refreshToken: string, deviceInfo: string) {
    let payload;
    try {
      payload = jwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, "AUTH_INVALID_TOKEN", "Invalid refresh token");
    }

    const session = await cacheService.getSession(payload.jti);
    if (!session) {
      throw new AppError(401, "AUTH_SESSION_EXPIRED", "Session has expired");
    }

    const user = await authRepository.findById(session.userId);
    if (!user) {
      throw new AppError(401, "AUTH_USER_NOT_FOUND", "User no longer exists");
    }

    await cacheService.deleteSession(payload.jti);

    const newJti = generateJti();

    const newAccessToken = jwtService.signAccessToken({
      sub: String(user.id),
      email: user.email,
      role: user.role,
      jti: newJti,
    });

    const newRefreshToken = jwtService.signRefreshToken({
      sub: String(user.id),
      jti: newJti,
    });

    await cacheService.setSession(newJti, {
      userId: user.id,
      email: user.email,
      role: user.role,
      device: deviceInfo,
      ip: "",
      userAgent: "",
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(jti: string) {
    await cacheService.deleteSession(jti);
    return { success: true };
  },

  async me(userId: number) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError(401, "AUTH_USER_NOT_FOUND", "User no longer exists");
    }
    return user;
  },
};