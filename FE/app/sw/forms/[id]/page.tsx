"use client";

import { Text } from "@mantine/core";
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
    mutationFn: (values: Record<string, unknown>) => formsService.submitForm(formId, values)
  });

  return (
    <PageShell title={`Điền form #${formId}`} subtitle={formQuery.data?.data.title}>
      {submitMutation.isSuccess ? <Text c="green">Submit thành công.</Text> : null}
      <DynamicFormRenderer
        fields={formQuery.data?.data.fields ?? []}
        loading={submitMutation.isPending}
        onSubmit={(values) => submitMutation.mutate(values)}
      />
    </PageShell>
  );
}
