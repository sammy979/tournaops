// app/dashboard/upgrade/page.tsx
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PaymentForm from "@/components/payment/PaymentForm"
import PaymentHistory from "@/components/payment/PaymentHistory"
import { Crown, Check, Loader2 } from "lucide-react"

const PRO_FEATURES = [
  "Unlimited tournaments",
  "Unlimited teams per tournament",
  "Advanced bracket types",
  "Discord integration",
  "Broadcast Studio / OBS overlay",
  "CSV import & export",
  "Custom scoring rules",
  "Priority support",
  "Analytics & reports",
  "Advanced group stages",
]

export default function UpgradePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.id) setAuthed(true)
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

  if (!authed) return null

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.3)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1rem" }}>
          <Crown style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f59e0b" }}>TournaOps Pro</span>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", margin: 0 }}>Upgrade to Pro</h1>
        <p style={{ color: "#9ca3af", marginTop: "0.5rem", maxWidth: "32rem", margin: "0.5rem auto 0" }}>
          Run professional esports tournaments with the full TournaOps suite.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Features */}
        <div style={{ background: "linear-gradient(135deg, #1a1a24, #252533)", borderRadius: "1rem", padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>What you get with Pro</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {PRO_FEATURES.map((f) => (
              <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem", color: "#e5e7eb" }}>
                <div style={{ width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "#10b981",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check style={{ width: "0.75rem", height: "0.75rem", color: "#fff" }} />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Form */}
        <div style={{ background: "rgba(30,30,40,0.6)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>Submit Payment</h2>
          <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginTop: 0, marginBottom: "1rem" }}>
            Send payment via eSewa, Khalti, or bank transfer then submit your details below.
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