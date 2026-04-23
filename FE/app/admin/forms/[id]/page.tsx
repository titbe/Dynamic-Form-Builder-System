"use client";

import { Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/core/page-shell";
import { FieldEditorDialog } from "@/components/forms/field-editor-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DraggableFieldList } from "@/components/fields/draggable-field-list";
import { formsService } from "@/lib/api";
import { FieldEntity } from "@/lib/core/types";

export default function FormDetailPage() {
  const params = useParams<{ id: string }>();
  const formId = Number(params.id);
  const queryClient = useQueryClient();

  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldEntity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingField, setDeletingField] = useState<FieldEntity | null>(null);

  const formQuery = useQuery({
    queryKey: ["form", formId],
    queryFn: () => formsService.getFormById(formId)
  });

  const addFieldMutation = useMutation({
    mutationFn: (payload: Parameters<typeof formsService.addField>[1]) => formsService.addField(formId, payload),
    onSuccess: () => {
      setFieldDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      notifications.show({
        title: "Thành công",
        message: "Đã thêm field mới",
        color: "green"
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Lỗi",
        message: error.message,
        color: "red"
      });
    }
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({ fieldId, payload }: { fieldId: number; payload: Parameters<typeof formsService.updateField>[2] }) =>
      formsService.updateField(formId, fieldId, payload),
    onSuccess: () => {
      setFieldDialogOpen(false);
      setEditingField(null);
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      notifications.show({
        title: "Thành công",
        message: "Đã cập nhật field",
        color: "green"
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Lỗi",
        message: error.message,
        color: "red"
      });
    }
  });

  const deleteFieldMutation = useMutation({
    mutationFn: (fieldId: number) => formsService.deleteField(formId, fieldId),
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setDeletingField(null);
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      notifications.show({
        title: "Thành công",
        message: "Đã xóa field",
        color: "green"
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Lỗi",
        message: error.message,
        color: "red"
      });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ id: number; order: number }>) => formsService.reorderFields(formId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Lỗi",
        message: error.message,
        color: "red"
      });
    }
  });

  const handleEdit = (field: FieldEntity) => {
    setEditingField(field);
    setFieldDialogOpen(true);
  };

  const handleDelete = (field: FieldEntity) => {
    setDeletingField(field);
    setDeleteDialogOpen(true);
  };

  const handleReorder = (items: Array<{ id: number; order: number }>) => {
    reorderMutation.mutate(items);
  };

  const handleConfirmDelete = () => {
    if (deletingField) {
      deleteFieldMutation.mutate(deletingField.id);
    }
  };

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
              setFieldDialogOpen(true);
            }}
          >
            Thêm field
          </Button>
        </Group>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          💡 Kéo thả để sắp xếp lại thứ tự các fields
        </div>

        <DraggableFieldList
          fields={formQuery.data?.data.fields ?? []}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={handleDelete}
          disabled={reorderMutation.isPending || addFieldMutation.isPending || updateFieldMutation.isPending}
        />
      </div>

      <FieldEditorDialog
        opened={fieldDialogOpen}
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
          setFieldDialogOpen(false);
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

      <ConfirmationDialog
        opened={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingField(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa field"
        message={`Bạn có chắc chắn muốn xóa field "${deletingField?.label}" không?`}
        confirmLabel="Xóa"
        loading={deleteFieldMutation.isPending}
        type="danger"
      />
    </PageShell>
  );
}