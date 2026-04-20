"use client";

import { Button, Group, Modal } from "@mantine/core";
import { ReactNode } from "react";

export const BaseDialog = ({
  opened,
  onClose,
  title,
  children,
  loading,
  onSubmit,
  submitLabel = "Lưu"
}: {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  loading?: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}) => {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <div className="space-y-4">
        {children}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button loading={loading} onClick={onSubmit}>
            {submitLabel}
          </Button>
        </Group>
      </div>
    </Modal>
  );
};
