"use client";

import { AuthGuard } from "@/lib/core/auth/auth-guard";
import { AuthHeader } from "@/components/auth/auth-header";

export default function SwLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard roles={["SW", "ADMIN"]}>
      <AuthHeader />
      {children}
    </AuthGuard>
  );
}
