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

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Next Match</h3>
        <div className="h-20 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Next Match</h3>
        <p className="text-sm text-gray-400 py-2">No upcoming matches scheduled</p>
      </div>
    )
  }

  const isLive = match.status === "LIVE"

  return (
    <div className={`rounded-xl border p-4 ${isLive ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {isLive ? "Live Now" : "Next Match"}
        </h3>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-600">LIVE</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">Match #{match.matchNumber}</span>
          {isLive && <Radio className="w-5 h-5 text-red-500" />}
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          {match.map && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{match.map}</span>
            </div>
          )}
          {match.scheduledAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{new Date(match.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
          {match.teamCount && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>{match.teamCount} teams</span>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/match-results?match=${match.id}`)}
          className={`w-full mt-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isLive
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-900 hover:bg-gray-800 text-white"
          }`}>
          {isLive ? "Manage Live Match" : "Open Match"}
        </button>
      </div>
    </div>
  )
}
