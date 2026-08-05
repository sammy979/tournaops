"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, Users, Share2, Loader2, 
  Target, ChevronLeft, Shield 
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  }

  // AI image generators for each podium position
  const getChampionImage = (rank: number, teamName: string) => {
    const prompts: Record<number, string> = {
      1: `PUBG champion squad holding golden trophy, epic sunset, celebrating victory, cinematic, ${teamName} team, professional esports photography`,
      2: `PUBG squad silver medalists, holding silver trophy, professional pose, cinematic lighting, esports`,
      3: `PUBG squad bronze position, holding bronze trophy, determined expression, cinematic, esports`,
    };
    const prompt = prompts[rank] || "PUBG esports team";
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=800&nologo=true&model=flux&seed=${rank}`;
  };

  const getBannerImage = (name: string) => {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(`PUBG Mobile tournament banner "${name}", epic esports arena, spotlights, cinematic, professional broadcast style`)}?width=1920&height=600&nologo=true&model=flux`;
  };

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
          <Link href="/" className="mt-4 inline-block px-6 py-2 bg-yellow-500 text-black rounded-lg font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Banner with AI Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={getBannerImage(tournament.name)}
          alt="Tournament banner"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/70 to-gray-950"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  tournament.status === "live" 
                    ? "bg-red-500 text-white" 
                    : tournament.status === "registration"
                    ? "bg-green-500 text-white"
                    : tournament.status === "completed"
                    ? "bg-gray-500 text-white"
                    : "bg-blue-500 text-white"
                }`}>
                  {tournament.status === "live" && "🔴 "}
                  {tournament.status.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-2 drop-shadow-2xl">{tournament.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-white/90">
                <div className="flex items-center gap-1">
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
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:opacity-90 transition shadow-lg"
                >
                  Register Team
                </Link>
              )}
              <button
                onClick={share}
                className="px-4 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg hover:bg-white/20 transition flex items-center gap-2"
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
                {tournament.matches?.length || 0}
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
                      {team.tag && <div className="text-yellow-400 text-xs">[{team.tag}]</div>}
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
            {standings.length > 0 && (
              <>
                {/* Champion Hero with AI Image */}
                <div className="mb-8">
                  <div className="relative rounded-3xl overflow-hidden border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50">
                    <img
                      src={getChampionImage(1, standings[0].teamName)}
                      alt={`${standings[0].teamName} champion`}
                      className="w-full h-96 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                      <div className="inline-block bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-black mb-3 tracking-widest">
                        🏆 CHAMPION
                      </div>
                      {standings[0].teamTag && (
                        <div className="text-2xl text-yellow-400 font-bold">
                          [{standings[0].teamTag}]
                        </div>
                      )}
                      <h2 className="text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-2xl">
                        {standings[0].teamName}
                      </h2>
                      <div className="flex justify-center gap-6 mt-4">
                        <div className="text-center">
                          <div className="text-3xl font-black text-yellow-400">
                            {standings[0].totalPoints}
                          </div>
                          <div className="text-xs text-white/80 tracking-widest font-bold">POINTS</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-red-400">
                            {standings[0].totalKills}
                          </div>
                          <div className="text-xs text-white/80 tracking-widest font-bold">KILLS</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-yellow-400">
                            {standings[0].wwcdCount}
                          </div>
                          <div className="text-xs text-white/80 tracking-widest font-bold">WWCD</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Silver + Bronze with AI images */}
                {(standings[1] || standings[2]) && (
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {standings[1] && (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-400 shadow-xl">
                        <img
                          src={getChampionImage(2, standings[1].teamName)}
                          alt={standings[1].teamName}
                          className="w-full h-64 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                          <div className="inline-block bg-gray-400 text-black px-3 py-0.5 rounded-full text-xs font-black mb-2">
                            🥈 2ND PLACE
                          </div>
                          {standings[1].teamTag && (
                            <div className="text-sm text-gray-300 font-bold">
                              [{standings[1].teamTag}]
                            </div>
                          )}
                          <h3 className="text-2xl font-black text-white">
                            {standings[1].teamName}
                          </h3>
                          <div className="text-xl font-bold text-gray-300 mt-1">
                            {standings[1].totalPoints} pts
                          </div>
                        </div>
                      </div>
                    )}

                    {standings[2] && (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-orange-600 shadow-xl">
                        <img
                          src={getChampionImage(3, standings[2].teamName)}
                          alt={standings[2].teamName}
                          className="w-full h-64 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                          <div className="inline-block bg-orange-600 text-black px-3 py-0.5 rounded-full text-xs font-black mb-2">
                            🥉 3RD PLACE
                          </div>
                          {standings[2].teamTag && (
                            <div className="text-sm text-orange-300 font-bold">
                              [{standings[2].teamTag}]
                            </div>
                          )}
                          <h3 className="text-2xl font-black text-white">
                            {standings[2].teamName}
                          </h3>
                          <div className="text-xl font-bold text-orange-300 mt-1">
                            {standings[2].totalPoints} pts
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
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
                        <tr key={s.teamId} className={`hover:bg-gray-800/50 transition ${
                          s.rank === 1 ? "bg-yellow-400/5" : ""
                        }`}>
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
                          <td className="px-4 py-3 text-center text-gray-400">{s.matchesPlayed}</td>
                          <td className="px-4 py-3 text-center">
                            {s.wwcdCount > 0 && (
                              <span className="text-yellow-400 font-bold">{s.wwcdCount}</span>
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
                  AI-powered podium reveal appears here once matches begin!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          Powered by <Link href="/" className="text-yellow-400 hover:underline">TournaOps</Link>
        </div>
      </div>
    </div>
  );
}