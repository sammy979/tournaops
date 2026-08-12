"use client";

import { useState } from "react";

const PLANS = {
  monthly: { label: "Monthly", amount: 299, duration: "monthly" },
  yearly: { label: "Yearly", amount: 2999, duration: "yearly" },
};

const METHODS = [
  { value: "esewa", label: "eSewa" },
  { value: "khalti", label: "Khalti" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

interface PaymentFormProps {
  onSuccess?: () => void;
}

export default function PaymentForm({ onSuccess }: PaymentFormProps) {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [method, setMethod] = useState("esewa");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedPlan = PLANS[plan];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError("Transaction ID is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          amount: selectedPlan.amount,
          currency: "NPR",
          transactionId: transactionId.trim(),
          screenshot: screenshot.trim() || undefined,
          planDuration: selectedPlan.duration,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit payment");
      setSuccess(true);
      onSuccess?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{
        padding: "2rem",
        background: "rgba(45,158,95,0.1)",
        border: "1px solid var(--green)",
        borderRadius: "12px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✅</div>
        <h3 style={{ color: "var(--green)", fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          Payment Submitted
        </h3>
        <p style={{ color: "var(--white-70)", fontSize: "0.875rem" }}>
          Your payment has been submitted for review. You will receive a notification once approved (usually within 24 hours).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Plan selection */}
      <div>
        <label style={{ color: "var(--white-70)", fontSize: "0.8rem", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
          Plan
        </label>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {Object.entries(PLANS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPlan(key as "monthly" | "yearly")}
              style={{
                flex: 1,
                padding: "0.875rem",
                background: plan === key ? "var(--gold-dim)" : "var(--surface)",
                border: `1px solid ${plan === key ? "var(--gold)" : "var(--border)"}`,
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ color: plan === key ? "var(--gold)" : "var(--white)", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1rem" }}>
                {p.label}
              </div>
              <div style={{ color: plan === key ? "var(--gold)" : "var(--white-70)", fontFamily: "JetBrains Mono, monospace", fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem" }}>
                Rs {p.amount}
              </div>
              {key === "yearly" && (
                <div style={{ color: "var(--green)", fontSize: "0.7rem", marginTop: "0.25rem" }}>Save 16%</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label style={{ color: "var(--white-70)", fontSize: "0.8rem", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
          Payment Method
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              style={{
                flex: 1,
                padding: "0.6rem",
                background: method === m.value ? "var(--gold-dim)" : "var(--surface)",
                border: `1px solid ${method === m.value ? "var(--gold)" : "var(--border)"}`,
                borderRadius: "8px",
                cursor: "pointer",
                color: method === m.value ? "var(--gold)" : "var(--white-70)",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction ID */}
      <div>
        <label style={{ color: "var(--white-70)", fontSize: "0.8rem", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
          Transaction ID *
        </label>
        <input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="Enter your transaction / reference ID"
          required
          style={{
            width: "100%", padding: "0.75rem", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: "8px",
            color: "var(--white)", fontSize: "0.875rem", fontFamily: "JetBrains Mono, monospace",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Screenshot URL */}
      <div>
        <label style={{ color: "var(--white-70)", fontSize: "0.8rem", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
          Screenshot URL (optional)
        </label>
        <input
          type="url"
          value={screenshot}
          onChange={(e) => setScreenshot(e.target.value)}
          placeholder="https://..."
          style={{
            width: "100%", padding: "0.75rem", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: "8px",
            color: "var(--white)", fontSize: "0.875rem",
            boxSizing: "border-box",
          }}
        />
        <p style={{ color: "var(--white-40)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
          Upload your payment screenshot to a service like Imgur and paste the link here.
        </p>
      </div>

      {/* Notes */}
      <div>
        <label style={{ color: "var(--white-70)", fontSize: "0.8rem", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information..."
          rows={2}
          style={{
            width: "100%", padding: "0.75rem", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: "8px",
            color: "var(--white)", fontSize: "0.875rem", resize: "vertical",
            fontFamily: "Barlow, sans-serif", boxSizing: "border-box",
          }}
        />
      </div>

      {error && (
        <div style={{
          padding: "0.75rem 1rem",
          background: "rgba(230,57,70,0.1)",
          border: "1px solid var(--red)",
          borderRadius: "8px",
          color: "var(--red)",
          fontSize: "0.875rem",
        }}>
          {error}
        </div>
      )}

      {/* Summary */}
      <div style={{
        padding: "1rem",
        background: "var(--gold-dim)",
        border: "1px solid var(--gold)",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <div style={{ color: "var(--white-70)", fontSize: "0.8rem" }}>Total Amount</div>
          <div style={{ color: "var(--gold)", fontFamily: "JetBrains Mono, monospace", fontSize: "1.5rem", fontWeight: 700 }}>
            Rs {selectedPlan.amount}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--white-70)", fontSize: "0.8rem" }}>Via {METHODS.find(m => m.value === method)?.label}</div>
          <div style={{ color: "var(--white-70)", fontSize: "0.8rem", textTransform: "capitalize" }}>{selectedPlan.label} Plan</div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !transactionId.trim()}
        style={{
          padding: "0.875rem",
          background: submitting || !transactionId.trim() ? "rgba(201,168,76,0.4)" : "var(--gold)",
          color: "var(--black)",
          border: "none",
          borderRadius: "8px",
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: submitting || !transactionId.trim() ? "not-allowed" : "pointer",
          letterSpacing: "0.05em",
        }}
      >
        {submitting ? "Submitting..." : "Submit Payment for Review"}
      </button>
    </form>
  );
}