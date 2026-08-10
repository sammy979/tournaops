// components/organizer/OrganizerCommandCenter.tsx
"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Trophy, Users, Swords, Clock, Shield, Wifi, WifiOff,
  ChevronDown, RefreshCw, Settings, Eye,
} from "lucide-react"
import QuickActions from "./QuickActions"
import TournamentHealth from "./TournamentHealth"
import ResultsQueue, { PendingResult } from "./ResultsQueue"
import NextMatch, { MatchInfo } from "./NextMatch"
import RecentActivity, { ActivityItem } from "./RecentActivity"
import type { HealthIssue } from "./TournamentHealth"

interface Tournament {
  id: string
  name: string
  status: string
  currentStage?: string
}

interface TournamentSummary {
  totalTeams: number
  totalMatches: number
  completedMatches: number
  pendingResults: number
  readyTeams: number
  warnings: number
  discordConnected: boolean
  currentStage?: string
  status: string
}

interface CommandCenterData {
  tournaments: Tournament[]
  selectedTournament: Tournament | null
  summary: TournamentSummary | null
  healthIssues: HealthIssue[]
  pendingResults: PendingResult[]
  nextMatch: MatchInfo | null
  recentActivity: ActivityItem[]
}

export default function OrganizerCommandCenter() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedId, setSelectedId] = useState<string>("")
  const [showTournamentSelect, setShowTournamentSelect] = useState(false)
  const [data, setData] = useState<CommandCenterData>({
    tournaments: [],
    selectedTournament: null,
    summary: null,
    healthIssues: [],
    pendingResults: [],
    nextMatch: null,
    recentActivity: [],
  })

  const fetchData = useCallback(async (tournamentId?: string) => {
    try {
      const id = tournamentId || selectedId
      const [tournamentsRes, summaryRes] = await Promise.all([
        fetch("/api/dashboard/tournaments"),
        id ? fetch(`/api/dashboard/tournaments/${id}/summary`) : Promise.resolve(null),
      ])

      const tournamentsData = await tournamentsRes.json()
      const tournaments: Tournament[] = tournamentsData.tournaments || []

      let summary = null, healthIssues = [], pendingResults = [], nextMatch = null, recentActivity = []

      if (id && summaryRes) {
        const summaryData = await summaryRes.json()
        summary = summaryData.summary || null
        healthIssues = summaryData.healthIssues || []
        pendingResults = summaryData.pendingResults || []
        nextMatch = summaryData.nextMatch || null
        recentActivity = summaryData.recentActivity || []
      }

      const selected = tournaments.find((t) => t.id === id) || tournaments[0] || null

      setData({
        tournaments,
        selectedTournament: selected,
        summary,
        healthIssues,
        pendingResults,
        nextMatch,
        recentActivity,
      })

      if (!selectedId && selected) setSelectedId(selected.id)
    } catch (err) {
      console.error("Command Center fetch error:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedId])

  useEffect(() => { fetchData() }, [])

  const handleTournamentChange = (id: string) => {
    setSelectedId(id)
    setShowTournamentSelect(false)
    setLoading(true)
    fetchData(id)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const { selectedTournament, summary, healthIssues, pendingResults, nextMatch, recentActivity, tournaments } = data

  const statusColor = summary?.status === "LIVE" ? "text-green-500" : summary?.status === "COMPLETED" ? "text-gray-400" : "text-yellow-500"

  const summaryCards = [
    { label: "Teams", value: summary?.totalTeams ?? 0, sub: "", link: selectedId ? `/dashboard/tournaments/${selectedId}/teams` : undefined, color: "text-blue-600" },
    { label: "Matches", value: summary ? `${summary.completedMatches}/${summary.totalMatches}` : "0/0", sub: "", link: selectedId ? `/dashboard/tournaments/${selectedId}/match-results` : undefined, color: "text-indigo-600" },
    { label: "Results Pending", value: summary?.pendingResults ?? 0, sub: "", link: selectedId ? `/dashboard/tournaments/${selectedId}/match-results` : undefined, color: summary?.pendingResults ? "text-orange-600" : "text-gray-400", highlight: !!(summary?.pendingResults) },
    { label: "Teams Ready", value: summary?.readyTeams ?? 0, sub: "", link: selectedId ? `/dashboard/tournaments/${selectedId}/stages` : undefined, color: "text-green-600" },
    { label: "Warnings", value: summary?.warnings ?? 0, sub: "", link: selectedId ? `/dashboard/tournaments/${selectedId}/overview` : undefined, color: summary?.warnings ? "text-yellow-600" : "text-gray-400", highlight: !!(summary?.warnings) },
    { label: "Discord", value: summary?.discordConnected ? "Connected" : "Disconnected", sub: "", link: "/dashboard/discord", color: summary?.discordConnected ? "text-green-600" : "text-red-500", isText: true },
  ]

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">TournaOps Organizer</span>
            </div>
            <h1 className="text-xl font-bold">Command Center</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Tournament Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTournamentSelect(!showTournamentSelect)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 text-sm font-semibold transition-colors">
                <span className="max-w-[140px] truncate">{selectedTournament?.name || "Select Tournament"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showTournamentSelect && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[200px] z-50 overflow-hidden">
                  {tournaments.map((t) => (
                    <button key={t.id} onClick={() => handleTournamentChange(t.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${t.id === selectedId ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-700"}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            {summary && (
              <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
                <div className={`w-2 h-2 rounded-full ${summary.status === "LIVE" ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
                <span className={`text-xs font-bold ${statusColor}`}>{summary.status}</span>
              </div>
            )}

            <button onClick={handleRefresh} disabled={refreshing}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            {selectedId && (
              <button onClick={() => router.push(`/dashboard/tournaments/${selectedId}/settings`)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tournament info row */}
        {selectedTournament && summary && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300">
            <span>{summary.totalTeams} Teams</span>
            {summary.currentStage && <><span>�</span><span>{summary.currentStage}</span></>}
            <span>�</span>
            <span>{summary.completedMatches}/{summary.totalMatches} Matches</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryCards.map((card) => (
          <button key={card.label}
            onClick={() => card.link && router.push(card.link)}
            disabled={!card.link}
            className={`bg-white rounded-xl border p-3.5 text-left transition-all ${card.highlight ? "border-orange-300 shadow-sm" : "border-gray-200"} ${card.link ? "hover:shadow-md cursor-pointer" : "cursor-default"}`}>
            <div className={`text-xl font-bold ${card.color} ${card.isText ? "text-base" : ""}`}>{card.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{card.label}</div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      {selectedId && <QuickActions tournamentId={selectedId} />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          <ResultsQueue tournamentId={selectedId} results={pendingResults} loading={loading} />
          <RecentActivity activities={recentActivity} loading={loading} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <NextMatch tournamentId={selectedId} match={nextMatch} loading={loading} />
          <TournamentHealth tournamentId={selectedId} issues={healthIssues} loading={loading} />
          {selectedId && (
            <button
              onClick={() => router.push(`/dashboard/tournaments/${selectedId}/overview`)}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4" /> Full Tournament Overview
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
