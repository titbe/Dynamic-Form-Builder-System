import { FormEntity } from "../core/types";
import { http } from "../core/api/http";

export const formsApi = {
  getForms: (params: { page: number; limit: number; search?: string; status?: string }) => {
    return http<FormEntity[]>("/api/forms", { params });
  },

  getFormById: (id: number) => {
    return http<FormEntity>(`/api/forms/${id}`);
  },

  createForm: (payload: { title: string; description?: string; order: number; status: "ACTIVE" | "DRAFT" }) => {
    return http<FormEntity>("/api/forms", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  updateForm: (
    id: number,
    payload: Partial<{ title: string; description?: string; order: number; status: "ACTIVE" | "DRAFT" }>
  ) => {
    return http<FormEntity>(`/api/forms/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  deleteForm: (id: number) => {
    return http<{ deleted: true }>(`/api/forms/${id}`, {
      method: "DELETE"
    });
  },

  reorderForms: (items: Array<{ id: number; order: number }>) => {
    return http<{ reordered: true }>("/api/forms/reorder", {
      method: "PUT",
      body: JSON.stringify({ items })
    });
  },

  getActiveForms: () => {
    return http<FormEntity[]>("/api/forms/active");
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
    return http(`/api/forms/${formId}/fields`, {
      method: "POST",
      body: JSON.stringify(payload)
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
    return http(`/api/forms/${formId}/fields/${fieldId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  deleteField: (formId: number, fieldId: number) => {
    return http(`/api/forms/${formId}/fields/${fieldId}`, {
      method: "DELETE"
    });
  },

  reorderFields: (formId: number, items: Array<{ id: number; order: number }>) => {
    return http<{ reordered: true }>(`/api/forms/${formId}/fields/reorder`, {
      method: "PUT",
      body: JSON.stringify({ items })
    });
  },

  submitForm: (formId: number, values: Record<string, unknown>) => {
    return http(`/api/forms/${formId}/submit`, {
      method: "POST",
      body: JSON.stringify({ values })
    });
  }
};
