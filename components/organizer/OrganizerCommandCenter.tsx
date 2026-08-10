// components/organizer/OrganizerCommandCenter.tsx
"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Trophy, RefreshCw, Settings, Eye, ChevronDown, User,
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
}

interface OrganizerProfile {
  displayName: string
  organizerName?: string
  organizerLogo?: string
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

export default function OrganizerCommandCenter() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedId, setSelectedId] = useState<string>("")
  const [showSelect, setShowSelect] = useState(false)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selected, setSelected] = useState<Tournament | null>(null)
  const [profile, setProfile] = useState<OrganizerProfile | null>(null)
  const [summary, setSummary] = useState<TournamentSummary | null>(null)
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([])
  const [pendingResults, setPendingResults] = useState<PendingResult[]>([])
  const [nextMatch, setNextMatch] = useState<MatchInfo | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])

  const fetchData = useCallback(async (tournamentId?: string) => {
    try {
      const id = tournamentId || selectedId
      const [tournamentsRes, summaryRes, profileRes] = await Promise.all([
        fetch("/api/dashboard/tournaments"),
        id ? fetch(`/api/dashboard/tournaments/${id}/summary`) : Promise.resolve(null),
        fetch("/api/organizer/profile"),
      ])

      const td = await tournamentsRes.json()
      const list: Tournament[] = td.tournaments || []
      setTournaments(list)

      const pd = await profileRes.json().catch(() => ({ profile: null }))
      if (pd.profile) setProfile(pd.profile)

      if (id && summaryRes) {
        const sd = await summaryRes.json()
        setSummary(sd.summary || null)
        setHealthIssues(sd.healthIssues || [])
        setPendingResults(sd.pendingResults || [])
        setNextMatch(sd.nextMatch || null)
        setRecentActivity(sd.recentActivity || [])
      }

      const sel = list.find((t) => t.id === id) || list[0] || null
      setSelected(sel)
      if (!selectedId && sel) setSelectedId(sel.id)
    } catch (err) {
      console.error("Command Center fetch error:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedId])

  useEffect(() => { fetchData() }, [])

  const handleChange = (id: string) => {
    setSelectedId(id)
    setShowSelect(false)
    setLoading(true)
    fetchData(id)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const organizerDisplayName = profile?.organizerName || profile?.displayName || "Organizer"

  const cards = [
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
        borderRadius: "1rem", padding: "1.25rem 1.5rem", marginBottom: "1rem",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            {profile?.organizerLogo ? (
              <img
                src={profile.organizerLogo} alt=""
                style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.625rem", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            ) : (
              <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.625rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy style={{ width: "1.375rem", height: "1.375rem", color: "#fff" }} />
              </div>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.125rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  TournaOps Organizer
                </span>
                <Link href="/dashboard/settings/organizer" style={{ fontSize: "0.65rem", color: "#a78bfa", textDecoration: "none", padding: "0.125rem 0.375rem", background: "rgba(167,139,250,0.1)", borderRadius: "0.25rem" }}>
                  Edit
                </Link>
              </div>
              <h1 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                {organizerDisplayName}
              </h1>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.125rem" }}>Command Center</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowSelect(!showSelect)}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "#fff",
                  fontWeight: 600, cursor: "pointer" }}>
                <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selected?.name || "Select Tournament"}
                </span>
                <ChevronDown style={{ width: "1rem", height: "1rem" }} />
              </button>
              {showSelect && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 0.25rem)", background: "#1a1a24",
                  borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.1)", minWidth: "220px",
                  zIndex: 50, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
                  {tournaments.length === 0 ? (
                    <div style={{ padding: "0.75rem", color: "#9ca3af", fontSize: "0.8rem", textAlign: "center" }}>No tournaments</div>
                  ) : tournaments.map((t) => (
                    <button key={t.id} onClick={() => handleChange(t.id)}
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

        {selected && summary && (
          <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
            <span style={{ color: "#fff", fontWeight: 600 }}>{selected.name}</span>
            <span>•</span>
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
        {cards.map((card) => (
          <button key={card.label}
            onClick={() => card.link && router.push(card.link)}
            disabled={!card.link}
            style={{
              background: card.highlight ? "rgba(251,146,60,0.08)" : "rgba(30,30,40,0.6)",
              borderRadius: "0.875rem", padding: "0.875rem 1rem", textAlign: "left",
              border: `1px solid ${card.highlight ? "rgba(251,146,60,0.25)" : "rgba(255,255,255,0.06)"}`,
              cursor: card.link ? "pointer" : "default",
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
            <button onClick={() => router.push(`/dashboard/tournaments/${selectedId}/overview`)}
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