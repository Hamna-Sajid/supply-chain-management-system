"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff } from "lucide-react";

type Tab = "login" | "signup";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/warehouse");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : "Login failed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f0] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-[#e0e5e0]">
          {/* Green header */}
          <div className="bg-[#2d5a27] px-8 py-8 text-center">
            <h1 className="text-2xl font-bold text-white">SCM System Access</h1>
            <p className="text-[#a8c5a0] text-sm mt-1">Supply Chain Management Portal</p>
          </div>

          {/* Tab switcher */}
          <div className="bg-[#2d5a27] flex">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-3 text-sm font-semibold transition-all rounded-t-xl ${
                tab === "login"
                  ? "bg-white text-[#2d5a27]"
                  : "text-[#a8c5a0] hover:text-white"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-3 text-sm font-semibold transition-all rounded-t-xl ${
                tab === "signup"
                  ? "bg-white text-[#2d5a27]"
                  : "text-[#a8c5a0] hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form area */}
          <div className="bg-white px-8 py-8">
            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm text-[#1a2e1a] placeholder:text-[#b0bdb0] outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 pr-11 text-sm text-[#1a2e1a] placeholder:text-[#b0bdb0] outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7f6b] hover:text-[#1a2e1a] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2d5a27] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#1e3d1a] active:bg-[#162e13] transition-colors disabled:opacity-60 mt-2"
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>

                <p className="text-center text-sm text-[#4a9d8a] hover:underline cursor-pointer mt-2" onClick={() => setTab("signup")}>
                  Don&apos;t have an account? Sign Up
                </p>
              </form>
            ) : (
              <SignupForm onSwitchToLogin={() => setTab("login")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignupForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Full Name</label>
        <input type="text" placeholder="John Doe" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Email Address</label>
        <input type="email" placeholder="you@example.com" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Set Password</label>
        <input type="password" placeholder="••••••••" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all" />
        <p className="text-xs text-[#4a9d8a] mt-1">Min 8 characters with uppercase, lowercase, number & special character</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Select Your Role</label>
        <select className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm text-[#b0bdb0] outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all appearance-none bg-white">
          <option value="">Choose a role</option>
          <option value="warehouse">Warehouse</option>
          <option value="manufacturer">Manufacturer</option>
          <option value="retailer">Retailer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Contact Number</label>
        <input type="tel" placeholder="+1 (555) 123-4567" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Physical Address</label>
        <textarea placeholder="Enter your business address" rows={3} className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all resize-none" />
      </div>
      <button className="w-full bg-[#2d5a27] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#1e3d1a] transition-colors">
        Sign Up
      </button>
      <p className="text-center text-sm text-[#4a9d8a] hover:underline cursor-pointer" onClick={onSwitchToLogin}>
        Already have an account? Log In
      </p>
    </div>
  );
}
