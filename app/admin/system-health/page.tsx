// app/admin/system-health/page.tsx
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, AlertTriangle, XCircle, Activity } from "lucide-react"
import HealthStatus from "@/components/system-health/HealthStatus"
import type { HealthStatusType } from "@/components/system-health/HealthStatus"

interface ServiceHealth {
  name: string
  status: HealthStatusType
  message?: string
  latencyMs?: number
  checkedAt: string
}

interface ErrorCounts { INFO: number; WARNING: number; ERROR: number; CRITICAL: number }

export default function SystemHealthPage() {
  const router = useRouter()
  const [services, setServices] = useState<ServiceHealth[]>([])
  const [errorCounts, setErrorCounts] = useState<ErrorCounts>({ INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 })
  const [pendingPayments, setPendingPayments] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [checkedAt, setCheckedAt] = useState<string>("")

  const fetchHealth = async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/system-health")
      const data = await res.json()
      setServices(data.services || [])
      setErrorCounts(data.errorCounts || { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 })
      setPendingPayments(data.pendingPayments || 0)
      setCheckedAt(data.checkedAt || "")
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchHealth() }, [])

  const overallStatus = services.some((s) => s.status === "down") ? "down"
    : services.some((s) => s.status === "degraded") ? "degraded" : "healthy"

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          {checkedAt && <p className="text-xs text-gray-400 mt-1">Last checked: {new Date(checkedAt).toLocaleTimeString()}</p>}
        </div>
        <button onClick={fetchHealth} disabled={refreshing}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Overall Status */}
      <div className={`rounded-2xl p-5 flex items-center gap-4 ${
        overallStatus === "healthy" ? "bg-green-50 border border-green-200"
        : overallStatus === "degraded" ? "bg-yellow-50 border border-yellow-200"
        : "bg-red-50 border border-red-200"
      }`}>
        <Activity className={`w-8 h-8 ${overallStatus === "healthy" ? "text-green-500" : overallStatus === "degraded" ? "text-yellow-500" : "text-red-500"}`} />
        <div>
          <div className="text-lg font-bold capitalize">{overallStatus === "healthy" ? "All Systems Operational" : overallStatus === "degraded" ? "Some Services Degraded" : "System Issues Detected"}</div>
          <div className="text-sm text-gray-500">{services.length} services monitored</div>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
          ) : services.map((s) => (
            <HealthStatus key={s.name} name={s.name} status={s.status} message={s.message} latencyMs={s.latencyMs} />
          ))}
        </div>
      </div>

      {/* Error Summary */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Error Summary (Last 24h)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Critical", count: errorCounts.CRITICAL, color: "text-red-700", bg: "bg-red-50 border-red-200" },
            { label: "Errors", count: errorCounts.ERROR, color: "text-red-600", bg: "bg-red-50 border-red-100" },
            { label: "Warnings", count: errorCounts.WARNING, color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
            { label: "Info", count: errorCounts.INFO, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 ${bg}`}>
              <div className={`text-2xl font-bold ${color}`}>{count}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => router.push("/admin/system-health/errors")}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <div className="font-semibold text-sm">Error Logs</div>
            <div className="text-xs text-gray-400">{errorCounts.ERROR + errorCounts.CRITICAL} active errors</div>
          </div>
        </button>
        <button onClick={() => router.push("/admin/payments")}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <div>
            <div className="font-semibold text-sm">Pending Payments</div>
            <div className="text-xs text-gray-400">{pendingPayments} awaiting review</div>
          </div>
        </button>
      </div>
    </div>
  )
}
