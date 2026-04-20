"use client";

import { ActionIcon, Loader, Pagination, Select, Table, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ReactNode } from "react";

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  rowActions?: (row: T) => ReactNode;
  pagination?: {
    page: number;
    totalPages: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (size: number) => void;
  };
};

export const DataTable = <T,>({
  columns,
  data,
  isLoading,
  searchValue,
  onSearchChange,
  filters,
  rowActions,
  pagination
}: DataTableProps<T>) => {
  const cols = rowActions
    ? [
        ...columns,
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }: { row: { original: T } }) => rowActions(row.original)
        }
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: cols,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {onSearchChange ? (
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            className="md:max-w-xs"
          />
        ) : (
          <div />
        )}
        {filters}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {pagination ? (
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Pagination
            total={Math.max(1, pagination.totalPages)}
            value={pagination.page}
            onChange={pagination.onPageChange}
          />
          <Select
            className="md:w-24"
            value={String(pagination.limit)}
            onChange={(value) => pagination.onLimitChange(Number(value ?? 10))}
            data={[
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "50", label: "50" }
            ]}
          />
        </div>
      ) : null}
    </div>
  );
};
