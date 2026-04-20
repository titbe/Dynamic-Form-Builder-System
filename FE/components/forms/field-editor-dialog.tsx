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
  const { register, watch, setValue, handleSubmit } = useForm<FieldInput>({
    defaultValues: {
      label: initial?.label ?? "",
      type: initial?.type ?? "TEXT",
      order: initial?.order ?? 0,
      required: initial?.required ?? false,
      optionsText: initial?.options?.map((item) => `${item.label}|${item.value}`).join("\n") ?? ""
    }
  });

  useEffect(() => {
    setValue("label", initial?.label ?? "");
    setValue("type", initial?.type ?? "TEXT");
    setValue("order", initial?.order ?? 0);
    setValue("required", initial?.required ?? false);
    setValue("optionsText", initial?.options?.map((item) => `${item.label}|${item.value}`).join("\n") ?? "");
  }, [initial, opened, setValue]);

  const type = watch("type");

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

  const helperText = useMemo(() => "Mỗi dòng theo format: label|value", []);

  return (
    <BaseDialog
      opened={opened}
      onClose={onClose}
      title={initial ? "Cập nhật field" : "Thêm field"}
      loading={loading}
      onSubmit={submit}
    >
      <TextInput label="Label" required {...register("label")} />
      <Select
        label="Type"
        value={type}
        onChange={(value) => setValue("type", (value as FieldInput["type"]) ?? "TEXT")}
        data={["TEXT", "NUMBER", "DATE", "COLOR", "SELECT"]}
      />
      <TextInput label="Thứ tự" type="number" required {...register("order", { valueAsNumber: true })} />
      <Checkbox label="Required" {...register("required")} />
      {type === "SELECT" ? (
        <Textarea label="Options" description={helperText} minRows={4} {...register("optionsText")} />
      ) : null}
    </BaseDialog>
  );
};
