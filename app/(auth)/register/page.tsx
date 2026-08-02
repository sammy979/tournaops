"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Command, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, AtSign } from "lucide-react";
import { registerUser } from "@/lib/auth/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = registerUser(email, password, username, displayName);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setError(result.error || "Registration failed");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md">
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

        <div className="glass-heavy neon-border rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h1 className="font-display font-black text-2xl md:text-3xl mb-2">Get Started</h1>
            <p className="text-white/60 mb-6 text-sm">Create your free account in seconds</p>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 fade-in-up">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-lg font-bold text-green-400">Account Created!</div>
                <div className="text-sm text-white/60">Welcome to TournaOps! Redirecting...</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">
                    <User className="w-3.5 h-3.5 inline mr-1" /> Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="input"
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="label">
                    <AtSign className="w-3.5 h-3.5 inline mr-1" /> Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="johndoe"
                    className="input"
                    required
                    pattern="[a-z0-9_]{3,20}"
                    minLength={3}
                    maxLength={20}
                    disabled={loading}
                  />
                  <p className="text-xs text-white/40 mt-1">Lowercase letters, numbers, underscores only</p>
                </div>

                <div>
                  <label className="label">
                    <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input"
                    required
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
                    placeholder="Minimum 6 characters"
                    className="input"
                    required
                    minLength={6}
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
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Free Account
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                <p className="text-xs text-white/40 text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>

                <div className="text-center text-sm text-white/60 pt-4 border-t border-white/5">
                  Already have an account?{" "}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition">
                    Sign in
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