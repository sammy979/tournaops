// components/organizer/NextMatch.tsx
"use client"
import { useRouter } from "next/navigation"
import { MapPin, Clock, Users, Radio } from "lucide-react"

export interface MatchInfo {
  id: string
  matchNumber: number
  map?: string
  scheduledAt?: string
  teamCount?: number
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "PENDING"
}

interface NextMatchProps {
  tournamentId: string
  match?: MatchInfo | null
  loading?: boolean
}

export default function NextMatch({ tournamentId, match, loading }: NextMatchProps) {
  const router = useRouter()

  const isLive = match?.status === "LIVE"

  return (
    <div style={{ background: isLive ? "rgba(239,68,68,0.08)" : "rgba(30,30,40,0.6)",
      borderRadius: "0.875rem", padding: "1rem",
      border: `1px solid ${isLive ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: isLive ? "#f87171" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {isLive ? "Live Now" : "Next Match"}
        </div>
        {isLive && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "#f87171", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#f87171" }}>LIVE</span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ height: "3rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.5rem" }} />
      ) : !match ? (
        <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>No upcoming matches scheduled</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>Match #{match.matchNumber}</span>
            {isLive && <Radio style={{ width: "1.25rem", height: "1.25rem", color: "#f87171" }} />}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
            {match.map && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <MapPin style={{ width: "0.875rem", height: "0.875rem" }} /> {match.map}
              </div>
            )}
            {match.scheduledAt && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Clock style={{ width: "0.875rem", height: "0.875rem" }} />
                {new Date(match.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
            {match.teamCount && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Users style={{ width: "0.875rem", height: "0.875rem" }} /> {match.teamCount} teams
              </div>
            )}
          </div>
          <button onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/match-results?match=${match.id}`)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 600,
              background: isLive ? "#ef4444" : "#1f2937", color: "#fff", border: "none", cursor: "pointer", marginTop: "0.25rem" }}>
            {isLive ? "Manage Live Match" : "Open Match"}
          </button>
        </div>
      )}
    </div>
  )
}