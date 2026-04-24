"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FieldEntity } from "@/lib/core/types";
import { IconGripVertical, IconEdit, IconTrash } from "@tabler/icons-react";
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
  disabled = false
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-300 ${
        isDragging ? "shadow-lg ring-2 ring-blue-400" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-3">
        <FieldTypeIcon type={field.type} />

        <div className="flex-1">
          <div className="font-medium text-gray-900">{field.label}</div>
          <div className="text-xs text-gray-500">
            <span className="uppercase">{field.type}</span>
            {field.required && <span className="ml-2 text-red-500">*</span>}
            {field.options && field.options.length > 0 && (
              <span className="ml-2">({field.options.length} options)</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(field)}
          className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
          title="Sửa"
        >
          <IconEdit size={18} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(field)}
          className="rounded p-1.5 text-red-500 hover:bg-red-50"
          title="Xóa"
        >
          <IconTrash size={18} />
        </button>
      </div>
    </div>
  );
}