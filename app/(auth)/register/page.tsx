"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/ui/SiteHeader";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("All fields required"); return; }
    if (password.length < 8)          { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: "calc(100vh - 68px)", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          {/* Card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderTop: "3px solid var(--gold)",
            padding: "40px 32px",
          }}>
            {/* Section label */}
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              color: "var(--gold)",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>Create Account</div>

            <h1 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "2rem",
              lineHeight: 1,
              letterSpacing: "-0.01em",
              color: "var(--white)",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}>Start Running<br />Tournaments</h1>

            <p style={{ color: "var(--white-40)", fontSize: "0.9rem", marginBottom: "28px" }}>
              Free to start. No credit card required.
            </p>

            {error && (
              <div style={{
                background: "var(--red-dim)",
                border: "1px solid var(--red)",
                padding: "10px 14px",
                marginBottom: "16px",
                color: "var(--red)",
                fontSize: "0.85rem",
              }}>{error}</div>
            )}

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Full Name",   value: name,     setter: setName,     type: "text",     placeholder: "Your name" },
                { label: "Email",       value: email,    setter: setEmail,    type: "email",    placeholder: "you@email.com" },
                { label: "Password",    value: password, setter: setPassword, type: "password", placeholder: "8+ characters" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{
                    display: "block",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.12em",
                    color: "var(--white-40)",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={e => f.setter(e.target.value)}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%",
                      background: "var(--black)",
                      border: "1px solid var(--border)",
                      color: "var(--white)",
                      padding: "12px 14px",
                      fontSize: "0.95rem",
                      fontFamily: "Barlow, sans-serif",
                      outline: "none",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                    onBlur={e =>  (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                </div>
              ))}

              <button type="submit" disabled={loading} style={{
                background: "var(--gold)",
                color: "var(--black)",
                padding: "13px",
                border: "none",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "0.95rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                marginTop: "8px",
              }}>
                {loading ? "Creating..." : "Create Account →"}
              </button>
            </form>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "24px 0",
            }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <span style={{ color: "var(--white-40)", fontSize: "0.75rem" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>

            <a href="/api/auth/google" style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              background: "var(--black)",
              border: "1px solid var(--border)",
              padding: "12px",
              color: "var(--white)",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>

            <p style={{ textAlign: "center", color: "var(--white-40)", fontSize: "0.85rem", marginTop: "20px" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--gold)", fontWeight: 600, textDecoration: "none" }}>
                Log In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}