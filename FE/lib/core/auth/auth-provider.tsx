"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/lib/api/auth.service";
import { tokenManager } from "@/lib/core/auth/token-manager";
import { AuthUser } from "@/lib/core/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isSW: boolean;
  hasRole: (role: "ADMIN" | "SW") => boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const initFromToken = useCallback(() => {
    const userFromToken = tokenManager.getUserFromToken();
    if (userFromToken) {
      setUser(userFromToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initFromToken();
  }, [initFromToken]);

  const login = useCallback((accessToken: string, refreshToken: string, userData: AuthUser) => {
    tokenManager.setTokens(accessToken, refreshToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Continue logout even if API fails
    } finally {
      tokenManager.clearTokens();
      setUser(null);
    }
  }, []);

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user?.role]);
  const isSW = useMemo(() => user?.role === "SW", [user?.role]);

  const hasRole = useCallback(
    (role: "ADMIN" | "SW") => user?.role === role,
    [user?.role]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin,
      isSW,
      hasRole,
      login,
      logout,
    }),
    [user, loading, isAdmin, isSW, hasRole, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};