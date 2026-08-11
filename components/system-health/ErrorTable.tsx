// components/system-health/ErrorTable.tsx
"use client"
import { useState } from "react"
import { AlertTriangle, XCircle, Info, AlertCircle, ChevronRight } from "lucide-react"

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

interface ErrorTableProps {
  errors: SystemError[]
  onViewDetails?: (error: SystemError) => void
}

const SEVERITY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  INFO: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
  WARNING: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
  ERROR: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  CRITICAL: { icon: XCircle, color: "text-red-700", bg: "bg-red-100" },
}

export default function ErrorTable({ errors, onViewDetails }: ErrorTableProps) {
  const [filter, setFilter] = useState<string>("ALL")

  const filtered = filter === "ALL" ? errors : errors.filter((e) => e.severity === filter)

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["ALL", "CRITICAL", "ERROR", "WARNING", "INFO"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Severity</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Route</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Message</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Count</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Last Seen</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No errors found</td></tr>
            ) : filtered.map((error) => {
              const config = SEVERITY_CONFIG[error.severity] || SEVERITY_CONFIG.INFO
              const Icon = config.icon
              return (
                <tr key={error.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${config.bg} ${config.color}`}>
                      <Icon className="w-3 h-3" />{error.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-500 font-mono max-w-[120px] truncate">{error.route || "�"}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-700 max-w-[300px]">
                    <div className="truncate">{error.message}</div>
                    {error.errorType && <div className="text-gray-400 font-mono mt-0.5">{error.errorType}</div>}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{error.occurrenceCount}x</span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-400">{new Date(error.lastSeenAt).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3">
                    {onViewDetails && (
                      <button onClick={() => onViewDetails(error)} className="text-purple-600 hover:text-purple-700">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
