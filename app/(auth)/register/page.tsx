"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trophy, Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";

const PERKS = [
  "Free forever Ã¢â‚¬â€ no credit card",
  "Run unlimited tournaments (free plan)",
  "OBS overlays included",
  "Discord bot integration",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    displayName: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "stretch",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Left Panel Ã¢â‚¬â€ desktop only */}
      <div
        className="hidden lg:flex"
        style={{
          width: "45%",
          background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.04))",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          flexDirection: "column",
          justifyContent: "center",
          padding: "4rem",
        }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "3rem" }}>
            <Image src="/logo.png" alt="TournaOps" width={48} height={48} style={{ objectFit: "contain", borderRadius: "0.5rem" }} priority />
        </Link>

        <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: "1rem" }}>
          Start running pro tournaments today
        </h2>
        <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.6, marginBottom: "2.5rem" }}>
          Join 1,000+ PUBG Mobile organizers who trust TournaOps to run their events.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {PERKS.map(perk => (
            <div key={perk} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "1.5rem", height: "1.5rem",
                background: "rgba(245,158,11,0.15)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Check style={{ width: "0.875rem", height: "0.875rem", color: "#f59e0b" }} />
              </div>
              <span style={{ color: "#d1d5db", fontSize: "0.9375rem" }}>{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel Ã¢â‚¬â€ Form */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Mobile Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }} className="lg:hidden">
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <Image src="/logo.png" alt="TournaOps" width={48} height={48} style={{ objectFit: "contain", borderRadius: "0.5rem" }} priority />
            </Link>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
              Create your account
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Free forever. No credit card required.
            </p>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              color: "#f87171",
              fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {[
              { key: "displayName", label: "Display Name", type: "text", placeholder: "Your name", autoComplete: "name" },
              { key: "username", label: "Username", type: "text", placeholder: "yourhandle", autoComplete: "username" },
              { key: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#d1d5db", marginBottom: "0.5rem" }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  required
                  autoComplete={field.autoComplete}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    color: "#fff",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
                />
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#d1d5db", marginBottom: "0.5rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 characters"
                  required
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 3rem 0.75rem 1rem",
                    color: "#fff",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: "1rem", height: "1rem" }} />
                    : <Eye style={{ width: "1rem", height: "1rem" }} />
                  }
                </button>
              </div>
              {form.password.length > 0 && (
                <div style={{ marginTop: "0.375rem", fontSize: "0.75rem", color: form.password.length >= 8 ? "#4ade80" : "#f87171" }}>
                  {form.password.length >= 8 ? "Ã¢Å“â€œ Strong enough" : `${8 - form.password.length} more characters needed`}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "rgba(245,158,11,0.6)" : "#f59e0b",
                color: "#000",
                border: "none",
                borderRadius: "0.875rem",
                padding: "0.875rem",
                fontWeight: 700,
                fontSize: "0.9375rem",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
                marginTop: "0.5rem",
              }}
            >
              {loading ? (
                <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} />Creating account...</>
              ) : (
                <>Create Free Account<ArrowRight style={{ width: "1rem", height: "1rem" }} /></>
              )}
            </button>
          </form>

          <p style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.875rem",
            color: "#6b7280",
          }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#f59e0b", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.75rem", color: "#4b5563" }}>
            By registering you agree to our{" "}
            <Link href="/terms" style={{ color: "#6b7280", textDecoration: "underline" }}>Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" style={{ color: "#6b7280", textDecoration: "underline" }}>Privacy Policy</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
