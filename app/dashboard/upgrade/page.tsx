// app/dashboard/upgrade/page.tsx
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PaymentForm from "@/components/payment/PaymentForm"
import PaymentHistory from "@/components/payment/PaymentHistory"
import { Crown, Check, Loader2, Zap } from "lucide-react"
import { PRO_PRICE, PRO_FEATURES } from "@/lib/pricing"

export default function UpgradePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.id) setUser(d.user)
        else router.push("/login")
      })
      .catch(() => router.push("/login"))
      .finally(() => setChecking(false))
  }, [router])

  if (checking) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!user) return null

  // Already Pro
  if (user.isPro) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,146,60,0.05))",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: "1.5rem",
          padding: "3rem 2rem",
        }}>
          <Crown style={{ width: "4rem", height: "4rem", color: "#f59e0b", margin: "0 auto 1rem" }} />
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
            You're a Pro Member! 🎉
          </h1>
          <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>
            You have full access to all TournaOps Pro features.
          </p>
          <button onClick={() => router.push("/dashboard")}
            style={{ background: "#f59e0b", color: "#000", fontWeight: 700, padding: "0.75rem 1.5rem",
              borderRadius: "0.625rem", border: "none", cursor: "pointer", fontSize: "0.9375rem" }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Hero Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.25rem",
        }}>
          <Crown style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f59e0b" }}>TournaOps Pro</span>
        </div>

        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.1 }}>
          Upgrade to Pro
        </h1>

        {/* HUGE PRICE DISPLAY */}
        <div style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: "0.375rem" }}>
            <span style={{ fontSize: "1.125rem", color: "#9ca3af", fontWeight: 600 }}>{PRO_PRICE.currencySymbol}</span>
            <span style={{
              fontSize: "3.5rem", fontWeight: 800,
              background: "linear-gradient(135deg, #f59e0b, #fb923c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}>
              {PRO_PRICE.amount}
            </span>
            <span style={{ fontSize: "1rem", color: "#9ca3af" }}>/ {PRO_PRICE.duration}</span>
          </div>
        </div>

        <p style={{ color: "#9ca3af", marginTop: "0.5rem", maxWidth: "32rem", margin: "0.5rem auto 0", fontSize: "0.9375rem" }}>
          One-time payment. No auto-renewal. Full access for {PRO_PRICE.duration}.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Features Card */}
        <div style={{
          background: "linear-gradient(135deg, #1a1a24, #252533)",
          borderRadius: "1rem", padding: "1.75rem",
          border: "1px solid rgba(245,158,11,0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Zap style={{ width: "1.25rem", height: "1.25rem", color: "#f59e0b" }} />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              Everything included
            </h2>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: "9999px", padding: "0.25rem 0.75rem", marginBottom: "1rem",
          }}>
            <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#10b981" }}>All features unlocked</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {PRO_FEATURES.map((f) => (
              <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem", color: "#e5e7eb" }}>
                <div style={{
                  width: "1.25rem", height: "1.25rem", borderRadius: "50%",
                  background: "rgba(16,185,129,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Check style={{ width: "0.75rem", height: "0.75rem", color: "#10b981" }} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <div style={{
            marginTop: "1.5rem", padding: "0.875rem", borderRadius: "0.625rem",
            background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>Total to pay</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b" }}>
                {PRO_PRICE.currencySymbol} {PRO_PRICE.amount}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div style={{
          background: "rgba(30,30,40,0.6)", borderRadius: "1rem",
          padding: "1.75rem", border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
            Submit Payment
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "#9ca3af", marginTop: 0, marginBottom: "1.25rem" }}>
            Pay {PRO_PRICE.display} via Khalti or Bank Transfer, then submit your details below.
          </p>
          <PaymentForm />
        </div>
      </div>

      {/* Payment History */}
      <div style={{ background: "rgba(30,30,40,0.6)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>Payment History</h2>
        <PaymentHistory />
      </div>
    </div>
  )
}