"use client";
import TournamentStatusManager from "@/components/tournament/TournamentStatusManager";
import RegistrationSharePanel from "@/components/tournament/RegistrationSharePanel";
import TournamentNav from "@/components/tournament/TournamentNav";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft, Trophy, Users, MapPin, Play,
  BarChart3, Shield, Crosshair, Zap, Download,
  Edit, Eye, Award, Flame, Radio, Sparkles,
  Loader2, ExternalLink, Copy, Check, Settings2,
  Calendar, Target, TrendingUp, Palette,
  MessageSquare, ChevronRight, Grid3x3
} from "lucide-react";
// Storage helpers replaced with inline API calls
const getTournamentById = async (id: string) => {
  try {
    const res = await fetch("/api/tournaments/" + id);
    if (!res.ok) return null;
    const data = await res.json();
    return data.tournament;
  } catch { return null; }
};

const getLeaderboard = (tournament: any) => {
  const teams = tournament?.teams || [];
  const matches = tournament?.matches || [];
  const map = new Map();
  for (const t of teams) {
    map.set(t.id, { teamId: t.id, teamName: t.name, teamTag: t.tag, totalPoints: 0, totalKills: 0, matchesPlayed: 0, wwcdCount: 0 });
  }
  for (const m of matches) {
    if (m.status !== "completed" || !Array.isArray(m.results)) continue;
    for (const r of (m.results as any[]) ?? []) {
      const s = map.get(r.teamId);
      if (!s) continue;
      s.totalKills += r.kills || 0;
      s.matchesPlayed++;
      if (r.placement === 1) s.wwcdCount++;
      const placementPts = r.placement === 1 ? 15 : r.placement === 2 ? 12 : r.placement === 3 ? 10 : r.placement <= 8 ? 5 : 1;
      s.totalPoints += placementPts + (r.kills || 0);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints);
};

const getTopPlayers = (t?: any) => { return { topKillers: [], topDamage: [] }; };
const generateDemoResults = async (_id: string, _mid: string) => null;
const submitMatchResults = async (_id: string, _mid: string, results: any) => {
  try {
    const res = await fetch("/api/matches/" + _mid, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results, status: "completed" }),
    });
    return res.ok;
  } catch { return false; }
};
import { Tournament, Match, Team } from "@/types/tournament";

const TeamEditor = dynamic(() => import("@/components/tournament/TeamEditor"), { ssr: false });
const MatchResultEntry = dynamic(() => import("@/components/tournament/MatchResultEntry"), { ssr: false });
const FullLeaderboard = dynamic(() => import("@/components/tournament/FullLeaderboard"), { ssr: false });

type Tab = "overview" | "matches" | "standings" | "teams";

export default function TournamentDetailPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [showTeamEditor, setShowTeamEditor] = useState(false);
  const [showMatchEntry, setShowMatchEntry] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedMatchTeams, setSelectedMatchTeams] = useState<Team[]>([]);
  const [generatingDemo, setGeneratingDemo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [regCopied, setRegCopied] = useState(false);
  const [pendingRegs, setPendingRegs] = useState(0);

  const refreshData = async () => {
    const id = params?.id as string;
    if (!id) return;
    const t = await getTournamentById(id);
    setTournament(t ?? null);
  };

  useEffect(() => {
    const id = params?.id as string;
    if (id) {
      getTournamentById(id).then(t => {
        setTournament(t ?? null);
        setLoading(false);
      });
    }
  }, [params?.id]);

  const handleDemoResult = async (matchId: string) => {
    if (!tournament) return;
    setGeneratingDemo(matchId);
    await new Promise(r => setTimeout(r, 500));
    const results = generateDemoResults(tournament, matchId);
    const updated = await submitMatchResults(tournament.id, matchId, results);
    if (updated) setTournament(updated);
    setGeneratingDemo(null);
  };

  const handleEnterResults = (match: Match) => {
    if (!tournament) return;
    const rounds = tournament.rounds || [];
    const teams = tournament.teams || [];
    const lobby = rounds.flatMap((r: any) => r.lobbies || []).find((l: any) => l.matchIds?.includes(match.id));
    const matchTeams = lobby
      ? teams.filter((t: any) => lobby.teamIds?.includes(t.id))
      : teams.slice(0, 16);
    setSelectedMatch(match);
    setSelectedMatchTeams(matchTeams);
    setShowMatchEntry(true);
  };

  const copyRegistrationLink = () => {
    if (!tournament?.slug) return;
    const url = `${window.location.origin}/tournaments/${tournament.slug}/register`;
    navigator.clipboard.writeText(url);
    setRegCopied(true);
    setTimeout(() => setRegCopied(false), 2000);
  };

  const shareRegistrationLink = () => {
    if (!tournament?.slug) return;
    const url = `${window.location.origin}/tournaments/${tournament.slug}/register`;
    const text = `Register your team for ${tournament.name}!`;
    if (navigator.share) {
      navigator.share({ title: tournament.name, text, url });
    } else {
      copyRegistrationLink();
    }
  };

  useEffect(() => {
    if (!tournament?.id) return;
    const fetchPending = () => {
      fetch(`/api/tournaments/${tournament.id}/registrations`)
        .then(r => r.json())
        .then(d => {
          const regs = Array.isArray(d.registrations) ? d.registrations : [];
          setPendingRegs(regs.filter((r: any) => r.status === "pending").length);
        })
        .catch(() => {});
    };
    fetchPending();
    const i = setInterval(fetchPending, 10000);
    return () => clearInterval(i);
  }, [tournament?.id]);

  const copyPublicLink = () => {
    if (!tournament?.slug) return;
    const url = `${window.location.origin}/tournaments/${tournament.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <Trophy style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
        <p style={{ color: "#9ca3af", fontSize: "1.125rem", marginBottom: "1rem" }}>Tournament not found</p>
        <Link href="/dashboard/tournaments" style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: "#f59e0b", color: "#000",
          padding: "0.625rem 1.5rem", borderRadius: "0.75rem",
          fontWeight: 700, fontSize: "0.875rem",
          textDecoration: "none",
        }}>
          <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
          Back to Tournaments
        </Link>
      </div>
    );
  }

  const teams = tournament.teams || [];
  const matches = tournament.matches || [];
  const rounds = tournament.rounds || [];
  const leaderboard = getLeaderboard(tournament);
  const { topKillers, topDamage } = getTopPlayers(tournament);
  const completedMatches = matches.filter((m: any) => m.status === "completed").length;
  const totalMatches = matches.length;
  const progress = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
  const totalKills = leaderboard.reduce((a, e) => a + (e.totalKills || 0), 0);

  const statusInfo: Record<string, { bg: string; text: string; border: string; label: string }> = {
    live: { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "rgba(34,197,94,0.3)", label: "LIVE" },
    draft: { bg: "rgba(107,114,128,0.1)", text: "#9ca3af", border: "rgba(107,114,128,0.25)", label: "DRAFT" },
    registration: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "rgba(59,130,246,0.25)", label: "REGISTRATION" },
    completed: { bg: "rgba(168,85,247,0.1)", text: "#c084fc", border: "rgba(168,85,247,0.25)", label: "COMPLETED" },
    cancelled: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.25)", label: "CANCELLED" },
  };
  const status = statusInfo[tournament.status] || statusInfo.draft;

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "matches", label: "Matches", icon: Play, count: totalMatches },
    { key: "standings", label: "Standings", icon: Trophy, count: leaderboard.length },
    { key: "teams", label: "Teams", icon: Users, count: teams.length },
  ];

  const quickTools = [
    { icon: Radio, label: "Broadcast", href: `/dashboard/tournaments/${tournament.id}/broadcast`, color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
    { icon: Sparkles, label: "AI Insights", href: `/dashboard/tournaments/${tournament.id}/insights`, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { icon: Trophy, label: "Standings", href: `/dashboard/tournaments/${tournament.id}/standings`, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { icon: Grid3x3, label: "Bulk Import", href: `/dashboard/tournaments/${tournament.id}/bulk-import`, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <TournamentNav tournamentId={tournament.id} />

      {/* -- HERO HEADER --- */}
      <div style={{
        background: tournament.bannerImage
          ? `linear-gradient(180deg, rgba(10,10,15,0.6), rgba(10,10,15,0.95)), url(${tournament.bannerImage})`
          : "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(249,115,22,0.02))",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "1.25rem",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Back button */}
        <Link href="/dashboard/tournaments" style={{
          display: "inline-flex", alignItems: "center", gap: "0.375rem",
          color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500,
          textDecoration: "none", marginBottom: "1rem",
        }}>
          <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
          All Tournaments
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>

          {/* Left - Tournament Info */}
          <div style={{ flex: 1, minWidth: "260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.65rem",
                fontWeight: 800,
                background: status.bg,
                color: status.text,
                border: `1px solid ${status.border}`,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                {tournament.status === "live" && (
                  <span style={{ width: "0.4rem", height: "0.4rem", borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
                )}
                {status.label}
              </span>
              <button
                onClick={() => setShowStatusManager(!showStatusManager)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.25rem",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "9999px",
                  fontSize: "0.65rem", fontWeight: 600,
                  background: "rgba(255,255,255,0.05)",
                  color: "#9ca3af",
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                }}
              >
                <Settings2 style={{ width: "0.7rem", height: "0.7rem" }} />
                {showStatusManager ? "Hide Controls" : "Change Status"}
              </button>
            </div>

            <h1 style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "0.5rem",
              lineHeight: 1.1,
            }}>
              {tournament.name}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", color: "#9ca3af", fontSize: "0.8rem", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                <Users style={{ width: "0.875rem", height: "0.875rem" }} />
                {teams.length} Teams
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                <Play style={{ width: "0.875rem", height: "0.875rem" }} />
                {completedMatches}/{totalMatches} Matches
              </span>
              {tournament.prizePool && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#fbbf24" }}>
                  <Trophy style={{ width: "0.875rem", height: "0.875rem" }} />
                  {tournament.prizePool}
                </span>
              )}
            </div>
          </div>

          {/* Right - Actions */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {tournament.slug && (
              <>
                <button
                  onClick={copyPublicLink}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.375rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.625rem",
                    padding: "0.5rem 0.875rem",
                    color: copied ? "#4ade80" : "#d1d5db",
                    fontSize: "0.75rem", fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {copied
                    ? <><Check style={{ width: "0.875rem", height: "0.875rem" }} />Copied</>
                    : <><Copy style={{ width: "0.875rem", height: "0.875rem" }} />Copy Link</>
                  }
                </button>
                <Link
                  href={`/tournaments/${tournament.slug}`}
                  target="_blank"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.375rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.625rem",
                    padding: "0.5rem 0.875rem",
                    color: "#d1d5db",
                    fontSize: "0.75rem", fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink style={{ width: "0.875rem", height: "0.875rem" }} />
                  Public
                </Link>
              </>
            )}
            <button
              onClick={() => setShowTeamEditor(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                background: "#f59e0b", color: "#000",
                borderRadius: "0.625rem",
                padding: "0.5rem 0.875rem",
                border: "none",
                fontSize: "0.75rem", fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Edit style={{ width: "0.875rem", height: "0.875rem" }} />
              Edit Teams
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalMatches > 0 && (
          <div style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.375rem" }}>
              <span>Tournament Progress</span>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ height: "0.375rem", background: "rgba(255,255,255,0.08)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{
                width: `${progress}%`, height: "100%",
                background: "linear-gradient(to right, #f59e0b, #f97316)",
                borderRadius: "9999px",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* -- STATUS MANAGER (Collapsible) --- */}
      {showStatusManager && (
        <div style={{ marginBottom: "1.5rem" }}>
          <TournamentStatusManager
            tournamentId={tournament.id}
            currentStatus={tournament.status}
            tournamentName={tournament.name}
            onUpdate={refreshData}
          />
        </div>
      )}

      {/* Registration Share Panel */}
      {tournament.slug && (
        <RegistrationSharePanel
          tournamentId={tournament.id}
          tournamentSlug={tournament.slug}
          tournamentName={tournament.name}
          status={tournament.status}
        />
      )}

      {/* -- QUICK TOOLS TOOLBAR --- */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "0.625rem",
        marginBottom: "1.5rem",
      }}>
        {quickTools.map(tool => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.label}
              href={tool.href}
              style={{
                display: "flex", alignItems: "center", gap: "0.625rem",
                padding: "0.875rem 1rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.875rem",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = tool.color + "40";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <div style={{
                width: "2rem", height: "2rem",
                borderRadius: "0.5rem",
                background: tool.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon style={{ width: "1rem", height: "1rem", color: tool.color }} />
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#d1d5db", flex: 1, whiteSpace: "nowrap" }}>
                {tool.label}
              </span>
              <ChevronRight style={{ width: "0.875rem", height: "0.875rem", color: "#4b5563" }} />
            </Link>
          );
        })}
      </div>

      {/* -- TABS --- */}
      <div style={{
        display: "flex", gap: "0.25rem",
        padding: "0.25rem",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.875rem",
        marginBottom: "1.5rem",
        overflowX: "auto",
      }} className="scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.625rem",
                fontSize: "0.8rem", fontWeight: 600,
                background: active ? "rgba(245,158,11,0.15)" : "transparent",
                color: active ? "#f59e0b" : "#9ca3af",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              <Icon style={{ width: "0.875rem", height: "0.875rem" }} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{
                  fontSize: "0.65rem",
                  background: active ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.06)",
                  padding: "0.05rem 0.4rem",
                  borderRadius: "9999px",
                  fontWeight: 700,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* -- OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.875rem" }}>
            {[
              { label: "Teams", value: teams.length, icon: Users, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
              { label: "Matches", value: `${completedMatches}/${totalMatches}`, icon: Play, color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
              { label: "Total Kills", value: totalKills, icon: Crosshair, color: "#f87171", bg: "rgba(239,68,68,0.1)" },
              { label: "Rounds", value: rounds.length, icon: Award, color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.125rem",
                }}>
                  <div style={{
                    width: "2rem", height: "2rem",
                    borderRadius: "0.5rem",
                    background: stat.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "0.75rem",
                  }}>
                    <Icon style={{ width: "1rem", height: "1rem", color: stat.color }} />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Players */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            {[
              { title: "Top Fraggers", icon: Crosshair, color: "#f87171", data: topKillers || [], valueKey: "kills", suffix: "K" },
              { title: "Top Damage", icon: Flame, color: "#fb923c", data: topDamage || [], valueKey: "damage", suffix: "", format: (v: number) => v?.toLocaleString() },
            ].map(section => {
              const Icon = section.icon;
              return (
                <div key={section.title} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                }}>
                  <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Icon style={{ width: "1rem", height: "1rem", color: section.color }} />
                    {section.title}
                  </h3>
                  {section.data.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {section.data.slice(0, 5).map((p: any, i: number) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "0.5rem",
                          background: i === 0 ? "rgba(245,158,11,0.05)" : "transparent",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                            <span style={{
                              width: "1.5rem", textAlign: "center",
                              color: i === 0 ? "#facc15" : i === 1 ? "#d1d5db" : i === 2 ? "#b45309" : "#6b7280",
                              fontWeight: 700, fontSize: "0.75rem",
                            }}>
                              #{i + 1}
                            </span>
                            <div>
                              <div style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 600 }}>{p.playerName}</div>
                              <div style={{ color: "#6b7280", fontSize: "0.65rem" }}>{p.teamName}</div>
                            </div>
                          </div>
                          <span style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            color: section.color,
                          }}>
                            {section.format ? section.format(p[section.valueKey]) : p[section.valueKey]}{section.suffix}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#4b5563", fontSize: "0.75rem", padding: "1rem 0", textAlign: "center" }}>
                      No match data yet
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Round Structure */}
          {rounds.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "1.25rem",
            }}>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Award style={{ width: "1rem", height: "1rem", color: "#c084fc" }} />
                Round Structure
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {rounds.map((round: any, idx: number) => {
                  const roundMatches = matches.filter((m: any) => m.roundId === round.id);
                  const roundCompleted = roundMatches.filter((m: any) => m.status === "completed").length;
                  const lobbies = round.lobbies || [];
                  const roundProgress = roundMatches.length > 0 ? (roundCompleted / roundMatches.length) * 100 : 0;
                  return (
                    <div key={round.id} style={{
                      display: "flex", alignItems: "center", gap: "0.875rem",
                      padding: "0.75rem 1rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "0.75rem",
                    }}>
                      <div style={{
                        width: "1.75rem", height: "1.75rem",
                        borderRadius: "50%",
                        background: "rgba(168,85,247,0.15)",
                        color: "#c084fc",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "0.75rem",
                        flexShrink: 0,
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>{round.name}</div>
                        <div style={{ color: "#6b7280", fontSize: "0.65rem", marginTop: "0.125rem" }}>
                          {lobbies.length} lobbies - {round.matchesPerLobby || 0} matches each
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: "60px" }}>
                        <div style={{ color: "#d1d5db", fontSize: "0.8rem", fontWeight: 600 }}>
                          {roundCompleted}/{roundMatches.length}
                        </div>
                        <div style={{ color: "#4b5563", fontSize: "0.6rem" }}>complete</div>
                      </div>
                      <div style={{
                        width: "0.5rem", height: "0.5rem", borderRadius: "50%",
                        background: roundCompleted === roundMatches.length && roundMatches.length > 0
                          ? "#4ade80"
                          : roundCompleted > 0 ? "#fbbf24" : "#374151",
                        flexShrink: 0,
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -- MATCHES TAB --- */}
      {activeTab === "matches" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {rounds.length === 0 ? (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "3rem",
              textAlign: "center",
            }}>
              <Play style={{ width: "2.5rem", height: "2.5rem", color: "#374151", margin: "0 auto 1rem" }} />
              <p style={{ color: "#9ca3af", fontWeight: 600 }}>No matches yet</p>
              <p style={{ color: "#4b5563", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                Configure your tournament rounds and matches
              </p>
            </div>
          ) : (
            rounds.map((round: any) => (
              <div key={round.id}>
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Award style={{ width: "1.125rem", height: "1.125rem", color: "#c084fc" }} />
                  {round.name}
                </h3>
                {(round.lobbies || []).map((lobby: any) => {
                  const lobbyMatches = matches.filter((m: any) => lobby.matchIds?.includes(m.id));
                  return (
                    <div key={lobby.id} style={{ marginBottom: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <div style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "#60a5fa" }} />
                        <span style={{ color: "#d1d5db", fontSize: "0.75rem", fontWeight: 600 }}>{lobby.name}</span>
                        <span style={{ color: "#4b5563", fontSize: "0.65rem" }}>({lobby.teamIds?.length || 0} teams)</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.625rem" }}>
                        {lobbyMatches.map((match: any) => (
                          <div key={match.id} style={{
                            background: match.status === "completed" ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.03)",
                            border: match.status === "completed" ? "1px solid rgba(34,197,94,0.15)" : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "0.75rem",
                            padding: "0.875rem",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.625rem" }}>
                              <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>{match.name}</div>
                                <div style={{ color: "#6b7280", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.125rem" }}>
                                  <MapPin style={{ width: "0.7rem", height: "0.7rem" }} />
                                  {match.map}
                                </div>
                              </div>
                              <span style={{
                                padding: "0.15rem 0.5rem",
                                borderRadius: "9999px",
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                background: match.status === "completed" ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.15)",
                                color: match.status === "completed" ? "#4ade80" : "#9ca3af",
                                border: `1px solid ${match.status === "completed" ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.25)"}`,
                              }}>
                                {match.status === "completed" ? "DONE" : "PENDING"}
                              </span>
                            </div>

                            {match.status === "completed" && match.results && match.results.length > 0 && (
                              <div style={{ marginBottom: "0.625rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                {match.results.slice(0, 3).map((r: any, i: number) => (
                                  <div key={r.teamId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                      <span style={{
                                        fontWeight: 700,
                                        color: i === 0 ? "#facc15" : i === 1 ? "#d1d5db" : "#b45309",
                                      }}>
                                        #{r.placement}
                                      </span>
                                      <span style={{ color: "#d1d5db", maxWidth: "5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {r.teamName}
                                      </span>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                      <span style={{ color: "#f87171" }}>{r.kills}K</span>
                                      <span style={{ color: "#60a5fa", fontWeight: 700 }}>{r.totalPoints}p</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div style={{ display: "flex", gap: "0.375rem" }}>
                              <button
                                onClick={() => handleEnterResults(match)}
                                style={{
                                  flex: 1,
                                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                  padding: "0.4rem",
                                  borderRadius: "0.5rem",
                                  background: "rgba(255,255,255,0.06)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  color: "#d1d5db",
                                  fontSize: "0.7rem", fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                <Edit style={{ width: "0.7rem", height: "0.7rem" }} />
                                {match.status === "completed" ? "Edit" : "Enter"}
                              </button>
                              <button
                                onClick={() => handleDemoResult(match.id)}
                                disabled={generatingDemo === match.id}
                                style={{
                                  padding: "0.4rem 0.625rem",
                                  borderRadius: "0.5rem",
                                  background: "rgba(245,158,11,0.1)",
                                  border: "1px solid rgba(245,158,11,0.2)",
                                  color: "#f59e0b",
                                  fontSize: "0.7rem", fontWeight: 600,
                                  cursor: generatingDemo === match.id ? "not-allowed" : "pointer",
                                  display: "inline-flex", alignItems: "center", gap: "0.25rem",
                                }}
                              >
                                <Zap style={{ width: "0.7rem", height: "0.7rem" }} />
                                {generatingDemo === match.id ? "..." : "Demo"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}

      {/* -- STANDINGS TAB --- */}
      {activeTab === "standings" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ color: "#fff", fontWeight: 700 }}>Live Standings</h3>
            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.625rem",
                padding: "0.5rem 0.875rem",
                color: "#d1d5db",
                fontSize: "0.75rem", fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Download style={{ width: "0.875rem", height: "0.875rem" }} />
              Export
            </button>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1rem",
            overflow: "hidden",
          }}>
            {leaderboard.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <Trophy style={{ width: "2rem", height: "2rem", color: "#374151", margin: "0 auto 0.5rem" }} />
                <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>No results yet</p>
                <p style={{ color: "#4b5563", fontSize: "0.7rem", marginTop: "0.25rem" }}>Enter match results to see standings</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#6b7280", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rank</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#6b7280", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Team</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#6b7280", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kills</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#6b7280", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Place</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#f59e0b", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map(entry => (
                      <tr key={entry.teamId} style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: entry.rank <= 3 ? "rgba(245,158,11,0.02)" : "transparent",
                      }}>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{
                            fontFamily: "monospace", fontWeight: 700,
                            color: entry.rank === 1 ? "#facc15" : entry.rank === 2 ? "#d1d5db" : entry.rank === 3 ? "#b45309" : "#6b7280",
                          }}>
                            #{entry.rank}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#fff", fontWeight: 600 }}>{entry.teamName}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#fb923c", fontFamily: "monospace", fontWeight: 700 }}>{entry.totalKills || 0}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#93c5fd", fontFamily: "monospace" }}>{entry.placementPoints || 0}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                          <span style={{
                            fontFamily: "monospace", fontWeight: 800, fontSize: "1rem",
                            color: entry.rank <= 3 ? "#facc15" : "#fff",
                          }}>
                            {entry.totalPoints}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- TEAMS TAB --- */}
      {activeTab === "teams" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ color: "#fff", fontWeight: 700 }}>{teams.length} Teams Registered</h3>
            <button
              onClick={() => setShowTeamEditor(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                background: "#f59e0b", color: "#000",
                borderRadius: "0.625rem",
                padding: "0.5rem 0.875rem",
                border: "none",
                fontSize: "0.75rem", fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Edit style={{ width: "0.875rem", height: "0.875rem" }} />
              Manage Teams
            </button>
          </div>

          {teams.length === 0 ? (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "3rem",
              textAlign: "center",
            }}>
              <Users style={{ width: "2.5rem", height: "2.5rem", color: "#374151", margin: "0 auto 1rem" }} />
              <p style={{ color: "#9ca3af", fontWeight: 600 }}>No teams yet</p>
              <button
                onClick={() => setShowTeamEditor(true)}
                style={{
                  marginTop: "1rem",
                  background: "#f59e0b", color: "#000",
                  borderRadius: "0.625rem",
                  padding: "0.5rem 1.25rem",
                  border: "none",
                  fontSize: "0.75rem", fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Add First Team
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.875rem" }}>
              {teams.map((team: any) => (
                <div key={team.id} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.125rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                    <div style={{
                      width: "2.5rem", height: "2.5rem",
                      borderRadius: "0.625rem",
                      background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.15))",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}>
                      {(team as any).logo ? (
                        <img src={(team as any).logo} alt={team.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{team.name.charAt(0)}</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {team.name}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.7rem" }}>
                        {(team.players || []).length} players
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    {(team.players || []).map((player: any) => (
                      <div key={player.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0.375rem 0.5rem",
                        borderRadius: "0.4rem",
                        background: "rgba(255,255,255,0.02)",
                        fontSize: "0.75rem",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <Shield style={{ width: "0.7rem", height: "0.7rem", color: "#4b5563" }} />
                          <span style={{ color: "#d1d5db" }}>{player.name}</span>
                        </div>
                        {player.role && (
                          <span style={{
                            padding: "0.1rem 0.4rem",
                            borderRadius: "9999px",
                            fontSize: "0.6rem",
                            fontWeight: 600,
                            background: player.role === "IGL" ? "rgba(168,85,247,0.15)"
                              : player.role === "Fragger" ? "rgba(239,68,68,0.15)"
                              : "rgba(107,114,128,0.15)",
                            color: player.role === "IGL" ? "#c084fc"
                              : player.role === "Fragger" ? "#f87171"
                              : "#9ca3af",
                          }}>
                            {player.role}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -- MODALS --- */}
      {showTeamEditor && (
        <TeamEditor
          tournament={tournament}
          onClose={() => setShowTeamEditor(false)}
          onSave={(updated: any) => {
            const handle = (r: any) => setTournament(r ?? null);
            if (updated && typeof updated.then === "function") updated.then(handle);
            else handle(updated);
            setShowTeamEditor(false);
          }}
        />
      )}

      {showMatchEntry && selectedMatch && (
        <MatchResultEntry
          tournament={tournament}
          match={selectedMatch}
          teams={selectedMatchTeams}
          onClose={() => { setShowMatchEntry(false); setSelectedMatch(null); }}
          onSave={(updated: any) => {
            const handle = (r: any) => setTournament(r ?? null);
            if (updated && typeof updated.then === "function") updated.then(handle);
            else handle(updated);
            setShowMatchEntry(false);
            setSelectedMatch(null);
          }}
        />
      )}

      {showLeaderboard && (
        <FullLeaderboard
          tournament={tournament}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
