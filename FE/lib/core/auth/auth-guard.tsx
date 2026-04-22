"use client";

import { Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";

export const AuthGuard = ({
  roles,
  children,
}: {
  roles: Array<"ADMIN" | "SW">;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { user, loading, hasRole } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      if (!roles.some((role) => hasRole(role))) {
        router.replace(user.role === "ADMIN" ? "/admin/forms" : "/sw/forms");
      }
    }
  }, [loading, user, roles, hasRole, router]);

  if (loading || !user || !roles.some((role) => hasRole(role))) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
};

export const withAuth = (roles: Array<"ADMIN" | "SW">) => {
  return (Component: React.ComponentType) => {
    return function AuthenticatedComponent(props: Record<string, unknown>) {
      return (
        <AuthGuard roles={roles}>
          <Component {...props} />
        </AuthGuard>
      );
    };
  };
};