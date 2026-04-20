"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api/auth";
import { authTokenStorage } from "@/lib/core/api/http";
import { AuthUser } from "@/lib/core/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const token = authTokenStorage.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.data);
    } catch {
      authTokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: (token, nextUser) => {
        authTokenStorage.set(token);
        setUser(nextUser);
      },
      logout: () => {
        authTokenStorage.clear();
        setUser(null);
      },
      refreshMe
    }),
    [user, loading]
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
