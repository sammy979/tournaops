"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TournamentNav from "@/components/tournament/TournamentNav";
import TeamLogo from "@/components/tournament/TeamLogo";
import {
  Play, Check, Clock, MapPin, ChevronLeft, Loader2,
  Trophy, Crosshair, Search, X, Filter, Edit,
  BarChart3, Target, Zap, Lock, Unlock
} from "lucide-react";

interface MatchResult {
  teamId: string;
  teamName?: string;
  placement: number;
  kills: number;
  totalPoints?: number;
  wwcd?: boolean;
}

interface Match {
  id: string;
  name: string;
  matchNumber?: number;
  map: string;
  status: string;
  roundId?: string;
  stageId?: string;
  groupId?: string;
  results?: MatchResult[];
  startTime?: string;
}

export default function MatchesPage() {
  const params = useParams();
  const id = params?.id as string;
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [selected, setSelected] = useState<Match | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(d => {
        setTournament(d.tournament);
        setMatches(d.tournament?.matches || []);
        setTeams(d.tournament?.teams || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const teamMap = new Map(teams.map((t: any) => [t.id, t]));

  const filtered = matches.filter(m => {
    const hasResults = Array.isArray(m.results) && m.results.length > 0;
    if (filter === "completed" && !hasResults) return false;
    if (filter === "pending" && hasResults) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
        !(m.map || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const completedCount = matches.filter(m => Array.isArray(m.results) && m.results.length > 0).length;
  const progress = matches.length > 0 ? Math.round((completedCount / matches.length) * 100) : 0;

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <Link href={`/dashboard/tournaments/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", textDecoration: "none", marginBottom: "1rem" }}>
        <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />Back to Tournament
      </Link>

      <TournamentNav tournamentId={id} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Play style={{ width: "1.75rem", height: "1.75rem", color: "#f59e0b" }} />
            Matches
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {tournament?.name} · {completedCount}/{matches.length} completed · {progress}%
          </p>
        </div>
        <Link href={`/dashboard/tournaments/${id}/match-results`}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "#f59e0b", color: "#000", borderRadius: "0.625rem", padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>
          <Trophy style={{ width: "0.875rem", height: "0.875rem" }} />Enter Results
        </Link>
      </div>

      {/* Progress */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
          <span>Overall Progress</span>
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>{completedCount}/{matches.length} matches · {progress}%</span>
        </div>
        <div style={{ height: "0.5rem", background: "rgba(255,255,255,0.06)", borderRadius: "9999px", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(to right, #f59e0b, #f97316)", borderRadius: "9999px", transition: "width 0.5s" }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {[
          { label: "Total", value: matches.length, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
          { label: "Completed", value: completedCount, color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
          { label: "Pending", value: matches.length - completedCount, color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
          { label: "Progress", value: `${progress}%`, color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "0.875rem" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "0.875rem", height: "0.875rem", color: "#6b7280" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search matches..."
            style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "0.625rem 0.625rem 0.625rem 2.25rem", color: "#fff", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: "0.25rem", padding: "0.25rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.625rem" }}>
          {(["all", "completed", "pending"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "capitalize", background: filter === f ? "rgba(245,158,11,0.15)" : "transparent", color: filter === f ? "#f59e0b" : "#9ca3af", border: "none", cursor: "pointer" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      {filtered.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "4rem 2rem", textAlign: "center" }}>
          <Play style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
          <p style={{ color: "#9ca3af", fontWeight: 600 }}>No matches found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "0.875rem" }}>
          {filtered.map(match => {
            const hasResults = Array.isArray(match.results) && match.results.length > 0;
            const winner = hasResults ? match.results!.find(r => r.placement === 1) : null;
            const winnerTeam = winner ? teamMap.get(winner.teamId) : null;
            const totalKills = hasResults ? match.results!.reduce((s, r) => s + (r.kills || 0), 0) : 0;

            return (
              <div key={match.id} style={{
                background: hasResults ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.03)",
                border: hasResults ? "1px solid rgba(34,197,94,0.15)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem", padding: "1rem",
              }}>
                {/* Match header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{match.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "#6b7280", marginTop: "0.125rem" }}>
                      <MapPin style={{ width: "0.65rem", height: "0.65rem" }} />
                      {match.map}
                      {match.matchNumber && <span>· Match #{match.matchNumber}</span>}
                    </div>
                  </div>
                  <span style={{
                    padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.6rem", fontWeight: 700,
                    background: hasResults ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.12)",
                    color: hasResults ? "#4ade80" : "#9ca3af",
                    border: hasResults ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(107,114,128,0.2)",
                  }}>
                    {hasResults ? "DONE" : "PENDING"}
                  </span>
                </div>

                {/* Results preview */}
                {hasResults && match.results && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    {/* Winner */}
                    {winner && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.625rem", background: "rgba(245,158,11,0.08)", borderRadius: "0.5rem", marginBottom: "0.375rem" }}>
                        <Trophy style={{ width: "0.875rem", height: "0.875rem", color: "#fbbf24", flexShrink: 0 }} />
                        {winnerTeam && <TeamLogo name={winnerTeam.name} logo={winnerTeam.logo} tag={winnerTeam.tag} size={24} />}
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fbbf24", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {winner.teamName || winnerTeam?.name || "Unknown"}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "#f87171" }}>{winner.kills}K</span>
                      </div>
                    )}
                    {/* Top 3 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {match.results.slice(0, 3).filter(r => r.placement > 1).map(r => {
                        const t = teamMap.get(r.teamId);
                        return (
                          <div key={r.teamId} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                            <span style={{ width: "1.25rem", textAlign: "center", color: "#6b7280", fontWeight: 700 }}>#{r.placement}</span>
                            {t && <TeamLogo name={t.name} logo={t.logo} tag={t.tag} size={20} />}
                            <span style={{ flex: 1, color: "#d1d5db", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.teamName || t?.name}</span>
                            <span style={{ color: "#f87171" }}>{r.kills}K</span>
                            <span style={{ color: "#60a5fa", fontWeight: 700 }}>{r.totalPoints}p</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.7rem", color: "#6b7280", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}>
                      <span>{match.results.length} teams</span>
                      <span style={{ color: "#f87171" }}>{totalKills} total kills</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <Link href={`/dashboard/tournaments/${id}/match-results`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.5rem", background: hasResults ? "rgba(255,255,255,0.05)" : "rgba(245,158,11,0.1)", border: hasResults ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(245,158,11,0.2)", borderRadius: "0.5rem", color: hasResults ? "#9ca3af" : "#f59e0b", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
                  <Edit style={{ width: "0.75rem", height: "0.75rem" }} />
                  {hasResults ? "Edit Results" : "Enter Results"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}