import { Router } from "express";
import { UserRole } from "@prisma/client";
import { submissionController } from "./submission.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { requireAuth } from "../../shared/middlewares/auth.middleware";

export const submissionRouter = Router();

submissionRouter.get("/", requireAuth(UserRole.ADMIN), asyncHandler(submissionController.list));
