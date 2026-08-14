"use client";
import { useState, useEffect } from "react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionReference: string;
  proofUrl: string | null;
  note: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
  };
}

export default function AdminPaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/payments", { credentials: "include" });
      const d = await r.json();
      setPayments(d.payments || []);
    } catch {
      setMessage({ text: "Failed to load payments", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const approve = async (id: string, username: string) => {
    if (!confirm(`Approve payment from ${username}? User will get Pro status for 1 year.`)) return;
    setProcessing(id);
    try {
      const r = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED", adminNote: "Verified and approved" }),
      });
      if (r.ok) {
        showMsg(`Approved ${username} - Pro activated`, "success");
        await load();
      } else {
        const d = await r.json();
        showMsg(d.error || "Failed to approve", "error");
      }
    } catch { showMsg("Network error", "error"); }
    finally { setProcessing(null); }
  };

  const reject = async (id: string, username: string) => {
    const reason = prompt(`Reject payment from ${username}?\n\nReason (optional):`);
    if (reason === null) return;
    setProcessing(id);
    try {
      const r = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", rejectionReason: reason || "Payment could not be verified" }),
      });
      if (r.ok) { showMsg(`Rejected ${username}`, "success"); await load(); }
      else { const d = await r.json(); showMsg(d.error || "Failed to reject", "error"); }
    } catch { showMsg("Network error", "error"); }
    finally { setProcessing(null); }
  };

  const filtered = filter === "ALL" ? payments : payments.filter(p => p.status === filter);
  const counts = {
    PENDING: payments.filter(p => p.status === "PENDING").length,
    APPROVED: payments.filter(p => p.status === "APPROVED").length,
    REJECTED: payments.filter(p => p.status === "REJECTED").length,
    ALL: payments.length,
  };

  const statusColor = (s: string) => s === "APPROVED" ? "#22c55e" : s === "REJECTED" ? "#ef4444" : "#D4AF37";
  const methodColor = (m: string) => m === "KHALTI" ? "#a855f7" : m === "ESEWA" ? "#60BB47" : "#3B82F6";

  return (
    <div>
      {message && (
        <div style={{ marginBottom: "1rem", padding: "0.875rem 1rem", background: message.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "0.5rem", color: message.type === "success" ? "#4ade80" : "#f87171", fontSize: "0.875rem", fontWeight: 600 }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "0.5rem 1rem", background: filter === f ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filter === f ? "#D4AF37" : "rgba(255,255,255,0.08)"}`, borderRadius: "0.5rem", color: filter === f ? "#D4AF37" : "#9ca3af", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", minHeight: "40px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {f}
            <span style={{ background: filter === f ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.08)", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", fontSize: "0.7rem" }}>{counts[f]}</span>
          </button>
        ))}
        <button onClick={load} style={{ padding: "0.5rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", color: "#9ca3af", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", marginLeft: "auto", minHeight: "40px" }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>Loading payments...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem" }}>
          <div style={{ color: "#6b7280" }}>No {filter.toLowerCase()} payments</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map(p => {
            const isProcessing = processing === p.id;
            return (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${p.status === "PENDING" ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.08)"}`, borderLeft: `4px solid ${statusColor(p.status)}`, borderRadius: "0.75rem", padding: "1.25rem", opacity: isProcessing ? 0.5 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{p.user.displayName}</span>
                      <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>@{p.user.username}</span>
                      <span style={{ background: `${statusColor(p.status)}20`, color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}40`, borderRadius: "0.25rem", padding: "0.15rem 0.5rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>{p.status}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{p.user.email}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#D4AF37", fontFamily: "monospace", lineHeight: 1 }}>Rs {p.amount}</div>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem" }}>{new Date(p.submittedAt).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ padding: "0.625rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.375rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Method</div>
                    <div style={{ color: methodColor(p.method), fontWeight: 700, fontSize: "0.85rem" }}>{p.method}</div>
                  </div>
                  <div style={{ padding: "0.625rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.375rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Transaction Ref</div>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.8rem", fontFamily: "monospace", wordBreak: "break-all" }}>{p.transactionReference}</div>
                  </div>
                </div>

                {p.note && (
                  <div style={{ padding: "0.625rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.375rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>User Note</div>
                    <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{p.note}</div>
                  </div>
                )}

                {p.proofUrl && (
                  <div style={{ marginBottom: "1rem" }}>
                    <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.875rem", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: "0.375rem", color: "#60a5fa", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none" }}>
                      View Payment Proof
                    </a>
                  </div>
                )}

                {p.rejectionReason && (
                  <div style={{ padding: "0.625rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.375rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "#f87171", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Rejection Reason</div>
                    <div style={{ color: "#fca5a5", fontSize: "0.85rem" }}>{p.rejectionReason}</div>
                  </div>
                )}

                {p.status === "PENDING" && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button onClick={() => approve(p.id, p.user.username)} disabled={isProcessing} style={{ flex: 1, minWidth: "140px", padding: "0.75rem 1rem", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "0.5rem", color: "#4ade80", fontWeight: 700, fontSize: "0.85rem", cursor: isProcessing ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.05em", minHeight: "44px" }}>
                      APPROVE
                    </button>
                    <button onClick={() => reject(p.id, p.user.username)} disabled={isProcessing} style={{ flex: 1, minWidth: "140px", padding: "0.75rem 1rem", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "0.5rem", color: "#f87171", fontWeight: 700, fontSize: "0.85rem", cursor: isProcessing ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.05em", minHeight: "44px" }}>
                      REJECT
                    </button>
                  </div>
                )}

                {p.reviewedAt && (
                  <div style={{ marginTop: "0.75rem", padding: "0.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.25rem", fontSize: "0.75rem", color: "#6b7280" }}>
                    Reviewed: {new Date(p.reviewedAt).toLocaleString()}
                    {p.adminNote && <div style={{ marginTop: "0.25rem", color: "#9ca3af" }}>Note: {p.adminNote}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}