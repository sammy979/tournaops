// app/admin/payments/page.tsx
"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, CheckCircle, XCircle, Clock, Eye, Loader2 } from "lucide-react"

interface Payment {
  id: string
  amount: number
  currency: string
  method: string
  transactionReference: string
  proofUrl?: string
  status: string
  submittedAt: string
  reviewedAt?: string
  rejectionReason?: string
  adminNote?: string
  note?: string
  user: { id: string; name?: string; email: string } | null
  reviewer?: { id: string; name?: string; email: string } | null
}

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  PENDING: { color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  APPROVED: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  REJECTED: { color: "#f87171", bg: "rgba(239,68,68,0.1)" },
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [methodFilter, setMethodFilter] = useState("")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [reviewModal, setReviewModal] = useState<Payment | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | "">("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [adminNote, setAdminNote] = useState("")
  const [processing, setProcessing] = useState(false)
  const [actionError, setActionError] = useState("")
  const [pageError, setPageError] = useState("")

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setPageError("")
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      if (methodFilter) params.set("method", methodFilter)
      if (search) params.set("search", search)
      params.set("page", String(page))
      params.set("limit", "20")

      const res = await fetch(`/api/admin/payments?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setPageError(data.error || `HTTP ${res.status}`)
        setPayments([])
        setTotal(0)
        setSummary([])
      } else {
        setPayments(Array.isArray(data.payments) ? data.payments : [])
        setTotal(data.total || 0)
        setSummary(Array.isArray(data.summary) ? data.summary : [])
      }
    } catch (err: any) {
      setPageError(err?.message || "Network error")
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, methodFilter, search, page])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleAction = async () => {
    if (!reviewModal || !action) return
    if (action === "reject" && !rejectionReason.trim()) {
      setActionError("Rejection reason is required")
      return
    }
    setProcessing(true)
    setActionError("")

    try {
      const res = await fetch(`/api/admin/payments/${reviewModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason: rejectionReason.trim(),
          adminNote: adminNote.trim(),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setActionError(data.error || "Action failed")
        setProcessing(false)
        return
      }

      setReviewModal(null)
      setAction("")
      setRejectionReason("")
      setAdminNote("")
      fetchPayments()
    } catch (err: any) {
      setActionError(err?.message || "Network error")
    } finally {
      setProcessing(false)
    }
  }

  const getSummaryCount = (status: string) => {
    const found = summary.find((s: any) => s.status === status)
    return found?._count?.status || 0
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: 0 }}>
          Payment Center
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginTop: "0.375rem" }}>
          Review and manage Pro payment submissions
        </p>
      </div>

      {/* Page Error */}
      {pageError && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "0.75rem",
          padding: "1rem",
          color: "#f87171",
          marginBottom: "1rem",
        }}>
          Error loading payments: {pageError}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Pending", status: "PENDING", color: "#facc15", icon: Clock },
          { label: "Approved", status: "APPROVED", color: "#10b981", icon: CheckCircle },
          { label: "Rejected", status: "REJECTED", color: "#f87171", icon: XCircle },
        ].map(({ label, status, color, icon: Icon }) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status === statusFilter ? "" : status); setPage(1) }}
            style={{
              background: statusFilter === status ? `${color}22` : "rgba(30,30,40,0.6)",
              border: `1px solid ${statusFilter === status ? color : "rgba(255,255,255,0.06)"}`,
              borderRadius: "0.75rem",
              padding: "1rem",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color }}>
              <Icon style={{ width: "1rem", height: "1rem" }} />
              <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{getSummaryCount(status)}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, marginTop: "0.375rem" }}>{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: "rgba(30,30,40,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "0.75rem",
        padding: "0.875rem",
        marginBottom: "1rem",
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#6b7280" }} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1) } }}
            placeholder="Search email, username, reference..."
            style={{
              width: "100%",
              paddingLeft: "2.25rem",
              paddingRight: "0.75rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.5rem",
              color: "#fff",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}
          style={{
            padding: "0.5rem 0.75rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.5rem",
            color: "#fff",
            fontSize: "0.875rem",
            outline: "none",
          }}
        >
          <option value="">All Methods</option>
          <option value="ESEWA">eSewa</option>
          <option value="KHALTI">Khalti</option>
          <option value="BANK">Bank</option>
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: "rgba(30,30,40,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Loader2 style={{ width: "1.5rem", height: "1.5rem", color: "#a855f7", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
            No payments found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["User", "Method", "Amount", "Reference", "Status", "Submitted", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const badge = STATUS_BADGE[p.status] || { color: "#9ca3af", bg: "rgba(107,114,128,0.1)" }
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ fontWeight: 600, color: "#fff" }}>{p.user?.name || p.user?.email || "Unknown"}</div>
                        <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>{p.user?.email}</div>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#e5e7eb", background: "rgba(255,255,255,0.05)", padding: "0.125rem 0.5rem", borderRadius: "0.25rem" }}>{p.method}</span>
                      </td>
                      <td style={{ padding: "0.75rem", fontWeight: 700, color: "#fff" }}>{p.currency} {p.amount.toLocaleString()}</td>
                      <td style={{ padding: "0.75rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#9ca3af", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.transactionReference}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: badge.color, background: badge.bg, padding: "0.25rem 0.5rem", borderRadius: "0.375rem" }}>{p.status}</span>
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>{new Date(p.submittedAt).toLocaleDateString()}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <button
                          onClick={() => {
                            setReviewModal(p)
                            setAction("")
                            setRejectionReason("")
                            setAdminNote("")
                            setActionError("")
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.75rem",
                            color: "#a855f7",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          <Eye style={{ width: "0.875rem", height: "0.875rem" }} /> Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.6)" }}>
          <div style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: "480px" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", margin: 0, marginBottom: "1rem" }}>Review Payment</h2>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.625rem", padding: "0.875rem", marginBottom: "1rem", fontSize: "0.8125rem" }}>
              {[
                ["User", reviewModal.user?.email],
                ["Method", reviewModal.method],
                ["Amount", `${reviewModal.currency} ${reviewModal.amount}`],
                ["Reference", reviewModal.transactionReference],
                ["Note", reviewModal.note || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
                  <span style={{ color: "#9ca3af" }}>{k}</span>
                  <span style={{ color: "#fff", fontWeight: 600, fontFamily: k === "Reference" ? "monospace" : "inherit", fontSize: k === "Reference" ? "0.75rem" : "inherit" }}>{v}</span>
                </div>
              ))}
              {reviewModal.proofUrl && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
                  <span style={{ color: "#9ca3af" }}>Proof</span>
                  <a href={reviewModal.proofUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#a855f7", fontSize: "0.75rem" }}>View Screenshot</a>
                </div>
              )}
            </div>

            {reviewModal.status === "PENDING" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.875rem" }}>
                  <button onClick={() => setAction("approve")} style={{ padding: "0.625rem", borderRadius: "0.5rem", border: `2px solid ${action === "approve" ? "#10b981" : "rgba(255,255,255,0.1)"}`, background: action === "approve" ? "rgba(16,185,129,0.1)" : "transparent", color: action === "approve" ? "#10b981" : "#e5e7eb", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>✓ Approve</button>
                  <button onClick={() => setAction("reject")} style={{ padding: "0.625rem", borderRadius: "0.5rem", border: `2px solid ${action === "reject" ? "#f87171" : "rgba(255,255,255,0.1)"}`, background: action === "reject" ? "rgba(239,68,68,0.1)" : "transparent", color: action === "reject" ? "#f87171" : "#e5e7eb", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>✕ Reject</button>
                </div>

                {action === "reject" && (
                  <div style={{ marginBottom: "0.875rem" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.25rem" }}>Rejection Reason *</label>
                    <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.8125rem", outline: "none", resize: "none" }} placeholder="Explain why this payment is being rejected..." />
                  </div>
                )}

                <div style={{ marginBottom: "0.875rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.25rem" }}>Admin Note (optional)</label>
                  <input value={adminNote} onChange={(e) => setAdminNote(e.target.value)} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.8125rem", outline: "none" }} placeholder="Internal note..." />
                </div>

                {actionError && <p style={{ fontSize: "0.75rem", color: "#f87171", marginBottom: "0.5rem" }}>{actionError}</p>}

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => setReviewModal(null)} style={{ flex: 1, padding: "0.625rem", borderRadius: "0.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e7eb", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>Cancel</button>
                  <button onClick={handleAction} disabled={!action || processing} style={{ flex: 1, padding: "0.625rem", borderRadius: "0.5rem", color: "#fff", cursor: !action || processing ? "not-allowed" : "pointer", opacity: !action || processing ? 0.5 : 1, background: action === "approve" ? "#10b981" : action === "reject" ? "#ef4444" : "#6b7280", border: "none", fontWeight: 600, fontSize: "0.875rem" }}>
                    {processing ? "Processing..." : action === "approve" ? "Approve & Activate Pro" : action === "reject" ? "Reject Payment" : "Select Action"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: "0.75rem", borderRadius: "0.5rem", background: STATUS_BADGE[reviewModal.status]?.bg, color: STATUS_BADGE[reviewModal.status]?.color, fontSize: "0.8125rem", marginBottom: "0.75rem" }}>Status: <strong>{reviewModal.status}</strong></div>
                {reviewModal.rejectionReason && <p style={{ fontSize: "0.75rem", color: "#f87171", marginBottom: "0.75rem" }}>Reason: {reviewModal.rejectionReason}</p>}
                <button onClick={() => setReviewModal(null)} style={{ width: "100%", padding: "0.625rem", borderRadius: "0.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e7eb", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}