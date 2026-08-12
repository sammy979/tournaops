"use client";

import { useState, useEffect, useCallback } from "react";

interface Payment {
  id: string;
  method: string;              // ESEWA | KHALTI | BANK
  amount: number;
  currency: string;
  status: string;              // PENDING | APPROVED | REJECTED
  transactionReference: string;
  rejectionReason?: string;
  reviewedAt?: string;
  submittedAt: string;
  createdAt: string;
  proofUrl?: string;
  note?: string;
  adminNote?: string;
  user: {
    id: string;
    email: string;
    name: string;              // mapped from displayName || username
    isPro?: boolean;
  } | null;
  reviewer?: {
    id: string;
    email: string;
    name: string;
  } | null;
}

interface Summary {
  status: string;
  _count: { status: number };
}

export default function AdminPaymentsClient() {
  const [payments,       setPayments]       = useState<Payment[]>([]);
  const [total,          setTotal]          = useState(0);
  const [summary,        setSummary]        = useState<Summary[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [statusFilter,   setStatusFilter]   = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [page,           setPage]           = useState(1);
  const [limit]                            = useState(20);
  const [actionLoading,  setActionLoading]  = useState<string | null>(null);
  const [rejectModal,    setRejectModal]    = useState<{ paymentId: string } | null>(null);
  const [rejectionReason,setRejectionReason]= useState("");
  const [actionMessage,  setActionMessage]  = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/payments?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data.payments || []);
      setTotal(data.total || 0);
      setSummary(data.summary || []);
    } catch (e: any) {
      setError(e.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, limit]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleApprove = async (paymentId: string) => {
    if (!confirm("Approve this payment and upgrade the user to Pro?")) return;
    setActionLoading(paymentId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve");
      setActionMessage({ type: "success", text: "Payment approved. User upgraded to Pro." });
      await fetchPayments();
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (paymentId: string) => {
    setRejectionReason("");
    setRejectModal({ paymentId });
  };

  const handleReject = async () => {
    if (!rejectModal?.paymentId) return;
    if (!rejectionReason.trim()) {
      setActionMessage({ type: "error", text: "Rejection reason is required" });
      return;
    }
    setActionLoading(rejectModal.paymentId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/payments/${rejectModal.paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject");
      setActionMessage({ type: "success", text: "Payment rejected." });
      setRejectModal(null);
      await fetchPayments();
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "var(--green)";
      case "REJECTED": return "var(--red)";
      default:         return "var(--amber)";
    }
  };

  const methodLabel = (method: string) => {
    switch (method) {
      case "ESEWA":  return "eSewa";
      case "KHALTI": return "Khalti";
      case "BANK":   return "Bank Transfer";
      default:       return method;
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const countFor = (status: string) => {
    const s = summary.find((x) => x.status === status);
    return s?._count?.status ?? 0;
  };

  return (
    <div style={{ fontFamily: "Barlow, sans-serif" }}>
      {/* Summary counters */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "12px",
        marginBottom: "20px",
      }}>
        <SummaryCard label="Total"    value={total}               color="var(--white)" />
        <SummaryCard label="Pending"  value={countFor("PENDING")}  color="var(--amber)" />
        <SummaryCard label="Approved" value={countFor("APPROVED")} color="var(--green)" />
        <SummaryCard label="Rejected" value={countFor("REJECTED")} color="var(--red)"   />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{
              padding: "6px 14px",
              border: "1px solid " + (statusFilter === s ? "var(--gold)" : "var(--border-2)"),
              background: statusFilter === s ? "var(--gold)" : "transparent",
              color: statusFilter === s ? "var(--black)" : "var(--white-70)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >{s === "ALL" ? "All" : s}</button>
        ))}
      </div>

      {/* Action message */}
      {actionMessage && (
        <div style={{
          padding: "10px 14px",
          marginBottom: "12px",
          background: actionMessage.type === "success" ? "var(--green-dim)" : "var(--red-dim)",
          border: `1px solid ${actionMessage.type === "success" ? "var(--green)" : "var(--red)"}`,
          color: actionMessage.type === "success" ? "var(--green)" : "var(--red)",
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.85rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem" }}
          >X</button>
        </div>
      )}

      {/* Loading / Error / Empty */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--white-40)", fontSize: "0.85rem" }}>
          Loading payments...
        </div>
      )}

      {error && (
        <div style={{
          padding: "12px 16px",
          background: "var(--red-dim)",
          border: "1px solid var(--red)",
          color: "var(--red)",
        }}>{error}</div>
      )}

      {!loading && !error && payments.length === 0 && (
        <div style={{
          padding: "48px",
          textAlign: "center",
          color: "var(--white-40)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          fontSize: "0.85rem",
        }}>No payments found for the selected filter.</div>
      )}

      {/* Table */}
      {!loading && !error && payments.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: "1100px" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                {["User", "Method", "Amount", "Reference", "Status", "Submitted", "Actions"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    color: "var(--white-40)",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)", verticalAlign: "top" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: "var(--white)", fontSize: "0.9rem" }}>
                      {p.user?.name || "Unknown"}
                    </div>
                    <div style={{ color: "var(--white-40)", fontSize: "0.75rem" }}>
                      {p.user?.email}
                    </div>
                    {p.user?.isPro && (
                      <span style={{
                        display: "inline-block",
                        fontSize: "0.65rem",
                        background: "var(--gold-dim)",
                        color: "var(--gold)",
                        padding: "2px 6px",
                        marginTop: "4px",
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}>Pro</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--white-70)" }}>
                    {methodLabel(p.method)}
                  </td>
                  <td style={{
                    padding: "12px 14px",
                    color: "var(--gold)",
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 700,
                  }}>
                    Rs {p.amount}
                  </td>
                  <td style={{
                    padding: "12px 14px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.72rem",
                    color: "var(--white-70)",
                    maxWidth: "180px",
                    wordBreak: "break-all",
                  }}>
                    {p.transactionReference}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      background: p.status === "APPROVED" ? "var(--green-dim)"
                                : p.status === "REJECTED" ? "var(--red-dim)"
                                : "var(--amber-dim)",
                      border: `1px solid ${statusColor(p.status)}`,
                      color: statusColor(p.status),
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}>{p.status}</span>
                    {p.rejectionReason && (
                      <div style={{
                        color: "var(--white-40)",
                        fontSize: "0.7rem",
                        marginTop: "4px",
                        maxWidth: "160px",
                      }}>{p.rejectionReason}</div>
                    )}
                    {p.reviewedAt && (
                      <div style={{
                        color: "var(--white-40)",
                        fontSize: "0.7rem",
                        marginTop: "4px",
                        fontFamily: "JetBrains Mono, monospace",
                      }}>{new Date(p.reviewedAt).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td style={{
                    padding: "12px 14px",
                    color: "var(--white-40)",
                    fontSize: "0.75rem",
                    fontFamily: "JetBrains Mono, monospace",
                    whiteSpace: "nowrap",
                  }}>
                    {new Date(p.submittedAt || p.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {p.status === "PENDING" && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={actionLoading === p.id}
                          style={{
                            padding: "5px 12px",
                            background: "var(--green)",
                            color: "var(--white)",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            opacity: actionLoading === p.id ? 0.5 : 1,
                          }}
                        >{actionLoading === p.id ? "..." : "Approve"}</button>
                        <button
                          onClick={() => openRejectModal(p.id)}
                          disabled={actionLoading === p.id}
                          style={{
                            padding: "5px 12px",
                            background: "var(--red-dim)",
                            color: "var(--red)",
                            border: "1px solid var(--red)",
                            cursor: "pointer",
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                          }}
                        >Reject</button>
                      </div>
                    )}
                    {p.proofUrl && (
                      <a
                        href={p.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--gold)",
                          fontSize: "0.72rem",
                          display: "block",
                          marginTop: p.status === "PENDING" ? "6px" : "0",
                          fontFamily: "Barlow Condensed, sans-serif",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          textDecoration: "none",
                        }}
                      >View Proof</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "20px", alignItems: "center" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary"
            style={{ opacity: page === 1 ? 0.4 : 1, fontSize: "0.75rem", padding: "6px 14px" }}
          >Prev</button>
          <span style={{
            padding: "6px 14px",
            color: "var(--white-70)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.82rem",
          }}>{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary"
            style={{ opacity: page === totalPages ? 0.4 : 1, fontSize: "0.75rem", padding: "6px 14px" }}
          >Next</button>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
        onClick={() => setRejectModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--charcoal)",
              border: "1px solid var(--border-2)",
              borderTop: "3px solid var(--red)",
              padding: "24px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <div className="section-label" style={{ marginBottom: "6px" }}>Danger</div>
            <h3 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "var(--white)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>Reject Payment</h3>
            <p style={{ color: "var(--white-70)", fontSize: "0.85rem", marginBottom: "14px", lineHeight: 1.6 }}>
              Provide a reason for rejecting this payment. The user will see the reason in their payment history.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Transaction reference not found, incorrect amount..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--black)",
                border: "1px solid var(--border)",
                color: "var(--white)",
                fontSize: "0.85rem",
                resize: "vertical",
                fontFamily: "Barlow, sans-serif",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setRejectModal(null)}
                className="btn-secondary"
                style={{ fontSize: "0.75rem", padding: "7px 14px" }}
              >Cancel</button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading === rejectModal.paymentId}
                className="btn-danger"
                style={{
                  fontSize: "0.75rem",
                  padding: "7px 14px",
                  opacity: !rejectionReason.trim() ? 0.5 : 1,
                }}
              >
                {actionLoading === rejectModal.paymentId ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderTop: `3px solid ${color}`,
      padding: "14px 16px",
    }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.65rem",
        letterSpacing: "0.15em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>{label}</div>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 900,
        fontSize: "1.8rem",
        color,
        lineHeight: 1,
      }}>{value.toLocaleString()}</div>
    </div>
  );
}