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
  { key: "PROGRESSION", label: "Progression", types: ["INVALID_PROGRESSION", "IMPOSSIBLE_PROGRESSION"] },
  { key: "DISCORD", label: "Discord", types: ["DISCORD_FAILURE"] },
]

export default function TournamentHealth({ tournamentId, issues, loading }: TournamentHealthProps) {
  const getCheckStatus = (types: string[]) => {
    const matching = issues.filter((i) => types.includes(i.type))
    if (matching.some((i) => i.severity === "critical")) return "critical"
    if (matching.some((i) => i.severity === "error")) return "error"
    if (matching.some((i) => i.severity === "warning")) return "warning"
    return "ok"
  }

  const getIssuesForTypes = (types: string[]) => issues.filter((i) => types.includes(i.type))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tournament Health</h3>
        {issues.length > 0 && (
          <Link href={`/dashboard/tournaments/${tournamentId}/overview`}
            className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
            View Issues <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-1.5">
          {checks.map((check) => {
            const status = getCheckStatus(check.types)
            const matchingIssues = getIssuesForTypes(check.types)

            return (
              <div key={check.key} className="flex items-start gap-2">
                {status === "ok" ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                ) : status === "warning" ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${status === "ok" ? "text-gray-700" : status === "warning" ? "text-yellow-700" : "text-red-700"}`}>
                    {check.label}
                  </span>
                  {matchingIssues.map((issue, i) => (
                    <div key={i} className="text-xs text-gray-500 mt-0.5">
                      {issue.message}
                      {issue.link && (
                        <Link href={issue.link} className="ml-1 text-purple-600 hover:underline">[fix]</Link>
                      )}
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
