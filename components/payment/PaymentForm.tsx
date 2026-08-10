// components/payment/PaymentForm.tsx
"use client"
import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { PRO_PRICE } from "@/lib/pricing"

interface PaymentSettings {
  esewaEnabled: boolean
  esewaAccountName?: string
  esewaAccountId?: string
  esewaInstructions?: string
  esewaQrUrl?: string
  khaltiEnabled: boolean
  khaltiAccountName?: string
  khaltiAccountId?: string
  khaltiInstructions?: string
  khaltiQrUrl?: string
  bankEnabled: boolean
  bankName?: string
  bankAccountHolder?: string
  bankAccountNumber?: string
  bankBranch?: string
  bankInstructions?: string
  bankQrUrl?: string
}

const input = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.5rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  color: "#fff",
  outline: "none",
} as const

const label = { display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.375rem" } as const

export default function PaymentForm() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [method, setMethod] = useState<string>("")
  const [amount, setAmount] = useState<string>(String(PRO_PRICE.amount))
  const [txRef, setTxRef] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [proofUrl, setProofUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    fetch("/api/payment-settings/public")
      .then((r) => r.json())
      .then((d) => setSettings(d?.settings || null))
      .catch(() => setSettings(null))
  }, [])

  const enabledMethods = settings
    ? ([
        settings.esewaEnabled ? "ESEWA" : null,
        settings.khaltiEnabled ? "KHALTI" : null,
        settings.bankEnabled ? "BANK" : null,
      ].filter(Boolean) as string[])
    : []

  // Auto-select first available method
  useEffect(() => {
    if (!method && enabledMethods.length > 0) {
      setMethod(enabledMethods[0])
    }
  }, [enabledMethods.length])

  const getInfo = () => {
    if (!settings || !method) return null
    if (method === "ESEWA") return { name: "eSewa", accountName: settings.esewaAccountName, accountId: settings.esewaAccountId, qrUrl: settings.esewaQrUrl, instructions: settings.esewaInstructions }
    if (method === "KHALTI") return { name: "Khalti", accountName: settings.khaltiAccountName, accountId: settings.khaltiAccountId, qrUrl: settings.khaltiQrUrl, instructions: settings.khaltiInstructions }
    if (method === "BANK") return { name: settings.bankName || "Bank", accountName: settings.bankAccountHolder, accountId: settings.bankAccountNumber, qrUrl: (settings as any).bankQrUrl, instructions: settings.bankInstructions, branch: settings.bankBranch }
    return null
  }

  const info = getInfo()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!method) return setError("Please select a payment method")
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError("Please enter a valid amount")
    if (!txRef.trim()) return setError("Please enter the transaction reference")

    setLoading(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method, amount: Number(amount), transactionReference: txRef.trim(),
          proofUrl: proofUrl.trim() || undefined, note: note.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || "Submission failed")
      setSuccess(true)
    } catch {
      setError("Network error. Try again.")
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ padding: "2rem", textAlign: "center", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "0.75rem" }}>
      <CheckCircle style={{ width: "3rem", height: "3rem", color: "#10b981", margin: "0 auto 0.75rem" }} />
      <h3 style={{ color: "#10b981", fontWeight: 700, marginBottom: "0.5rem" }}>Payment Submitted!</h3>
      <p style={{ color: "#6ee7b7", fontSize: "0.875rem", margin: 0 }}>Your payment is under review. Pro will activate once approved.</p>
    </div>
  )

  if (settings && enabledMethods.length === 0) return (
    <div style={{ padding: "1.5rem", textAlign: "center", background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.3)", borderRadius: "0.75rem" }}>
      <p style={{ color: "#facc15", fontSize: "0.875rem", margin: 0 }}>No payment methods currently available. Please contact support.</p>
    </div>
  )

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Price Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,146,60,0.05))",
        border: "1px solid rgba(245,158,11,0.25)",
        borderRadius: "0.625rem",
        padding: "0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Amount to Pay
          </div>
          <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "#f59e0b", lineHeight: 1.2 }}>
            {PRO_PRICE.display}
          </div>
        </div>
        <div style={{ fontSize: "0.7rem", color: "#9ca3af", textAlign: "right" }}>
          Pro for {PRO_PRICE.duration}
        </div>
      </div>

      <div>
        <div style={label}>Payment Method</div>
        {!settings ? (
          <div style={{ height: "2.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.5rem" }} />
        ) : (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {enabledMethods.includes("ESEWA") && (
              <button type="button" onClick={() => setMethod("ESEWA")}
                style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", border: `2px solid ${method === "ESEWA" ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                  background: method === "ESEWA" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)", color: method === "ESEWA" ? "#10b981" : "#e5e7eb",
                  fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>eSewa</button>
            )}
            {enabledMethods.includes("KHALTI") && (
              <button type="button" onClick={() => setMethod("KHALTI")}
                style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", border: `2px solid ${method === "KHALTI" ? "#a855f7" : "rgba(255,255,255,0.1)"}`,
                  background: method === "KHALTI" ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.03)", color: method === "KHALTI" ? "#a855f7" : "#e5e7eb",
                  fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>Khalti</button>
            )}
            {enabledMethods.includes("BANK") && (
              <button type="button" onClick={() => setMethod("BANK")}
                style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", border: `2px solid ${method === "BANK" ? "#3b82f6" : "rgba(255,255,255,0.1)"}`,
                  background: method === "BANK" ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)", color: method === "BANK" ? "#3b82f6" : "#e5e7eb",
                  fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>Bank</button>
            )}
          </div>
        )}
      </div>

      {info && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {info.qrUrl && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
              <img src={info.qrUrl} alt="QR" style={{ width: "10rem", height: "10rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          )}
          {info.accountName && <div style={{ fontSize: "0.8125rem", color: "#9ca3af", display: "flex", justifyContent: "space-between" }}><span>Account</span><span style={{ color: "#fff", fontWeight: 600 }}>{info.accountName}</span></div>}
          {info.accountId && (
            <div style={{ fontSize: "0.8125rem", color: "#9ca3af", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{method === "KHALTI" ? "Khalti Number" : method === "BANK" ? "Account No." : "ID"}</span>
              <span style={{ color: "#fff", fontFamily: "monospace", fontWeight: 600, fontSize: "0.9375rem" }}>{info.accountId}</span>
            </div>
          )}
          {"branch" in info && info.branch && info.branch !== "UPDATE_WITH_YOUR_BRANCH" && (
            <div style={{ fontSize: "0.8125rem", color: "#9ca3af", display: "flex", justifyContent: "space-between" }}><span>Branch</span><span style={{ color: "#fff" }}>{info.branch}</span></div>
          )}
          {info.instructions && <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.375rem 0 0", paddingTop: "0.375rem", borderTop: "1px solid rgba(255,255,255,0.08)", lineHeight: 1.5 }}>{info.instructions}</p>}
        </div>
      )}

      <div>
        <div style={label}>Amount Paid (NPR)</div>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={input} />
        <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem", margin: "0.25rem 0 0" }}>
          Expected: <span style={{ color: "#f59e0b", fontWeight: 600 }}>Rs {PRO_PRICE.amount}</span>
        </p>
      </div>

      <div>
        <div style={label}>Transaction Reference / ID</div>
        <input type="text" value={txRef} onChange={(e) => setTxRef(e.target.value)}
          placeholder={method === "KHALTI" ? "Khalti transaction ID" : method === "BANK" ? "Bank transaction/slip reference" : "Transaction ID"}
          style={input} />
      </div>

      <div>
        <div style={label}>Payment Screenshot URL (optional)</div>
        <input type="url" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://..." style={input} />
      </div>

      <div>
        <div style={label}>Note (optional)</div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={{ ...input, resize: "none" }} />
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.625rem", fontSize: "0.8125rem", color: "#f87171" }}>
          <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
          {error}
        </div>
      )}

      <button type="submit" disabled={loading || !method}
        style={{ width: "100%", background: "linear-gradient(135deg, #f59e0b, #fb923c)", color: "#000",
          fontWeight: 700, padding: "0.875rem", borderRadius: "0.625rem", border: "none",
          cursor: loading || !method ? "not-allowed" : "pointer", opacity: loading || !method ? 0.6 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.9375rem" }}>
        {loading ? <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} /> Submitting...</> : `Submit Payment (Rs ${PRO_PRICE.amount})`}
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </form>
  )
}