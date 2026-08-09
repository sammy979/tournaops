"use client";
import { useState, useEffect, use, useMemo } from "react";
import { Trophy, Target, MapPin, ChevronLeft, Crown, Crosshair, Award, Users, Layers } from "lucide-react";
import Link from "next/link";
import TeamLogo from "@/components/tournament/TeamLogo";
import SponsorsBar from "@/components/tournament/SponsorsBar";

// Uses stored server-calculated totalPoints from match results
// This is the single source of truth — no client-side recalculation
function calcStandings(teamIds: string[], matchList: any[], allTeams: any[]) {
  const teamMap = new Map(allTeams.map((t: any) => [t.id, t]));
  const stats = new Map<string, any>();
  for (const tid of teamIds) {
    const t = teamMap.get(tid);
    if (t) stats.set(tid, {
      id: tid, name: t.name, tag: t.tag, logo: t.logo,
      totalPoints: 0, totalKills: 0, wwcdCount: 0, matchesPlayed: 0,
    });
  }
  for (const m of matchList) {
    if (!Array.isArray(m.results)) continue;
    for (const r of m.results) {
      const s = stats.get(r.teamId);
      if (!s) continue;
      // Use server-calculated totalPoints — do not recalculate
      s.totalPoints += Number(r.totalPoints) || 0;
      s.totalKills += Number(r.kills) || 0;
      if (r.wwcd === true || Number(r.placement) === 1) s.wwcdCount++;
      s.matchesPlayed++;
    }
  }
  return Array.from(stats.values())
    .filter((s: any) => s.matchesPlayed > 0)
    .sort((a: any, b: any) => b.totalPoints - a.totalPoints || b.wwcdCount - a.wwcdCount || b.totalKills - a.totalKills)
    .map((s: any, i: number) => ({ ...s, rank: i + 1 }));
}

export default function PublicResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<string>("overall");

  useEffect(() => {
    fetch(`/api/public/tournaments/${slug}`)
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [slug]);

  const views = useMemo(() => {
    if (!data?.tournament) return [];
    const t = data.tournament;
    const list: Array<{ id: string; label: string; type: "overall" | "stage" | "group"; stageId?: string; groupId?: string }> = [
      { id: "overall", label: "Overall", type: "overall" },
    ];
    const stages = t.stages || [];
    for (const s of stages) {
      list.push({ id: `stage:${s.id}`, label: s.name, type: "stage", stageId: s.id });
      if (s.groups && s.groups.length > 1) {
        for (const g of s.groups) {
          list.push({ id: `group:${g.id}`, label: `${s.name} · ${g.name}`, type: "group", stageId: s.id, groupId: g.id });
        }
      }
    }
    return list;
  }, [data]);

  const currentStandings = useMemo(() => {
    if (!data?.tournament) return [];
    const t = data.tournament;
    const view = views.find(v => v.id === selectedView) || views[0];
    if (!view) return [];

    if (view.type === "overall") {
      const allTeamIds = (t.teams || []).map((x: any) => x.id);
      return calcStandings(allTeamIds, t.matches || [], t.teams || []);
    }
    if (view.type === "stage" && view.stageId) {
      const stage = (t.stages || []).find((s: any) => s.id === view.stageId);
      if (!stage) return [];
      const teamIds = (stage.groups || []).flatMap((g: any) => g.teamIds || []);
      const stageMatches = (t.matches || []).filter((m: any) => m.stageId === view.stageId);
      return calcStandings(teamIds, stageMatches, t.teams || []);
    }
    if (view.type === "group" && view.groupId) {
      const stage = (t.stages || []).find((s: any) => s.id === view.stageId);
      const group = stage?.groups.find((g: any) => g.id === view.groupId);
      if (!group) return [];
      const groupMatches = (t.matches || []).filter((m: any) => m.groupId === view.groupId);
      return calcStandings(group.teamIds || [], groupMatches, t.teams || []);
    }
    return [];
  }, [data, selectedView, views]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "2rem", height: "2rem", border: "2px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data?.tournament) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
      Tournament not found
    </div>
  );

  const { tournament, branding } = data;
  const primaryColor = branding?.primaryColor || "#f59e0b";
  const sponsors = branding?.sponsors || [];
  const top3 = currentStandings.slice(0, 3);
  const rest = currentStandings.slice(3);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>
      {/* Header */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem 1rem" }}>
        <Link href={`/tournaments/${slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.8rem", textDecoration: "none", marginBottom: "1rem" }}>
          <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />Back to Tournament
        </Link>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: primaryColor, letterSpacing: "0.15em", marginBottom: "0.375rem" }}>RESULTS</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{tournament.name}</h1>
        <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#9ca3af" }}>
          {(tournament.teams || []).length} teams · {(tournament.matches || []).filter((m: any) => Array.isArray(m.results) && m.results.length > 0).length} matches played
        </div>
      </div>

      {/* View selector */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 1rem" }}>
        <div style={{ display: "flex", gap: "0.375rem", overflowX: "auto", padding: "0.375rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem" }}>
          {views.map(v => {
            const active = selectedView === v.id;
            return (
              <button key={v.id} onClick={() => setSelectedView(v.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.5rem 0.875rem", borderRadius: "0.625rem",
                  background: active ? `${primaryColor}25` : "transparent",
                  color: active ? primaryColor : "#9ca3af",
                  border: "none", fontSize: "0.8rem", fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>
                {v.type === "overall" && <Trophy style={{ width: "0.75rem", height: "0.75rem" }} />}
                {v.type === "stage" && <Layers style={{ width: "0.75rem", height: "0.75rem" }} />}
                {v.type === "group" && <Users style={{ width: "0.75rem", height: "0.75rem" }} />}
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Podium */}
      {top3.length >= 3 && (
        <div style={{ maxWidth: "1200px", margin: "1rem auto", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "0.75rem", alignItems: "end" }}>
            {[top3[1], top3[0], top3[2]].map((team, idx) => {
              const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const config = isFirst
                ? { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.4)", emoji: "🏆", label: "CHAMPION", height: "240px" }
                : isSecond
                ? { color: "#e5e7eb", bg: "rgba(229,231,235,0.08)", border: "rgba(229,231,235,0.25)", emoji: "🥈", label: "RUNNER UP", height: "200px" }
                : { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", emoji: "🥉", label: "THIRD", height: "180px" };

              return (
                <div key={team.id} style={{
                  background: `linear-gradient(180deg, ${config.bg} 0%, rgba(0,0,0,0.3) 100%)`,
                  border: `2px solid ${config.border}`,
                  borderRadius: "1rem", padding: "1.5rem 1rem",
                  textAlign: "center", height: config.height,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                  boxShadow: `0 10px 40px ${config.color}30`,
                }}>
                  <div style={{ fontSize: isFirst ? "3rem" : "2rem" }}>{config.emoji}</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <TeamLogo name={team.name} tag={team.tag} logo={team.logo} size={isFirst ? 72 : 56} />
                    <div style={{ fontSize: "0.6rem", fontWeight: 800, color: config.color, letterSpacing: "0.15em" }}>{config.label}</div>
                    {team.tag && <div style={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 700 }}>[{team.tag}]</div>}
                    <div style={{ fontSize: isFirst ? "1.125rem" : "0.95rem", fontWeight: 900, color: "#fff", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.7rem" }}>
                    <div><div style={{ color: config.color, fontWeight: 900, fontSize: isFirst ? "1.5rem" : "1.125rem" }}>{team.totalPoints}</div><div style={{ color: "#6b7280", fontSize: "0.6rem", fontWeight: 700 }}>PTS</div></div>
                    <div><div style={{ color: "#f87171", fontWeight: 900, fontSize: isFirst ? "1.5rem" : "1.125rem" }}>{team.totalKills}</div><div style={{ color: "#6b7280", fontSize: "0.6rem", fontWeight: 700 }}>KILLS</div></div>
                    {team.wwcdCount > 0 && <div><div style={{ color: "#a855f7", fontWeight: 900, fontSize: isFirst ? "1.5rem" : "1.125rem" }}>{team.wwcdCount}</div><div style={{ color: "#6b7280", fontSize: "0.6rem", fontWeight: 700 }}>WWCD</div></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full standings table */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 1.5rem" }}>
        {currentStandings.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "3rem", textAlign: "center", color: "#6b7280" }}>
            No results for this view yet
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>#</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Team</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>M</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>WWCD</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kills</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.65rem", fontWeight: 700, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStandings.map((s: any) => (
                    <tr key={s.id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: s.rank === 1 ? `${primaryColor}08` : "transparent" }}>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 800, color: s.rank === 1 ? primaryColor : s.rank === 2 ? "#e5e7eb" : s.rank === 3 ? "#f97316" : "#6b7280" }}>#{s.rank}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <TeamLogo name={s.name} tag={s.tag} logo={s.logo} size={32} />
                          <div>
                            {s.tag && <div style={{ fontSize: "0.65rem", color: primaryColor, fontWeight: 700 }}>[{s.tag}]</div>}
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>{s.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#9ca3af" }}>{s.matchesPlayed}</td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: s.wwcdCount > 0 ? primaryColor : "#4b5563", fontWeight: 700 }}>{s.wwcdCount}</td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#f87171", fontWeight: 700 }}>{s.totalKills}</td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: s.rank === 1 ? primaryColor : "#fff", fontWeight: 900, fontSize: "1rem" }}>{s.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <SponsorsBar sponsors={sponsors} primaryColor={primaryColor} />
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}