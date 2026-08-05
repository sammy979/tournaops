"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Users, Share2, Loader2, Target, ChevronLeft, Shield, Award, User } from "lucide-react";

export default function PublicTournamentPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [tournament, setTournament] = useState<any>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [organizer, setOrganizer] = useState<any>(null);
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "teams" | "results">("overview");

  async function loadData() {
    try {
      const res = await fetch(`/api/public/tournaments/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data.tournament);
        setStandings(data.standings || []);
        setOrganizer(data.organizer);
        setBranding(data.branding);
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
      navigator.share({ title: tournament?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  }

  const getChampionImage = (rank: number, teamName: string) => {
    const prompts: Record<number, string> = {
      1: `PUBG champion team holding golden trophy, epic sunset, celebrating victory, cinematic, professional esports photography, dramatic lighting`,
      2: `PUBG squad silver medalists holding silver trophy, professional pose, cinematic lighting, esports arena`,
      3: `PUBG squad bronze position holding bronze trophy, determined expression, cinematic, esports background`,
    };
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts[rank] || "PUBG esports")}?width=800&height=800&nologo=true&model=flux&seed=${rank}`;
  };

  const getBannerImage = (name: string) => {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(`PUBG Mobile tournament banner "${name}", epic esports arena, spotlights, cinematic, professional broadcast style`)}?width=1920&height=600&nologo=true&model=flux`;
  };

  const primaryColor = branding?.primaryColor || "#facc15";
  const organizerName = branding?.organizerName || organizer?.displayName || organizer?.username || "TournaOps";
  const organizerLogo = branding?.logoUrl || organizer?.avatar;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Banner with Organizer */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={tournament.bannerImage || getBannerImage(tournament.name)}
          alt="Tournament banner"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-950/70 to-gray-950"></div>
        
        {/* Organizer badge (top right) */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full">
          {organizerLogo ? (
            <img src={organizerLogo} alt={organizerName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: primaryColor }}>
              <User className="w-3 h-3 text-black" />
            </div>
          )}
          <span className="text-xs font-semibold text-white">Organized by {organizerName}</span>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  tournament.status === "live" ? "bg-red-500 text-white" :
                  tournament.status === "registration" ? "bg-green-500 text-white" :
                  tournament.status === "completed" ? "bg-gray-500 text-white" :
                  "bg-blue-500 text-white"
                }`}>
                  {tournament.status === "live" && "🔴 "}
                  {tournament.status.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-2 drop-shadow-2xl">{tournament.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" style={{ color: primaryColor }} />
                  {tournament.teams?.length || 0} / {tournament.maxTeams} Teams
                </div>
                {tournament.prizePool && (
                  <div className="flex items-center gap-1 font-bold" style={{ color: primaryColor }}>
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
                  className="px-6 py-3 text-black font-bold rounded-lg hover:opacity-90 transition shadow-lg"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, #f97316)` }}
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
                    tab === t.id ? "border-current" : "border-transparent text-gray-400 hover:text-white"
                  }`}
                  style={tab === t.id ? { color: primaryColor, borderColor: primaryColor } : {}}
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
              <Users className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
              <div className="text-3xl font-bold">{tournament.teams?.length || 0}</div>
              <div className="text-sm text-gray-400">Registered Teams</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Target className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
              <div className="text-3xl font-bold">{tournament.matches?.length || 0}</div>
              <div className="text-sm text-gray-400">Total Matches</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Trophy className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
              <div className="text-3xl font-bold">
                {tournament.prizePool ? `$${tournament.prizePool.toLocaleString()}` : "TBA"}
              </div>
              <div className="text-sm text-gray-400">Prize Pool</div>
            </div>

            {/* Organizer Card */}
            <div className="md:col-span-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border-2" style={{ borderColor: primaryColor + "50" }}>
              <div className="flex items-center gap-4">
                {organizerLogo ? (
                  <img src={organizerLogo} alt={organizerName} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: primaryColor }} />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-black" style={{ background: primaryColor }}>
                    {organizerName?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Tournament Organizer</div>
                  <div className="text-2xl font-black">{organizerName}</div>
                  {organizer?.username && (
                    <div className="text-sm text-gray-400">@{organizer.username}</div>
                  )}
                </div>
              </div>
            </div>

            {tournament.rules && (
              <div className="md:col-span-3 bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" style={{ color: primaryColor }} />
                  Rules & Regulations
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap">{tournament.rules}</p>
              </div>
            )}
          </div>
        )}

        {tab === "teams" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournament.teams?.map((team: any) => (
              <div key={team.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-current transition" style={{ ["--tw-border-opacity" as any]: 0.5, borderColor: undefined }}>
                <div className="flex items-center gap-3">
                  {team.logo ? (
                    <img src={team.logo} className="w-12 h-12 rounded-lg object-cover" alt={team.name} />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: primaryColor + "20" }}>
                      <Users className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold truncate">{team.name}</div>
                    {team.tag && <div className="text-xs" style={{ color: primaryColor }}>[{team.tag}]</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "results" && (
          <div>
            {standings.length > 0 && (
              <>
                {/* Champion Card with AI Image + Organizer */}
                <div className="mb-8">
                  <div className="relative rounded-3xl overflow-hidden border-4 shadow-2xl" style={{ borderColor: primaryColor, boxShadow: `0 25px 50px ${primaryColor}50` }}>
                    <img
                      src={getChampionImage(1, standings[0].teamName)}
                      alt="Champion"
                      className="w-full h-96 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    
                    {/* Organizer badge top left */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full">
                      {organizerLogo ? (
                        <img src={organizerLogo} alt={organizerName} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: primaryColor }}>
                          {organizerName?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-white">{organizerName}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                      <div className="inline-block text-black px-4 py-1 rounded-full text-xs font-black mb-3 tracking-widest" style={{ background: primaryColor }}>
                        🏆 CHAMPION
                      </div>
                      {standings[0].teamTag && (
                        <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                          [{standings[0].teamTag}]
                        </div>
                      )}
                      <h2 className="text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-2xl">
                        {standings[0].teamName}
                      </h2>
                      <div className="flex justify-center gap-6 mt-4">
                        <div className="text-center">
                          <div className="text-3xl font-black" style={{ color: primaryColor }}>{standings[0].totalPoints}</div>
                          <div className="text-xs text-white/80 tracking-widest font-bold">POINTS</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-red-400">{standings[0].totalKills}</div>
                          <div className="text-xs text-white/80 tracking-widest font-bold">KILLS</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black" style={{ color: primaryColor }}>{standings[0].wwcdCount}</div>
                          <div className="text-xs text-white/80 tracking-widest font-bold">WWCD</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Silver + Bronze */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {[1, 2].map((idx) => {
                    if (!standings[idx]) return null;
                    const rank = idx + 1;
                    const colors = { 2: "#94a3b8", 3: "#f97316" };
                    const medals = { 2: "🥈", 3: "🥉" };
                    const labels = { 2: "2ND PLACE", 3: "3RD PLACE" };
                    return (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border-2 shadow-xl" style={{ borderColor: colors[rank as 2 | 3] }}>
                        <img src={getChampionImage(rank, standings[idx].teamName)} alt="" className="w-full h-64 object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                          <div className="inline-block text-black px-3 py-0.5 rounded-full text-xs font-black mb-2" style={{ background: colors[rank as 2 | 3] }}>
                            {medals[rank as 2 | 3]} {labels[rank as 2 | 3]}
                          </div>
                          {standings[idx].teamTag && (
                            <div className="text-sm font-bold" style={{ color: colors[rank as 2 | 3] }}>
                              [{standings[idx].teamTag}]
                            </div>
                          )}
                          <h3 className="text-2xl font-black text-white">{standings[idx].teamName}</h3>
                          <div className="text-xl font-bold mt-1" style={{ color: colors[rank as 2 | 3] }}>
                            {standings[idx].totalPoints} pts
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Full Standings */}
            {standings.length > 0 ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {organizerLogo && (
                      <img src={organizerLogo} className="w-8 h-8 rounded-full object-cover" alt="" />
                    )}
                    <div>
                      <h3 className="font-bold">Full Standings</h3>
                      <p className="text-xs text-gray-500">Presented by {organizerName}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Auto-refreshes every 30s</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 text-xs uppercase" style={{ color: primaryColor }}>
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
                        <tr key={s.teamId} className="hover:bg-gray-800/50 transition" style={s.rank === 1 ? { background: primaryColor + "10" } : {}}>
                          <td className="px-4 py-3 font-bold">
                            {s.rank === 1 && "🏆 "}
                            {s.rank === 2 && "🥈 "}
                            {s.rank === 3 && "🥉 "}
                            {s.rank > 3 && s.rank}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold flex items-center gap-2">
                              {s.teamLogo && <img src={s.teamLogo} className="w-6 h-6 rounded" alt="" />}
                              {s.teamTag && <span className="mr-1" style={{ color: primaryColor }}>[{s.teamTag}]</span>}
                              {s.teamName}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400">{s.matchesPlayed}</td>
                          <td className="px-4 py-3 text-center">
                            {s.wwcdCount > 0 && <span className="font-bold" style={{ color: primaryColor }}>{s.wwcdCount}</span>}
                          </td>
                          <td className="px-4 py-3 text-center">{s.totalKills}</td>
                          <td className="px-4 py-3 text-right font-bold" style={{ color: primaryColor }}>{s.totalPoints}</td>
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
                <p className="text-gray-400">AI-powered podium reveal appears here once matches begin!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with Organizer */}
      <div className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {organizerLogo ? (
                <img src={organizerLogo} className="w-10 h-10 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black" style={{ background: primaryColor }}>
                  {organizerName?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm text-gray-400">Organized by</div>
                <div className="font-bold text-white">{organizerName}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Powered by <Link href="/" className="hover:underline" style={{ color: primaryColor }}>TournaOps</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}