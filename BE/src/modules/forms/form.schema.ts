import { FieldType, FormStatus } from "@prisma/client";
import { z } from "zod";

const fieldOptionSchema = z.object({
  label: z.string().trim().min(1).max(100),
  value: z.string().trim().min(1).max(100)
});

export const createFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional(),
  order: z.number().int().nonnegative(),
  status: z.nativeEnum(FormStatus)
});

export const updateFormSchema = createFormSchema.partial();

export const createFieldSchema = z.object({
  label: z.string().trim().min(1).max(200),
  type: z.nativeEnum(FieldType),
  order: z.number().int().nonnegative(),
  required: z.boolean().default(false),
  options: z.array(fieldOptionSchema).optional()
});

export const updateFieldSchema = createFieldSchema.partial();

export const submitFormSchema = z.object({
  values: z.record(z.unknown()).refine((val) => {
    const entries = Object.entries(val);
    return entries.length > 0;
  }, {
    message: "Form must have at least one value"
  })
});

export const fieldValidationSchema = z.object({
  fieldId: z.number().int().positive(),
  fieldType: z.nativeEnum(FieldType),
  required: z.boolean(),
  values: z.record(z.unknown())
});

export const validateFieldValue = (
  fieldType: FieldType,
  value: unknown,
  required: boolean
): { valid: boolean; error?: string } => {
  if (required) {
    if (value === null || value === undefined || value === "") {
      return { valid: false, error: "Trường này bắt buộc" };
    }
  }

  if (value === null || value === undefined || value === "") {
    return { valid: true };
  }

  switch (fieldType) {
    case "TEXT":
      if (typeof value === "string" && value.trim().length === 0) {
        return { valid: false, error: "Văn bản không được để trống" };
      }
      break;

    case "NUMBER":
      if (typeof value === "number" && (isNaN(value) || value < 0 || value > 100)) {
        return { valid: false, error: "Số phải từ 0-100" };
      }
      break;

    case "DATE":
      if (typeof value === "string") {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { valid: false, error: "Ngày không hợp lệ" };
        }
      }
      break;

    case "COLOR":
      if (typeof value === "string" && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
        return { valid: false, error: "Mã màu phải dạng #RRGGBB" };
      }
      break;

    case "SELECT":
      if (typeof value === "string" && value.trim().length === 0) {
        return { valid: false, error: "Vui lòng chọn một lựa chọn" };
      }
      break;
  }

  return { valid: true };
};

export const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        order: z.number().int().nonnegative()
      })
    )
    .min(1)
});