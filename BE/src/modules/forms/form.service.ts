import { AppError } from "../../shared/errors/app-error";
import { getPagination } from "../../shared/utils/pagination";
import { validateFieldDefinition, validateSubmissionPayload } from "../validation/field-validation";
import { submissionRepository } from "../submissions/submission.repository";
import {
  CreateFieldInput,
  CreateFormInput,
  FormQuery,
  ReorderInput,
  SubmitFormInput,
  UpdateFieldInput,
  UpdateFormInput
} from "./form.types";
import { formRepository } from "./form.repository";

const ensureFormExists = async (id: number) => {
  const form = await formRepository.findById(id);
  if (!form) {
    throw new AppError(404, "FORM_NOT_FOUND", "Form does not exist");
  }
  return form;
};

export const formService = {
  async getForms(query: FormQuery) {
    const { page, limit, skip } = getPagination(query.page, query.limit);

    const [items, total] = await formRepository.findMany({
      skip,
      take: limit,
      search: query.search,
      status: query.status
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async createForm(payload: CreateFormInput) {
    return formRepository.create(payload);
  },

  async getFormById(id: number) {
    return ensureFormExists(id);
  },

  async updateForm(id: number, payload: UpdateFormInput) {
    await ensureFormExists(id);
    return formRepository.update(id, payload);
  },

  async deleteForm(id: number) {
    await ensureFormExists(id);
    await formRepository.remove(id);
  },

  async addField(formId: number, payload: CreateFieldInput) {
    await ensureFormExists(formId);
    const configError = validateFieldDefinition({
      type: payload.type,
      options: payload.options
    });
    if (configError) {
      throw new AppError(422, "FIELD_CONFIG_INVALID", configError);
    }

    return formRepository.addField(formId, payload);
  },

  async updateField(formId: number, fieldId: number, payload: UpdateFieldInput) {
    await ensureFormExists(formId);
    if (payload.type) {
      const configError = validateFieldDefinition({
        type: payload.type,
        options: payload.options
      });
      if (configError) {
        throw new AppError(422, "FIELD_CONFIG_INVALID", configError);
      }
    }

    const updated = await formRepository.updateField(formId, fieldId, payload);
    if (!updated) {
      throw new AppError(404, "FIELD_NOT_FOUND", "Field does not exist in form");
    }
    return updated;
  },

  async deleteField(formId: number, fieldId: number) {
    await ensureFormExists(formId);
    const result = await formRepository.deleteField(formId, fieldId);
    if (result.count === 0) {
      throw new AppError(404, "FIELD_NOT_FOUND", "Field does not exist in form");
    }
  },

  async getActiveForms() {
    return formRepository.findActiveForms();
  },

  async submitForm(formId: number, payload: SubmitFormInput) {
    const form = await ensureFormExists(formId);
    const validationErrors = validateSubmissionPayload(form.fields, payload.values);

    if (validationErrors.length > 0) {
      throw new AppError(422, "SUBMISSION_VALIDATION_FAILED", "Submission is invalid", validationErrors);
    }

    const normalized = form.fields.reduce<Record<string, unknown>>((acc, field) => {
      const key = String(field.id);
      if (payload.values[key] !== undefined) {
        acc[key] = payload.values[key];
      }
      return acc;
    }, {});

    return submissionRepository.create(formId, normalized, payload.userId);
  },

  async reorderForms(payload: ReorderInput) {
    await formRepository.reorderForms(payload.items);
  },

  async reorderFields(formId: number, payload: ReorderInput) {
    await ensureFormExists(formId);
    const updatedCount = await formRepository.reorderFields(formId, payload.items);
    if (updatedCount !== payload.items.length) {
      throw new AppError(404, "FIELD_NOT_FOUND", "Some fields do not exist in the target form");
    }
  }
};
