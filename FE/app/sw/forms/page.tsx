"use client";

import { Button } from "@mantine/core";
import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/core/page-shell";
import { formsService } from "@/lib/api";

export default function SwFormsPage() {
  const activeQuery = useQuery({
    queryKey: ["active-forms"],
    queryFn: formsService.getActiveForms
  });

  return (
    <PageShell title="SW - Active Forms" subtitle="Danh sách form active theo thứ tự cấu hình">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {(activeQuery.data?.data ?? []).map((form, index) => (
          <motion.div
            key={form.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-brand-800">{form.title}</h3>
            <p className="mb-4 text-sm text-brand-700">{form.description}</p>
            <Link href={`/sw/forms/${form.id}`}>
              <Button>Điền form</Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}
