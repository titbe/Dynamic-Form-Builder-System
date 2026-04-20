"use client";

import { Button, NumberInput, Select, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "react-hook-form";
import { FieldEntity } from "@/lib/core/types";

type DynamicFormRendererProps = {
  fields: FieldEntity[];
  loading?: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
};

export const DynamicFormRenderer = ({ fields, onSubmit, loading }: DynamicFormRendererProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<Record<string, unknown>>({
    defaultValues: {}
  });

  return (
    <form
      className="space-y-4 rounded-xl border border-brand-200 bg-white p-4 shadow-sm"
      onSubmit={handleSubmit((values) => {
        const normalized = fields.reduce<Record<string, unknown>>((acc, field) => {
          const key = String(field.id);
          const value = values[key];
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        }, {});
        onSubmit(normalized);
      })}
    >
      {fields.map((field) => {
        const key = String(field.id);

        if (field.type === "TEXT") {
          return <TextInput key={field.id} label={field.label} required={field.required} {...register(key)} />;
        }

        if (field.type === "NUMBER") {
          return (
            <NumberInput
              key={field.id}
              label={field.label}
              min={0}
              max={100}
              required={field.required}
              value={(watch(key) as number | undefined) ?? undefined}
              onChange={(value) => setValue(key, typeof value === "number" ? value : undefined)}
            />
          );
        }

        if (field.type === "DATE") {
          return (
            <DateInput
              key={field.id}
              label={field.label}
              required={field.required}
              minDate={new Date()}
              value={(watch(key) as Date | null | undefined) ?? null}
              onChange={(value) => setValue(key, value ? value.toISOString() : null)}
            />
          );
        }

        if (field.type === "COLOR") {
          return <TextInput key={field.id} label={field.label} placeholder="#RRGGBB" {...register(key)} />;
        }

        return (
          <Select
            key={field.id}
            label={field.label}
            required={field.required}
            value={(watch(key) as string | null | undefined) ?? null}
            onChange={(value) => setValue(key, value ?? "")}
            data={(field.options ?? []).map((option) => ({ value: option.value, label: option.label }))}
          />
        );
      })}
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </form>
  );
};
