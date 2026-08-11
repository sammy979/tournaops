"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicNav from "@/components/ui/PublicNav";
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight,
  AlertCircle, Loader2, CheckCircle2,
  Trophy, Zap, Users, Globe, Radio,
} from "lucide-react";

const BG      = "#07090f";
const SURFACE = "#0d0f18";
const BORDER  = "rgba(255,255,255,0.08)";

const PERKS = [
  { icon: Trophy, text: "Create tournaments for free, no limit"  },
  { icon: Zap,    text: "AI generates your brackets instantly"   },
  { icon: Users,  text: "Discord bot posts results automatically"},
  { icon: Globe,  text: "Public pages shareable with anyone"     },
  { icon: Radio,  text: "OBS overlays for live broadcasting"     },
];

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const clr   = score <= 1 ? "#ef4444" : score === 2 ? "#f59e0b" : score === 3 ? "#3b82f6" : "#10b981";
  const lbl   = score <= 1 ? "Weak"    : score === 2 ? "Fair"    : score === 3 ? "Good"    : "Strong";
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i <= score ? clr : "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["8+ chars","Uppercase","Number","Symbol"].map((l, i) => (
            <span key={l} className="text-xs"
              style={{ color: checks[i] ? "#34d399" : "rgba(255,255,255,0.2)" }}>{l}</span>
          ))}
        </div>
        <span className="text-xs font-semibold" style={{ color: clr }}>{lbl}</span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (!agreed)             { setError("Please accept the terms to continue."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) { router.push("/dashboard"); }
      else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Registration failed. Please try again.");
      }
    } catch { setError("Network error. Please try again."); }
    finally   { setLoading(false); }
  };

  const fieldStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${BORDER}`,
    color: "#fff",
    borderRadius: "12px",
    padding: "12px 16px 12px 40px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    transition: "border-color .15s",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, color: "#fff" }}>
      <PublicNav />

      <div className="flex-1 flex">

        {/* Left: Visual panel */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden"
          style={{ background: SURFACE, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="absolute bottom-1/4 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(79,70,229,0.10)" }} />
          <div className="relative max-w-sm w-full">
            <h2 className="text-3xl font-black text-white mb-3 leading-tight">
              Start Running<br />Pro Tournaments
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
              Everything you need to organize, broadcast, and manage competitive esports events.
            </p>
            <div className="space-y-4">
              {PERKS.map(perk => (
                <div key={perk.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
                    <perk.icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.60)" }}>{perk.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {["S","P","G","T","D"].map((l, i) => (
                    <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-violet-300"
                      style={{ background: "rgba(124,58,237,0.3)", border: "2px solid #0d0f18" }}>{l}</div>
                  ))}
                </div>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>+3,200 organizers</span>
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
                "Best tournament platform we've used. Saves hours every event."
              </p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white mb-1.5">Create account</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Free forever · No credit card required
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 text-sm px-4 py-3 rounded-xl mb-5"
                style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            {/* Google OAuth */}
            <button onClick={() => window.location.href = "/api/auth/google"}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all mb-5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>or with email</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "rgba(255,255,255,0.25)" }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your name" style={fieldStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
                    onBlur={e  => (e.currentTarget.style.borderColor = BORDER)} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "rgba(255,255,255,0.25)" }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" style={fieldStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
                    onBlur={e  => (e.currentTarget.style.borderColor = BORDER)} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "rgba(255,255,255,0.25)" }} />
                  <input type={showPass ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    style={{ ...fieldStyle, paddingRight: "48px" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
                    onBlur={e  => (e.currentTarget.style.borderColor = BORDER)} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.25)" }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <StrengthBar password={password} />
              </div>

              {/* Terms agreement */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <div onClick={() => setAgreed(!agreed)}
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    background:  agreed ? "#7C3AED" : "transparent",
                    border:      agreed ? "2px solid #7C3AED" : "2px solid rgba(255,255,255,0.2)",
                  }}>
                  {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                  I agree to the{" "}
                  <Link href="/terms"   className="text-violet-400 hover:text-violet-300 transition-colors">Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-violet-400 hover:text-violet-300 transition-colors">Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" disabled={loading || !agreed}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all mt-2"
                style={{
                  background: "#7C3AED",
                  boxShadow:  "0 4px 20px rgba(124,58,237,0.28)",
                  opacity:    loading || !agreed ? 0.5 : 1,
                  cursor:     loading || !agreed ? "not-allowed" : "pointer",
                }}
                onMouseEnter={e => { if (!loading && agreed) e.currentTarget.style.background = "#6D28D9"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#7C3AED"; }}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                  : <>Create Account <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}