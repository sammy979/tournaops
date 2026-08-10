// app/admin/system-health/errors/page.tsx
"use client"
import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import ErrorTable from "@/components/system-health/ErrorTable"

interface SystemError {
  id: string
  severity: string
  route?: string
  errorType?: string
  message: string
  occurrenceCount: number
  firstSeenAt: string
  lastSeenAt: string
  resolved: boolean
}

export default function ErrorLogsPage() {
  const [errors, setErrors] = useState<SystemError[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchErrors = async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/admin/system-errors")
      const data = await res.json()
      setErrors(data.errors || [])
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchErrors() }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-sm text-gray-500 mt-1">System errors and warnings</p>
        </div>
        <button onClick={fetchErrors} disabled={refreshing}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <ErrorTable errors={errors} />
        )}
      </div>
    </div>
  )
}
