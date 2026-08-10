// app/admin/payments/page.tsx
"use client"
import { useState, useEffect, useCallback } from "react"
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, ChevronDown } from "lucide-react"

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
  user: { id: string; name?: string; email: string }
  reviewer?: { name?: string; email: string }
}

interface Summary { status: string; _count: { status: number } }

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<Summary[]>([])
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

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set("status", statusFilter)
    if (methodFilter) params.set("method", methodFilter)
    if (search) params.set("search", search)
    params.set("page", String(page))
    params.set("limit", "20")

    const res = await fetch(`/api/admin/payments?${params}`)
    const data = await res.json()
    setPayments(data.payments || [])
    setTotal(data.total || 0)
    setSummary(data.summary || [])
    setLoading(false)
  }, [statusFilter, methodFilter, search, page])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const handleAction = async () => {
    if (!reviewModal || !action) return
    if (action === "reject" && !rejectionReason.trim()) { setActionError("Rejection reason is required"); return }
    setProcessing(true)
    setActionError("")

    const res = await fetch(`/api/admin/payments/${reviewModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejectionReason: rejectionReason.trim(), adminNote: adminNote.trim() }),
    })
    const data = await res.json()

    if (!res.ok) { setActionError(data.error || "Action failed"); setProcessing(false); return }

    setReviewModal(null)
    setAction("")
    setRejectionReason("")
    setAdminNote("")
    setProcessing(false)
    fetchPayments()
  }

  const getSummaryCount = (status: string) => summary.find((s) => s.status === status)?._count?.status || 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Center</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage Pro payment submissions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", status: "PENDING", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: Clock },
          { label: "Approved", status: "APPROVED", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: CheckCircle },
          { label: "Rejected", status: "REJECTED", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
        ].map(({ label, status, color, bg, icon: Icon }) => (
          <button key={status} onClick={() => setStatusFilter(status === statusFilter ? "" : status)}
            className={`rounded-xl border p-4 text-left transition-all ${bg} ${status === statusFilter ? "ring-2 ring-purple-500" : ""}`}>
            <div className={`flex items-center gap-2 ${color}`}>
              <Icon className="w-4 h-4" />
              <span className="text-xl font-bold">{getSummaryCount(status)}</span>
            </div>
            <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1) } }}
            placeholder="Search email, username, reference..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">All Methods</option>
          <option value="ESEWA">eSewa</option>
          <option value="KHALTI">Khalti</option>
          <option value="BANK">Bank</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["User", "Method", "Amount", "Reference", "Status", "Submitted", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No payments found</td></tr>
              ) : payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.user.name || p.user.email}</div>
                    <div className="text-xs text-gray-400">{p.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{p.method}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.currency} {p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[120px] truncate">{p.transactionReference}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_BADGE[p.status] || ""}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.submittedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setReviewModal(p); setAction(""); setRejectionReason(""); setAdminNote(""); setActionError("") }}
                      className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-semibold">
                      <Eye className="w-3.5 h-3.5" /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {page} � {total} total</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Review Payment</h2>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">User</span><span className="font-semibold">{reviewModal.user.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-semibold">{reviewModal.method}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-semibold">{reviewModal.currency} {reviewModal.amount}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-mono text-xs">{reviewModal.transactionReference}</span></div>
              {reviewModal.proofUrl && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Proof</span>
                  <a href={reviewModal.proofUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 text-xs underline">View Screenshot</a>
                </div>
              )}
            </div>

            {reviewModal.status === "PENDING" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setAction("approve")}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${action === "approve" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-green-300"}`}>
                    ? Approve
                  </button>
                  <button onClick={() => setAction("reject")}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${action === "reject" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:border-red-300"}`}>
                    ? Reject
                  </button>
                </div>

                {action === "reject" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Rejection Reason *</label>
                    <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      placeholder="Please provide a clear reason..." />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Note (optional)</label>
                  <input value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Internal note..." />
                </div>

                {actionError && <p className="text-xs text-red-600">{actionError}</p>}

                <div className="flex gap-3">
                  <button onClick={() => setReviewModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleAction} disabled={!action || processing}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 ${action === "approve" ? "bg-green-600 hover:bg-green-700" : action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-gray-400"}`}>
                    {processing ? "Processing..." : action === "approve" ? "Approve & Activate Pro" : action === "reject" ? "Reject Payment" : "Select Action"}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 text-sm">
                <div className={`p-3 rounded-xl ${STATUS_BADGE[reviewModal.status] || ""} border`}>
                  Status: <strong>{reviewModal.status}</strong>
                </div>
                {reviewModal.rejectionReason && <p className="text-red-600 text-xs">Reason: {reviewModal.rejectionReason}</p>}
                {reviewModal.reviewer && <p className="text-gray-400 text-xs">Reviewed by: {reviewModal.reviewer.email}</p>}
                <button onClick={() => setReviewModal(null)} className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 mt-2">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
