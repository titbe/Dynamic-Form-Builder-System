export type FormStatus = "ACTIVE" | "DRAFT";
export type FieldType = "TEXT" | "NUMBER" | "DATE" | "COLOR" | "SELECT";

export type FieldOption = {
  label: string;
  value: string;
};

export type FieldEntity = {
  id: number;
  formId: number;
  label: string;
  type: FieldType;
  order: number;
  required: boolean;
  options: FieldOption[] | null;
};

export type FormEntity = {
  id: number;
  title: string;
  description: string | null;
  order: number;
  status: FormStatus;
  fields: FieldEntity[];
};

export type SubmissionEntity = {
  id: number;
  formId: number;
  answers: Record<string, unknown>;
  createdAt: string;
  form: {
    id: number;
    title: string;
  };
  user: {
    id: number;
    email: string;
    role: "ADMIN" | "SW";
  };
};

export type AuthUser = {
  id: number;
  email: string;
  role: "ADMIN" | "SW";
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown;
  };
};
