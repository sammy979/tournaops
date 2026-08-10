// components/organizer/ResultsQueue.tsx
"use client"
import { useRouter } from "next/navigation"
import { MessageSquare, Image, FileText } from "lucide-react"

export interface PendingResult {
  id: string
  matchNumber: number
  source: "MANUAL" | "DISCORD" | "SCREENSHOT" | "CSV" | "API"
  status: "PENDING" | "UNDER_REVIEW"
  submittedAt: string
}

interface ResultsQueueProps {
  tournamentId: string
  results: PendingResult[]
  loading?: boolean
}

const SOURCE_ICONS: Record<string, any> = {
  DISCORD: MessageSquare, SCREENSHOT: Image, CSV: FileText, MANUAL: FileText, API: FileText,
}

export default function ResultsQueue({ tournamentId, results, loading }: ResultsQueueProps) {
  const router = useRouter()

  return (
    <div style={{ background: "rgba(30,30,40,0.6)", borderRadius: "0.875rem", padding: "1rem",
      border: `1px solid ${results.length > 0 ? "rgba(251,146,60,0.3)" : "rgba(255,255,255,0.06)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: results.length > 0 ? "#fb923c" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Results Needing Verification {results.length > 0 && `(${results.length})`}
        </div>
        {results.length > 0 && (
          <button onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/match-results`)}
            style={{ fontSize: "0.75rem", color: "#a78bfa", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
            View All
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ height: "2.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.5rem" }} />)}
        </div>
      ) : results.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", color: "#4ade80" }}>
          <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "#4ade80" }} />
          <span style={{ fontSize: "0.875rem" }}>All results verified</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {results.slice(0, 5).map((r) => {
            const Icon = SOURCE_ICONS[r.source] || FileText
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem",
                background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: "0.5rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>Match #{r.matchNumber}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.125rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", color: "#fb923c", fontWeight: 600 }}>
                      <Icon style={{ width: "0.75rem", height: "0.75rem" }} /> {r.source}
                    </span>
                  </div>
                </div>
                <button onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/match-results?review=${r.id}`)}
                  style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.3)", color: "#fb923c",
                    fontSize: "0.75rem", fontWeight: 600, padding: "0.375rem 0.75rem", borderRadius: "0.5rem", cursor: "pointer" }}>
                  Review
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}