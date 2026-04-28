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
    const stored = localStorage.getItem("app_user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (payload: LoginPayload) => {
    const data = await apiLogin(payload);
    
    // Allow both warehouse_manager and supplier roles
    if (data.user.role !== "warehouse_manager" && data.user.role !== "supplier") {
      throw new Error("Access restricted to authorized personnel.");
    }
    
    localStorage.setItem("token", data.token);
    localStorage.setItem("app_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("app_user");
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