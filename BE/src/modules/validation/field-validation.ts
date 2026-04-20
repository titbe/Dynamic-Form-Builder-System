import { Field, FieldType } from "@prisma/client";
import dayjs from "dayjs";

type ValidationError = {
  fieldId: number;
  label: string;
  message: string;
};

type SelectOption = { label: string; value: string };

const isHexColor = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);

const validateByFieldType = (field: Field, value: unknown): string | null => {
  switch (field.type) {
    case FieldType.TEXT: {
      if (typeof value !== "string") return "Must be a string";
      if (value.length > 200) return "Must not exceed 200 characters";
      return null;
    }
    case FieldType.NUMBER: {
      if (typeof value !== "number") return "Must be a number";
      if (value < 0 || value > 100) return "Must be between 0 and 100";
      return null;
    }
    case FieldType.DATE: {
      if (typeof value !== "string") return "Must be an ISO date string";
      const date = dayjs(value);
      if (!date.isValid()) return "Date is invalid";
      if (date.startOf("day").isBefore(dayjs().startOf("day"))) {
        return "Date must not be in the past";
      }
      return null;
    }
    case FieldType.COLOR: {
      if (typeof value !== "string") return "Must be a string";
      if (!isHexColor(value)) return "Must be a valid HEX color (#RRGGBB)";
      return null;
    }
    case FieldType.SELECT: {
      if (typeof value !== "string") return "Must be a string";
      const options = (field.options ?? []) as SelectOption[];
      if (!options.some((option) => option.value === value)) {
        return "Must be one of configured options";
      }
      return null;
    }
    default:
      return "Unsupported field type";
  }
};

export const validateFieldDefinition = (payload: {
  type: FieldType;
  options?: SelectOption[];
}) => {
  if (payload.type === FieldType.SELECT) {
    if (!payload.options || payload.options.length === 0) {
      return "Select field requires at least one option";
    }
  }

  if (payload.type !== FieldType.SELECT && payload.options && payload.options.length > 0) {
    return "Options are only allowed for select fields";
  }

  return null;
};

export const validateSubmissionPayload = (fields: Field[], values: Record<string, unknown>) => {
  const errors: ValidationError[] = [];

  fields.forEach((field) => {
    const key = String(field.id);
    const value = values[key];

    if (field.required && (value === undefined || value === null || value === "")) {
      errors.push({
        fieldId: field.id,
        label: field.label,
        message: "This field is required"
      });
      return;
    }

    if (value === undefined || value === null || value === "") {
      return;
    }

    const typeError = validateByFieldType(field, value);
    if (typeError) {
      errors.push({
        fieldId: field.id,
        label: field.label,
        message: typeError
      });
    }
  });

  return errors;
};
