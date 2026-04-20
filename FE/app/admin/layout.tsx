"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthHeader } from "@/components/auth/auth-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard roles={["ADMIN"]}>
      <AuthHeader />
      {children}
    </AuthGuard>
  );
}
