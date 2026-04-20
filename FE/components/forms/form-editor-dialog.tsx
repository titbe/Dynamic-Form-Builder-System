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
  const { register, setValue, watch, handleSubmit } = useForm<FormInput>({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      order: initial?.order ?? 0,
      status: initial?.status ?? "DRAFT"
    }
  });

  useEffect(() => {
    setValue("title", initial?.title ?? "");
    setValue("description", initial?.description ?? "");
    setValue("order", initial?.order ?? 0);
    setValue("status", initial?.status ?? "DRAFT");
  }, [initial, setValue, opened]);

  return (
    <BaseDialog
      opened={opened}
      onClose={onClose}
      title={initial ? "Cập nhật form" : "Tạo form"}
      loading={loading}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextInput label="Tên form" required {...register("title")} />
      <Textarea label="Mô tả" minRows={2} {...register("description")} />
      <TextInput label="Thứ tự" type="number" required {...register("order", { valueAsNumber: true })} />
      <Select
        label="Trạng thái"
        value={watch("status")}
        onChange={(value) => setValue("status", (value as "ACTIVE" | "DRAFT") ?? "DRAFT")}
        data={[
          { value: "DRAFT", label: "Draft" },
          { value: "ACTIVE", label: "Active" }
        ]}
      />
    </BaseDialog>
  );
};
