import { http } from "../core/api/client";
import { FormEntity, FieldEntity } from "../core/types";

export interface FormListParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export interface FormListResponse {
  data: FormEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const formsService = {
  getForms: (params: FormListParams) => {
    return http<FormEntity[]>("forms", { params });
  },

  getFormById: (id: number) => {
    return http<FormEntity>(`forms/${id}`);
  },

  createForm: (payload: {
    title: string;
    description?: string;
    order: number;
    status: "ACTIVE" | "DRAFT";
  }) => {
    return http<FormEntity>("forms", {
      method: "POST",
      data: payload,
    });
  },

  updateForm: (
    id: number,
    payload: Partial<{
      title: string;
      description?: string;
      order: number;
      status: "ACTIVE" | "DRAFT";
    }>
  ) => {
    return http<FormEntity>(`forms/${id}`, {
      method: "PUT",
      data: payload,
    });
  },

  deleteForm: (id: number) => {
    return http<{ deleted: boolean }>(`forms/${id}`, {
      method: "DELETE",
    });
  },

  reorderForms: (items: Array<{ id: number; order: number }>) => {
    return http<{ reordered: boolean }>("forms/reorder", {
      method: "PUT",
      data: { items },
    });
  },

  getActiveForms: () => {
    return http<FormEntity[]>("forms/active");
  },

  addField: (
    formId: number,
    payload: {
      label: string;
      type: "TEXT" | "NUMBER" | "DATE" | "COLOR" | "SELECT";
      order: number;
      required: boolean;
      options?: Array<{ label: string; value: string }>;
    }
  ) => {
    return http<FieldEntity>(`forms/${formId}/fields`, {
      method: "POST",
      data: payload,
    });
  },

  updateField: (
    formId: number,
    fieldId: number,
    payload: Partial<{
      label: string;
      type: "TEXT" | "NUMBER" | "DATE" | "COLOR" | "SELECT";
      order: number;
      required: boolean;
      options: Array<{ label: string; value: string }>;
    }>
  ) => {
    return http<FieldEntity>(`forms/${formId}/fields/${fieldId}`, {
      method: "PUT",
      data: payload,
    });
  },

  deleteField: (formId: number, fieldId: number) => {
    return http<{ deleted: boolean }>(`forms/${formId}/fields/${fieldId}`, {
      method: "DELETE",
    });
  },

  reorderFields: (formId: number, items: Array<{ id: number; order: number }>) => {
    return http<{ reordered: boolean }>(`forms/${formId}/fields/reorder`, {
      method: "PUT",
      data: { items },
    });
  },

  submitForm: (formId: number, values: Record<string, unknown>) => {
    return http<{ success: boolean }>(`forms/${formId}/submit`, {
      method: "POST",
      data: { values },
    });
  },
};