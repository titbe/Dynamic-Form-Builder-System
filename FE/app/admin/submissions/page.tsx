"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/core/table/data-table";
import { PageShell } from "@/components/core/page-shell";
import { submissionApi } from "@/lib/api/submissions";
import { SubmissionEntity } from "@/lib/core/types";

export default function SubmissionListPage() {
  const query = useQuery({
    queryKey: ["submissions"],
    queryFn: submissionApi.list
  });

  const columns = useMemo<ColumnDef<SubmissionEntity>[]>(
    () => [
      { header: "ID", accessorKey: "id" },
      {
        header: "Form",
        cell: ({ row }) => row.original.form.title
      },
      {
        header: "Answers",
        cell: ({ row }) => JSON.stringify(row.original.answers)
      },
      {
        header: "Submitted By",
        cell: ({ row }) => row.original.user.email
      },
      { header: "Created At", accessorKey: "createdAt" }
    ],
    []
  );

  return (
    <PageShell title="Admin - Submissions" subtitle="Danh sách bài submit từ nhân viên SW">
      <DataTable columns={columns} data={query.data?.data ?? []} isLoading={query.isLoading} />
    </PageShell>
  );
}
