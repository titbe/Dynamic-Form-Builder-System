"use client";

import { Checkbox, Select, TextInput, Textarea } from "@mantine/core";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { BaseDialog } from "../core/dialog/base-dialog";

type FieldInput = {
  label: string;
  type: "TEXT" | "NUMBER" | "DATE" | "COLOR" | "SELECT";
  order: number;
  required: boolean;
  optionsText?: string;
};

export const FieldEditorDialog = ({
  opened,
  onClose,
  loading,
  initial,
  onSubmit
}: {
  opened: boolean;
  onClose: () => void;
  loading?: boolean;
  initial?: {
    label: string;
    type: "TEXT" | "NUMBER" | "DATE" | "COLOR" | "SELECT";
    order: number;
    required: boolean;
    options?: Array<{ label: string; value: string }>;
  };
  onSubmit: (values: {
    label: string;
    type: "TEXT" | "NUMBER" | "DATE" | "COLOR" | "SELECT";
    order: number;
    required: boolean;
    options?: Array<{ label: string; value: string }>;
  }) => void;
}) => {
  const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm<FieldInput>({
    defaultValues: {
      label: initial?.label ?? "",
      type: initial?.type ?? "TEXT",
      order: initial?.order ?? 0,
      required: initial?.required ?? false,
      optionsText: initial?.options?.map((item) => `${item.label}|${item.value}`).join("\n") ?? ""
    },
    mode: "onBlur"
  });

  useEffect(() => {
    setValue("label", initial?.label ?? "");
    setValue("type", initial?.type ?? "TEXT");
    setValue("order", initial?.order ?? 0);
    setValue("required", initial?.required ?? false);
    setValue("optionsText", initial?.options?.map((item) => `${item.label}|${item.value}`).join("\n") ?? "");
  }, [initial, opened, setValue]);

  const type = watch("type");

  const getFieldError = (field: keyof FieldInput) => {
    const error = errors[field];
    return error ? error.message as string : undefined;
  };

  const submit = handleSubmit((values) => {
    const options = values.optionsText
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, value] = line.split("|").map((part) => part.trim());
        return {
          label: label || value,
          value
        };
      })
      .filter((option) => option.value);

    onSubmit({
      label: values.label,
      type: values.type,
      order: values.order,
      required: values.required,
      options: values.type === "SELECT" ? options : undefined
    });
  });

  const helperText = useMemo(() => "Mỗi dòng theo format: label|value (ví dụ: Đã làm|da_lam)", []);

  return (
    <BaseDialog
      opened={opened}
      onClose={onClose}
      title={initial ? "Cập nhật field" : "Thêm field"}
      loading={loading}
      onSubmit={submit}
    >
      <TextInput
        label="Tên field (Label)"
        required
        placeholder="Nhập tên field"
        error={getFieldError("label")}
        {...register("label", {
          required: "Tên field bắt buộc",
          validate: (value) => {
            if (!value || value.trim().length === 0) return "Tên field bắt buộc";
            if (value.trim().length > 200) return "Tên field không được vượt quá 200 ký tự";
            return true;
          }
        })}
      />
      <Select
        label="Loại field"
        value={type}
        onChange={(value) => setValue("type", (value as FieldInput["type"]) ?? "TEXT")}
        data={[
          { value: "TEXT", label: "TEXT - Văn bản (max 200 ký tự)" },
          { value: "NUMBER", label: "NUMBER - Số (0-100)" },
          { value: "DATE", label: "DATE - Ngày tháng (không quá khứ)" },
          { value: "COLOR", label: "COLOR - Màu sắc (#RRGGBB)" },
          { value: "SELECT", label: "SELECT - Lựa chọn" }
        ]}
      />
      <TextInput
        label="Thứ tự"
        type="number"
        required
        placeholder="0"
        error={getFieldError("order")}
        {...register("order", {
          required: "Thứ tự bắt buộc",
          valueAsNumber: true,
          validate: (value) => {
            if (value === undefined || value === null) return "Thứ tự bắt buộc";
            if (value < 0) return "Thứ tự phải là số không âm";
            return true;
          }
        })}
      />
      <Checkbox
        label="Bắt buộc điền"
        {...register("required")}
      />
      {type === "SELECT" ? (
        <Textarea
          label="Các lựa chọn (Options)"
          description={helperText}
          placeholder="Đã làm|da_lam&#10;Chưa làm|chua_lam"
          minRows={4}
          error={getFieldError("optionsText")}
          {...register("optionsText", {
            required: "Cần ít nhất 1 option cho SELECT",
            validate: (value) => {
              if (type !== "SELECT") return true;
              if (!value || value.trim().length === 0) return "Cần ít nhất 1 option cho SELECT";
              
              const options = value.split("\n").filter(line => line.trim());
              if (options.length === 0) return "Cần ít nhất 1 option cho SELECT";
              
              const invalidLines = options.filter(line => {
                const parts = line.split("|");
                return !parts[1] || parts[1].trim().length === 0;
              });
              
              if (invalidLines.length > 0) return "Mỗi option cần có cả label và value (cách nhau bằng dấu |)";
              return true;
            }
          })}
        />
      ) : null}
    </BaseDialog>
  );
};