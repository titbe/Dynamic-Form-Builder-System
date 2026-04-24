import { http } from "../core/api/client";
import { AuthUser } from "../core/types";

export const authService = {
  login: (payload: { email: string; password: string }) => {
    return http<{ accessToken: string; refreshToken: string; user: AuthUser }>("auth/login", {
      method: "POST",
      data: payload,
    });
  },

  refresh: (refreshToken: string) => {
    return http<{ success: boolean }>("auth/refresh", {
      method: "POST",
      data: { refreshToken },
    });
  },

  logout: () => {
    return http<{ success: boolean }>("auth/logout", {
      method: "POST",
    });
  },

  me: () => {
    return http<AuthUser>("auth/me");
  },
};