"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LoginForm from "./warehouse/components/LoginForm";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/warehouse");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d0d]">
        <div className="h-1 w-24 bg-[#c8b86a] animate-pulse" />
      </div>
    );
  }

  if (user) return null;

  return <LoginForm />;
}
