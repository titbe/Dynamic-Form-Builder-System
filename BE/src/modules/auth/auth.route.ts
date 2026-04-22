import { Router } from "express";
import { authController } from "./auth.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { requireAuth, requireRefreshToken } from "../../shared/middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/refresh", requireRefreshToken(), asyncHandler(authController.refresh));
authRouter.post("/logout", requireAuth(), asyncHandler(authController.logout));
authRouter.get("/me", requireAuth(), asyncHandler(authController.me));