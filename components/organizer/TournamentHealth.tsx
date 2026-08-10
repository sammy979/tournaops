// components/organizer/TournamentHealth.tsx
"use client"
import { CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

export interface HealthIssue {
  type: string
  severity: "warning" | "error" | "critical"
  message: string
  link?: string
}

interface TournamentHealthProps {
  tournamentId: string
  issues: HealthIssue[]
  loading?: boolean
}

const checks = [
  { key: "TEAMS", label: "Teams", types: ["NO_TEAMS", "DUPLICATE_TEAMS"] },
  { key: "GROUPS", label: "Groups", types: ["NO_GROUPS", "EMPTY_GROUP"] },
  { key: "SCHEDULE", label: "Schedule", types: ["NO_SCHEDULE"] },
  { key: "RESULTS", label: "Results", types: ["MISSING_RESULTS"] },
  { key: "STANDINGS", label: "Standings", types: ["STANDINGS_FAILURE"] },
  { key: "PROGRESSION", label: "Progression", types: ["INVALID_PROGRESSION"] },
  { key: "DISCORD", label: "Discord", types: ["DISCORD_FAILURE"] },
]

export default function TournamentHealth({ tournamentId, issues, loading }: TournamentHealthProps) {
  const getStatus = (types: string[]) => {
    const m = issues.filter((i) => types.includes(i.type))
    if (m.some((i) => i.severity === "critical")) return "critical"
    if (m.some((i) => i.severity === "error")) return "error"
    if (m.some((i) => i.severity === "warning")) return "warning"
    return "ok"
  }

  return (
    <div style={{ background: "rgba(30,30,40,0.6)", borderRadius: "0.875rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Tournament Health
        </div>
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {[...Array(5)].map((_, i) => <div key={i} style={{ height: "1.25rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.25rem" }} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {checks.map((check) => {
            const status = getStatus(check.types)
            const matching = issues.filter((i) => check.types.includes(i.type))
            const Icon = status === "ok" ? CheckCircle : status === "warning" ? AlertTriangle : XCircle
            const color = status === "ok" ? "#4ade80" : status === "warning" ? "#facc15" : "#f87171"
            return (
              <div key={check.key} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.25rem 0" }}>
                <Icon style={{ width: "0.875rem", height: "0.875rem", color, marginTop: "0.125rem", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "0.8125rem", color: status === "ok" ? "#e5e7eb" : color, fontWeight: 500 }}>{check.label}</span>
                  {matching.map((issue, i) => (
                    <div key={i} style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.125rem" }}>
                      {issue.message}
                      {issue.link && <Link href={issue.link} style={{ marginLeft: "0.25rem", color: "#a78bfa" }}>[fix]</Link>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}