"use client";

import { TextInput, TextInputProps } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useDebouncedCallback } from "@/lib/hooks/use-debounce";

interface SearchInputProps extends Omit<TextInputProps, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  debounceMs = 300,
  ...props
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useDebouncedCallback(onChange, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <TextInput
      leftSection={<IconSearch className="h-4 w-4" />}
      placeholder="Tìm kiếm..."
      value={localValue}
      onChange={handleChange}
      {...props}
    />
  );
}