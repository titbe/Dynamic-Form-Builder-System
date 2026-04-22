"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FieldEntity } from "@/lib/core/types";
import { IconGripVertical, IconTrash } from "@tabler/icons-react";
import { FieldTypeIcon } from "./field-type-icon";

interface SortableFieldItemProps {
  field: FieldEntity;
  onEdit: (field: FieldEntity) => void;
  onDelete: (field: FieldEntity) => void;
  disabled?: boolean;
}

export function SortableFieldItem({
  field,
  onEdit,
  onDelete,
  disabled = false,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-300"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="h-5 w-5" />
      </button>

      <FieldTypeIcon type={field.type} />

      <div className="flex-1">
        <div className="font-medium">{field.label}</div>
        <div className="text-xs text-gray-500">
          {field.type}
          {field.required && <span className="text-red-500"> *</span>}
        </div>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(field)}
          className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Sửa
        </button>
        <button
          type="button"
          onClick={() => onDelete(field)}
          className="rounded p-1 text-red-500 hover:bg-red-50"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface SortableFieldListProps {
  fields: FieldEntity[];
  onEdit: (field: FieldEntity) => void;
  onDelete: (field: FieldEntity) => void;
  disabled?: boolean;
}

export function SortableFieldList({
  fields,
  onEdit,
  onDelete,
  disabled = false,
}: SortableFieldListProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      {sortedFields.map((field) => (
        <SortableFieldItem
          key={field.id}
          field={field}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={disabled}
        />
      ))}
    </div>
  );
}