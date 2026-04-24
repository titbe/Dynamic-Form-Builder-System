"use client";

import { Button, Group, Modal, Text } from "@mantine/core";
import { IconAlertTriangle, IconEdit } from "@tabler/icons-react";
import { ReactNode } from "react";

interface ConfirmationDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  type?: "danger" | "warning";
}

export function ConfirmationDialog({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  loading = false,
  type = "danger",
}: ConfirmationDialogProps) {
  const isDanger = type === "danger";
  const color = isDanger ? "red" : "blue";

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="sm">
      <div className="space-y-4">
        <Group gap="sm">
          {isDanger ? (
            <IconAlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <IconEdit className="h-5 w-5 text-blue-500" />
          )}
          <Text>{message}</Text>
        </Group>

        <Text size="sm" c="dimmed">
          {isDanger ? "Hành động này không thể hoàn tác." : "Hành động này sẽ lưu các thay đổi."}
        </Text>

        <Group gap="sm" justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={color} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </div>
    </Modal>
  );
}

interface UpdateDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  changes: Array<{ field: string; from: string; to: string }>;
  confirmLabel?: string;
  loading?: boolean;
}

export function UpdateDialog({
  opened,
  onClose,
  onConfirm,
  title = "Xác nhận cập nhật",
  changes,
  confirmLabel = "Lưu",
  loading = false,
}: UpdateDialogProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="sm">
      <div className="space-y-4">
        <Text>Bạn có muốn lưu các thay đổi:</Text>

        <div className="space-y-2 rounded-lg bg-gray-50 p-3">
          {changes.map((change, index) => (
            <div key={index} className="text-sm">
              <Text span c="dimmed">
                {change.field}:{" "}
              </Text>
              <Text span>{change.from}</Text>
              {change.from !== change.to && (
                <>
                  {" → "}
                  <Text span fw="bold">
                    {change.to}
                  </Text>
                </>
              )}
            </div>
          ))}
        </div>

        <Group gap="sm" justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </div>
    </Modal>
  );
}