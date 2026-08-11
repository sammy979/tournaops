"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, username, email, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--black)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at top, rgba(201,168,76,0.06) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "460px", position: "relative" }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "32px",
          textDecoration: "none",
        }}>
          <div style={{
            background: "var(--gold)",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "1rem",
              color: "var(--black)",
            }}>TO</span>
          </div>
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 800,
            fontSize: "1.3rem",
            letterSpacing: "0.08em",
            color: "var(--white)",
            textTransform: "uppercase",
          }}>TournaOps</span>
        </Link>

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: "3px solid var(--gold)",
          padding: "32px",
        }}>
          <div className="section-label" style={{ marginBottom: "8px" }}>Create Account</div>
          <h1 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "1.6rem",
            color: "var(--white)",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            marginBottom: "8px",
          }}>Start Running Tournaments</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--white-40)", marginBottom: "24px" }}>
            Free to start. Upgrade to Pro when you need advanced features.
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{
                display: "block",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                color: "var(--white-40)",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoFocus
                style={{
                  width: "100%",
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.92rem",
                  padding: "11px 14px",
                  background: "var(--surface-2)",
                  color: "var(--white)",
                  border: "1px solid var(--border)",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  letterSpacing: "0.12em",
                  color: "var(--white-40)",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  pattern="[a-z0-9_]+"
                  style={{
                    width: "100%",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.88rem",
                    padding: "11px 14px",
                    background: "var(--surface-2)",
                    color: "var(--white)",
                    border: "1px solid var(--border)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  letterSpacing: "0.12em",
                  color: "var(--white-40)",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.92rem",
                    padding: "11px 14px",
                    background: "var(--surface-2)",
                    color: "var(--white)",
                    border: "1px solid var(--border)",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: "block",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                color: "var(--white-40)",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: "100%",
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.92rem",
                  padding: "11px 14px",
                  background: "var(--surface-2)",
                  color: "var(--white)",
                  border: "1px solid var(--border)",
                  outline: "none",
                }}
              />
              <div style={{ fontSize: "0.72rem", color: "var(--white-40)", marginTop: "4px" }}>
                Minimum 6 characters
              </div>
            </div>

            {error && (
              <div style={{
                background: "var(--red-dim)",
                border: "1px solid var(--red)",
                borderLeft: "3px solid var(--red)",
                padding: "10px 14px",
                fontSize: "0.82rem",
                color: "var(--red)",
                fontFamily: "Barlow Condensed, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{ width: "100%", opacity: loading ? 0.5 : 1, marginTop: "8px" }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div style={{
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: "1px solid var(--border)",
          }}>
            <a href="/api/auth/google" style={{
              display: "block",
              width: "100%",
              padding: "10px 14px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--white-70)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              textAlign: "center",
            }}>Continue with Google</a>
          </div>
        </div>

        <div style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "0.85rem",
          color: "var(--white-40)",
        }}>
          Already have an account?{" "}
          <Link href="/login" style={{
            color: "var(--gold)",
            textDecoration: "none",
            fontWeight: 600,
          }}>Sign in</Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <Link href="/" style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            color: "var(--white-40)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>← Back to TournaOps</Link>
        </div>
      </div>
    </div>
  );
}