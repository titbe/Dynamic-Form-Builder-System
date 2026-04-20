import { Router } from "express";
import { authController } from "./auth.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { requireAuth } from "../../shared/middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(authController.login));
authRouter.get("/me", requireAuth(), asyncHandler(authController.me));
