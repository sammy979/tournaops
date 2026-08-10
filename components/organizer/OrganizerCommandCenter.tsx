// components/organizer/OrganizerCommandCenter.tsx
"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Trophy, RefreshCw, Settings, Eye, ChevronDown,
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

  const summaryCards = [
    { label: "Teams", value: summary?.totalTeams ?? 0, link: selectedId ? `/dashboard/tournaments/${selectedId}/teams` : undefined, color: "#60a5fa" },
    { label: "Matches", value: summary ? `${summary.completedMatches}/${summary.totalMatches}` : "0/0", link: selectedId ? `/dashboard/tournaments/${selectedId}/match-results` : undefined, color: "#818cf8" },
    { label: "Results Pending", value: summary?.pendingResults ?? 0, link: selectedId ? `/dashboard/tournaments/${selectedId}/match-results` : undefined, color: summary?.pendingResults ? "#fb923c" : "#6b7280", highlight: !!(summary?.pendingResults) },
    { label: "Teams Ready", value: summary?.readyTeams ?? 0, link: selectedId ? `/dashboard/tournaments/${selectedId}/stages` : undefined, color: "#4ade80" },
    { label: "Warnings", value: summary?.warnings ?? 0, link: selectedId ? `/dashboard/tournaments/${selectedId}/overview` : undefined, color: summary?.warnings ? "#facc15" : "#6b7280", highlight: !!(summary?.warnings) },
    { label: "Discord", value: summary?.discordConnected ? "Connected" : "Disconnected", link: "/dashboard/discord", color: summary?.discordConnected ? "#4ade80" : "#f87171", isText: true },
  ]

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(20,20,30,0.95), rgba(30,30,45,0.9))",
        borderRadius: "1rem",
        padding: "1.5rem",
        marginBottom: "1rem",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <Trophy style={{ width: "1.25rem", height: "1.25rem", color: "#f59e0b" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase" }}>TournaOps Organizer</span>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>Command Center</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowTournamentSelect(!showTournamentSelect)}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedTournament?.name || "Select Tournament"}
                </span>
                <ChevronDown style={{ width: "1rem", height: "1rem" }} />
              </button>
              {showTournamentSelect && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 0.25rem)", background: "#1a1a24",
                  borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.1)", minWidth: "220px",
                  zIndex: 50, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
                  {tournaments.length === 0 ? (
                    <div style={{ padding: "0.75rem", color: "#9ca3af", fontSize: "0.8rem", textAlign: "center" }}>No tournaments</div>
                  ) : tournaments.map((t) => (
                    <button key={t.id} onClick={() => handleTournamentChange(t.id)}
                      style={{ width: "100%", textAlign: "left", padding: "0.625rem 0.875rem", fontSize: "0.875rem",
                        background: t.id === selectedId ? "rgba(139,92,246,0.15)" : "transparent",
                        color: t.id === selectedId ? "#a78bfa" : "#e5e7eb", border: "none", cursor: "pointer",
                        fontWeight: t.id === selectedId ? 600 : 400 }}>
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {summary && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "rgba(255,255,255,0.08)",
                borderRadius: "0.75rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%",
                  background: summary.status === "LIVE" ? "#4ade80" : "#6b7280",
                  animation: summary.status === "LIVE" ? "pulse 2s infinite" : "none" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#e5e7eb", textTransform: "uppercase" }}>{summary.status}</span>
              </div>
            )}

            <button onClick={handleRefresh} disabled={refreshing}
              style={{ padding: "0.5rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.75rem", color: "#fff", cursor: "pointer" }}>
              <RefreshCw style={{ width: "1rem", height: "1rem", animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            </button>

            {selectedId && (
              <button onClick={() => router.push(`/dashboard/tournaments/${selectedId}/settings`)}
                style={{ padding: "0.5rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem", color: "#fff", cursor: "pointer" }}>
                <Settings style={{ width: "1rem", height: "1rem" }} />
              </button>
            )}
          </div>
        </div>

        {selectedTournament && summary && (
          <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
            <span>{summary.totalTeams} Teams</span>
            {summary.currentStage && (<><span>•</span><span>{summary.currentStage}</span></>)}
            <span>•</span>
            <span>{summary.completedMatches}/{summary.totalMatches} Matches</span>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        {summaryCards.map((card) => (
          <button key={card.label}
            onClick={() => card.link && router.push(card.link)}
            disabled={!card.link}
            style={{
              background: card.highlight ? "rgba(251,146,60,0.08)" : "rgba(30,30,40,0.6)",
              borderRadius: "0.875rem",
              padding: "0.875rem 1rem",
              textAlign: "left",
              border: `1px solid ${card.highlight ? "rgba(251,146,60,0.25)" : "rgba(255,255,255,0.06)"}`,
              cursor: card.link ? "pointer" : "default",
              transition: "all 0.15s",
            }}>
            <div style={{ fontSize: card.isText ? "1rem" : "1.5rem", fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500, marginTop: "0.125rem" }}>{card.label}</div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      {selectedId && <QuickActions tournamentId={selectedId} />}

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ResultsQueue tournamentId={selectedId} results={pendingResults} loading={loading} />
          <RecentActivity activities={recentActivity} loading={loading} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <NextMatch tournamentId={selectedId} match={nextMatch} loading={loading} />
          <TournamentHealth tournamentId={selectedId} issues={healthIssues} loading={loading} />
          {selectedId && (
            <button
              onClick={() => router.push(`/dashboard/tournaments/${selectedId}/overview`)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.625rem",
                fontSize: "0.875rem", fontWeight: 600, color: "#9ca3af", background: "rgba(30,30,40,0.6)", cursor: "pointer" }}>
              <Eye style={{ width: "1rem", height: "1rem" }} /> Full Tournament Overview
            </button>
          )}
        </div>
      </div>
    </div>
  )
}