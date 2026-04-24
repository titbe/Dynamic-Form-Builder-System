"use client";

import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/lib/api/auth.service";
import { useAuth } from "@/lib/core/auth/auth-provider";

type LoginInput = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { register, handleSubmit } = useForm<LoginInput>();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ data }) => {
      login(data.accessToken, data.refreshToken, data.user);
      router.replace(data.user.role === "ADMIN" ? "/admin/forms" : "/sw/forms");
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form
        className="w-full space-y-4 rounded-xl border border-brand-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
      >
        <h1 className="text-2xl font-bold text-brand-800">Đăng nhập</h1>
        <p className="text-sm text-brand-700">Admin/SW dùng tài khoản trong file env backend.</p>
        <TextInput label="Email" {...register("email")} required />
        <PasswordInput label="Password" {...register("password")} required />
        <Button type="submit" fullWidth loading={loginMutation.isPending}>
          Login
        </Button>
      </form>
    </main>
  );
}