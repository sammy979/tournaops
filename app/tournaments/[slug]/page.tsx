"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, Users, Calendar, Share2, Loader2, 
  Crown, Target, Zap, ChevronLeft, Shield 
} from "lucide-react";

export default function PublicTournamentPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [tournament, setTournament] = useState<any>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "teams" | "results">("overview");

  async function loadData() {
    try {
      const res = await fetch(`/api/public/tournaments/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data.tournament);
        setStandings(data.standings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  function share() {
    if (navigator.share) {
      navigator.share({
        title: tournament?.name,
        text: `Check out ${tournament?.name} on TournaOps!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h1>
          <p className="text-gray-400">This tournament does not exist or is private.</p>
          <Link href="/" className="mt-4 inline-block px-6 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  tournament.status === "live" 
                    ? "bg-red-500/20 text-red-400" 
                    : tournament.status === "registration"
                    ? "bg-green-500/20 text-green-400"
                    : tournament.status === "completed"
                    ? "bg-gray-500/20 text-gray-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}>
                  {tournament.status === "live" && "🔴 "}
                  {tournament.status.toUpperCase()}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 font-semibold">
                  {tournament.format?.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-2">{tournament.name}</h1>
              {tournament.description && (
                <p className="text-gray-400 max-w-2xl">{tournament.description}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1 text-gray-300">
                  <Users className="w-4 h-4 text-yellow-400" />
                  {tournament.teams?.length || 0} / {tournament.maxTeams} Teams
                </div>
                {tournament.prizePool && (
                  <div className="flex items-center gap-1 text-yellow-400 font-bold">
                    <Trophy className="w-4 h-4" />
                    ${tournament.prizePool.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {tournament.status === "registration" && (
                <Link
                  href={`/tournaments/${slug}/register`}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:opacity-90 transition"
                >
                  Register Team
                </Link>
              )}
              <button
                onClick={share}
                className="px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: "overview", label: "Overview", icon: Trophy },
              { id: "teams", label: `Teams (${tournament.teams?.length || 0})`, icon: Users },
              { id: "results", label: "Results", icon: Target },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`px-4 py-3 flex items-center gap-2 text-sm font-semibold border-b-2 transition ${
                    tab === t.id
                      ? "border-yellow-400 text-yellow-400"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {tab === "overview" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Users className="w-8 h-8 text-yellow-400 mb-3" />
              <div className="text-3xl font-bold">{tournament.teams?.length || 0}</div>
              <div className="text-sm text-gray-400">Registered Teams</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Target className="w-8 h-8 text-yellow-400 mb-3" />
              <div className="text-3xl font-bold">
                {tournament.rounds?.reduce((s: number, r: any) => s + (r.matches?.length || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-400">Total Matches</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Trophy className="w-8 h-8 text-yellow-400 mb-3" />
              <div className="text-3xl font-bold">
                {tournament.prizePool ? `$${tournament.prizePool.toLocaleString()}` : "TBA"}
              </div>
              <div className="text-sm text-gray-400">Prize Pool</div>
            </div>

            {tournament.rules && (
              <div className="md:col-span-3 bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Rules & Regulations
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap">{tournament.rules}</p>
              </div>
            )}
          </div>
        )}

        {tab === "teams" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournament.teams?.length > 0 ? (
              tournament.teams.map((team: any) => (
                <div key={team.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-yellow-400/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate">{team.name}</div>
                      {team.tag && (
                        <div className="text-yellow-400 text-xs">[{team.tag}]</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No teams registered yet
              </div>
            )}
          </div>
        )}

        {tab === "results" && (
          <div>
            {/* Podium — Top 3 */}
            {standings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center">🏆 Current Standings</h2>
                <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {/* 2nd Place */}
                  {standings[1] && (
                    <div className="text-center pt-8">
                      <div className="bg-gray-700 rounded-t-lg p-4 h-32 flex flex-col justify-end">
                        <div className="text-4xl mb-1">🥈</div>
                        <div className="text-xs text-gray-400">2nd</div>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-b-lg">
                        <div className="font-bold text-sm truncate">
                          {standings[1].teamName}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {standings[1].totalPoints} pts
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {standings[0] && (
                    <div className="text-center">
                      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-lg p-4 h-40 flex flex-col justify-end">
                        <div className="text-5xl mb-1">🏆</div>
                        <div className="text-xs text-black font-bold">1st</div>
                      </div>
                      <div className="bg-yellow-500/20 border border-yellow-400 p-3 rounded-b-lg">
                        <div className="font-bold text-yellow-400 truncate">
                          {standings[0].teamName}
                        </div>
                        <div className="text-sm text-yellow-300 mt-1 font-semibold">
                          {standings[0].totalPoints} pts
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {standings[2] && (
                    <div className="text-center pt-12">
                      <div className="bg-orange-800 rounded-t-lg p-4 h-24 flex flex-col justify-end">
                        <div className="text-3xl mb-1">🥉</div>
                        <div className="text-xs text-orange-200">3rd</div>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-b-lg">
                        <div className="font-bold text-sm truncate">
                          {standings[2].teamName}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {standings[2].totalPoints} pts
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Standings Table */}
            {standings.length > 0 ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="font-bold">Full Standings</h3>
                  <span className="text-xs text-gray-500">Auto-refreshes every 30s</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Team</th>
                        <th className="px-4 py-3 text-center">Matches</th>
                        <th className="px-4 py-3 text-center">WWCD</th>
                        <th className="px-4 py-3 text-center">Kills</th>
                        <th className="px-4 py-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {standings.map((s) => (
                        <tr 
                          key={s.teamId} 
                          className={`hover:bg-gray-800/50 transition ${
                            s.rank === 1 ? "bg-yellow-400/5" : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-bold">
                            {s.rank === 1 && "🏆 "}
                            {s.rank === 2 && "🥈 "}
                            {s.rank === 3 && "🥉 "}
                            {s.rank > 3 && s.rank}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">
                              {s.teamTag && (
                                <span className="text-yellow-400 mr-1">[{s.teamTag}]</span>
                              )}
                              {s.teamName}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400">
                            {s.matchesPlayed}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.wwcdCount > 0 && (
                              <span className="text-yellow-400 font-bold">
                                {s.wwcdCount}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">{s.totalKills}</td>
                          <td className="px-4 py-3 text-right font-bold text-yellow-400">
                            {s.totalPoints}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Results Yet</h3>
                <p className="text-gray-400">
                  Standings will appear here once matches are completed.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          Powered by <Link href="/" className="text-yellow-400 hover:underline">TournaOps</Link>
        </div>
      </div>
    </div>
  );
}