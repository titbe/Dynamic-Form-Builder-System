"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/core/table/data-table";
import { PageShell } from "@/components/core/page-shell";
import { submissionsService } from "@/lib/api";
import { SubmissionEntity } from "@/lib/core/types";

export default function SubmissionListPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const query = useQuery({
    queryKey: ["submissions", page, limit],
    queryFn: () => submissionsService.list({ page, limit })
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
      <DataTable
        columns={columns}
        data={query.data?.data ?? []}
        isLoading={query.isLoading}
        pagination={{
          page,
          totalPages: query.data?.meta?.totalPages ?? 1,
          limit,
          onPageChange: setPage,
          onLimitChange: (nextLimit) => {
            setPage(1);
            setLimit(nextLimit);
          }
        }}
      />
    </PageShell>
  );
}
