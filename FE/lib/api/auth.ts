import { http } from "../core/api/http";
import { AuthUser } from "../core/types";

export const authApi = {
  login: (payload: { email: string; password: string }) => {
    return http<{ accessToken: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  me: () => {
    return http<AuthUser>("/api/auth/me");
  }
};
