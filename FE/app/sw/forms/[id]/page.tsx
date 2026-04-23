"use client";

import { notifications } from "@mantine/notifications";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/core/page-shell";
import { DynamicFormRenderer } from "@/components/forms/dynamic-form-renderer";
import { formsService } from "@/lib/api";

export default function SwFormSubmitPage() {
  const params = useParams<{ id: string }>();
  const formId = Number(params.id);

  const formQuery = useQuery({
    queryKey: ["form", formId],
    queryFn: () => formsService.getFormById(formId)
  });

  const submitMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => formsService.submitForm(formId, values),
    onSuccess: () => {
      notifications.show({
        title: "Thành công",
        message: "Form đã được gửi thành công!",
        color: "green",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
        color: "red",
      });
    }
  });

  return (
    <PageShell title={`Điền form #${formId}`} subtitle={formQuery.data?.data.title}>
      {submitMutation.isSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">
          Form đã được gửi thành công! Bạn có thể điền form khác.
        </div>
      )}
      <DynamicFormRenderer
        fields={formQuery.data?.data.fields ?? []}
        loading={submitMutation.isPending}
        onSubmit={(values) => submitMutation.mutate(values)}
      />
    </PageShell>
  );
}