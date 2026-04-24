import { AuthUser } from "../types";

const ACCESS_TOKEN_KEY = "fms_access_token";
const REFRESH_TOKEN_KEY = "fms_refresh_token";

export interface DecodedToken {
  sub: string;
  email?: string;
  role?: "ADMIN" | "SW";
  jti: string;
  type: "access" | "refresh";
  exp: number;
  iat: number;
}

export const tokenManager = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  decodeAccessToken(): Omit<DecodedToken, "email" | "role"> & { email: string; role: "ADMIN" | "SW" } | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    if (!decoded || decoded.type !== "access") return null;

    return decoded as Omit<DecodedToken, "email" | "role"> & { email: string; role: "ADMIN" | "SW" };
  },

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  },

  shouldRefresh(expiresInSeconds = 300): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now < expiresInSeconds;
  },

  getUserFromToken(): AuthUser | null {
    const decoded = this.decodeAccessToken();
    if (!decoded) return null;

    return {
      id: Number(decoded.sub),
      email: decoded.email,
      role: decoded.role,
    };
  },

  hasToken(): boolean {
    return !!this.getAccessToken();
  },
};