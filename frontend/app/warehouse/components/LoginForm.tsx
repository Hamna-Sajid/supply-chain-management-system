"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/warehouse");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#c8b86a 1px, transparent 1px), linear-gradient(90deg, #c8b86a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Corner accents */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#c8b86a]" />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#c8b86a]" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#c8b86a]" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#c8b86a]" />

        <div className="border border-[#2a2a2a] bg-[#111111] p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-[#c8b86a]" />
              <span className="text-[10px] tracking-[0.3em] text-[#c8b86a] uppercase font-mono">
                Supply Chain OS
              </span>
            </div>
            <h1 className="text-2xl font-mono font-bold text-[#e8e4dc] tracking-tight leading-none mb-1">
              Warehouse
            </h1>
            <p className="text-[11px] text-[#555] font-mono tracking-widest uppercase">
              Management Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-[#666] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e4dc] font-mono text-sm px-3 py-2.5 outline-none focus:border-[#c8b86a] transition-colors placeholder:text-[#333]"
                placeholder="warehouse@company.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-[#666] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e4dc] font-mono text-sm px-3 py-2.5 outline-none focus:border-[#c8b86a] transition-colors placeholder:text-[#333]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="border border-red-900/50 bg-red-950/20 px-3 py-2">
                <p className="text-red-400 text-[11px] font-mono">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c8b86a] text-[#0d0d0d] font-mono text-xs font-bold tracking-[0.2em] uppercase py-3 hover:bg-[#d4c67a] active:bg-[#b8a85a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Authenticating..." : "Enter System"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
            <p className="text-[10px] text-[#333] font-mono text-center tracking-wider">
              ROLE: WAREHOUSE_MANAGER
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
