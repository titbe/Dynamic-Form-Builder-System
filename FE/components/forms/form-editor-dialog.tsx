"use client";

import { Select, TextInput, Textarea } from "@mantine/core";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { BaseDialog } from "../core/dialog/base-dialog";

type FormInput = {
  title: string;
  description?: string;
  order: number;
  status: "ACTIVE" | "DRAFT";
};

export const FormEditorDialog = ({
  opened,
  onClose,
  loading,
  initial,
  onSubmit
}: {
  opened: boolean;
  onClose: () => void;
  loading?: boolean;
  initial?: Partial<FormInput>;
  onSubmit: (values: FormInput) => void;
}) => {
  const { register, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormInput>({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      order: initial?.order ?? 0,
      status: initial?.status ?? "DRAFT"
    },
    mode: "onBlur"
  });

  useEffect(() => {
    setValue("title", initial?.title ?? "");
    setValue("description", initial?.description ?? "");
    setValue("order", initial?.order ?? 0);
    setValue("status", initial?.status ?? "DRAFT");
  }, [initial, setValue, opened]);

  const getFieldError = (field: keyof FormInput) => {
    const error = errors[field];
    return error ? error.message as string : undefined;
  };

  return (
    <BaseDialog
      opened={opened}
      onClose={onClose}
      title={initial ? "Cập nhật form" : "Tạo form"}
      loading={loading}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextInput
        label="Tên form"
        required
        placeholder="Nhập tên form"
        error={getFieldError("title")}
        {...register("title", {
          required: "Tên form bắt buộc",
          validate: (value) => {
            if (!value || value.trim().length === 0) return "Tên form bắt buộc";
            if (value.trim().length > 200) return "Tên form không được vượt quá 200 ký tự";
            return true;
          }
        })}
      />
      <Textarea
        label="Mô tả"
        placeholder="Nhập mô tả (tùy chọn)"
        minRows={2}
        error={getFieldError("description")}
        {...register("description", {
          validate: (value) => {
            if (!value) return true;
            if (value.trim().length > 500) return "Mô tả không được vượt quá 500 ký tự";
            return true;
          }
        })}
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
      <Select
        label="Trạng thái"
        value={watch("status")}
        onChange={(value) => setValue("status", (value as "ACTIVE" | "DRAFT") ?? "DRAFT")}
        data={[
          { value: "DRAFT", label: "Draft - Chưa công bố" },
          { value: "ACTIVE", label: "Active - Có thể điền" }
        ]}
      />
    </BaseDialog>
  );
};