"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  transactionReference: string;
  proofUrl: string | null;
  note: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    isPro: boolean;
    proExpiresAt: string | null;
  };
}

interface Props {
  initialPayments: Payment[];
}

export function AdminPaymentsClient({ initialPayments }: Props) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [actionNote, setActionNote] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");

  const filtered = payments.filter((p) => {
    const matchesFilter = filter === "ALL" || p.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.transactionReference.toLowerCase().includes(q) ||
      (p.user.name?.toLowerCase().includes(q) ?? false) ||
      p.user.email.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  async function handleAction(paymentId: string, action: "APPROVE" | "REJECT") {
    if (!paymentId || paymentId.trim() === "") {
      setFeedback({ id: paymentId, msg: "Invalid payment ID", ok: false });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/payments/${paymentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            note: actionNote[paymentId] || null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setFeedback({ id: paymentId, msg: data.error || "Action failed", ok: false });
          return;
        }

        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? { ...p, status: action === "APPROVE" ? "APPROVED" : "REJECTED" }
              : p
          )
        );
        setFeedback({ id: paymentId, msg: data.message, ok: true });
        setActionNote((prev) => {
          const next = { ...prev };
          delete next[paymentId];
          return next;
        });
      } catch (err) {
        setFeedback({ id: paymentId, msg: "Network error", ok: false });
      }
    });
  }

  const counts = {
    ALL: payments.length,
    PENDING: payments.filter((p) => p.status === "PENDING").length,
    APPROVED: payments.filter((p) => p.status === "APPROVED").length,
    REJECTED: payments.filter((p) => p.status === "REJECTED").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              background: filter === s ? "var(--gold)" : "var(--surface)",
              color: filter === s ? "var(--black)" : "var(--gold)",
              border: "1px solid var(--border)",
              padding: "1rem",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "Barlow Condensed, sans-serif",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{counts[s]}</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{s}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, or transaction ref..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--gold)",
          padding: "0.75rem 1rem",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.875rem",
          outline: "none",
          width: "100%",
        }}
      />

      {/* Payment list */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "3rem",
            textAlign: "center",
            color: "var(--charcoal)",
            fontFamily: "Barlow Condensed, sans-serif",
          }}
        >
          No payments found
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map((payment) => (
            <div
              key={payment.id}
              style={{
                background: "var(--surface)",
                border: `1px solid ${
                  payment.status === "PENDING"
                    ? "var(--gold)"
                    : payment.status === "APPROVED"
                    ? "#22c55e"
                    : "#ef4444"
                }`,
                padding: "1.5rem",
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: "var(--gold)",
                    }}
                  >
                    {payment.user.name || "Unknown User"}
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.75rem",
                      color: "var(--charcoal)",
                    }}
                  >
                    {payment.user.email}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.75rem",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      background:
                        payment.status === "PENDING"
                          ? "#f59e0b22"
                          : payment.status === "APPROVED"
                          ? "#22c55e22"
                          : "#ef444422",
                      color:
                        payment.status === "PENDING"
                          ? "#f59e0b"
                          : payment.status === "APPROVED"
                          ? "#22c55e"
                          : "#ef4444",
                      border: `1px solid ${
                        payment.status === "PENDING"
                          ? "#f59e0b"
                          : payment.status === "APPROVED"
                          ? "#22c55e"
                          : "#ef4444"
                      }`,
                    }}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.625rem", color: "var(--charcoal)", marginBottom: "0.25rem", fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.1em" }}>
                    AMOUNT
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--gold)", fontWeight: 700 }}>
                    Rs {payment.amount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.625rem", color: "var(--charcoal)", marginBottom: "0.25rem", fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.1em" }}>
                    METHOD
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#e5e7eb" }}>
                    {payment.method}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.625rem", color: "var(--charcoal)", marginBottom: "0.25rem", fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.1em" }}>
                    TXN REF
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#e5e7eb", fontSize: "0.8rem", wordBreak: "break-all" }}>
                    {payment.transactionReference}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.625rem", color: "var(--charcoal)", marginBottom: "0.25rem", fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.1em" }}>
                    SUBMITTED
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#e5e7eb", fontSize: "0.8rem" }}>
                    {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>

              {/* Proof URL */}
              {payment.proofUrl && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.625rem", color: "var(--charcoal)", marginBottom: "0.25rem", fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.1em" }}>
                    PROOF
                  </div>
                  <a
                    href={payment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.75rem",
                      color: "var(--gold)",
                      textDecoration: "underline",
                      wordBreak: "break-all",
                    }}
                  >
                    {payment.proofUrl}
                  </a>
                </div>
              )}

              {/* Note */}
              {payment.note && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.625rem", color: "var(--charcoal)", marginBottom: "0.25rem", fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.1em" }}>
                    NOTE
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#e5e7eb", fontSize: "0.8rem" }}>
                    {payment.note}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {feedback?.id === payment.id && (
                <div
                  style={{
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    background: feedback.ok ? "#22c55e11" : "#ef444411",
                    border: `1px solid ${feedback.ok ? "#22c55e" : "#ef4444"}`,
                    color: feedback.ok ? "#22c55e" : "#ef4444",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.8rem",
                  }}
                >
                  {feedback.msg}
                </div>
              )}

              {/* Actions for PENDING */}
              {payment.status === "PENDING" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <textarea
                    placeholder="Optional note (required for rejection reason)..."
                    value={actionNote[payment.id] || ""}
                    onChange={(e) =>
                      setActionNote((prev) => ({ ...prev, [payment.id]: e.target.value }))
                    }
                    rows={2}
                    style={{
                      background: "var(--black)",
                      border: "1px solid var(--border)",
                      color: "#e5e7eb",
                      padding: "0.5rem",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.8rem",
                      resize: "vertical",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => handleAction(payment.id, "APPROVE")}
                      disabled={isPending}
                      style={{
                        background: "#22c55e",
                        color: "#000",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        cursor: isPending ? "not-allowed" : "pointer",
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        letterSpacing: "0.05em",
                        opacity: isPending ? 0.6 : 1,
                      }}
                    >
                      ✓ APPROVE & GRANT PRO
                    </button>
                    <button
                      onClick={() => handleAction(payment.id, "REJECT")}
                      disabled={isPending}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        cursor: isPending ? "not-allowed" : "pointer",
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        letterSpacing: "0.05em",
                        opacity: isPending ? 0.6 : 1,
                      }}
                    >
                      ✕ REJECT
                    </button>
                  </div>
                </div>
              )}

              {/* Reviewed info */}
              {payment.reviewedAt && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "0.75rem",
                    color: "var(--charcoal)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  Reviewed {formatDistanceToNow(new Date(payment.reviewedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}