"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, AtSign, Eye, EyeOff } from "lucide-react";
import { registerUser } from "@/lib/auth/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await registerUser(email, password, username, displayName);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setError(result.error || "Registration failed");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/12 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/12 rounded-full blur-3xl animate-blob-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/8 rounded-full blur-3xl animate-blob-slow" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex flex-col items-center gap-4 mb-8 group">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden logo-glow shadow-2xl shadow-blue-500/50 bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-105 transition-transform animate-pulse-glow">
            <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-white tracking-tight">TournaOps</div>
            <div className="text-[10px] text-blue-400 uppercase tracking-[0.25em] font-semibold">Tournament OS</div>
          </div>
        </Link>

        <div className="glass-heavy rounded-3xl p-8 border border-white/10 shadow-2xl">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center animate-pulse-glow">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xl font-bold text-green-400">Account Created!</p>
              <p className="text-gray-500 text-sm">Welcome to TournaOps!</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
                <p className="text-gray-500 text-sm">Free forever. No credit card.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    className="input-field"
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5" /> Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="johndoe"
                    className="input-field"
                    required
                    minLength={3}
                    maxLength={20}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-600">Lowercase, numbers, underscores - 3-20 chars</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="input-field pr-10"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= i * 3
                            ? i <= 1 ? "bg-red-500" : i <= 2 ? "bg-yellow-500" : i <= 3 ? "bg-blue-500" : "bg-green-500"
                            : "bg-white/10"
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>Create Free Account<ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <p className="text-xs text-gray-600 text-center">
                  By signing up you agree to our Terms of Service
                </p>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/8" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-[#0f0f18] text-gray-600 text-xs">or</span>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm">
             Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}