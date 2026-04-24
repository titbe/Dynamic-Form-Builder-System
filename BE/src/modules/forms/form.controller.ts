import { Request, Response } from "express";
import {
  createFieldSchema,
  createFormSchema,
  reorderSchema,
  submitFormSchema,
  updateFieldSchema,
  updateFormSchema
} from "./form.schema";
import { formService } from "./form.service";
import { created, ok } from "../../shared/response";
import { FormQuery } from "./form.types";
import { AppError } from "../../shared/errors/app-error";

const toNumber = (value: string) => Number(value);

export const formController = {
  async list(req: Request, res: Response) {
    const data = await formService.getForms(req.query as unknown as FormQuery);
    return ok(res, data.items, data.meta);
  },

  async create(req: Request, res: Response) {
    const payload = createFormSchema.parse(req.body);
    const data = await formService.createForm(payload);
    return created(res, data);
  },

  async detail(req: Request, res: Response) {
    const data = await formService.getFormById(toNumber(req.params.formId));
    if (req.authUser?.role === "SW" && data.status !== "ACTIVE") {
      throw new AppError(403, "AUTH_FORBIDDEN", "SW can only access active forms");
    }
    return ok(res, data);
  },

  async update(req: Request, res: Response) {
    const payload = updateFormSchema.parse(req.body);
    const data = await formService.updateForm(toNumber(req.params.formId), payload);
    return ok(res, data);
  },

  async remove(req: Request, res: Response) {
    await formService.deleteForm(toNumber(req.params.formId));
    return ok(res, { deleted: true });
  },

  async addField(req: Request, res: Response) {
    const payload = createFieldSchema.parse(req.body);
    const data = await formService.addField(toNumber(req.params.formId), payload);
    return created(res, data);
  },

  async updateField(req: Request, res: Response) {
    const payload = updateFieldSchema.parse(req.body);
    const data = await formService.updateField(
      toNumber(req.params.formId),
      toNumber(req.params.fieldId),
      payload
    );
    return ok(res, data);
  },

  async deleteField(req: Request, res: Response) {
    await formService.deleteField(toNumber(req.params.formId), toNumber(req.params.fieldId));
    return ok(res, { deleted: true });
  },

  async active(req: Request, res: Response) {
    const data = await formService.getActiveForms();
    return ok(res, data);
  },

  async submit(req: Request, res: Response) {
    const payload = submitFormSchema.parse(req.body);
    
    try {
      const data = await formService.submitForm(toNumber(req.params.formId), {
        ...payload,
        userId: req.authUser!.id
      });
      return created(res, data);
    } catch (error) {
      if (error instanceof AppError && error.code === "SUBMISSION_VALIDATION_FAILED") {
        const fieldErrors = (error.details as Array<{ fieldId: number; label: string; message: string }>)
          .map(e => `- ${e.label}: ${e.message}`)
          .join("\n");
        
        throw new AppError(
          422,
          "SUBMISSION_VALIDATION_FAILED",
          `Vui lòng kiểm tra lại các trường sau:\n${fieldErrors}`,
          error.details
        );
      }
      throw error;
    }
  },

  async reorderForms(req: Request, res: Response) {
    const payload = reorderSchema.parse(req.body);
    await formService.reorderForms(payload);
    return ok(res, { reordered: true });
  },

  async reorderFields(req: Request, res: Response) {
    const payload = reorderSchema.parse(req.body);
    await formService.reorderFields(toNumber(req.params.formId), payload);
    return ok(res, { reordered: true });
  }
};