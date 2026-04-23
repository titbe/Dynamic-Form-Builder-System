"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useState } from "react";
import { FieldEntity } from "@/lib/core/types";
import { SortableFieldItem } from "./sortable-field-item";

interface DraggableFieldListProps {
  fields: FieldEntity[];
  onReorder: (items: Array<{ id: number; order: number }>) => void;
  onEdit: (field: FieldEntity) => void;
  onDelete: (field: FieldEntity) => void;
  disabled?: boolean;
}

export function DraggableFieldList({
  fields,
  onReorder,
  onEdit,
  onDelete,
  disabled = false
}: DraggableFieldListProps) {
  const [items, setItems] = useState(() => 
    [...fields].sort((a, b) => a.order - b.order)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      const reorderItems = newItems.map((item, index) => ({
        id: item.id,
        order: index
      }));

      onReorder(reorderItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((field) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}