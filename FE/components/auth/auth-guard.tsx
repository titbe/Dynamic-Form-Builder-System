"use client";

import { Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";

export const AuthGuard = ({
  roles,
  children
}: {
  roles: Array<"ADMIN" | "SW">;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (!loading && user && !roles.includes(user.role)) {
      router.replace(user.role === "ADMIN" ? "/admin/forms" : "/sw/forms");
    }
  }, [loading, user, roles, router]);

  if (loading || !user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
};
