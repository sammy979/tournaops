"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TournamentNav from "@/components/tournament/TournamentNav";
import TeamLogo from "@/components/tournament/TeamLogo";
import {
  Trophy, Users, Play, BarChart3, Radio, Sparkles,
  Loader2, ExternalLink, Copy, Check, Settings2,
  Layers, Crown, Zap, Clock, Globe, AlertCircle,
  ChevronRight, MessageSquare, Palette, FileText,
  TrendingUp, Target, Shield, ArrowRight, RefreshCw
} from "lucide-react";

export default function TournamentOverviewPage() {
  const params = useParams();
  const id = params?.id as string;

  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async (showRefreshing = false) => {
    if (!id) return;
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/command-status`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setLastRefresh(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 30000);
    return () => clearInterval(interval);
  }, [load]);

  function copyLink() {
    if (!status?.tournament?.slug) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/tournaments/${status.tournament.slug}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!status) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Trophy style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
        <p style={{ color: "#9ca3af" }}>Tournament not found</p>
      </div>
    );
  }

  const t = status.tournament;
  const primaryColor = t.brandingData?.primaryColor || "#f59e0b";

  const statusConfig: Record<string, any> = {
    live: { label: "LIVE", color: "#4ade80", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)", dot: true },
    draft: { label: "DRAFT", color: "#9ca3af", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)" },
    registration: { label: "REGISTRATION", color: "#60a5fa", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)" },
    completed: { label: "COMPLETED", color: "#c084fc", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)" },
    cancelled: { label: "CANCELLED", color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
  };
  const sc = statusConfig[t.status] || statusConfig.draft;

  const nextAction = status.nextAction;
  const urgencyColor =
    nextAction.urgency === "high"
      ? "#f87171"
      : nextAction.urgency === "medium"
      ? "#fbbf24"
      : "#4ade80";
  const urgencyBg =
    nextAction.urgency === "high"
      ? "rgba(239,68,68,0.08)"
      : nextAction.urgency === "medium"
      ? "rgba(245,158,11,0.08)"
      : "rgba(34,197,94,0.08)";
  const urgencyBorder =
    nextAction.urgency === "high"
      ? "rgba(239,68,68,0.25)"
      : nextAction.urgency === "medium"
      ? "rgba(245,158,11,0.25)"
      : "rgba(34,197,94,0.25)";

  const quickActions = [
    { icon: Trophy, label: "Match Results", desc: "Enter results", href: `/dashboard/tournaments/${id}/match-results`, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
    { icon: BarChart3, label: "Standings", desc: "Live leaderboard", href: `/dashboard/tournaments/${id}/standings`, color: "#60a5fa", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)" },
    { icon: Users, label: "Teams", desc: `${status.teams.total} registered`, href: `/dashboard/tournaments/${id}/teams`, color: "#4ade80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
    { icon: Layers, label: "Stages", desc: "Manage stages", href: `/dashboard/tournaments/${id}/stages`, color: "#c084fc", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.2)" },
    { icon: Play, label: "Matches", desc: `${status.matches.total} total`, href: `/dashboard/tournaments/${id}/matches`, color: "#fb923c", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)" },
    { icon: Radio, label: "OBS Overlays", desc: "Broadcast tools", href: `/dashboard/tournaments/${id}/overlays`, color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.2)" },
    { icon: MessageSquare, label: "Discord", desc: status.integrations.discord ? "Connected" : "Not configured", href: `/dashboard/tournaments/${id}/discord`, color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.2)" },
    { icon: Palette, label: "Branding", desc: "Colors & sponsors", href: `/dashboard/tournaments/${id}/branding`, color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
    { icon: Sparkles, label: "AI Insights", desc: "Smart analysis", href: `/dashboard/tournaments/${id}/insights`, color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)" },
    { icon: FileText, label: "Public Report", desc: "View results", href: `/tournaments/${t.slug}/results`, color: "#38bdf8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.2)", external: true },
    { icon: Settings2, label: "Settings", desc: "Tournament config", href: `/dashboard/tournaments/${id}/settings`, color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" },
    { icon: Globe, label: "Public Page", desc: "View public site", href: `/tournaments/${t.slug}`, color: "#fb923c", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", external: true },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <TournamentNav tournamentId={id} />

      {/* HERO */}
      <div style={{
        background: t.bannerImage
          ? `linear-gradient(180deg,rgba(10,10,15,.65),rgba(10,10,15,.97)),url(${t.bannerImage}) center/cover`
          : `linear-gradient(135deg,${primaryColor}08,rgba(249,115,22,.02))`,
        borderRadius: "1.25rem",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        position: "relative",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                padding: "0.2rem 0.75rem", borderRadius: "9999px",
                fontSize: "0.65rem", fontWeight: 800,
                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {sc.dot && <span style={{ width: "0.4rem", height: "0.4rem", borderRadius: "50%", background: sc.color, animation: "pulse 2s infinite" }} />}
                {sc.label}
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 800, color: "#fff", marginBottom: "0.5rem", lineHeight: 1.1 }}>
              {t.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#9ca3af", fontSize: "0.8rem", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                <Users style={{ width: "0.875rem", height: "0.875rem" }} />
                {status.teams.total}/{t.maxTeams} Teams
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                <Play style={{ width: "0.875rem", height: "0.875rem" }} />
                {status.matches.completed}/{status.matches.total} Matches
              </span>
              {t.prizePool && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#fbbf24" }}>
                  <Trophy style={{ width: "0.875rem", height: "0.875rem" }} />
                  {t.prizePool}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.625rem", padding: "0.5rem 0.875rem",
                color: "#9ca3af", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: "0.875rem", height: "0.875rem", animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button onClick={copyLink} style={{
              display: "inline-flex", alignItems: "center", gap: "0.375rem",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.625rem", padding: "0.5rem 0.875rem",
              color: copied ? "#4ade80" : "#d1d5db", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
            }}>
              {copied ? <><Check style={{ width: "0.875rem", height: "0.875rem" }} />Copied!</> : <><Copy style={{ width: "0.875rem", height: "0.875rem" }} />Copy Link</>}
            </button>
            {t.slug && (
              <Link href={`/tournaments/${t.slug}`} target="_blank" style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.625rem", padding: "0.5rem 0.875rem",
                color: "#d1d5db", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none",
              }}>
                <ExternalLink style={{ width: "0.875rem", height: "0.875rem" }} />View Public
              </Link>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {status.matches.total > 0 && (
          <div style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.375rem" }}>
              <span>Tournament Progress</span>
              <span style={{ color: primaryColor, fontWeight: 700 }}>
                {status.matches.progressPercent}% ({status.matches.completed}/{status.matches.total} matches)
              </span>
            </div>
            <div style={{ height: "0.375rem", background: "rgba(255,255,255,0.08)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{
                width: `${status.matches.progressPercent}%`, height: "100%",
                background: `linear-gradient(to right,${primaryColor},#f97316)`,
                borderRadius: "9999px", transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* NEXT ACTION BANNER */}
      {nextAction && nextAction.action !== "ALL_GOOD" && (
        <Link href={nextAction.href || "#"} style={{ textDecoration: "none", display: "block", marginBottom: "1.5rem" }}>
          <div style={{
            background: urgencyBg,
            border: `1px solid ${urgencyBorder}`,
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
            display: "flex", alignItems: "center", gap: "1rem",
            cursor: "pointer",
          }}>
            <div style={{
              width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem",
              background: `${urgencyColor}15`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Zap style={{ width: "1.25rem", height: "1.25rem", color: urgencyColor }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: urgencyColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.125rem" }}>
                Next Action
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{nextAction.label}</div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.125rem" }}>{nextAction.description}</div>
            </div>
            <ArrowRight style={{ width: "1.25rem", height: "1.25rem", color: urgencyColor, flexShrink: 0 }} />
          </div>
        </Link>
      )}

      {/* QUICK STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Teams", value: status.teams.total, icon: Users, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
          { label: "Completed", value: status.matches.completed, icon: Check, color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
          { label: "Remaining", value: status.matches.pending, icon: Clock, color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
          { label: "Stages", value: status.stageProgress.length, icon: Layers, color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1rem" }}>
              <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.625rem" }}>
                <Icon style={{ width: "0.875rem", height: "0.875rem", color: stat.color }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>

        {/* COMMAND CENTER */}
        <div>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
            Command Center
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.625rem" }}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              const content = (
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${action.border}`,
                  borderRadius: "0.875rem",
                  textDecoration: "none",
                  cursor: "pointer", width: "100%", textAlign: "left",
                }}>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: action.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: "1.125rem", height: "1.125rem", color: action.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      {action.label}
                      {(action as any).external && <ExternalLink style={{ width: "0.625rem", height: "0.625rem", color: "#6b7280" }} />}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.125rem" }}>{action.desc}</div>
                  </div>
                  <ChevronRight style={{ width: "0.875rem", height: "0.875rem", color: "#4b5563", flexShrink: 0 }} />
                </div>
              );
              return (action as any).external
                ? <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{content}</a>
                : <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>{content}</Link>;
            })}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Active Stage */}
          {status.activeStage && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${primaryColor}30`, borderRadius: "1rem", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Layers style={{ width: "0.75rem", height: "0.75rem", color: primaryColor }} />
                Current Stage
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", marginBottom: "0.375rem" }}>
                {status.activeStage.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.875rem" }}>
                {status.activeStage.numGroups} group{status.activeStage.numGroups !== 1 ? "s" : ""} · {status.activeStage.teamsPerGroup} teams/group
              </div>
              {status.activeStageCompletion && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.25rem" }}>
                    <span>Match progress</span>
                    <span style={{ color: status.activeStageCompletion.isComplete ? "#4ade80" : primaryColor, fontWeight: 700 }}>
                      {status.activeStageCompletion.completedMatches}/{status.activeStageCompletion.totalMatches}
                    </span>
                  </div>
                  <div style={{ height: "0.25rem", background: "rgba(255,255,255,0.08)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{
                      width: `${status.activeStageCompletion.totalMatches > 0 ? Math.round(status.activeStageCompletion.completedMatches / status.activeStageCompletion.totalMatches * 100) : 0}%`,
                      height: "100%",
                      background: status.activeStageCompletion.isComplete ? "#4ade80" : primaryColor,
                      borderRadius: "9999px",
                    }} />
                  </div>
                  {status.activeStageCompletion.isComplete && (
                    <div style={{ marginTop: "0.625rem", padding: "0.5rem 0.75rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "0.5rem", fontSize: "0.75rem", color: "#4ade80", fontWeight: 600 }}>
                      ✅ Stage complete{status.canAdvance ? " — ready to advance" : ""}
                    </div>
                  )}
                </div>
              )}
              {status.canAdvance && (
                <Link href={`/dashboard/tournaments/${id}/stages`} style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  marginTop: "0.75rem", padding: "0.5rem 1rem",
                  background: "#4ade80", color: "#000",
                  borderRadius: "0.625rem", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none",
                }}>
                  <TrendingUp style={{ width: "0.875rem", height: "0.875rem" }} />
                  Advance Stage
                </Link>
              )}
            </div>
          )}

          {/* Top 5 Standings */}
          {status.standings.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Top Teams
                </div>
                <Link href={`/dashboard/tournaments/${id}/standings`} style={{ fontSize: "0.65rem", color: primaryColor, fontWeight: 700, textDecoration: "none" }}>
                  View All
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {status.standings.map((s: any) => {
                  const rc = s.rank === 1 ? "#fbbf24" : s.rank === 2 ? "#d1d5db" : s.rank === 3 ? "#f97316" : "#6b7280";
                  return (
                    <div key={s.teamId} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.375rem" }}>
                      <span style={{ width: "1.5rem", textAlign: "center", fontWeight: 800, fontSize: "0.85rem", color: rc }}>
                        #{s.rank}
                      </span>
                      <TeamLogo name={s.teamName} tag={s.teamTag} logo={s.teamLogo} size={28} />
                      <span style={{ flex: 1, fontSize: "0.8rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.teamName}
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: primaryColor }}>
                        {s.points}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Integrations */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.875rem" }}>
              Integrations
            </div>
            {[
              { label: "Discord Webhook", ok: status.integrations.discord, href: `/dashboard/tournaments/${id}/discord` },
              { label: "OBS Overlay", ok: status.integrations.overlayConfigured, href: `/dashboard/tournaments/${id}/overlays` },
            ].map((item) => (
              <Link key={item.label} href={item.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: item.ok ? "#4ade80" : "#374151" }} />
                  <span style={{ fontSize: "0.8rem", color: "#d1d5db" }}>{item.label}</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: item.ok ? "#4ade80" : "#6b7280", fontWeight: 600 }}>
                  {item.ok ? "Connected" : "Configure →"}
                </span>
              </Link>
            ))}
          </div>

          {/* Stage Pipeline */}
          {status.stageProgress.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.875rem" }}>
                Stage Pipeline
              </div>
              {status.stageProgress.map((sp: any, i: number) => {
                const isActive = sp.stageId === status.activeStage?.id;
                const isDone = sp.stageStatus === "COMPLETED";
                const dotColor = isDone ? "#4ade80" : isActive ? primaryColor : "#374151";
                return (
                  <div key={sp.stageId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: i < status.stageProgress.length - 1 ? "0.625rem" : 0 }}>
                    <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: isActive ? "#fff" : isDone ? "#9ca3af" : "#6b7280" }}>
                        {sp.stageName}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "#4b5563" }}>
                        {isDone ? "Complete" : isActive ? `${sp.completedMatches}/${sp.totalMatches} matches` : "Upcoming"}
                      </div>
                    </div>
                    {isActive && (
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: primaryColor, background: `${primaryColor}15`, padding: "0.125rem 0.5rem", borderRadius: "9999px" }}>
                        ACTIVE
                      </span>
                    )}
                    {isDone && (
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#4ade80", background: "rgba(34,197,94,0.1)", padding: "0.125rem 0.5rem", borderRadius: "9999px" }}>
                        DONE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Last refresh */}
          {lastRefresh && (
            <div style={{ fontSize: "0.65rem", color: "#374151", textAlign: "center" }}>
              Last updated {lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}