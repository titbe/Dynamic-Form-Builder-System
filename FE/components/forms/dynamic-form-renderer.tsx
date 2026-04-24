"use client";

import { NumberInput, Select, TextInput, Button } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm, Controller } from "react-hook-form";
import { FieldEntity } from "@/lib/core/types";
import {
  validateColor,
  validateDate,
  validateNumber,
  validateSelect,
  validateText
} from "@/lib/validations/field-validations";

type DynamicFormRendererProps = {
  fields: FieldEntity[];
  loading?: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
};

export const DynamicFormRenderer = ({ fields, onSubmit, loading }: DynamicFormRendererProps) => {
  const defaultValues = fields.reduce<Record<string, unknown>>((acc, field) => {
    acc[String(field.id)] = field.type === "SELECT" ? "" : null;
    return acc;
  }, {});

  const { register, handleSubmit, control, formState: { errors } } = useForm<Record<string, unknown>>({
    defaultValues,
    mode: "onBlur"
  });

  const getFieldError = (field: FieldEntity) => {
    const key = String(field.id);
    const error = errors[key];
    if (!error) return undefined;
    return error.message as string;
  };

  const handleFormSubmit = (values: Record<string, unknown>) => {
    const normalized = fields.reduce<Record<string, unknown>>((acc, field) => {
      const key = String(field.id);
      const value = values[key];
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    onSubmit(normalized);
  };

  return (
    <form
      className="space-y-4 rounded-xl border border-brand-200 bg-white p-4 shadow-sm"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      {fields.map((field) => {
        const key = String(field.id);
        const fieldError = getFieldError(field);

        if (field.type === "TEXT") {
          return (
            <TextInput
              key={field.id}
              label={field.label}
              required={field.required}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
              error={fieldError}
              {...register(key, {
                required: field.required ? "Trường này bắt buộc" : false,
                validate: validateText,
                maxLength: 200
              })}
            />
          );
        }

        if (field.type === "NUMBER") {
          return (
            <Controller
              key={field.id}
              name={key}
              control={control}
              rules={{
                required: field.required ? "Trường này bắt buộc" : false,
                validate: validateNumber
              }}
              render={({ field: { value, onChange } }) => (
                <NumberInput
                  label={field.label}
                  placeholder="0-100"
                  required={field.required}
                  error={fieldError}
                  value={typeof value === "number" ? value : undefined}
                  onChange={onChange}
                />
              )}
            />
          );
        }

        if (field.type === "DATE") {
          return (
            <Controller
              key={field.id}
              name={key}
              control={control}
              rules={{
                required: field.required ? "Trường này bắt buộc" : false,
                validate: validateDate
              }}
              render={({ field: { value, onChange } }) => (
                <DateTimePicker
                  label={field.label}
                  required={field.required}
                  minDate={new Date()}
                  placeholder="Chọn ngày và giờ"
                  error={fieldError}
                  value={value ? new Date(value as string) : null}
                  onChange={(val) => onChange(val ? val.toISOString() : null)}
                />
              )}
            />
          );
        }

        if (field.type === "COLOR") {
          return (
            <TextInput
              key={field.id}
              label={field.label}
              placeholder="#RRGGBB (Ví dụ: #FF0000)"
              required={field.required}
              error={fieldError}
              {...register(key, {
                required: field.required ? "Trường này bắt buộc" : false,
                validate: validateColor
              })}
            />
          );
        }

        if (field.type === "SELECT") {
          return (
            <Controller
              key={field.id}
              name={key}
              control={control}
              rules={{
                required: field.required ? "Trường này bắt buộc" : false,
                validate: validateSelect
              }}
              render={({ field: { value, onChange } }) => (
                <Select
                  label={field.label}
                  required={field.required}
                  placeholder="Chọn một lựa chọn"
                  error={fieldError}
                  value={value as string | null}
                  onChange={onChange}
                  data={(field.options ?? []).map((option) => ({
                    value: option.value,
                    label: option.label
                  }))}
                />
              )}
            />
          );
        }

        return null;
      })}
      <Button type="submit" loading={loading}>
        Gửi form
      </Button>
    </form>
  );
};