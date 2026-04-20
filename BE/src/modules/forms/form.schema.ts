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
  values: z.record(z.unknown())
});

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
