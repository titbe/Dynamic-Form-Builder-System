"use client";

import { ActionIcon, Badge, Button, Group, Select } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/core/table/data-table";
import { FormEditorDialog } from "@/components/forms/form-editor-dialog";
import { PageShell } from "@/components/core/page-shell";
import { formsService } from "@/lib/api";
import { FormEntity } from "@/lib/core/types";

export default function AdminFormsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [opened, setOpened] = useState(false);
  const [editingForm, setEditingForm] = useState<FormEntity | null>(null);

  const formsQuery = useQuery({
    queryKey: ["forms", page, limit, search, statusFilter],
    queryFn: () => formsService.getForms({ page, limit, search, status: statusFilter ?? undefined })
  });

  const createMutation = useMutation({
    mutationFn: formsService.createForm,
    onSuccess: () => {
      setOpened(false);
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof formsService.updateForm>[1] }) =>
      formsService.updateForm(id, payload),
    onSuccess: () => {
      setOpened(false);
      setEditingForm(null);
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: formsService.deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: formsService.reorderForms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["active-forms"] });
    }
  });

  const reorder = (targetId: number, direction: "up" | "down") => {
    const current = formsQuery.data?.data ?? [];
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

  const columns = useMemo<ColumnDef<FormEntity>[]>(
    () => [
      { header: "ID", accessorKey: "id" },
      { header: "Title", accessorKey: "title" },
      {
        header: "Status",
        cell: ({ row }) => (
          <Badge color={row.original.status === "ACTIVE" ? "green" : "gray"}>{row.original.status}</Badge>
        )
      },
      { header: "Order", accessorKey: "order" }
    ],
    []
  );

  return (
    <PageShell
      title="Admin - Form Management"
      subtitle="CRUD form, filter theo trạng thái, và điều hướng vào quản lý field"
      actions={
        <Group>
          <Link href="/admin/submissions">
            <Button variant="default">Submissions</Button>
          </Link>
          <Button
            onClick={() => {
              setEditingForm(null);
              setOpened(true);
            }}
          >
            Tạo form
          </Button>
        </Group>
      }
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable
          columns={columns}
          data={formsQuery.data?.data ?? []}
          isLoading={formsQuery.isLoading}
          searchValue={search}
          onSearchChange={setSearch}
          filters={
            <Select
              w={180}
              placeholder="Filter status"
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { value: "ACTIVE", label: "Active" },
                { value: "DRAFT", label: "Draft" }
              ]}
              clearable
            />
          }
          rowActions={(row) => (
            <Group gap="xs">
              <Link href={`/admin/forms/${row.id}`}>
                <ActionIcon variant="light" color="blue">
                  <IconEye size={16} />
                </ActionIcon>
              </Link>
              <ActionIcon
                variant="light"
                color="gray"
                onClick={() => {
                  setEditingForm(row);
                  setOpened(true);
                }}
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon variant="light" color="gray" onClick={() => reorder(row.id, "up")}>
                <IconArrowUp size={16} />
              </ActionIcon>
              <ActionIcon variant="light" color="gray" onClick={() => reorder(row.id, "down")}>
                <IconArrowDown size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                onClick={() => {
                  deleteMutation.mutate(row.id);
                }}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          )}
          pagination={{
            page,
            totalPages: formsQuery.data?.meta?.totalPages ?? 1,
            limit,
            onPageChange: setPage,
            onLimitChange: setLimit
          }}
        />
      </motion.div>

      <FormEditorDialog
        opened={opened}
        initial={
          editingForm
            ? {
                title: editingForm.title,
                description: editingForm.description ?? "",
                order: editingForm.order,
                status: editingForm.status
              }
            : undefined
        }
        onClose={() => {
          setOpened(false);
          setEditingForm(null);
        }}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          if (editingForm) {
            updateMutation.mutate({ id: editingForm.id, payload: values });
            return;
          }
          createMutation.mutate(values);
        }}
      />
    </PageShell>
  );
}
