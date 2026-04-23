"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, List, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { DataTable } from "@/components/core/table/data-table";
import { PageShell } from "@/components/core/page-shell";
import { submissionsService } from "@/lib/api";
import { SubmissionEntity } from "@/lib/core/types";

export default function SubmissionListPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const query = useQuery({
    queryKey: ["submissions", page, limit, debouncedSearch],
    queryFn: () => submissionsService.list({ page, limit, search: debouncedSearch })
  });

  const columns = useMemo<ColumnDef<SubmissionEntity>[]>(
    () => [
      { header: "ID", accessorKey: "id", size: 80 },
      {
        header: "Form",
        cell: ({ row }) => (
          <div>
            <Text fw={500}>{row.original.form.title}</Text>
            <Badge size="xs" variant="light">ID: {row.original.form.id}</Badge>
          </div>
        )
      },
      {
        header: "Answers",
        cell: ({ row }) => (
          <List size="xs" spacing={4} withPadding>
            {row.original.enrichedAnswers.map((ans) => (
              <List.Item key={ans.fieldId}>
                <Text component="span" fw={600}>{ans.label}: </Text>
                <Text component="span" c="dimmed">
                  {ans.value === null || ans.value === undefined ? "N/A" : String(ans.value)}
                </Text>
              </List.Item>
            ))}
          </List>
        )
      },
      {
        header: "Submitted By",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            <Text size="sm">{row.original.user.email}</Text>
            <Badge size="xs" color={row.original.user.role === "ADMIN" ? "red" : "blue"}>
              {row.original.user.role}
            </Badge>
          </div>
        )
      },
      {
        header: "Created At",
        cell: ({ row }) => (
          <Text size="xs" c="dimmed">
            {new Date(row.original.createdAt).toLocaleString()}
          </Text>
        )
      }
    ],
    []
  );

  return (
    <PageShell title="Admin - Submissions" subtitle="Danh sách bài submit từ nhân viên SW">
      <div className="mb-4 flex justify-end">
        <TextInput
          placeholder="Tìm nội dung câu trả lời..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          className="w-full max-w-xs"
        />
      </div>

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
