"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, LoginPayload } from "@/lib/warehouse-api";

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("wh_user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = async (payload: LoginPayload) => {
    const data = await apiLogin(payload);
    if (data.user.role !== "warehouse_manager") {
      throw new Error("Access restricted to warehouse role.");
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("wh_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("wh_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
