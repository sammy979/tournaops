"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  method: string;
  transactionReference: string;
  proofUrl: string | null;
  note: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerName: string | null;
  rejectionReason: string | null;
  adminNote: string | null;
}

export default function AdminPaymentsClient({ initialPayments }: { initialPayments: Payment[] }) {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [filter,   setFilter]   = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [search,   setSearch]   = useState("");
  const [openId,   setOpenId]   = useState<string | null>(null);
  const [busy,     setBusy]     = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = payments.filter(p => {
    const matchFilter = filter === "ALL" || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.userName.toLowerCase().includes(q) ||
      p.userEmail.toLowerCase().includes(q) ||
      p.transactionReference.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  async function act(paymentId: string, action: "APPROVE" | "REJECT", reason?: string) {
    setBusy(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason: action === "REJECT" ? reason : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error ?? "Action failed");
        return;
      }
      // Update local state
      setPayments(prev => prev.map(p =>
        p.id === paymentId
          ? { ...p, status: action === "APPROVE" ? "APPROVED" : "REJECTED", rejectionReason: reason ?? null }
          : p
      ));
      setOpenId(null);
      setRejectReason("");
      router.refresh();
    } catch (err: any) {
      alert(err?.message ?? "Network error");
    } finally {
      setBusy(null);
    }
  }

  function fmtDate(iso: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 3600_000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
    return d.toLocaleDateString();
  }

  const statusColor = (s: string) =>
    s === "APPROVED" ? "var(--green)" :
    s === "REJECTED" ? "var(--red)"   :
    "var(--amber)";

  return (
    <div>
      {/* Search + Filter */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, email, invoice ID, or transaction reference…"
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--white)",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "10px 16px",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background:  filter === f ? "var(--gold)" : "var(--surface)",
              color:       filter === f ? "var(--black)" : "var(--white-70)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto 1.5fr auto auto 1fr 1fr auto",
          gap: "12px",
          padding: "12px 20px",
          background: "var(--charcoal)",
          borderBottom: "1px solid var(--border)",
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          color: "var(--white-40)",
          textTransform: "uppercase",
        }}>
          <span>Invoice</span>
          <span>User</span>
          <span style={{ textAlign: "right" }}>Amount</span>
          <span>Method</span>
          <span>Tx Ref</span>
          <span>Submitted</span>
          <span style={{ textAlign: "right" }}>Status</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--white-40)" }}>
            No payments found.
          </div>
        ) : filtered.map((p, i) => (
          <div key={p.id}>
            <div
              onClick={() => setOpenId(openId === p.id ? null : p.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1.5fr auto auto 1fr 1fr auto",
                gap: "12px",
                padding: "16px 20px",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                cursor: "pointer",
                background: openId === p.id ? "var(--charcoal)" : "transparent",
              }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "var(--white-40)" }}>
                {p.id.substring(0, 8)}…
              </span>
              <div>
                <div style={{ color: "var(--white)", fontSize: "0.9rem", fontWeight: 600 }}>{p.userName}</div>
                <div style={{ color: "var(--white-40)", fontSize: "0.75rem" }}>{p.userEmail}</div>
              </div>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                color: "var(--gold)",
                textAlign: "right",
              }}>Rs {p.amount.toLocaleString()}</span>
              <span style={{
                padding: "3px 10px",
                background: "var(--surface-2)",
                color: "var(--white-70)",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>{p.method}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem", color: "var(--white-70)" }}>
                {p.transactionReference}
              </span>
              <span style={{ color: "var(--white-40)", fontSize: "0.8rem" }}>{fmtDate(p.submittedAt)}</span>
              <span style={{
                padding: "3px 10px",
                background: `${statusColor(p.status)}22`,
                color: statusColor(p.status),
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textAlign: "center",
              }}>{p.status}</span>
            </div>

            {/* EXPANDED ROW — inline detail + actions */}
            {openId === p.id && (
              <div style={{
                background: "var(--charcoal)",
                borderBottom: "1px solid var(--border)",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: p.proofUrl ? "auto 1fr" : "1fr",
                gap: "24px",
              }}>
                {/* Left: Payment proof */}
                {p.proofUrl && (
                  <div>
                    <div style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      color: "var(--gold)",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}>Payment Screenshot</div>
                    <a href={p.proofUrl} target="_blank" rel="noopener noreferrer">
                      <img src={p.proofUrl} alt="Payment proof"
                        style={{
                          maxWidth: "320px",
                          maxHeight: "400px",
                          border: "1px solid var(--border)",
                          objectFit: "contain",
                          background: "var(--surface-2)",
                          display: "block",
                        }} />
                    </a>
                    <div style={{ color: "var(--white-40)", fontSize: "0.7rem", marginTop: "6px" }}>
                      Click to open full size ↗
                    </div>
                  </div>
                )}

                {/* Right: Details + actions */}
                <div>
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.12em",
                    color: "var(--gold)",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}>Payment Details</div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "8px 16px",
                    fontSize: "0.85rem",
                    marginBottom: "20px",
                  }}>
                    <span style={{ color: "var(--white-40)" }}>Full ID:</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--white)" }}>{p.id}</span>

                    <span style={{ color: "var(--white-40)" }}>User:</span>
                    <span style={{ color: "var(--white)" }}>{p.userName} ({p.userEmail})</span>

                    <span style={{ color: "var(--white-40)" }}>Amount:</span>
                    <span style={{ color: "var(--gold)", fontWeight: 700 }}>Rs {p.amount.toLocaleString()} {p.currency}</span>

                    <span style={{ color: "var(--white-40)" }}>Method:</span>
                    <span style={{ color: "var(--white)" }}>{p.method}</span>

                    <span style={{ color: "var(--white-40)" }}>Transaction Ref:</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--white)" }}>{p.transactionReference}</span>

                    <span style={{ color: "var(--white-40)" }}>Submitted:</span>
                    <span style={{ color: "var(--white)" }}>{new Date(p.submittedAt).toLocaleString()}</span>

                    {p.note && (
                      <>
                        <span style={{ color: "var(--white-40)" }}>User Note:</span>
                        <span style={{ color: "var(--white)", whiteSpace: "pre-wrap" }}>{p.note}</span>
                      </>
                    )}

                    {p.reviewedAt && (
                      <>
                        <span style={{ color: "var(--white-40)" }}>Reviewed:</span>
                        <span style={{ color: "var(--white)" }}>
                          {new Date(p.reviewedAt).toLocaleString()} {p.reviewerName ? `by ${p.reviewerName}` : ""}
                        </span>
                      </>
                    )}

                    {p.rejectionReason && (
                      <>
                        <span style={{ color: "var(--red)" }}>Rejection:</span>
                        <span style={{ color: "var(--red)" }}>{p.rejectionReason}</span>
                      </>
                    )}
                  </div>

                  {/* Actions (only for pending) */}
                  {p.status === "PENDING" && (
                    <div>
                      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                        <button
                          onClick={() => act(p.id, "APPROVE")}
                          disabled={busy === p.id}
                          style={{
                            padding: "12px 24px",
                            background: "var(--green)",
                            color: "var(--white)",
                            border: "none",
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 800,
                            fontSize: "0.85rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            cursor: busy === p.id ? "not-allowed" : "pointer",
                            opacity: busy === p.id ? 0.5 : 1,
                          }}>
                          {busy === p.id ? "Processing…" : "✓ Approve & Activate Pro"}
                        </button>

                        {rejectReason === "__show__" ? (
                          <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                            <input
                              type="text"
                              placeholder="Reason for rejection…"
                              autoFocus
                              onChange={e => setRejectReason(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter" && rejectReason && rejectReason !== "__show__") {
                                  act(p.id, "REJECT", rejectReason);
                                }
                                if (e.key === "Escape") setRejectReason("");
                              }}
                              style={{
                                flex: 1,
                                padding: "12px 14px",
                                background: "var(--surface-2)",
                                color: "var(--white)",
                                border: "1px solid var(--red)",
                                fontSize: "0.85rem",
                                outline: "none",
                              }}
                            />
                            <button
                              onClick={() => act(p.id, "REJECT", rejectReason)}
                              disabled={!rejectReason || rejectReason === "__show__"}
                              style={{
                                padding: "12px 20px",
                                background: "var(--red)",
                                color: "var(--white)",
                                border: "none",
                                fontFamily: "Barlow Condensed, sans-serif",
                                fontWeight: 800,
                                fontSize: "0.85rem",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                cursor: "pointer",
                              }}>Confirm</button>
                            <button
                              onClick={() => setRejectReason("")}
                              style={{
                                padding: "12px 16px",
                                background: "transparent",
                                color: "var(--white-40)",
                                border: "1px solid var(--border)",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                              }}>Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRejectReason("__show__")}
                            disabled={busy === p.id}
                            style={{
                              padding: "12px 24px",
                              background: "transparent",
                              color: "var(--red)",
                              border: "1px solid var(--red)",
                              fontFamily: "Barlow Condensed, sans-serif",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                            }}>✕ Reject</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "16px", color: "var(--white-40)", fontSize: "0.8rem", textAlign: "center" }}>
        Click any row to view details and take action inline · No page navigation required
      </div>
    </div>
  );
}