"use client";

import {
  IconAbc,
  IconCalendar,
  IconColorFilter,
  IconHash,
  IconSelector,
} from "@tabler/icons-react";
import { FieldType } from "@/lib/core/types";

interface FieldTypeIconProps {
  type: FieldType;
  className?: string;
}

export function FieldTypeIcon({ type, className = "h-5 w-5" }: FieldTypeIconProps) {
  const iconProps = { className };

  switch (type) {
    case "TEXT":
      return <IconAbc {...iconProps} />;
    case "NUMBER":
      return <IconHash {...iconProps} />;
    case "DATE":
      return <IconCalendar {...iconProps} />;
    case "COLOR":
      return <IconColorFilter {...iconProps} />;
    case "SELECT":
      return <IconSelector {...iconProps} />;
    default:
      return <IconAbc {...iconProps} />;
  }
}

export function FieldTypeLabel({ type }: { type: FieldType }) {
  switch (type) {
    case "TEXT":
      return "Văn bản";
    case "NUMBER":
      return "Số";
    case "DATE":
      return "Ngày tháng";
    case "COLOR":
      return "Màu sắc";
    case "SELECT":
      return "Lựa chọn";
    default:
      return type;
  }
}