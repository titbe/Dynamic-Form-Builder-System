import { Request, Response } from "express";
import { created, ok } from "../../shared/response";
import { authService } from "./auth.service";
import { loginSchema } from "./auth.schema";
import { getDeviceInfo } from "../../shared/middlewares/auth.middleware";

export const authController = {
  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body);
    const deviceInfo = getDeviceInfo(req);
    const data = await authService.login(payload, deviceInfo);

    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return created(res, data);
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { code: "AUTH_UNAUTHORIZED", message: "Missing refresh token", details: null },
      });
    }

    const deviceInfo = getDeviceInfo(req);
    const data = await authService.refresh(refreshToken, deviceInfo);

    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ok(res, { success: true });
  },

  async logout(req: Request, res: Response) {
    const jti = req.authUser?.jti;
    if (jti) {
      await authService.logout(jti);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return ok(res, { success: true });
  },

  async me(req: Request, res: Response) {
    const data = await authService.me(req.authUser!.id);
    return ok(res, data);
  },
};