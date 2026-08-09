"use client";
import { useDialog } from "@/lib/use-confirm";
import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Trophy, Search, X, ExternalLink,
  Download, ChevronDown, FileText, FileSpreadsheet,
  FileImage, File as FileIcon, Sparkles, Radio, Users,
  Target, Crosshair, TrendingUp, Award
} from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export-standings";
import TeamDetailModal from "@/components/tournament/TeamDetailModal";
import TournamentNav from "@/components/tournament/TournamentNav";
import TeamLogo from "@/components/tournament/TeamLogo";
import SponsorsBar from "@/components/tournament/SponsorsBar";

// ─── Scoring helpers ──────────────────────────────────────────────────────────
// Uses the tournament's scoringRule JSON field as the single source of truth.
// Falls back to PMGC defaults only when the field is absent or malformed.

const DEFAULT_PLACEMENT_POINTS = [15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const DEFAULT_KILL_POINTS = 1;
const DEFAULT_WWCD_BONUS = 0;

function parseScoringRule(scoringRule: any) {
  const raw = scoringRule || {};
  const killPoints = Number(raw.killPoints ?? DEFAULT_KILL_POINTS);
  const wwcdBonus = Number(raw.wwcdBonus ?? DEFAULT_WWCD_BONUS);

  let placementPoints: number[] = DEFAULT_PLACEMENT_POINTS;
  if (Array.isArray(raw.placementPoints) && raw.placementPoints.length > 0) {
    placementPoints = raw.placementPoints.map(Number);
  } else if (raw.placementPoints && typeof raw.placementPoints === "object") {
    placementPoints = Object.values(raw.placementPoints).map(Number);
  }

  return { killPoints, wwcdBonus, placementPoints };
}

function getPlacementPoints(placement: number, placementPoints: number[]): number {
  if (placement < 1) return 0;
  return placementPoints[placement - 1] ?? 0;
}

function calculateStandings(teams: any[], matches: any[], scoringRule: any) {
  const { killPoints, wwcdBonus, placementPoints } = parseScoringRule(scoringRule);

  const map = new Map<string, any>();
  const matchHistory = new Map<string, any[]>();
  const placementSums = new Map<string, number>();

  teams.forEach((t: any) => {
    map.set(t.id, {
      id: t.id, name: t.name || "", tag: t.tag || "", logo: t.logo || "",
      players: t.players || t.playersList || [],
      totalPoints: 0, placementPoints: 0, killPointsTotal: 0, totalKills: 0,
      wwcdCount: 0, matchesPlayed: 0,
      avgKills: 0, avgPlacement: 0, bestPlacement: 999,
      highestKills: 0, highestKillsMatch: null,
    });
    matchHistory.set(t.id, []);
    placementSums.set(t.id, 0);
  });

  matches.forEach((m: any, mIdx: number) => {
    const results = Array.isArray(m.results) ? m.results : [];
    results.forEach((r: any) => {
      const s = map.get(r.teamId);
      if (!s) return;

      const kills = Number(r.kills) || 0;
      const placement = Number(r.placement) || 0;
      const isWWCD = r.wwcd === true || placement === 1;

      const pPts = getPlacementPoints(placement, placementPoints);
      const kPts = kills * killPoints;
      const bonus = isWWCD ? wwcdBonus : 0;
      const matchTotal = pPts + kPts + bonus;

      s.totalKills += kills;
      s.placementPoints += pPts;
      s.killPointsTotal += kPts;
      s.totalPoints += matchTotal;
      if (isWWCD) s.wwcdCount += 1;
      s.matchesPlayed += 1;

      if (placement > 0 && placement < s.bestPlacement) s.bestPlacement = placement;
      if (kills > s.highestKills) {
        s.highestKills = kills;
        s.highestKillsMatch = {
          matchId: m.id, matchNumber: m.matchNumber || mIdx + 1,
          map: m.map || "", placement, kills, points: matchTotal,
          wwcd: isWWCD, startTime: m.startTime,
        };
      }

      placementSums.set(r.teamId, (placementSums.get(r.teamId) || 0) + (placement || 16));

      matchHistory.get(r.teamId)!.push({
        matchId: m.id, matchNumber: m.matchNumber || mIdx + 1,
        map: m.map || "", placement, kills, points: matchTotal,
        wwcd: isWWCD, startTime: m.startTime,
      });
    });
  });

  map.forEach((s, teamId) => {
    if (s.matchesPlayed > 0) {
      s.avgKills = s.totalKills / s.matchesPlayed;
      s.avgPlacement = (placementSums.get(teamId) || 0) / s.matchesPlayed;
    }
    s.matchHistory = (matchHistory.get(teamId) || []).sort(
      (a: any, b: any) => a.matchNumber - b.matchNumber
    );
  });

  return Array.from(map.values())
    .filter((s: any) => s.matchesPlayed > 0)
    .sort((a: any, b: any) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.wwcdCount !== a.wwcdCount) return b.wwcdCount - a.wwcdCount;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      if (a.bestPlacement !== b.bestPlacement) return a.bestPlacement - b.bestPlacement;
      return 0;
    })
    .map((s: any, idx: number) => ({ ...s, currentRank: idx + 1 }));
}

export default function StandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const dialog = useDialog();
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    fetch("/api/tournaments/" + id)
      .then(r => r.json())
      .then(d => setTournament(d.tournament))
      .finally(() => setLoading(false));
  }, [id]);

  const standings = useMemo(() => {
    if (!tournament) return [];
    return calculateStandings(
      tournament.teams || [],
      tournament.matches || [],
      tournament.scoringRule
    );
  }, [tournament]);

  const filtered = useMemo(() => {
    if (!search) return standings;
    const q = search.toLowerCase();
    return standings.filter((s: any) =>
      s.name.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q)
    );
  }, [standings, search]);

  const exportRows = filtered.map((s: any) => ({
    rank: s.currentRank,
    teamName: s.name,
    teamTag: s.tag || "",
    matchesPlayed: s.matchesPlayed,
    wwcdCount: s.wwcdCount,
    totalKills: s.totalKills,
    avgKills: s.avgKills,
    placementPoints: s.placementPoints,
    avgPlacement: s.avgPlacement,
    totalPoints: s.totalPoints,
    bestPlacement: s.bestPlacement,
    highestKills: s.highestKills,
  }));

  const exportOpts = {
    tournamentName: tournament?.name || "Tournament",
    subtitle: "Overall Standings",
    organizerName:
      tournament?.brandingData?.orgName ||
      tournament?.brandingData?.organizerName ||
      "Tournament Organizer",
  };

  const handleExport = (format: string) => {
    setExportOpen(false);
    try {
      if (format === "csv") exportToCSV(exportRows, exportOpts);
      else if (format === "excel") exportToExcel(exportRows, exportOpts);
      else if (format === "pdf") exportToPDF(exportRows, exportOpts);
      else if (format === "png") {
        const p = new URLSearchParams({
          top: String(filtered.length),
          subtitle: "Overall Standings",
          format: "youtube",
          advanced: "1",
          sponsors: "1",
          social: "1",
        });
        window.open("/preview/" + id + "?" + p.toString(), "_blank");
      }
    } catch (e: any) {
      void dialog.alert({ title: "Export Failed", description: "Export failed: " + (e?.message || "Unknown error"), variant: "danger" });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Trophy style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
        <p style={{ color: "#9ca3af" }}>Tournament not found</p>
      </div>
    );
  }

  const primaryColor = tournament.brandingData?.primaryColor || "#f59e0b";
  const totalKills = filtered.reduce((sum: number, s: any) => sum + s.totalKills, 0);
  const totalWwcd = filtered.reduce((sum: number, s: any) => sum + s.wwcdCount, 0);
  const { killPoints: kp, wwcdBonus: wb } = parseScoringRule(tournament.scoringRule);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      <button
        onClick={() => router.push("/dashboard/tournaments/" + id)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.375rem",
          color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500,
          background: "transparent", border: "none", cursor: "pointer", marginBottom: "1rem",
        }}
      >
        <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to Tournament
      </button>

      <div style={{ marginBottom: "1.5rem" }}>
        <TournamentNav tournamentId={id} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Trophy style={{ width: "2rem", height: "2rem", color: primaryColor }} />
            Live Standings
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {tournament.name} • {kp} kill pt{kp !== 1 ? "s" : ""}{wb > 0 ? ` • +${wb} WWCD bonus` : ""} • Click any team for history
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", padding: "0.5rem 0.875rem", borderRadius: "0.625rem",
                fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              <Download style={{ width: "0.875rem", height: "0.875rem" }} />
              Export
              <ChevronDown style={{ width: "0.75rem", height: "0.75rem", transform: exportOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
            </button>
            {exportOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setExportOpen(false)} />
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 0.5rem)", width: "15rem", background: "#111116", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", zIndex: 50, overflow: "hidden" }}>
                  {[
                    { format: "csv", label: "CSV", desc: "Spreadsheet", icon: FileText, color: "#60a5fa" },
                    { format: "excel", label: "Excel (.xlsx)", desc: "Full formatting", icon: FileSpreadsheet, color: "#4ade80" },
                    { format: "pdf", label: "PDF", desc: "Print-ready", icon: FileIcon, color: "#f87171" },
                    { format: "png", label: "PNG Broadcast", desc: "Opens preview", icon: FileImage, color: "#fbbf24" },
                  ].map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.format}
                        onClick={() => handleExport(opt.format)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#fff", textAlign: "left", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <Icon style={{ width: "1rem", height: "1rem", color: opt.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>{opt.label}</div>
                          <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => router.push("/dashboard/tournaments/" + id + "/insights")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "linear-gradient(to right, #a855f7, #ec4899)", color: "#fff", padding: "0.5rem 0.875rem", borderRadius: "0.625rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            <Sparkles style={{ width: "0.875rem", height: "0.875rem" }} />
            AI Insights
          </button>

          <button
            onClick={() => router.push("/dashboard/tournaments/" + id + "/broadcast")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "#f59e0b", color: "#000", padding: "0.5rem 0.875rem", borderRadius: "0.625rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            <Radio style={{ width: "0.875rem", height: "0.875rem" }} />
            Broadcast
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {[
          { icon: Users, label: "Teams", value: filtered.length, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
          { icon: Target, label: "Matches", value: (tournament.matches || []).length, color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
          { icon: Crosshair, label: "Total Kills", value: totalKills, color: "#f87171", bg: "rgba(239,68,68,0.1)" },
          { icon: Award, label: "WWCD", value: totalWwcd, color: primaryColor, bg: `${primaryColor}15` },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "1rem" }}>
              <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.625rem" }}>
                <Icon style={{ width: "0.875rem", height: "0.875rem", color: stat.color }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

            {/* PODIUM HERO — Top 3 Champions */}
      {filtered.length >= 3 && (
        <div id="podium-hero-section" style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr 1fr", gap: "0.75rem", alignItems: "end" }}>
            {[filtered[1], filtered[0], filtered[2]].map((team: any, idx: number) => {
              const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const isFirst = actualRank === 1;
              const isSecond = actualRank === 2;
              const config = isFirst
                ? { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)", glow: "rgba(251,191,36,0.4)", emoji: "🏆", label: "CHAMPION", height: "220px" }
                : isSecond
                ? { color: "#e5e7eb", bg: "rgba(229,231,235,0.08)", border: "rgba(229,231,235,0.2)", glow: "rgba(229,231,235,0.2)", emoji: "🥈", label: "RUNNER UP", height: "180px" }
                : { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.3)", emoji: "🥉", label: "THIRD", height: "160px" };

              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  style={{
                    background: `linear-gradient(180deg, ${config.bg} 0%, rgba(0,0,0,0.3) 100%)`,
                    border: `2px solid ${config.border}`,
                    borderRadius: "1rem",
                    padding: "1.25rem 1rem",
                    textAlign: "center",
                    height: config.height,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                    boxShadow: `0 10px 30px ${config.glow}, inset 0 1px 0 ${config.border}`,
                    position: "relative",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: isFirst ? "2.5rem" : "1.75rem", lineHeight: 1 }}>{config.emoji}</div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <TeamLogo name={team.name} tag={team.tag} logo={team.logo} size={isFirst ? 64 : 52} />
                    <div style={{ fontSize: "0.6rem", fontWeight: 800, color: config.color, letterSpacing: "0.15em" }}>
                      {config.label}
                    </div>
                    {team.tag && (
                      <div style={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 700, letterSpacing: "0.05em" }}>
                        [{team.tag}]
                      </div>
                    )}
                    <div style={{
                      fontSize: isFirst ? "1rem" : "0.85rem",
                      fontWeight: 800,
                      color: "#fff",
                      maxWidth: "160px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {team.name}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.7rem" }}>
                    <div>
                      <div style={{ color: config.color, fontWeight: 900, fontSize: isFirst ? "1.5rem" : "1.125rem" }}>
                        {team.totalPoints}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.6rem", textTransform: "uppercase", fontWeight: 700 }}>
                        Points
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#f87171", fontWeight: 900, fontSize: isFirst ? "1.5rem" : "1.125rem" }}>
                        {team.totalKills}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.6rem", textTransform: "uppercase", fontWeight: 700 }}>
                        Kills
                      </div>
                    </div>
                    {team.wwcdCount > 0 && (
                      <div>
                        <div style={{ color: "#a855f7", fontWeight: 900, fontSize: isFirst ? "1.5rem" : "1.125rem" }}>
                          {team.wwcdCount}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: "0.6rem", textTransform: "uppercase", fontWeight: 700 }}>
                          WWCD
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#6b7280" }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search team name or tag..."
          style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "0.75rem 2.75rem", color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <X style={{ width: "1rem", height: "1rem" }} />
          </button>
        )}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 55px 65px 65px 65px 65px 90px", gap: "0.5rem", alignItems: "center", padding: "0.875rem", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <div style={{ textAlign: "center" }}>Rank</div>
          <div>Team</div>
          <div style={{ textAlign: "center" }}>M</div>
          <div style={{ textAlign: "center" }}>WWCD</div>
          <div style={{ textAlign: "center" }}>Kills</div>
          <div style={{ textAlign: "center" }}>Avg K</div>
          <div style={{ textAlign: "center" }}>Pl.Pts</div>
          <div style={{ textAlign: "center", color: primaryColor }}>TOTAL</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Search style={{ width: "2.5rem", height: "2.5rem", color: "#374151", margin: "0 auto 0.75rem" }} />
            <div style={{ color: "#9ca3af", fontWeight: 600 }}>No teams found</div>
            <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
              {search ? "Try a different search term" : "Enter match results to see standings"}
            </div>
          </div>
        ) : (
          filtered.map((s: any) => {
            const isFirst = s.currentRank === 1;
            const isSecond = s.currentRank === 2;
            const isThird = s.currentRank === 3;
            const rankColor = isFirst ? primaryColor : isSecond ? "#d1d5db" : isThird ? "#f97316" : "#6b7280";
            const rowBg = isFirst ? `${primaryColor}08` : isSecond ? "rgba(209,213,219,0.03)" : isThird ? "rgba(249,115,22,0.03)" : "transparent";
            return (
              <button
                key={s.id}
                onClick={() => setSelectedTeam(s)}
                style={{ width: "100%", display: "grid", gridTemplateColumns: "60px 1fr 55px 65px 65px 65px 65px 90px", gap: "0.5rem", alignItems: "center", padding: "0.875rem", borderBottom: "1px solid rgba(255,255,255,0.04)", background: rowBg, border: "none", cursor: "pointer", color: "#fff" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = rowBg}
              >
                <div style={{ textAlign: "center", fontWeight: 800, fontSize: "1.125rem", color: rankColor }}>#{s.currentRank}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
                  <TeamLogo name={s.name} tag={s.tag} logo={s.logo} size={36} />
                  {false && (
                    <div>
                      {(s.tag || s.name).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div style={{ minWidth: 0, textAlign: "left" }}>
                    {s.tag && <div style={{ fontSize: "0.65rem", fontWeight: 700, color: primaryColor }}>[{s.tag}]</div>}
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: "center", color: "#d1d5db", fontWeight: 600, fontSize: "0.85rem" }}>{s.matchesPlayed}</div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.8rem", background: s.wwcdCount > 0 ? primaryColor : "rgba(255,255,255,0.06)", color: s.wwcdCount > 0 ? "#000" : "#6b7280" }}>
                    {s.wwcdCount}
                  </span>
                </div>
                <div style={{ textAlign: "center", color: "#f87171", fontWeight: 800, fontSize: "0.85rem" }}>{s.totalKills}</div>
                <div style={{ textAlign: "center", color: "#fb923c", fontWeight: 600, fontSize: "0.8rem" }}>{s.avgKills.toFixed(1)}</div>
                <div style={{ textAlign: "center", color: "#22d3ee", fontWeight: 600, fontSize: "0.8rem" }}>{s.placementPoints}</div>
                <div style={{ textAlign: "center", fontWeight: 900, fontSize: "1.5rem", color: primaryColor }}>{s.totalPoints}</div>
              </button>
            );
          })
        )}
      </div>

      
      {tournament?.brandingData?.sponsors && tournament.brandingData.sponsors.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <SponsorsBar sponsors={tournament.brandingData.sponsors} primaryColor={primaryColor} />
        </div>
      )}
      {selectedTeam && (
        <TeamDetailModal team={selectedTeam} primaryColor={primaryColor} onClose={() => setSelectedTeam(null)} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

