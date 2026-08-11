// components/system-health/HealthStatus.tsx
"use client"
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react"

export type HealthStatusType = "healthy" | "degraded" | "down" | "unknown"

interface HealthStatusProps {
  name: string
  status: HealthStatusType
  message?: string
  latencyMs?: number
}

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 border-green-200", label: "Healthy" },
  degraded: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200", label: "Degraded" },
  down: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 border-red-200", label: "Down" },
  unknown: { icon: Loader2, color: "text-gray-400", bg: "bg-gray-50 border-gray-200", label: "Unknown" },
}

export default function HealthStatus({ name, status, message, latencyMs }: HealthStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3.5 ${config.bg}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.color} ${status === "unknown" ? "animate-spin" : ""}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">{name}</span>
          <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
        </div>
        {message && <p className="text-xs text-gray-500 mt-0.5">{message}</p>}
        {latencyMs !== undefined && <p className="text-xs text-gray-400 mt-0.5">{latencyMs}ms</p>}
      </div>
    </div>
  )
}
