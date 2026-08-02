"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Command, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginUser } from "@/lib/auth/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = loginUser(email, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setError(result.error || "Login failed");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 rounded-xl blur-md opacity-60"></div>
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center border border-white/10">
              <Command className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="font-display font-black text-2xl">
              <span className="text-white">TOURNA</span><span className="text-cyan-400">OPS</span>
            </div>
          </div>
        </Link>

        {/* Card */}
        <div className="glass-heavy neon-border rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h1 className="font-display font-black text-2xl md:text-3xl mb-2">Welcome Back</h1>
            <p className="text-white/60 mb-6 text-sm">Sign in to continue to your command center</p>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 fade-in-up">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-lg font-bold text-green-400">Login Successful!</div>
                <div className="text-sm text-white/60">Redirecting to dashboard...</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">
                    <Mail className="w-3.5 h-3.5 inline mr-1" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input"
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="label">
                    <Lock className="w-3.5 h-3.5 inline mr-1" /> Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                <div className="text-center text-sm text-white/60 pt-4 border-t border-white/5">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-bold transition">
                    Create one
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}