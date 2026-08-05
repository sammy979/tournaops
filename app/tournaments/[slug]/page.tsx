"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Users, Share2, Loader2, Target, ChevronLeft, Shield, User } from "lucide-react";

export default function PublicTournamentPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "teams" | "results">("overview");

  async function loadData() {
    try {
      const res = await fetch(`/api/public/tournaments/${slug}`);
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  function share() {
    if (navigator.share) navigator.share({ title: data?.tournament?.name, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-yellow-400 animate-spin" /></div>;
  if (!data?.tournament) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h1>
      </div>
    </div>
  );

  const { tournament, standings, organizer, branding, topFraggers } = data;
  const primaryColor = branding?.primaryColor || "#facc15";
  const orgName = branding?.organizerName || organizer?.displayName || organizer?.username || "Organizer";
  const orgLogo = branding?.logoUrl || organizer?.avatar;

  // Placeholder component for missing images
  const TeamAvatar = ({ team, size = 48 }: any) => {
    if (team?.teamLogo || team?.logo) {
      return <img src={team.teamLogo || team.logo} alt={team.teamName || team.name} style={{ width: size, height: size }} className="rounded-lg object-cover" />;
    }
    return (
      <div style={{ width: size, height: size, background: primaryColor + "20" }} className="rounded-lg flex items-center justify-center border" >
        <span style={{ color: primaryColor, fontWeight: 900, fontSize: size / 3 }}>
          {(team?.teamName || team?.name || "?")[0].toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
        {(tournament.bannerImage || tournament.coverImage) ? (
          <img src={tournament.bannerImage || tournament.coverImage} className="absolute inset-0 w-full h-full object-cover" alt="" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primaryColor}20, #000)` }}></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/70 to-gray-950"></div>
        
        {/* Organizer badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full">
          {orgLogo ? (
            <img src={orgLogo} className="w-6 h-6 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: primaryColor }}>
              {orgName[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold text-white">Organized by {orgName}</span>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 w-fit">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {tournament.trophyImage && (
                <img src={tournament.trophyImage} className="w-20 h-20 object-contain drop-shadow-2xl" alt="Trophy" />
              )}
              <div>
                <div className="flex gap-2 mb-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    tournament.status === "live" ? "bg-red-500 text-white" :
                    tournament.status === "registration" ? "bg-green-500 text-white" :
                    tournament.status === "completed" ? "bg-gray-600 text-white" :
                    "bg-blue-500 text-white"
                  }`}>
                    {tournament.status === "live" && "🔴 "}
                    {tournament.status.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black drop-shadow-2xl">{tournament.name}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/90">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" style={{ color: primaryColor }} />
                    {tournament.teams?.length || 0} / {tournament.maxTeams} Teams
                  </span>
                  {tournament.prizePool && (
                    <span className="flex items-center gap-1 font-bold" style={{ color: primaryColor }}>
                      <Trophy className="w-4 h-4" />
                      ${tournament.prizePool.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {tournament.status === "registration" && (
                <Link href={`/tournaments/${slug}/register`} className="px-6 py-3 text-black font-bold rounded-lg shadow-lg hover:opacity-90" style={{ background: `linear-gradient(to right, ${primaryColor}, #f97316)` }}>
                  Register Team
                </Link>
              )}
              <button onClick={share} className="px-4 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg hover:bg-white/20 flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Sponsor strip */}
        {tournament.sponsorLogos && Array.isArray(tournament.sponsorLogos) && tournament.sponsorLogos.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur border-t border-white/10 py-2 px-4">
            <div className="flex items-center justify-center gap-6 max-w-6xl mx-auto">
              <span className="text-xs text-white/50 font-semibold">SPONSORS:</span>
              {tournament.sponsorLogos.slice(0, 5).map((logo: string, i: number) => (
                <img key={i} src={logo} className="h-8 object-contain opacity-70 hover:opacity-100 transition" alt="Sponsor" />
              ))}
            </div>
          </div>
        )}
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
                <button key={t.id} onClick={() => setTab(t.id as any)} className={`px-4 py-3 flex items-center gap-2 text-sm font-semibold border-b-2 transition ${tab === t.id ? "border-current" : "border-transparent text-gray-400 hover:text-white"}`} style={tab === t.id ? { color: primaryColor, borderColor: primaryColor } : {}}>
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {tab === "overview" && (
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard icon={Users} value={tournament.teams?.length || 0} label="Teams" color={primaryColor} />
            <StatCard icon={Target} value={tournament.matches?.length || 0} label="Matches" color={primaryColor} />
            <StatCard icon={Trophy} value={tournament.prizePool ? `$${tournament.prizePool.toLocaleString()}` : "TBA"} label="Prize Pool" color={primaryColor} />

            <div className="md:col-span-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border-2" style={{ borderColor: primaryColor + "50" }}>
              <div className="flex items-center gap-4">
                {orgLogo ? (
                  <img src={orgLogo} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: primaryColor }} alt="" />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-black" style={{ background: primaryColor }}>
                    {orgName[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Tournament Organizer</div>
                  <div className="text-2xl font-black">{orgName}</div>
                  {organizer?.username && <div className="text-sm text-gray-400">@{organizer.username}</div>}
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
              <div key={team.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-yellow-400/50 transition">
                <div className="flex items-center gap-3">
                  <TeamAvatar team={team} size={56} />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{team.name}</div>
                    <div className="flex items-center gap-2 text-xs">
                      {team.tag && <span style={{ color: primaryColor }}>[{team.tag}]</span>}
                      {team.countryFlag && <span>{team.countryFlag}</span>}
                    </div>
                    {team.playersList?.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">{team.playersList.length} players</div>
                    )}
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
                {/* Champion Card */}
                <div className="mb-8 relative rounded-3xl overflow-hidden border-4 shadow-2xl" style={{ borderColor: primaryColor, boxShadow: `0 25px 50px ${primaryColor}50` }}>
                  {(standings[0].teamBanner || tournament.bannerImage) ? (
                    <img src={standings[0].teamBanner || tournament.bannerImage} className="w-full h-96 object-cover" alt="" />
                  ) : (
                    <div className="w-full h-96" style={{ background: `linear-gradient(135deg, ${primaryColor}30, #000)` }}></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full">
                    {orgLogo && <img src={orgLogo} className="w-6 h-6 rounded-full object-cover" alt="" />}
                    <span className="text-xs font-semibold text-white">{orgName}</span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                    <TeamAvatar team={standings[0]} size={100} />
                    <div className="inline-block text-black px-4 py-1 rounded-full text-xs font-black my-3 tracking-widest" style={{ background: primaryColor }}>
                      🏆 CHAMPION
                    </div>
                    {standings[0].teamTag && <div className="text-2xl font-bold" style={{ color: primaryColor }}>[{standings[0].teamTag}]</div>}
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">{standings[0].teamName}</h2>
                    <div className="flex justify-center gap-6">
                      <PodStat label="POINTS" value={standings[0].totalPoints} color={primaryColor} />
                      <PodStat label="KILLS" value={standings[0].totalKills} color="#ef4444" />
                      <PodStat label="WWCD" value={standings[0].wwcdCount} color={primaryColor} />
                    </div>
                  </div>
                </div>

                {/* Silver + Bronze */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {[1, 2].map((idx) => {
                    if (!standings[idx]) return null;
                    const rank = idx + 1;
                    const colors = { 2: "#94a3b8", 3: "#f97316" };
                    const c = colors[rank as 2 | 3];
                    return (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border-2 bg-gray-900 shadow-xl" style={{ borderColor: c }}>
                        <div className="p-6 flex items-center gap-4">
                          <TeamAvatar team={standings[idx]} size={80} />
                          <div className="flex-1">
                            <div className="text-xs font-black tracking-widest" style={{ color: c }}>
                              {rank === 2 ? "🥈 2ND PLACE" : "🥉 3RD PLACE"}
                            </div>
                            {standings[idx].teamTag && <div className="text-sm font-bold" style={{ color: c }}>[{standings[idx].teamTag}]</div>}
                            <h3 className="text-2xl font-black text-white">{standings[idx].teamName}</h3>
                            <div className="text-xl font-bold mt-1" style={{ color: c }}>{standings[idx].totalPoints} pts</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Top Fraggers with Player Photos */}
                {topFraggers?.length > 0 && (
                  <div className="mb-8 bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: primaryColor + "40" }}>
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                      🎯 Top Killers
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {topFraggers.slice(0, 5).map((p: any, i: number) => (
                        <div key={i} className="text-center">
                          {p.photo ? (
                            <img src={p.photo} className="w-20 h-20 rounded-full object-cover mx-auto border-2" style={{ borderColor: i === 0 ? primaryColor : "#4b5563" }} alt="" />
                          ) : (
                            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center border-2 text-2xl font-black" style={{ borderColor: i === 0 ? primaryColor : "#4b5563", background: "#1f2937", color: primaryColor }}>
                              {p.name[0]}
                            </div>
                          )}
                          <div className="mt-2 font-bold text-sm truncate">{p.name}</div>
                          {p.teamTag && <div className="text-xs" style={{ color: primaryColor }}>[{p.teamTag}]</div>}
                          <div className="text-lg font-black" style={{ color: i === 0 ? primaryColor : "white" }}>{p.kills}K</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Full Standings */}
            {standings.length > 0 ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {orgLogo && <img src={orgLogo} className="w-8 h-8 rounded-full object-cover" alt="" />}
                    <div>
                      <h3 className="font-bold">Full Standings</h3>
                      <p className="text-xs text-gray-500">Presented by {orgName}</p>
                    </div>
                  </div>
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
                      {standings.map((s: any) => (
                        <tr key={s.teamId} className="hover:bg-gray-800/50" style={s.rank === 1 ? { background: primaryColor + "10" } : {}}>
                          <td className="px-4 py-3 font-bold">
                            {s.rank === 1 && "🏆 "}{s.rank === 2 && "🥈 "}{s.rank === 3 && "🥉 "}
                            {s.rank > 3 && s.rank}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <TeamAvatar team={s} size={32} />
                              <div>
                                {s.teamTag && <span className="mr-1" style={{ color: primaryColor }}>[{s.teamTag}]</span>}
                                {s.teamName}
                              </div>
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
                <p className="text-gray-400">Standings appear once matches begin!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {orgLogo ? (
              <img src={orgLogo} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black" style={{ background: primaryColor }}>
                {orgName[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm text-gray-400">Organized by</div>
              <div className="font-bold text-white">{orgName}</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Powered by <Link href="/" className="hover:underline" style={{ color: primaryColor }}>TournaOps</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: any) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <Icon className="w-8 h-8 mb-3" style={{ color }} />
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function PodStat({ label, value, color }: any) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs text-white/80 tracking-widest font-bold">{label}</div>
    </div>
  );
}