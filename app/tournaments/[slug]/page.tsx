"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Users, Play, MapPin, Crosshair, Flame, RefreshCw } from "lucide-react";
import { getTournamentBySlug, getLeaderboard, getTopPlayers } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function PublicTournamentPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"standings" | "matches" | "teams">("standings");

  const load = useCallback(() => {
    const slug = params?.slug as string;
    if (slug) {
      const t = getTournamentBySlug(slug);
      setTournament(t || null);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, [params?.slug]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Tournament Not Found</h1>
          <p className="text-gray-500 mb-6">This tournament does not exist or has not been published.</p>
          <Link href="/" className="btn-primary px-6 py-2">Go to TournaOps</Link>
        </div>
      </div>
    );
  }

  const leaderboard = getLeaderboard(tournament);
  const { topKillers, topDamage } = getTopPlayers(tournament);
  const completedMatches = tournament.matches.filter(m => m.status === "completed").length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-blue-400 font-bold text-lg">TournaOps</Link>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <RefreshCw className="w-3 h-3" />
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-blue-900/20 to-transparent border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${tournament.status === "live" ? "bg-green-500/20 text-green-400 border-green-500/30" : tournament.status === "completed" ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                  {tournament.status === "live" ? "LIVE" : tournament.status === "completed" ? "Completed" : "Upcoming"}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">{tournament.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{tournament.teams.length} Squads</span>
                <span className="flex items-center gap-1.5"><Play className="w-4 h-4" />{completedMatches}/{tournament.matches.length} Matches</span>
                {tournament.prizePool && <span className="flex items-center gap-1.5 text-yellow-400 font-semibold"><Trophy className="w-4 h-4" />{tournament.prizePool}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit mb-6">
          {(["standings", "matches", "teams"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "standings" && (
          <div className="space-y-6">
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, idx) => {
                  const medals = ["🥈", "🥇", "🥉"];
                  const colors = ["text-gray-300", "text-yellow-400", "text-amber-600"];
                  return (
                    <div key={entry.teamId} className={`glass-card rounded-xl p-5 text-center border ${idx === 1 ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10"} ${idx !== 1 ? "mt-6" : ""}`}>
                      <div className="text-4xl mb-2">{medals[idx]}</div>
                      <p className={`font-bold text-xl ${colors[idx]}`}>{entry.teamName}</p>
                      <p className="text-gray-500 text-sm mt-1">{entry.totalPoints} pts</p>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase">Rank</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase">Squad</th>
                      <th className="text-center py-3 px-4 text-gray-500 font-medium text-xs uppercase">Kills</th>
                      <th className="text-center py-3 px-4 text-gray-500 font-medium text-xs uppercase">Place Pts</th>
                      <th className="text-center py-3 px-4 text-gray-500 font-medium text-xs uppercase">Kill Pts</th>
                      <th className="text-center py-3 px-4 text-blue-400 font-bold text-xs uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.teamId} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${entry.rank === 1 ? "bg-yellow-500/5" : ""}`}>
                        <td className="py-3 px-4">
                          <span className={`font-mono font-bold ${entry.rank === 1 ? "text-yellow-400" : entry.rank === 2 ? "text-gray-300" : entry.rank === 3 ? "text-amber-600" : "text-gray-500"}`}>
                            {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank-1] : `#${entry.rank}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-semibold">{entry.teamName}</td>
                        <td className="py-3 px-4 text-center text-orange-400 font-mono font-bold">{entry.totalKills || 0}</td>
                        <td className="py-3 px-4 text-center text-blue-300 font-mono">{entry.placementPoints || 0}</td>
                        <td className="py-3 px-4 text-center text-green-400 font-mono">{entry.killPoints || 0}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-mono font-bold text-lg ${entry.rank <= 3 ? "text-yellow-400" : "text-white"}`}>{entry.totalPoints}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {leaderboard.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Standings will appear when matches are played</p>
                  </div>
                )}
              </div>
            </div>
            {(topKillers.length > 0 || topDamage.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Crosshair className="w-4 h-4 text-red-400" />Top Killers</h3>
                  <div className="space-y-3">
                    {topKillers.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 text-sm w-5">#{i+1}</span>
                          <div><p className="text-white text-sm font-medium">{p.playerName}</p><p className="text-gray-500 text-xs">{p.teamName}</p></div>
                        </div>
                        <span className="text-red-400 font-bold font-mono">{p.kills}K</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" />Top Damage</h3>
                  <div className="space-y-3">
                    {topDamage.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 text-sm w-5">#{i+1}</span>
                          <div><p className="text-white text-sm font-medium">{p.playerName}</p><p className="text-gray-500 text-xs">{p.teamName}</p></div>
                        </div>
                        <span className="text-orange-400 font-bold font-mono">{p.damage?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-6">
            {tournament.rounds.map((round) => (
              <div key={round.id}>
                <h3 className="text-white font-bold text-lg mb-4">{round.name}</h3>
                {round.lobbies.map((lobby) => {
                  const lobbyMatches = tournament.matches.filter(m => lobby.matchIds.includes(m.id));
                  return (
                    <div key={lobby.id} className="mb-4">
                      <p className="text-gray-500 text-sm mb-2">{lobby.name}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {lobbyMatches.map((match) => (
                          <div key={match.id} className={`glass-card rounded-xl p-4 border ${match.status === "completed" ? "border-green-500/20" : "border-white/10"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-white font-semibold text-sm">{match.name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${match.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-500"}`}>
                                {match.status === "completed" ? "Done" : "Pending"}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" />{match.map}</p>
                            {match.results && match.results.length > 0 && (
                              <div className="space-y-1.5">
                                {match.results.slice(0, 3).map((r) => (
                                  <div key={r.teamId} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${r.placement === 1 ? "text-yellow-400" : "text-gray-500"}`}>#{r.placement}</span>
                                      <span className="text-gray-300">{r.teamName}</span>
                                    </div>
                                    <span className="text-blue-400 font-bold">{r.totalPoints}pts</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {activeTab === "teams" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tournament.teams.map((team) => (
              <div key={team.id} className="glass-card rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 overflow-hidden">
                    {(team as any).logo ? (
                      <img src={(team as any).logo} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-white">{team.name.charAt(0)}</span>
                    )}
                  </div>
                  <p className="text-white font-semibold">{team.name}</p>
                </div>
                <div className="space-y-1.5">
                  {team.players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{player.name}</span>
                      {player.role && <span className="text-gray-600 text-xs">{player.role}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 mt-12 py-6 text-center">
        <p className="text-gray-600 text-sm">Powered by <Link href="/" className="text-blue-400 hover:text-blue-300">TournaOps</Link></p>
      </div>
    </div>
  );
}
