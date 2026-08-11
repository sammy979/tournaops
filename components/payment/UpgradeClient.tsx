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
    { key: "ESEWA" as const, label: "eSewa", enabled: paymentSettings?.esewaEnabled },
    { key: "KHALTI" as const, label: "Khalti", enabled: paymentSettings?.khaltiEnabled },
    { key: "BANK" as const, label: "Bank Transfer", enabled: paymentSettings?.bankEnabled },
  ].filter((m) => m.enabled);

  const currentDetails = () => {
    if (selectedMethod === "ESEWA") {
      return {
        qrUrl: paymentSettings?.esewaQrUrl,
        accountName: paymentSettings?.esewaAccountName,
        accountId: paymentSettings?.esewaAccountId,
        instructions: paymentSettings?.esewaInstructions,
      };
    }
    if (selectedMethod === "KHALTI") {
      return {
        qrUrl: paymentSettings?.khaltiQrUrl,
        accountName: paymentSettings?.khaltiAccountName,
        accountId: paymentSettings?.khaltiAccountId,
        instructions: paymentSettings?.khaltiInstructions,
      };
    }
    return {
      qrUrl: paymentSettings?.bankQrUrl,
      accountName: paymentSettings?.bankAccountHolder,
      accountId: paymentSettings?.bankAccountNumber,
      bankName: paymentSettings?.bankName,
      branch: paymentSettings?.bankBranch,
      instructions: paymentSettings?.bankInstructions,
    } as any;
  };

  async function submit() {
    if (!txRef.trim()) {
      setError("Transaction reference is required");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("amount", "299");
      formData.append("currency", "NPR");
      formData.append("method", selectedMethod);
      formData.append("transactionReference", txRef);
      if (note) formData.append("note", note);
      if (file) formData.append("proof", file);

      const res = await fetch("/api/payments", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        setError(err.error || "Submission failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{
        background: "var(--green-dim)",
        border: "1px solid var(--green)",
        padding: "16px",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "1rem",
          color: "var(--green)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "8px",
        }}>✓ Payment Submitted</div>
        <p style={{ fontSize: "0.78rem", color: "var(--white-70)" }}>
          We&apos;ll review your payment and activate Pro within 24 hours.
        </p>
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        padding: "16px",
        textAlign: "center",
        color: "var(--white-40)",
        fontSize: "0.85rem",
      }}>
        Payment methods are not configured yet. Please contact support.
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="btn-gold"
        style={{ width: "100%" }}
      >
        Upgrade to Pro
      </button>
    );
  }

  const details = currentDetails();

  return (
    <div>
      {/* METHOD TABS */}
      <div style={{
        display: "flex",
        gap: "0",
        marginBottom: "16px",
      }}>
        {methods.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelectedMethod(m.key)}
            style={{
              flex: 1,
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "8px 12px",
              background: selectedMethod === m.key ? "var(--gold)" : "transparent",
              color: selectedMethod === m.key ? "var(--black)" : "var(--white-40)",
              border: "1px solid var(--border)",
              borderRight: "none",
              cursor: "pointer",
            }}
          >{m.label}</button>
        ))}
      </div>

      {/* METHOD DETAILS */}
      <div style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        padding: "14px",
        marginBottom: "16px",
      }}>
        {details.qrUrl && (
          <img
            src={details.qrUrl}
            alt="QR Code"
            style={{
              width: "100%",
              maxWidth: "180px",
              margin: "0 auto 12px",
              display: "block",
              border: "1px solid var(--border)",
            }}
          />
        )}
        <div style={{ fontSize: "0.78rem", color: "var(--white-70)", lineHeight: 1.6 }}>
          {details.accountName && (
            <div><strong style={{ color: "var(--white)" }}>Name:</strong> {details.accountName}</div>
          )}
          {details.accountId && (
            <div><strong style={{ color: "var(--white)" }}>Account:</strong> {details.accountId}</div>
          )}
          {(details as any).bankName && (
            <div><strong style={{ color: "var(--white)" }}>Bank:</strong> {(details as any).bankName}</div>
          )}
          {(details as any).branch && (
            <div><strong style={{ color: "var(--white)" }}>Branch:</strong> {(details as any).branch}</div>
          )}
          {details.instructions && (
            <div style={{
              marginTop: "10px",
              paddingTop: "10px",
              borderTop: "1px solid var(--border)",
              fontSize: "0.75rem",
              color: "var(--white-40)",
              whiteSpace: "pre-wrap",
            }}>{details.instructions}</div>
          )}
        </div>
      </div>

      {/* TRANSACTION REF */}
      <label style={{
        display: "block",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 600,
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "4px",
      }}>Transaction Reference *</label>
      <input
        type="text"
        value={txRef}
        onChange={(e) => setTxRef(e.target.value)}
        placeholder="TXN123456"
        style={{
          width: "100%",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.85rem",
          padding: "9px 12px",
          background: "var(--surface-2)",
          color: "var(--white)",
          border: "1px solid var(--border)",
          outline: "none",
          marginBottom: "12px",
        }}
      />

      {/* PROOF UPLOAD */}
      <label style={{
        display: "block",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 600,
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "4px",
      }}>Payment Screenshot (Optional)</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{
          width: "100%",
          fontSize: "0.78rem",
          padding: "8px",
          background: "var(--surface-2)",
          color: "var(--white-70)",
          border: "1px solid var(--border)",
          marginBottom: "12px",
        }}
      />

      {/* NOTE */}
      <label style={{
        display: "block",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 600,
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "4px",
      }}>Note (Optional)</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Any details for admin..."
        style={{
          width: "100%",
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.82rem",
          padding: "9px 12px",
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
          padding: "10px 12px",
          marginBottom: "12px",
          fontSize: "0.8rem",
          color: "var(--red)",
        }}>{error}</div>
      )}

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={submit}
          disabled={submitting}
          className="btn-gold"
          style={{ flex: 1, opacity: submitting ? 0.5 : 1 }}
        >
          {submitting ? "Submitting..." : "Submit Payment"}
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}