"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Save, Loader2, Check, ChevronLeft, Trash2, Zap,
  MapPin, Search, Filter, ArrowUpDown, Crown, Crosshair,
  Target, Sparkles, AlertCircle, PlayCircle, XCircle
} from "lucide-react";
import TournamentNav from "@/components/tournament/TournamentNav";

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
  results: any;
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
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [matchFilter, setMatchFilter] = useState<"all" | "pending" | "completed">("all");
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
        setTournament(data.tournament);
        setTeams(data.tournament?.teams || []);
        setMatches(data.tournament?.matches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function selectMatch(match: Match) {
    setSelectedMatch(match);
    if (Array.isArray(match.results) && match.results.length > 0) {
      setResults(match.results);
    } else {
      setResults(
        teams.map((team) => ({
          teamId: team.id,
          placement: 0,
          kills: 0,
          wwcd: false,
        }))
      );
    }
  }

  function updateResult(teamId: string, field: keyof Result, value: any) {
    setResults((prev) =>
      prev.map((r) => {
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
        alert("Error: " + (err.error || "Failed to save"));
      }
    } catch {
      alert("Failed to save results");
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

  async function extractFromScreenshot(file: File) {
    if (!selectedMatch) return;
    setExtracting(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(`/api/matches/${selectedMatch.id}/extract-screenshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          teams: teams.map(t => t.name),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");

      if (!Array.isArray(data.results) || data.results.length === 0) {
        alert("AI could not find any team results in that screenshot. Try a clearer image.");
        return;
      }

      // Match extracted team names to our teams (fuzzy match)
      const teamsByName = new Map(teams.map(t => [t.name.toLowerCase().trim(), t]));
      const teamsByTag = new Map(teams.filter(t => t.tag).map(t => [t.tag!.toLowerCase().trim(), t]));

      const newResults = results.map(r => ({ ...r, placement: 0, kills: 0, wwcd: false }));
      let matched = 0;
      let unmatched: string[] = [];

      for (const ext of data.results) {
        const extName = String(ext.teamName || "").toLowerCase().trim();
        if (!extName) continue;

        let team = teamsByName.get(extName) || teamsByTag.get(extName);

        // Fuzzy: partial match
        if (!team) {
          team = teams.find(t =>
            t.name.toLowerCase().includes(extName) ||
            extName.includes(t.name.toLowerCase()) ||
            (t.tag && (t.tag.toLowerCase().includes(extName) || extName.includes(t.tag.toLowerCase())))
          );
        }

        if (team) {
          const idx = newResults.findIndex(r => r.teamId === team!.id);
          if (idx !== -1) {
            newResults[idx] = {
              teamId: team.id,
              placement: Number(ext.placement) || 0,
              kills: Number(ext.kills) || 0,
              wwcd: Number(ext.placement) === 1,
            };
            matched++;
          }
        } else {
          unmatched.push(ext.teamName);
        }
      }

      setResults(newResults);

      if (data.map && selectedMatch) {
        setSelectedMatch({ ...selectedMatch, map: data.map });
      }

      let msg = `Extracted ${matched} team result${matched === 1 ? "" : "s"}`;
      if (unmatched.length > 0) {
        msg += `\n\nCould not match: ${unmatched.slice(0, 5).join(", ")}`;
      }
      msg += "\n\nReview and click Save Results when ready.";
      alert(msg);
    } catch (err: any) {
      alert("Failed: " + (err?.message || "Unknown error"));
    } finally {
      setExtracting(false);
    }
  }

  function clearResults() {
    if (!confirm("Clear all results?")) return;
    setResults(
      teams.map((team) => ({
        teamId: team.id,
        placement: 0,
        kills: 0,
        wwcd: false,
      }))
    );
  }

  const filteredMatches = matches.filter(m => {
    const hasResults = Array.isArray(m.results) && m.results.length > 0;
    if (matchFilter === "completed" && !hasResults) return false;
    if (matchFilter === "pending" && hasResults) return false;
    if (matchSearch && !m.name.toLowerCase().includes(matchSearch.toLowerCase())) return false;
    return true;
  });

  const totalCompleted = matches.filter(m => Array.isArray(m.results) && m.results.length > 0).length;
  const filledCount = results.filter(r => r.placement > 0).length;

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      {/* Back link */}
      <Link
        href={`/dashboard/tournaments/${tournamentId}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.375rem",
          color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500,
          textDecoration: "none", marginBottom: "1rem",
        }}
      >
        <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to Tournament
      </Link>

      {/* Nav */}
      <div style={{ marginBottom: "1.5rem" }}>
        <TournamentNav tournamentId={tournamentId} />
      </div>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
          fontWeight: 800, color: "#fff",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <Trophy style={{ width: "2rem", height: "2rem", color: "#f59e0b" }} />
          Match Results
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          {tournament?.name} • Enter and edit match results
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "0.75rem",
        marginBottom: "1.5rem",
      }}>
        {[
          { icon: Target, label: "Total Matches", value: matches.length, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
          { icon: Check, label: "Completed", value: totalCompleted, color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
          { icon: PlayCircle, label: "Pending", value: matches.length - totalCompleted, color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
          { icon: Trophy, label: "Progress", value: `${Math.round((totalCompleted / (matches.length || 1)) * 100)}%`, color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.875rem",
              padding: "1rem",
            }}>
              <div style={{
                width: "1.75rem", height: "1.75rem",
                borderRadius: "0.5rem",
                background: stat.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "0.625rem",
              }}>
                <Icon style={{ width: "0.875rem", height: "0.875rem", color: stat.color }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 320px) 1fr",
        gap: "1.25rem",
      }} className="match-results-grid">

        {/* Left: Match List */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "1rem",
          padding: "1rem",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ marginBottom: "0.875rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.625rem" }}>
              Matches ({filteredMatches.length})
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "0.5rem" }}>
              <Search style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", width: "0.875rem", height: "0.875rem", color: "#6b7280" }} />
              <input
                type="text"
                value={matchSearch}
                onChange={e => setMatchSearch(e.target.value)}
                placeholder="Search matches..."
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.5rem 0.5rem 2rem",
                  color: "#fff",
                  fontSize: "0.75rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "0.25rem", padding: "0.25rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
              {(["all", "pending", "completed"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setMatchFilter(f)}
                  style={{
                    flex: 1,
                    padding: "0.3rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    background: matchFilter === f ? "rgba(245,158,11,0.15)" : "transparent",
                    color: matchFilter === f ? "#f59e0b" : "#9ca3af",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
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
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "0.5rem",
                    background: active ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.02)",
                    border: active ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
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

        {/* Right: Editor */}
        <div>
          {!selectedMatch ? (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "4rem 2rem",
              textAlign: "center",
            }}>
              <Trophy style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
                Select a Match
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                Choose a match from the list to enter results
              </p>
            </div>
          ) : (
            <>
              {/* Match Header */}
              <div style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.03))",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: "1rem",
                padding: "1rem 1.25rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}>
                <div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff", marginBottom: "0.125rem" }}>
                    {selectedMatch.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem", color: "#9ca3af" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <MapPin style={{ width: "0.75rem", height: "0.75rem" }} />
                      {selectedMatch.map}
                    </span>
                    <span>•</span>
                    <span>{filledCount}/{results.length} filled</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={autoFillPlacements}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.375rem",
                      background: "rgba(59,130,246,0.15)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      color: "#60a5fa",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.7rem", fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Zap style={{ width: "0.75rem", height: "0.75rem" }} />
                    Auto-Fill
                  </button>
                  <button
                    onClick={clearResults}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.375rem",
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#f87171",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.7rem", fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 style={{ width: "0.75rem", height: "0.75rem" }} />
                    Clear
                  </button>
                </div>
              </div>

              {/* Results Table */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                overflow: "hidden",
              }}>
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
                      {results.map(result => {
                        const team = teams.find(t => t.id === result.teamId);
                        if (!team) return null;
                        const isWWCD = result.wwcd || result.placement === 1;
                        return (
                          <tr
                            key={result.teamId}
                            style={{
                              borderTop: "1px solid rgba(255,255,255,0.04)",
                              background: isWWCD ? "rgba(245,158,11,0.05)" : "transparent",
                            }}
                          >
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                {team.logo ? (
                                  <img
                                    src={team.logo}
                                    style={{
                                      width: "2rem", height: "2rem",
                                      borderRadius: "0.375rem",
                                      objectFit: "cover",
                                      border: "1px solid rgba(255,255,255,0.08)",
                                    }}
                                    alt=""
                                  />
                                ) : (
                                  <div style={{
                                    width: "2rem", height: "2rem",
                                    borderRadius: "0.375rem",
                                    background: "rgba(245,158,11,0.15)",
                                    color: "#f59e0b",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.7rem", fontWeight: 700,
                                  }}>
                                    {team.name[0]}
                                  </div>
                                )}
                                <div>
                                  {team.tag && (
                                    <span style={{ color: "#f59e0b", marginRight: "0.25rem", fontWeight: 700, fontSize: "0.75rem" }}>
                                      [{team.tag}]
                                    </span>
                                  )}
                                  <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>
                                    {team.name}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={result.placement || ""}
                                onChange={e => updateResult(result.teamId, "placement", e.target.value)}
                                style={{
                                  width: "3.5rem",
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  borderRadius: "0.375rem",
                                  padding: "0.375rem",
                                  color: "#fff",
                                  textAlign: "center",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  outline: "none",
                                }}
                              />
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={result.kills}
                                onChange={e => updateResult(result.teamId, "kills", e.target.value)}
                                style={{
                                  width: "3.5rem",
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  borderRadius: "0.375rem",
                                  padding: "0.375rem",
                                  color: "#f87171",
                                  textAlign: "center",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  outline: "none",
                                }}
                              />
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                              <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={isWWCD}
                                  onChange={e => updateResult(result.teamId, "wwcd", e.target.checked)}
                                  style={{
                                    width: "1.1rem", height: "1.1rem",
                                    accentColor: "#f59e0b",
                                    cursor: "pointer",
                                  }}
                                />
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Save */}
              <div style={{
                display: "flex", justifyContent: "flex-end", alignItems: "center",
                gap: "0.75rem", marginTop: "1rem",
              }}>
                {savedMsg && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#4ade80", fontSize: "0.85rem", fontWeight: 600, marginRight: "auto" }}>
                    <Check style={{ width: "1rem", height: "1rem" }} />
                    Saved successfully!
                  </span>
                )}
                {filledCount === 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#fbbf24", fontSize: "0.8rem", marginRight: "auto" }}>
                    <AlertCircle style={{ width: "0.875rem", height: "0.875rem" }} />
                    Fill in at least one placement
                  </span>
                )}
                <button
                  onClick={saveResults}
                  disabled={saving || filledCount === 0}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    background: filledCount === 0 ? "rgba(245,158,11,0.4)" : "#f59e0b",
                    color: "#000",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.75rem",
                    fontWeight: 800, fontSize: "0.875rem",
                    border: "none",
                    cursor: saving || filledCount === 0 ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
                  }}
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
        @media (max-width: 768px) {
          .match-results-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}