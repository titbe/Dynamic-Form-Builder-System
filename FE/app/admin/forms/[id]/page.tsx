"use client";

import { ActionIcon, Button, Group } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconEdit, IconTrash } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/core/page-shell";
import { DataTable } from "@/components/core/table/data-table";
import { FieldEditorDialog } from "@/components/forms/field-editor-dialog";
import { formsService } from "@/lib/api";
import { FieldEntity } from "@/lib/core/types";

export default function FormDetailPage() {
  const params = useParams<{ id: string }>();
  const formId = Number(params.id);
  const queryClient = useQueryClient();
  const [opened, setOpened] = useState(false);
  const [editingField, setEditingField] = useState<FieldEntity | null>(null);

  const formQuery = useQuery({
    queryKey: ["form", formId],
    queryFn: () => formsService.getFormById(formId)
  });

  const addFieldMutation = useMutation({
    mutationFn: (payload: Parameters<typeof formsService.addField>[1]) => formsService.addField(formId, payload),
    onSuccess: () => {
      setOpened(false);
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
    }
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({ fieldId, payload }: { fieldId: number; payload: Parameters<typeof formsService.updateField>[2] }) =>
      formsService.updateField(formId, fieldId, payload),
    onSuccess: () => {
      setOpened(false);
      setEditingField(null);
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
    }
  });

  const deleteFieldMutation = useMutation({
    mutationFn: (fieldId: number) => formsService.deleteField(formId, fieldId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["form", formId] })
  });

  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ id: number; order: number }>) => formsService.reorderFields(formId, items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["form", formId] })
  });

  const reorder = (targetId: number, direction: "up" | "down") => {
    const current = formQuery.data?.data.fields ?? [];
    const sorted = [...current].sort((a, b) => a.order - b.order || a.id - b.id);
    const index = sorted.findIndex((item) => item.id === targetId);
    if (index < 0) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const first = sorted[index];
    const second = sorted[swapIndex];
    if (!first || !second) return;

    reorderMutation.mutate([
      { id: first.id, order: second.order },
      { id: second.id, order: first.order }
    ]);
  };

  const columns = useMemo<ColumnDef<FieldEntity>[]>(
    () => [
      { header: "Label", accessorKey: "label" },
      { header: "Type", accessorKey: "type" },
      { header: "Order", accessorKey: "order" },
      {
        header: "Required",
        cell: ({ row }) => (row.original.required ? "Yes" : "No")
      }
    ],
    []
  );

  return (
    <PageShell
      title={`Form #${formId}`}
      subtitle={formQuery.data?.data.title}
      actions={
        <Group>
          <Link href="/admin/forms" className="text-sm text-brand-700 underline">
            Quay lại
          </Link>
          <Button
            onClick={() => {
              setEditingField(null);
              setOpened(true);
            }}
          >
            Thêm field
          </Button>
        </Group>
      }
    >
      <DataTable
        columns={columns}
        data={formQuery.data?.data.fields ?? []}
        isLoading={formQuery.isLoading}
        rowActions={(row) => (
          <Group gap="xs">
            <ActionIcon
              color="gray"
              variant="light"
              onClick={() => {
                setEditingField(row);
                setOpened(true);
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon color="gray" variant="light" onClick={() => reorder(row.id, "up")}>
              <IconArrowUp size={16} />
            </ActionIcon>
            <ActionIcon color="gray" variant="light" onClick={() => reorder(row.id, "down")}>
              <IconArrowDown size={16} />
            </ActionIcon>
            <ActionIcon color="red" variant="light" onClick={() => deleteFieldMutation.mutate(row.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        )}
      />

      <FieldEditorDialog
        opened={opened}
        initial={
          editingField
            ? {
                label: editingField.label,
                type: editingField.type,
                order: editingField.order,
                required: editingField.required,
                options: editingField.options ?? undefined
              }
            : undefined
        }
        onClose={() => {
          setOpened(false);
          setEditingField(null);
        }}
        loading={addFieldMutation.isPending || updateFieldMutation.isPending}
        onSubmit={(values) => {
          if (editingField) {
            updateFieldMutation.mutate({ fieldId: editingField.id, payload: values });
            return;
          }
          addFieldMutation.mutate(values);
        }}
      />
    </PageShell>
  );
}
