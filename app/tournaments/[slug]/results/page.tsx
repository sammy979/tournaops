"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Trophy, Users, Crosshair, RefreshCw, Share2, ExternalLink } from "lucide-react";

interface Standing {
  rank: number;
  teamId: string;
  teamName: string;
  totalPoints: number;
  totalKills: number;
  placementPoints: number;
  killPoints: number;
  wwcdCount: number;
  matchesPlayed: number;
}

interface TournamentData {
  name: string;
  status: string;
  prizePool?: string;
  organizer: string;
  completedMatches: number;
  maxTeams: number;
  teams: Array<{ id: string; name: string; tag?: string }>;
}

export default function PublicResultsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [champion, setChampion] = useState<Standing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(() => {
    if (!slug) return;
    fetch("/api/public/tournaments/" + slug)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setTournament(data.tournament);
        setStandings(data.standings || []);
        setChampion(data.champion || null);
        setLastUpdated(new Date());
      })
      .catch(() => setError("Failed to load results"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tournament?.name + " Results",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <h2 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h2>
          <p className="text-gray-400">{error || "This tournament does not exist or is private."}</p>
        </div>
      </div>
    );
  }

  const top3 = standings.slice(0, 3);
  const rest = standings.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gray-400 text-xs mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {tournament.status === "completed" ? "Tournament Complete" : "Live Results"}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{tournament.name}</h1>
          <p className="text-gray-400">
            Organized by {tournament.organizer}
            {tournament.prizePool && " • Prize Pool: " + tournament.prizePool}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{tournament.teams.length}</div>
              <div className="text-xs text-gray-500">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{tournament.completedMatches}</div>
              <div className="text-xs text-gray-500">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{standings.length}</div>
              <div className="text-xs text-gray-500">Ranked</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 mb-8">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 text-sm transition-all">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 text-sm transition-all">
            <Share2 className="w-4 h-4" />Share
          </button>
        </div>

        {standings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">No Results Yet</p>
            <p className="text-sm mt-2">Check back once matches are completed</p>
          </div>
        ) : (
          <>
            {/* Podium — Top 3 */}
            {top3.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-white text-center mb-6 flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />Podium
                </h2>
                <div className="flex items-end justify-center gap-4">

                  {/* 2nd Place */}
                  {top3[1] && (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-2xl bg-gray-400/20 border-2 border-gray-400 flex items-center justify-center mb-3">
                        <span className="text-2xl font-bold text-gray-300">{top3[1].teamName.charAt(0)}</span>
                      </div>
                      <p className="text-white font-bold text-sm text-center mb-1">{top3[1].teamName}</p>
                      <p className="text-gray-400 text-xs">{top3[1].totalPoints}pts</p>
                      <div className="w-20 h-16 bg-gray-500/30 rounded-t-xl mt-3 flex items-center justify-center">
                        <span className="text-gray-300 font-bold text-2xl">2</span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {top3[0] && (
                    <div className="flex flex-col items-center -mt-8">
                      <div className="text-3xl mb-2">👑</div>
                      <div className="w-24 h-24 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center mb-3 shadow-lg shadow-yellow-400/30">
                        <span className="text-3xl font-bold text-yellow-300">{top3[0].teamName.charAt(0)}</span>
                      </div>
                      <p className="text-white font-bold text-center mb-1">{top3[0].teamName}</p>
                      <p className="text-yellow-400 text-sm font-bold">{top3[0].totalPoints}pts</p>
                      <div className="w-24 h-24 bg-yellow-500/30 rounded-t-xl mt-3 flex items-center justify-center">
                        <span className="text-yellow-300 font-bold text-3xl">1</span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {top3[2] && (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-2xl bg-orange-700/20 border-2 border-orange-700 flex items-center justify-center mb-3">
                        <span className="text-2xl font-bold text-orange-400">{top3[2].teamName.charAt(0)}</span>
                      </div>
                      <p className="text-white font-bold text-sm text-center mb-1">{top3[2].teamName}</p>
                      <p className="text-orange-400 text-xs">{top3[2].totalPoints}pts</p>
                      <div className="w-20 h-10 bg-orange-700/30 rounded-t-xl mt-3 flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-2xl">3</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Standings */}
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Full Standings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Team</th>
                      <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase">Points</th>
                      <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase">Kills</th>
                      <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase hidden md:table-cell">Matches</th>
                      <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase hidden md:table-cell">WWCDs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s) => (
                      <tr key={s.teamId} className={"border-b border-white/5 transition-colors " + (s.rank <= 3 ? "bg-yellow-500/5" : "hover:bg-white/5")}>
                        <td className="px-4 py-3">
                          <span className={"font-bold text-lg " + (s.rank === 1 ? "text-yellow-400" : s.rank === 2 ? "text-gray-300" : s.rank === 3 ? "text-orange-400" : "text-gray-500")}>
                            #{s.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                              {s.teamName.charAt(0)}
                            </div>
                            <span className="text-white font-medium">{s.teamName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-white">{s.totalPoints}</span>
                          <span className="text-gray-500 text-xs ml-1">pts</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-red-400 font-semibold">{s.totalKills}</span>
                          <Crosshair className="w-3 h-3 text-red-400 inline ml-1" />
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400 hidden md:table-cell">{s.matchesPlayed}</td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          {s.wwcdCount > 0 && <span className="text-yellow-400 font-bold">{s.wwcdCount}x 🐔</span>}
                          {s.wwcdCount === 0 && <span className="text-gray-600">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Powered by <a href="https://tournaops.com" className="text-purple-400 hover:text-purple-300">TournaOps</a></p>
          {lastUpdated && <p className="text-xs mt-1">Updated {lastUpdated.toLocaleTimeString()}</p>}
        </div>
      </div>
    </div>
  );
}