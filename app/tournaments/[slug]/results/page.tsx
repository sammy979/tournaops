"use client";
import { useState, useEffect, use, useMemo } from "react";
import { Trophy, Target, MapPin, ChevronLeft, Crown, Crosshair, Award } from "lucide-react";
import Link from "next/link";

const DEFAULT_PLACEMENT_POINTS = [15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const DEFAULT_KILL_POINTS = 1;

function parseScoringRule(scoringRule: any) {
  const raw = scoringRule || {};
  const killPoints = Number(raw.killPoints ?? DEFAULT_KILL_POINTS);
  let placementPoints: number[] = DEFAULT_PLACEMENT_POINTS;
  if (Array.isArray(raw.placementPoints) && raw.placementPoints.length > 0) {
    placementPoints = raw.placementPoints.map(Number);
  }
  const wwcdBonus = Number(raw.wwcdBonus ?? 0);
  return { killPoints, placementPoints, wwcdBonus };
}

function buildStandings(teams: any[], matches: any[], scoringRule: any) {
  const { killPoints, placementPoints, wwcdBonus } = parseScoringRule(scoringRule);
  const map = new Map<string, any>();

  teams.forEach((t: any) => {
    map.set(t.id, {
      id: t.id, name: t.name, tag: t.tag || null, logo: t.logo || null,
      totalPoints: 0, totalKills: 0, wwcdCount: 0, matchesPlayed: 0,
    });
  });

  matches.forEach((m: any) => {
    if (!Array.isArray(m.results)) return;
    m.results.forEach((r: any) => {
      const s = map.get(r.teamId);
      if (!s) return;
      const kills = Number(r.kills) || 0;
      const placement = Number(r.placement) || 0;
      const isWWCD = r.wwcd === true || placement === 1;
      const pPts = placement >= 1 ? (placementPoints[placement - 1] ?? 0) : 0;
      const kPts = kills * killPoints;
      const bonus = isWWCD ? wwcdBonus : 0;
      s.totalPoints += pPts + kPts + bonus;
      s.totalKills += kills;
      if (isWWCD) s.wwcdCount += 1;
      s.matchesPlayed += 1;
    });
  });

  return Array.from(map.values())
    .filter((s: any) => s.matchesPlayed > 0)
    .sort((a: any, b: any) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.wwcdCount !== a.wwcdCount) return b.wwcdCount - a.wwcdCount;
      return b.totalKills - a.totalKills;
    })
    .map((s: any, i: number) => ({ ...s, rank: i + 1 }));
}

export default function PublicResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<"standings" | "matches">("standings");

  useEffect(() => {
    fetch(`/api/public/tournaments/${slug}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, [slug]);

  const standings = useMemo(() => {
    if (!data?.tournament) return [];
    return buildStandings(
      data.tournament.teams || [],
      data.tournament.matches || [],
      data.tournament.scoringRule
    );
  }, [data]);

  const completedMatches = useMemo(() => {
    if (!data?.tournament?.matches) return [];
    return data.tournament.matches.filter((m: any) => Array.isArray(m.results) && m.results.length > 0);
  }, [data]);

  const primaryColor = data?.tournament?.brandingData?.primaryColor || "#f59e0b";
  const tournamentName = data?.tournament?.name || "Tournament";

  if (!data?.tournament) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "2rem", height: "2rem", border: `2px solid ${primaryColor}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const rankColors: Record<number, string> = { 1: "#f59e0b", 2: "#94a3b8", 3: "#f97316" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem 1rem" }}>

        {/* Back */}
        <Link href={`/tournaments/${slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", textDecoration: "none", fontSize: "0.8rem", fontWeight: 500, marginBottom: "1.5rem" }}>
          <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
          Back to Tournament
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: primaryColor, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Results</div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: "0.5rem" }}>{tournamentName}</h1>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.8rem", color: "#6b7280" }}>
            <span>{standings.length} teams</span>
            <span>•</span>
            <span>{completedMatches.length} matches played</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "0.25rem", marginBottom: "1.5rem", width: "fit-content" }}>
          {(["standings", "matches"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", fontSize: "0.8rem", fontWeight: 700, textTransform: "capitalize", background: tab === t ? primaryColor : "transparent", color: tab === t ? "#000" : "#9ca3af", border: "none", cursor: "pointer", transition: "all 0.15s" }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Standings Tab */}
        {tab === "standings" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", overflow: "hidden" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 60px 60px 80px", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <div style={{ textAlign: "center" }}>#</div>
              <div>Team</div>
              <div style={{ textAlign: "center" }}>WWCD</div>
              <div style={{ textAlign: "center" }}>Kills</div>
              <div style={{ textAlign: "right", color: primaryColor }}>Points</div>
            </div>

            {standings.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>No results yet</div>
            ) : standings.map((s: any) => {
              const rankColor = rankColors[s.rank] || "rgba(255,255,255,0.4)";
              const isTop3 = s.rank <= 3;
              return (
                <div
                  key={s.id}
                  style={{ display: "grid", gridTemplateColumns: "48px 1fr 60px 60px 80px", gap: "0.5rem", padding: "0.875rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)", background: s.rank === 1 ? `${primaryColor}08` : "transparent", alignItems: "center" }}
                >
                  <div style={{ textAlign: "center", fontWeight: 900, fontSize: "1.1rem", color: rankColor }}>{s.rank}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
                    {s.logo ? (
                      <img src={s.logo} alt="" style={{ width: "2rem", height: "2rem", borderRadius: "0.375rem", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "0.375rem", background: `${primaryColor}20`, color: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, flexShrink: 0 }}>
                        {(s.tag || s.name).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      {s.tag && <div style={{ fontSize: "0.6rem", fontWeight: 700, color: primaryColor }}>[{s.tag}]</div>}
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {s.wwcdCount > 0 ? (
                      <span style={{ background: primaryColor, color: "#000", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 800 }}>{s.wwcdCount}</span>
                    ) : (
                      <span style={{ color: "#4b5563", fontSize: "0.75rem" }}>—</span>
                    )}
                  </div>
                  <div style={{ textAlign: "center", color: "#f87171", fontWeight: 700, fontSize: "0.875rem" }}>{s.totalKills}</div>
                  <div style={{ textAlign: "right", fontWeight: 900, fontSize: "1.25rem", color: isTop3 ? rankColor : "#fff" }}>{s.totalPoints}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Matches Tab */}
        {tab === "matches" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {completedMatches.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem" }}>
                No completed matches yet
              </div>
            ) : completedMatches.map((m: any) => {
              const results = (Array.isArray(m.results) ? m.results : [])
                .slice()
                .sort((a: any, b: any) => (a.placement || 99) - (b.placement || 99));
              const winner = results.find((r: any) => r.placement === 1);
              const winnerTeam = data.tournament.teams?.find((t: any) => t.id === winner?.teamId);
              return (
                <div key={m.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", overflow: "hidden" }}>
                  {/* Match header */}
                  <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>{m.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        <MapPin style={{ width: "0.75rem", height: "0.75rem" }} />
                        {m.map}
                        {winnerTeam && (
                          <>
                            <span>•</span>
                            <Crown style={{ width: "0.75rem", height: "0.75rem", color: primaryColor }} />
                            <span style={{ color: primaryColor, fontWeight: 700 }}>{winnerTeam.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#4ade80", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>COMPLETED</div>
                  </div>

                  {/* Results */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", minWidth: "400px" }}>
                      <thead>
                        <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                          <th style={{ padding: "0.5rem 1rem", textAlign: "left", color: "#6b7280", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em" }}>PLACE</th>
                          <th style={{ padding: "0.5rem 1rem", textAlign: "left", color: "#6b7280", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em" }}>TEAM</th>
                          <th style={{ padding: "0.5rem 1rem", textAlign: "center", color: "#6b7280", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em" }}>KILLS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.slice(0, 8).map((r: any, i: number) => {
                          const team = data.tournament.teams?.find((t: any) => t.id === r.teamId);
                          const rColor = rankColors[r.placement] || "rgba(255,255,255,0.4)";
                          return (
                            <tr key={r.teamId || i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding: "0.5rem 1rem", fontWeight: 900, color: rColor, fontSize: "1rem" }}>#{r.placement}</td>
                              <td style={{ padding: "0.5rem 1rem", color: "#fff", fontWeight: 600 }}>
                                {team?.tag && <span style={{ color: primaryColor, marginRight: "0.25rem" }}>[{team.tag}]</span>}
                                {team?.name || r.teamId}
                              </td>
                              <td style={{ padding: "0.5rem 1rem", textAlign: "center", color: "#f87171", fontWeight: 700 }}>{r.kills}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}