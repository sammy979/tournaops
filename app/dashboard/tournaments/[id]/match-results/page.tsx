"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TournamentNav from "@/components/tournament/TournamentNav";
import TeamLogo from "@/components/tournament/TeamLogo";
import {
  Trophy, Save, Loader2, Check, ChevronLeft, Trash2, Zap,
  MapPin, Search, Target, PlayCircle, Layers, AlertCircle,
  Crown, Crosshair, Users
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
}

interface Match {
  id: string;
  name: string;
  status: string;
  matchNumber: number;
  map: string;
  stageId?: string;
  groupId?: string;
  results: any;
}

interface Stage {
  id: string;
  name: string;
  type: string;
  order: number;
  status: string;
  groups: Array<{
    id: string;
    name: string;
    teamIds: string[];
  }>;
}

interface Result {
  teamId: string;
  placement: number;
  kills: number;
  wwcd: boolean;
}

export default function MatchResultsPage() {
  const params = useParams();
  const tournamentId = params?.id as string;
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string | "all">("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string | "all">("all");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [matchSearch, setMatchSearch] = useState("");

  useEffect(() => {
    if (!tournamentId) return;
    loadData();
  }, [tournamentId]);

  async function loadData() {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        const t = data.tournament;
        setTournament(t);
        setTeams(t?.teams || []);
        setMatches(t?.matches || []);
        setStages((t?.stages || []).map((s: any) => ({ ...s, groups: s.groups || [] })));
        // Auto-select first stage if stages exist
        if (t?.stages && t.stages.length > 0 && selectedStageId === "all") {
          setSelectedStageId(t.stages[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Determine which matches to show based on selected stage/group
  const filteredMatches = useMemo(() => {
    let list = matches;
    if (selectedStageId !== "all") {
      list = list.filter(m => m.stageId === selectedStageId);
      if (selectedGroupId !== "all") {
        list = list.filter(m => m.groupId === selectedGroupId);
      }
    }
    if (matchSearch) {
      list = list.filter(m =>
        m.name.toLowerCase().includes(matchSearch.toLowerCase()) ||
        (m.map || "").toLowerCase().includes(matchSearch.toLowerCase())
      );
    }
    return list.sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
  }, [matches, selectedStageId, selectedGroupId, matchSearch]);

  // Get teams eligible for the selected match (from its stage/group)
  function getEligibleTeams(match: Match | null): Team[] {
    if (!match) return teams;

    // Match has stage + group: use only that group's teams
    if (match.stageId && match.groupId) {
      const stage = stages.find(s => s.id === match.stageId);
      const group = stage?.groups.find(g => g.id === match.groupId);
      if (group) {
        // If group has teams, use them
        if (group.teamIds.length > 0) {
          return teams.filter(t => group.teamIds.includes(t.id));
        }
        // Group has no teams assigned yet - return empty (blocks entry)
        return [];
      }
    }

    // Match has stage but no group: use all teams across the stage's groups
    if (match.stageId) {
      const stage = stages.find(s => s.id === match.stageId);
      if (stage) {
        const stageTeamIds = new Set<string>();
        for (const g of stage.groups) g.teamIds.forEach(id => stageTeamIds.add(id));
        if (stageTeamIds.size > 0) {
          return teams.filter(t => stageTeamIds.has(t.id));
        }
        // Stage has no teams assigned - return empty (blocks entry)
        return [];
      }
    }

    // Legacy match with no stage: allow all teams (old tournaments)
    return teams;
  }

  function selectMatch(match: Match) {
    setSelectedMatch(match);
    const eligibleTeams = getEligibleTeams(match);

    if (Array.isArray(match.results) && match.results.length > 0) {
      // Existing results — populate
      setResults(match.results.map((r: any) => ({
        teamId: r.teamId,
        placement: r.placement || 0,
        kills: r.kills || 0,
        wwcd: r.wwcd || r.placement === 1,
      })));
    } else {
      // Fresh entry — only eligible teams
      setResults(
        eligibleTeams.map(team => ({
          teamId: team.id,
          placement: 0,
          kills: 0,
          wwcd: false,
        }))
      );
    }
  }

  function updateResult(teamId: string, field: keyof Result, value: any) {
    setResults(prev =>
      prev.map(r => {
        if (r.teamId === teamId) {
          if (field === "wwcd" && value === true) {
            return { ...r, wwcd: true, placement: 1 };
          }
          if (field === "placement") {
            const numVal = Number(value);
            return { ...r, placement: numVal, wwcd: numVal === 1 };
          }
          return { ...r, [field]: field === "kills" ? Number(value) : value };
        }
        if (field === "wwcd" && value === true) {
          return { ...r, wwcd: false };
        }
        return r;
      })
    );
  }

  async function saveResults() {
    if (!selectedMatch) return;
    setSaving(true);
    const validResults = results.filter(r => r.placement > 0);

    try {
      const res = await fetch(`/api/matches/${selectedMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: validResults,
          status: "completed",
        }),
      });

      if (res.ok) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
        await loadData();
      } else {
        const err = await res.json();
        alert("Error: " + (err.error || "Failed"));
      }
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function autoFillPlacements() {
    const sorted = [...results].sort((a, b) => b.kills - a.kills);
    setResults(
      sorted.map((r, i) => ({
        ...r,
        placement: i + 1,
        wwcd: i === 0,
      }))
    );
  }

  function autoSimulate() {
    if (!selectedMatch) return;
    const eligible = getEligibleTeams(selectedMatch);
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const newResults = shuffled.map((team, idx) => {
      const placement = idx + 1;
      const baseKills = Math.max(0, Math.floor(Math.random() * 15) - Math.floor(idx / 3));
      const kills = Math.min(20, baseKills + Math.floor(Math.random() * 4));
      return {
        teamId: team.id,
        placement,
        kills,
        wwcd: placement === 1,
      };
    });
    setResults(newResults);
  }

  function clearResults() {
    if (!confirm("Clear all entered results for this match?")) return;
    const eligibleTeams = getEligibleTeams(selectedMatch);
    setResults(
      eligibleTeams.map(team => ({
        teamId: team.id,
        placement: 0,
        kills: 0,
        wwcd: false,
      }))
    );
  }

  const activeStage = selectedStageId === "all"
    ? null
    : stages.find(s => s.id === selectedStageId);
  const activeGroup = activeStage && selectedGroupId !== "all"
    ? activeStage.groups.find(g => g.id === selectedGroupId)
    : null;

  const eligibleForSelected = getEligibleTeams(selectedMatch);
  const filledCount = results.filter(r => r.placement > 0).length;
  const totalCompleted = filteredMatches.filter(m => Array.isArray(m.results) && m.results.length > 0).length;

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <Link href={`/dashboard/tournaments/${tournamentId}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", textDecoration: "none", marginBottom: "1rem" }}>
        <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to Tournament
      </Link>

      <TournamentNav tournamentId={tournamentId} />

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Trophy style={{ width: "2rem", height: "2rem", color: "#f59e0b" }} />
          Match Results
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          {tournament?.name} · Enter results per stage · Points auto-calculated
        </p>
      </div>

      {/* STAGE TABS */}
      {stages.length > 0 && (
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1rem", overflowX: "auto", padding: "0.375rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem" }} className="scrollbar-hide">
          <button
            onClick={() => { setSelectedStageId("all"); setSelectedGroupId("all"); setSelectedMatch(null); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.375rem",
              padding: "0.5rem 0.875rem", borderRadius: "0.625rem",
              background: selectedStageId === "all" ? "rgba(245,158,11,0.15)" : "transparent",
              color: selectedStageId === "all" ? "#f59e0b" : "#9ca3af",
              border: "none", fontSize: "0.8rem", fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            <Trophy style={{ width: "0.875rem", height: "0.875rem" }} />
            All Matches ({matches.length})
          </button>
          {stages.map(stage => {
            const stageMatches = matches.filter(m => m.stageId === stage.id);
            const stageDone = stageMatches.filter(m => Array.isArray(m.results) && m.results.length > 0).length;
            const totalTeamsInStage = stage.groups.reduce((s, g) => s + g.teamIds.length, 0);
            const active = selectedStageId === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => { setSelectedStageId(stage.id); setSelectedGroupId("all"); setSelectedMatch(null); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.5rem 0.875rem", borderRadius: "0.625rem",
                  background: active ? "rgba(139,92,246,0.15)" : "transparent",
                  color: active ? "#a78bfa" : "#9ca3af",
                  border: "none", fontSize: "0.8rem", fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                <Layers style={{ width: "0.875rem", height: "0.875rem" }} />
                {stage.name}
                <span style={{
                  fontSize: "0.65rem",
                  background: active ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)",
                  padding: "0.1rem 0.45rem", borderRadius: "9999px",
                  fontWeight: 700,
                }}>
                  {totalTeamsInStage}T · {stageDone}/{stageMatches.length}M
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* GROUP TABS (only if stage selected and has multiple groups) */}
      {activeStage && (activeStage.groups?.length || 0) > 1 && (
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem", overflowX: "auto", padding: "0.25rem", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "0.75rem" }} className="scrollbar-hide">
          <button
            onClick={() => { setSelectedGroupId("all"); setSelectedMatch(null); }}
            style={{
              padding: "0.375rem 0.75rem", borderRadius: "0.5rem",
              background: selectedGroupId === "all" ? "rgba(139,92,246,0.2)" : "transparent",
              color: selectedGroupId === "all" ? "#a78bfa" : "#9ca3af",
              border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            All Groups ({activeStage.groups.length})
          </button>
          {activeStage.groups.map(group => {
            const groupMatches = matches.filter(m => m.groupId === group.id);
            const active = selectedGroupId === group.id;
            return (
              <button
                key={group.id}
                onClick={() => { setSelectedGroupId(group.id); setSelectedMatch(null); }}
                style={{
                  padding: "0.375rem 0.75rem", borderRadius: "0.5rem",
                  background: active ? "rgba(139,92,246,0.2)" : "transparent",
                  color: active ? "#a78bfa" : "#9ca3af",
                  border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {group.name} ({group.teamIds.length}T · {groupMatches.length}M)
              </button>
            );
          })}
        </div>
      )}

      {/* Warning if no matches in this stage */}
      {stages.length > 0 && filteredMatches.length === 0 && (
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "0.875rem", padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <AlertCircle style={{ width: "1.25rem", height: "1.25rem", color: "#fbbf24" }} />
          <span style={{ fontSize: "0.85rem", color: "#fcd34d" }}>
            No matches found for this selection. If this stage should have matches, go to Stages → Regenerate.
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 320px) 1fr", gap: "1.25rem" }} className="match-results-grid">

        {/* Match List */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1rem", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Matches ({filteredMatches.length}) · {totalCompleted} done
          </div>
          <div style={{ position: "relative", marginBottom: "0.75rem" }}>
            <Search style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", width: "0.875rem", height: "0.875rem", color: "#6b7280" }} />
            <input
              value={matchSearch}
              onChange={e => setMatchSearch(e.target.value)}
              placeholder="Search matches..."
              style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem 0.5rem 0.5rem 2rem", color: "#fff", fontSize: "0.75rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.375rem" }} className="scrollbar-hide">
            {filteredMatches.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0.5rem", color: "#6b7280", fontSize: "0.8rem" }}>
                No matches
              </div>
            ) : filteredMatches.map(match => {
              const hasResults = Array.isArray(match.results) && match.results.length > 0;
              const active = selectedMatch?.id === match.id;
              return (
                <button
                  key={match.id}
                  onClick={() => selectMatch(match)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "0.625rem 0.75rem", borderRadius: "0.5rem",
                    background: active ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.02)",
                    border: active ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    color: "#fff", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: active ? "#f59e0b" : "#fff" }}>
                      {match.name}
                    </span>
                    {hasResults ? (
                      <Check style={{ width: "0.875rem", height: "0.875rem", color: "#4ade80" }} />
                    ) : (
                      <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "#4b5563" }} />
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.65rem", color: "#6b7280" }}>
                    <MapPin style={{ width: "0.65rem", height: "0.65rem" }} />
                    {match.map}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div>
          {!selectedMatch ? (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "4rem 2rem", textAlign: "center" }}>
              <Trophy style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>Select a Match</h3>
              <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                {stages.length > 0
                  ? "Choose a stage tab above, then click a match to enter results"
                  : "Choose a match from the list"}
              </p>
            </div>
          ) : (
            <>
              {/* Match Header with stage context */}
              <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.03))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff", marginBottom: "0.25rem" }}>
                      {selectedMatch.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem", color: "#9ca3af", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <MapPin style={{ width: "0.75rem", height: "0.75rem" }} />
                        {selectedMatch.map}
                      </span>
                      {activeStage && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#a78bfa" }}>
                          <Layers style={{ width: "0.75rem", height: "0.75rem" }} />
                          {activeStage.name}
                        </span>
                      )}
                      {activeGroup && <span style={{ color: "#a78bfa" }}>· {activeGroup.name}</span>}
                      <span>· <Users style={{ width: "0.75rem", height: "0.75rem", display: "inline" }} /> {eligibleForSelected.length} teams</span>
                      <span>· {filledCount}/{results.length} filled</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button onClick={autoSimulate}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      <Zap style={{ width: "0.75rem", height: "0.75rem" }} />Simulate
                    </button>
                    <button onClick={autoFillPlacements}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Rank by Kills
                    </button>
                    <button onClick={clearResults}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      <Trash2 style={{ width: "0.75rem", height: "0.75rem" }} />Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                    <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                      <tr>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Team</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Place</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kills</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>WWCD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                          No teams assigned to this stage yet. Go to Stages page → advance teams from previous stage, or use Stage 1 first.
                        </td></tr>
                      ) : results.map(result => {
                        const team = teams.find(t => t.id === result.teamId);
                        if (!team) return null;
                        const isWWCD = result.wwcd || result.placement === 1;
                        return (
                          <tr key={result.teamId} style={{
                            borderTop: "1px solid rgba(255,255,255,0.04)",
                            background: isWWCD ? "rgba(245,158,11,0.05)" : "transparent",
                          }}>
                            <td style={{ padding: "0.625rem 1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                <TeamLogo name={team.name} tag={team.tag} logo={team.logo} size={30} />
                                <div>
                                  {team.tag && <span style={{ color: "#f59e0b", marginRight: "0.25rem", fontWeight: 700, fontSize: "0.7rem" }}>[{team.tag}]</span>}
                                  <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>{team.name}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "0.625rem 1rem", textAlign: "center" }}>
                              <input type="number" min={1} max={100} value={result.placement || ""}
                                onChange={e => updateResult(result.teamId, "placement", e.target.value)}
                                style={{ width: "3.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.375rem", padding: "0.375rem", color: "#fff", textAlign: "center", fontSize: "0.85rem", fontWeight: 700, outline: "none" }}
                              />
                            </td>
                            <td style={{ padding: "0.625rem 1rem", textAlign: "center" }}>
                              <input type="number" min={0} max={100} value={result.kills}
                                onChange={e => updateResult(result.teamId, "kills", e.target.value)}
                                style={{ width: "3.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.375rem", padding: "0.375rem", color: "#f87171", textAlign: "center", fontSize: "0.85rem", fontWeight: 700, outline: "none" }}
                              />
                            </td>
                            <td style={{ padding: "0.625rem 1rem", textAlign: "center" }}>
                              <input type="checkbox" checked={isWWCD}
                                onChange={e => updateResult(result.teamId, "wwcd", e.target.checked)}
                                style={{ width: "1.1rem", height: "1.1rem", accentColor: "#f59e0b", cursor: "pointer" }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Save */}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
                {savedMsg && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#4ade80", fontSize: "0.85rem", fontWeight: 600, marginRight: "auto" }}>
                    <Check style={{ width: "1rem", height: "1rem" }} />Saved! Discord posted.
                  </span>
                )}
                {filledCount === 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#fbbf24", fontSize: "0.8rem", marginRight: "auto" }}>
                    <AlertCircle style={{ width: "0.875rem", height: "0.875rem" }} />Fill at least one placement
                  </span>
                )}
                <button onClick={saveResults} disabled={saving || filledCount === 0}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: filledCount === 0 ? "rgba(245,158,11,0.4)" : "#f59e0b", color: "#000", padding: "0.75rem 1.5rem", borderRadius: "0.75rem", fontWeight: 800, fontSize: "0.875rem", border: "none", cursor: saving || filledCount === 0 ? "not-allowed" : "pointer", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}
                >
                  {saving
                    ? <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 0.8s linear infinite" }} />Saving...</>
                    : <><Save style={{ width: "1rem", height: "1rem" }} />Save Results</>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 768px) {
          .match-results-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}