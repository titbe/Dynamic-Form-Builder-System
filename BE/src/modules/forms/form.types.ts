import { FieldType, FormStatus } from "@prisma/client";

export type FormQuery = {
  page?: string;
  limit?: string;
  search?: string;
  status?: FormStatus;
};

export type CreateFormInput = {
  title: string;
  description?: string;
  order: number;
  status: FormStatus;
};

export type UpdateFormInput = Partial<CreateFormInput>;

export type FieldOption = {
  label: string;
  value: string;
};

export type CreateFieldInput = {
  label: string;
  type: FieldType;
  order: number;
  required: boolean;
  options?: FieldOption[];
};

export type UpdateFieldInput = Partial<CreateFieldInput>;

export type SubmitFormInput = {
  values: Record<string, unknown>;
  userId: number;
};

export type ReorderInput = {
  items: Array<{
    id: number;
    order: number;
  }>;
};
