// src/providers/AuthProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMe, logoutUser } from "@/lib/api/auth";
import {
  clearAuthStorage,
  getStoredUser,
  setStoredUser,
} from "@/lib/storage";

interface AuthContextValue {
  user: any | null;
  loading: boolean;
  authenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<any | null>>;
  refreshUser: () => Promise<any | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const freshUser = await getMe();

      setUser(freshUser);
      setStoredUser(freshUser);

      return freshUser;
    } catch {
      clearAuthStorage();
      setUser(null);

      return null;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Even if the backend logout call fails,
      // clear client UI state and move on.
    } finally {
      clearAuthStorage();
      setUser(null);

      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      /**
       * This cached user is only a fast UI hint.
       * It is not the auth source of truth.
       */
      const cachedUser = getStoredUser<any>();

      if (cachedUser) {
        setUser(cachedUser);
      }

      /**
       * The backend cookie session is the real source of truth.
       */
      await refreshUser();

      setLoading(false);
    };

    void bootstrapAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: Boolean(user),
        setUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}