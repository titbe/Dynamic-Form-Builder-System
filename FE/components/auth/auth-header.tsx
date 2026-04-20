"use client";

import { Button } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export const AuthHeader = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-brand-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-brand-800">
          FMS
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-brand-700">{user?.email}</span>
          <Button
            size="xs"
            variant="default"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
