"use client";

import { useState, useEffect, useCallback } from "react";

interface Payment {
  id: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  planDuration: string;
  transactionId: string;
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
  screenshot?: string;
  notes?: string;
  user: {
    id: string;
    name: string;
    email: string;
    isPro: boolean;
    proExpiresAt?: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminPaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ paymentId: string; open: boolean } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments?status=${statusFilter}&page=${page}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data.payments || []);
      setPagination(data.pagination || null);
    } catch (e: any) {
      setError(e.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
      setActionMessage({ type: "success", text: `Payment approved. User upgraded to Pro.` });
      await fetchPayments();
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (paymentId: string) => {
    setRejectionReason("");
    setRejectModal({ paymentId, open: true });
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
      case "approved": return "var(--green)";
      case "rejected": return "var(--red)";
      default: return "var(--amber)";
    }
  };

  const methodLabel = (method: string) => {
    switch (method) {
      case "esewa": return "eSewa";
      case "khalti": return "Khalti";
      case "bank_transfer": return "Bank Transfer";
      default: return method;
    }
  };

  return (
    <div style={{ fontFamily: "Barlow, sans-serif" }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: statusFilter === s ? "var(--gold)" : "var(--surface)",
              color: statusFilter === s ? "var(--black)" : "var(--white-70)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              fontSize: "0.85rem",
            }}
          >
            {s}
          </button>
        ))}
        <div style={{ marginLeft: "auto", color: "var(--white-40)", fontSize: "0.8rem" }}>
          {pagination ? `${pagination.total} total payments` : ""}
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div style={{
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          background: actionMessage.type === "success" ? "rgba(45,158,95,0.15)" : "rgba(230,57,70,0.15)",
          border: `1px solid ${actionMessage.type === "success" ? "var(--green)" : "var(--red)"}`,
          color: actionMessage.type === "success" ? "var(--green)" : "var(--red)",
          fontSize: "0.9rem",
        }}>
          {actionMessage.text}
          <button
            onClick={() => setActionMessage(null)}
            style={{ float: "right", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
          >×</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--white-40)" }}>
          Loading payments...
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "1rem", background: "rgba(230,57,70,0.1)", border: "1px solid var(--red)", borderRadius: "8px", color: "var(--red)" }}>
          {error}
        </div>
      )}

      {/* Payments Table */}
      {!loading && !error && (
        <>
          {payments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--white-40)" }}>
              No payments found for the selected filter.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["User", "Method", "Amount", "Plan", "Transaction ID", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        color: "var(--white-40)",
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} style={{ borderBottom: "1px solid var(--border)", verticalAlign: "top" }}>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--white)" }}>{payment.user?.name || "Unknown"}</div>
                        <div style={{ color: "var(--white-40)", fontSize: "0.75rem" }}>{payment.user?.email}</div>
                        {payment.user?.isPro && (
                          <span style={{
                            fontSize: "0.7rem",
                            background: "var(--gold-dim)",
                            color: "var(--gold)",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            marginTop: "0.2rem",
                            display: "inline-block",
                          }}>PRO</span>
                        )}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "var(--white-70)" }}>
                        {methodLabel(payment.method)}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "var(--gold)", fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>
                        Rs {payment.amount}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "var(--white-70)", textTransform: "capitalize" }}>
                        {payment.planDuration}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "var(--white-70)", maxWidth: "160px", wordBreak: "break-all" }}>
                        {payment.transactionId}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{
                          color: statusColor(payment.status),
                          fontWeight: 600,
                          textTransform: "capitalize",
                          fontSize: "0.8rem",
                        }}>
                          {payment.status}
                        </span>
                        {payment.rejectionReason && (
                          <div style={{ color: "var(--white-40)", fontSize: "0.7rem", marginTop: "0.25rem", maxWidth: "120px" }}>
                            {payment.rejectionReason}
                          </div>
                        )}
                        {payment.approvedAt && (
                          <div style={{ color: "var(--white-40)", fontSize: "0.7rem", marginTop: "0.25rem" }}>
                            {new Date(payment.approvedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "var(--white-40)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                        {new Date(payment.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        {payment.status === "pending" && (
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleApprove(payment.id)}
                              disabled={actionLoading === payment.id}
                              style={{
                                padding: "0.35rem 0.75rem",
                                background: "var(--green)",
                                color: "var(--white)",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontFamily: "Barlow Condensed, sans-serif",
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                opacity: actionLoading === payment.id ? 0.6 : 1,
                              }}
                            >
                              {actionLoading === payment.id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => openRejectModal(payment.id)}
                              disabled={actionLoading === payment.id}
                              style={{
                                padding: "0.35rem 0.75rem",
                                background: "rgba(230,57,70,0.15)",
                                color: "var(--red)",
                                border: "1px solid var(--red)",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontFamily: "Barlow Condensed, sans-serif",
                                fontWeight: 600,
                                fontSize: "0.8rem",
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {payment.screenshot && (
                          <a
                            href={payment.screenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--gold)", fontSize: "0.75rem", display: "block", marginTop: "0.25rem" }}
                          >
                            View Screenshot
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.5rem" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "0.4rem 0.75rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: page === 1 ? "var(--white-40)" : "var(--white)",
                  borderRadius: "6px",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >← Prev</button>
              <span style={{ padding: "0.4rem 0.75rem", color: "var(--white-70)" }}>
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                style={{
                  padding: "0.4rem 0.75rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: page === pagination.totalPages ? "var(--white-40)" : "var(--white)",
                  borderRadius: "6px",
                  cursor: page === pagination.totalPages ? "not-allowed" : "pointer",
                }}
              >Next →</button>
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      {rejectModal?.open && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "var(--charcoal)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "2rem", width: "100%", maxWidth: "480px",
          }}>
            <h3 style={{ color: "var(--white)", fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.25rem", marginBottom: "1rem" }}>
              Reject Payment
            </h3>
            <p style={{ color: "var(--white-70)", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Please provide a reason for rejecting this payment. The user will be notified.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Transaction ID not found, incorrect amount..."
              rows={4}
              style={{
                width: "100%", padding: "0.75rem", background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: "8px",
                color: "var(--white)", fontSize: "0.875rem", resize: "vertical",
                fontFamily: "Barlow, sans-serif", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setRejectModal(null)}
                style={{
                  padding: "0.5rem 1rem", background: "var(--surface)",
                  border: "1px solid var(--border)", borderRadius: "8px",
                  color: "var(--white-70)", cursor: "pointer", fontFamily: "Barlow Condensed, sans-serif",
                }}
              >Cancel</button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading === rejectModal.paymentId}
                style={{
                  padding: "0.5rem 1rem", background: "var(--red)",
                  border: "none", borderRadius: "8px", color: "var(--white)",
                  cursor: "pointer", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600,
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