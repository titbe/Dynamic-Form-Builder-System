import { Router } from "express";
import { UserRole } from "@prisma/client";
import { formController } from "./form.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { requireAuth } from "../../shared/middlewares/auth.middleware";

export const formRouter = Router();

formRouter.get("/active", requireAuth(UserRole.ADMIN, UserRole.SW), asyncHandler(formController.active));
formRouter.get("/", requireAuth(UserRole.ADMIN), asyncHandler(formController.list));
formRouter.post("/", requireAuth(UserRole.ADMIN), asyncHandler(formController.create));
formRouter.put("/reorder", requireAuth(UserRole.ADMIN), asyncHandler(formController.reorderForms));
formRouter.get("/:formId", requireAuth(UserRole.ADMIN, UserRole.SW), asyncHandler(formController.detail));
formRouter.put("/:formId", requireAuth(UserRole.ADMIN), asyncHandler(formController.update));
formRouter.delete("/:formId", requireAuth(UserRole.ADMIN), asyncHandler(formController.remove));

formRouter.post("/:formId/fields", requireAuth(UserRole.ADMIN), asyncHandler(formController.addField));
formRouter.put(
  "/:formId/fields/reorder",
  requireAuth(UserRole.ADMIN),
  asyncHandler(formController.reorderFields)
);
formRouter.put("/:formId/fields/:fieldId", requireAuth(UserRole.ADMIN), asyncHandler(formController.updateField));
formRouter.delete(
  "/:formId/fields/:fieldId",
  requireAuth(UserRole.ADMIN),
  asyncHandler(formController.deleteField)
);

formRouter.post("/:formId/submit", requireAuth(UserRole.ADMIN, UserRole.SW), asyncHandler(formController.submit));
