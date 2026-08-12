"use client";
import { useState } from "react";

interface Props {
  userId: string;
  userEmail: string;
  paymentSettings: any;
}

export default function UpgradeClient({ userId, userEmail, paymentSettings }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"ESEWA" | "KHALTI" | "BANK">("ESEWA");
  const [txRef, setTxRef] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const methods = [
    { key: "ESEWA"  as const, label: "eSewa",         enabled: paymentSettings?.esewaEnabled  },
    { key: "KHALTI" as const, label: "Khalti",        enabled: paymentSettings?.khaltiEnabled },
    { key: "BANK"   as const, label: "Bank Transfer", enabled: paymentSettings?.bankEnabled   },
  ].filter((m) => m.enabled);

  // Set initial method to first available
  const activeMethod = methods.find(m => m.key === selectedMethod) ? selectedMethod : methods[0]?.key ?? "ESEWA";

  const currentDetails = () => {
    if (activeMethod === "ESEWA") {
      return {
        qrUrl:        paymentSettings?.esewaQrUrl,
        accountName:  paymentSettings?.esewaAccountName,
        accountId:    paymentSettings?.esewaAccountId,
        instructions: paymentSettings?.esewaInstructions,
      };
    }
    if (activeMethod === "KHALTI") {
      return {
        qrUrl:        paymentSettings?.khaltiQrUrl,
        accountName:  paymentSettings?.khaltiAccountName,
        accountId:    paymentSettings?.khaltiAccountId,
        instructions: paymentSettings?.khaltiInstructions,
      };
    }
    return {
      qrUrl:        paymentSettings?.bankQrUrl,
      accountName:  paymentSettings?.bankAccountHolder,
      accountId:    paymentSettings?.bankAccountNumber,
      bankName:     paymentSettings?.bankName,
      branch:       paymentSettings?.bankBranch,
      instructions: paymentSettings?.bankInstructions,
    } as any;
  };

  async function uploadProof(f: File): Promise<string | null> {
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) return null;
      const j = await res.json();
      return j?.url ?? j?.blobUrl ?? j?.publicUrl ?? null;
    } catch {
      return null;
    }
  }

  async function submit() {
    setError("");

    // Client-side validation
    const ref = txRef.trim();
    if (!ref) {
      setError("Transaction reference is required");
      return;
    }
    if (ref.length < 4) {
      setError("Transaction reference is too short");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload proof file if any
      let proofUrl: string | null = null;
      if (file) {
        proofUrl = await uploadProof(file);
        if (!proofUrl) {
          setError("Failed to upload payment screenshot. Try again or submit without it.");
          setSubmitting(false);
          return;
        }
      }

      // 2. Submit payment as JSON (matches API contract)
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: activeMethod,
          amount: 299,           // ← number, not string
          currency: "NPR",
          transactionReference: ref,
          proofUrl,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data?.error || `Submission failed (HTTP ${res.status})`);
      }
    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── STATES ────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div style={{
        background: "var(--green-dim)",
        border: "1px solid var(--green)",
        padding: "24px",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "1.2rem",
          color: "var(--green)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "8px",
        }}>✓ Payment Submitted</div>
        <p style={{ fontSize: "0.9rem", color: "var(--white-70)", marginBottom: "16px" }}>
          We&apos;ll review your payment and activate Pro within 24 hours. You&apos;ll receive an email once approved.
        </p>
        <button
          onClick={() => { setSubmitted(false); setShowForm(false); setTxRef(""); setNote(""); setFile(null); }}
          style={{
            padding: "8px 20px",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--white)",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.8rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        padding: "24px",
        textAlign: "center",
        color: "var(--white-40)",
        fontSize: "0.9rem",
      }}>
        No payment methods are enabled. Please contact the administrator.
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={{
          width: "100%",
          padding: "16px",
          background: "var(--gold)",
          color: "var(--black)",
          border: "none",
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "1rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}>
        Upgrade to Pro — Rs 299/month
      </button>
    );
  }

  const details = currentDetails();

  return (
    <div>
      {/* METHOD TABS */}
      <div style={{ display: "flex", gap: "0", marginBottom: "16px" }}>
        {methods.map((m, i) => (
          <button
            key={m.key}
            onClick={() => setSelectedMethod(m.key)}
            style={{
              flex: 1,
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "12px",
              background: activeMethod === m.key ? "var(--gold)" : "transparent",
              color:      activeMethod === m.key ? "var(--black)" : "var(--white-40)",
              border: "1px solid var(--border)",
              borderRight: i < methods.length - 1 ? "none" : "1px solid var(--border)",
              cursor: "pointer",
            }}>{m.label}</button>
        ))}
      </div>

      {/* METHOD DETAILS + QR */}
      <div style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        padding: "20px",
        marginBottom: "16px",
      }}>
        {details.qrUrl && (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ display: "inline-block", background: "var(--white)", padding: "10px" }}>
              <img
                src={details.qrUrl}
                alt="QR Code"
                style={{ width: "160px", height: "160px", objectFit: "contain", display: "block" }}
              />
            </div>
          </div>
        )}
        <div style={{ fontSize: "0.85rem", color: "var(--white-70)", lineHeight: 1.7 }}>
          {details.accountName && (<div><strong style={{ color: "var(--white)" }}>Name:</strong> {details.accountName}</div>)}
          {details.accountId   && (<div><strong style={{ color: "var(--white)" }}>Account:</strong> {details.accountId}</div>)}
          {(details as any).bankName && (<div><strong style={{ color: "var(--white)" }}>Bank:</strong> {(details as any).bankName}</div>)}
          {(details as any).branch   && (<div><strong style={{ color: "var(--white)" }}>Branch:</strong> {(details as any).branch}</div>)}
          {details.instructions && (
            <div style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border)",
              fontSize: "0.8rem",
              color: "var(--white-40)",
              whiteSpace: "pre-wrap",
            }}>{details.instructions}</div>
          )}
        </div>
      </div>

      {/* TRANSACTION REFERENCE */}
      <label style={{
        display: "block",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.72rem",
        letterSpacing: "0.12em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>Transaction Reference *</label>
      <input
        type="text"
        value={txRef}
        onChange={(e) => setTxRef(e.target.value)}
        placeholder="e.g. TXN123456"
        style={{
          width: "100%",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.9rem",
          padding: "12px 14px",
          background: "var(--surface-2)",
          color: "var(--white)",
          border: "1px solid var(--border)",
          outline: "none",
          marginBottom: "14px",
        }}
      />

      {/* PROOF UPLOAD */}
      <label style={{
        display: "block",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.72rem",
        letterSpacing: "0.12em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>Payment Screenshot (Optional)</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{
          width: "100%",
          fontSize: "0.85rem",
          padding: "10px",
          background: "var(--surface-2)",
          color: "var(--white-70)",
          border: "1px solid var(--border)",
          marginBottom: "14px",
        }}
      />

      {/* NOTE */}
      <label style={{
        display: "block",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.72rem",
        letterSpacing: "0.12em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>Note (Optional)</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Any additional details for admin…"
        style={{
          width: "100%",
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.9rem",
          padding: "12px 14px",
          background: "var(--surface-2)",
          color: "var(--white)",
          border: "1px solid var(--border)",
          outline: "none",
          resize: "vertical",
          marginBottom: "16px",
        }}
      />

      {error && (
        <div style={{
          background: "var(--red-dim)",
          border: "1px solid var(--red)",
          padding: "12px 14px",
          marginBottom: "14px",
          fontSize: "0.9rem",
          color: "var(--red)",
        }}>{error}</div>
      )}

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={submit}
          disabled={submitting}
          style={{
            flex: 1,
            padding: "14px",
            background: "var(--gold)",
            color: "var(--black)",
            border: "none",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 800,
            fontSize: "0.95rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.5 : 1,
          }}>
          {submitting ? "Submitting…" : "Submit Payment"}
        </button>
        <button
          onClick={() => { setShowForm(false); setError(""); }}
          disabled={submitting}
          style={{
            padding: "14px 24px",
            background: "transparent",
            color: "var(--white)",
            border: "1px solid var(--border)",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.9rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: submitting ? "not-allowed" : "pointer",
          }}>Cancel</button>
      </div>
    </div>
  );
}