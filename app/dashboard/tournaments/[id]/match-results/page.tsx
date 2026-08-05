"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Trophy, Users, Save, Loader2, Check, ChevronLeft, Plus, X, Trash2 } from "lucide-react";
import Link from "next/link";

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
  const [savedMsg, setSavedMsg] = useState(false);

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
      // Initialize empty results for all teams
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
        // If setting WWCD, remove from others
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
    
    // Validate: all placements filled
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
    } catch (e) {
      alert("Failed to save results");
    } finally {
      setSaving(false);
    }
  }

  function autoFillPlacements() {
    // Sort teams by kills descending, assign placement
    const sorted = [...results].sort((a, b) => b.kills - a.kills);
    setResults(
      sorted.map((r, i) => ({
        ...r,
        placement: i + 1,
        wwcd: i === 0,
      }))
    );
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

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Link href={`/dashboard/tournaments/${tournamentId}`} className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to Tournament
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Match Results Entry
          </h1>
          <p className="text-gray-400 mt-1">{tournament?.name}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Match list */}
          <div className="lg:col-span-1 bg-gray-900 rounded-xl p-4 border border-gray-800 max-h-screen overflow-y-auto">
            <h2 className="font-bold mb-3">Matches ({matches.length})</h2>
            <div className="space-y-2">
              {matches.map((match) => {
                const hasResults = Array.isArray(match.results) && match.results.length > 0;
                return (
                  <button
                    key={match.id}
                    onClick={() => selectMatch(match)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedMatch?.id === match.id
                        ? "bg-yellow-400/10 border-yellow-400"
                        : "bg-gray-800 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{match.name}</span>
                      {hasResults && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {match.map} • {match.status}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Results Editor */}
          <div className="lg:col-span-2">
            {!selectedMatch ? (
              <div className="bg-gray-900 rounded-xl p-16 text-center border border-gray-800">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Select a Match</h3>
                <p className="text-gray-400 text-sm">Click a match on the left to enter results</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedMatch.name}</h2>
                      <p className="text-sm text-gray-400">
                        Map: {selectedMatch.map} • Status: {selectedMatch.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={autoFillPlacements}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-semibold"
                      >
                        Auto-Fill by Kills
                      </button>
                      <button
                        onClick={clearResults}
                        className="px-3 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Clear
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                      <tr>
                        <th className="px-3 py-2 text-left">Team</th>
                        <th className="px-3 py-2 text-center">Placement</th>
                        <th className="px-3 py-2 text-center">Kills</th>
                        <th className="px-3 py-2 text-center">WWCD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {results.map((result) => {
                        const team = teams.find((t) => t.id === result.teamId);
                        if (!team) return null;
                        return (
                          <tr key={result.teamId} className={result.wwcd ? "bg-yellow-400/10" : ""}>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                {team.logo ? (
                                  <img src={team.logo} className="w-8 h-8 rounded object-cover" alt="" />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-yellow-400/20 flex items-center justify-center text-xs font-bold text-yellow-400">
                                    {team.name[0]}
                                  </div>
                                )}
                                <div>
                                  {team.tag && <span className="text-yellow-400 mr-1">[{team.tag}]</span>}
                                  <span className="font-semibold">{team.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={result.placement || ""}
                                onChange={(e) => updateResult(result.teamId, "placement", e.target.value)}
                                className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-sm focus:border-yellow-400 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={result.kills}
                                onChange={(e) => updateResult(result.teamId, "kills", e.target.value)}
                                className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-sm focus:border-yellow-400 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={result.wwcd}
                                onChange={(e) => updateResult(result.teamId, "wwcd", e.target.checked)}
                                className="w-4 h-4 accent-yellow-400 cursor-pointer"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  {savedMsg && (
                    <span className="text-green-400 flex items-center gap-1 mr-auto">
                      <Check className="w-4 h-4" /> Saved!
                    </span>
                  )}
                  <button
                    onClick={saveResults}
                    disabled={saving}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold rounded-lg flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Results
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}