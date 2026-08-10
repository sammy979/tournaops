// components/payment/PaymentHistory.tsx
"use client"
import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Clock, CreditCard } from "lucide-react"

interface Payment {
  id: string
  amount: number
  currency: string
  method: string
  transactionReference: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  submittedAt: string
  rejectionReason?: string
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }, [])

  const badge = (s: string) => {
    const c = s === "APPROVED" ? { c: "#10b981", bg: "rgba(16,185,129,0.1)" }
      : s === "REJECTED" ? { c: "#f87171", bg: "rgba(239,68,68,0.1)" }
      : { c: "#facc15", bg: "rgba(250,204,21,0.1)" }
    const Icon = s === "APPROVED" ? CheckCircle : s === "REJECTED" ? XCircle : Clock
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem",
        background: c.bg, color: c.c, borderRadius: "0.375rem", fontSize: "0.7rem", fontWeight: 600 }}>
        <Icon style={{ width: "0.75rem", height: "0.75rem" }} /> {s}
      </span>
    )
  }

  if (loading) return <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>Loading...</div>
  if (!payments.length) return (
    <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
      <CreditCard style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto 0.5rem", opacity: 0.4 }} />
      <p style={{ fontSize: "0.875rem", margin: 0 }}>No payment history yet</p>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {payments.map((p) => (
        <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.625rem", padding: "0.875rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: 700, color: "#fff" }}>{p.currency} {p.amount.toLocaleString()}</span>
                <span style={{ fontSize: "0.7rem", color: "#9ca3af", background: "rgba(255,255,255,0.05)", padding: "0.125rem 0.375rem", borderRadius: "0.25rem" }}>{p.method}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", fontFamily: "monospace" }}>Ref: {p.transactionReference}</div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem" }}>{new Date(p.submittedAt).toLocaleDateString()}</div>
            </div>
            {badge(p.status)}
          </div>
          {p.status === "APPROVED" && (
            <div style={{ marginTop: "0.5rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "0.375rem", padding: "0.375rem 0.5rem", fontSize: "0.7rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <CheckCircle style={{ width: "0.75rem", height: "0.75rem" }} /> Pro is now active
            </div>
          )}
          {p.status === "REJECTED" && p.rejectionReason && (
            <div style={{ marginTop: "0.5rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.375rem", padding: "0.375rem 0.5rem", fontSize: "0.7rem", color: "#f87171" }}>
              <strong>Reason: </strong>{p.rejectionReason}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}