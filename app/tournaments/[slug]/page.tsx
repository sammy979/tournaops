"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, Play, MapPin, Crosshair, Flame,
  RefreshCw, Share2, Twitter, MessageSquare, Copy,
  Check, Award, Crown, Radio, Clock, Star, Zap,
  ChevronRight, Eye, Calendar, FileText, Shield
} from "lucide-react";

export default function PublicTournamentPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const load = useCallback(async () => {
    const slug = params?.slug as string;
    if (!slug) return;

    try {
      // Fetch tournament by slug
      const res = await fetch(`/api/tournaments/${slug}`, { cache: "no-store" });
      if (!res.ok) {
        // Try as ID
        const res2 = await fetch(`/api/tournaments/${slug}`, { cache: "no-store" });
        if (!res2.ok) { setLoading(false); return; }
        const d2 = await res2.json();
        setTournament(d2.tournament);
      } else {
        const d = await res.json();
        setTournament(d.tournament);

        // Fetch stages
        if (d.tournament?.id) {
          const stagesRes = await fetch(`/api/tournaments/${d.tournament.id}/stages`);
          if (stagesRes.ok) {
            const sd = await stagesRes.json();
            setStages(sd.stages || []);
          }
        }
      }
    } catch {}

    setLastUpdated(new Date());
    setLoading(false);
  }, [params?.slug]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, [load]);

  // Calculate leaderboard from tournament data
  useEffect(() => {
    if (!tournament) return;
    const teamMap: Record<string, any> = {};
    (tournament.teams || []).forEach((t: any) => {
      teamMap[t.id] = {
        id: t.id, name: t.name, logo: t.logo, tag: t.tag,
        points: 0, kills: 0, wwcds: 0, matches: 0, placementPts: 0, killPts: 0,
      };
    });
    (tournament.matches || []).forEach((m: any) => {
      if (m.status !== "completed" || !m.results) return;
      m.results.forEach((r: any) => {
        if (!teamMap[r.teamId]) return;
        teamMap[r.teamId].points += r.totalPoints || 0;
        teamMap[r.teamId].kills += r.kills || 0;
        teamMap[r.teamId].placementPts += r.placementPoints || 0;
        teamMap[r.teamId].killPts += r.killPoints || 0;
        if (r.placement === 1) teamMap[r.teamId].wwcds += 1;
        teamMap[r.teamId].matches += 1;
      });
    });
    const sorted = Object.values(teamMap).sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.kills !== a.kills) return b.kills - a.kills;
      return b.wwcds - a.wwcds;
    });
    sorted.forEach((t: any, i: number) => { t.rank = i + 1; });
    setLeaderboard(sorted);
  }, [tournament]);

  const publicUrl = typeof window !== "undefined" ? window.location.href : "";
  const copyShare = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };
  const shareTwitter = () => {
    const leader = leaderboard[0];
    const text = leader
      ? `🏆 ${tournament?.name} — ${leader.name} leads with ${leader.points}pts!`
      : `🏆 ${tournament?.name} is live on TournaOps!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(publicUrl)}`, "_blank");
  };
  const shareWhatsApp = () => {
    const text = `Check out ${tournament?.name} live standings on TournaOps!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + publicUrl)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4">
        <div>
          <Trophy className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h1 className="text-white text-3xl font-bold mb-2">Tournament Not Found</h1>
          <p className="text-gray-500 mb-6">This tournament may not exist or has been removed.</p>
          <Link href="/" className="btn-primary px-6 py-2.5">Go to TournaOps</Link>
        </div>
      </div>
    );
  }

  const completedMatches = (tournament.matches || []).filter((m: any) => m.status === "completed").length;
  const totalMatches = (tournament.matches || []).length;
  const progress = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
  const isLive = tournament.status === "live" || stages.some((s: any) => s.status === "LIVE");
  const currentMatch = (tournament.matches || []).find((m: any) => m.status === "live");
  const lastMatch = (tournament.matches || []).filter((m: any) => m.status === "completed").pop();
  const leader = leaderboard[0];

  const tabs = [
    { key: "overview", label: "Overview", icon: Eye },
    { key: "standings", label: "Standings", icon: Trophy },
    { key: "matches", label: "Matches", icon: Play },
    { key: "teams", label: "Teams", icon: Users },
    { key: "schedule", label: "Schedule", icon: Calendar },
  ];

  if (stages.length > 0) tabs.splice(1, 0, { key: "stages", label: "Stages", icon: Award });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* NAV */}
      <div className="border-b border-white/8 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-blue-500/30 bg-gradient-to-br from-blue-500 to-purple-600">
              <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" />
            </div>
            <span className="text-blue-400 font-bold">TournaOps</span>
          </Link>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold animate-pulse">
                <Radio className="w-3 h-3" />LIVE
              </span>
            )}
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isLive ? "bg-green-500/20 text-green-400 border-green-500/30" :
                  tournament.status === "completed" ? "bg-gray-500/20 text-gray-400 border-gray-500/30" :
                  "bg-blue-500/20 text-blue-400 border-blue-500/30"
                }`}>
                  {isLive ? "LIVE" : tournament.status?.toUpperCase() || "DRAFT"}
                </span>
                <span className="text-gray-500 text-xs">PUBG Mobile</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
                {tournament.name}
              </h1>

              {tournament.description && (
                <p className="text-gray-400 text-sm mb-4 max-w-2xl">{tournament.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{(tournament.teams || []).length} Squads</span>
                <span className="flex items-center gap-1.5"><Play className="w-4 h-4" />{completedMatches}/{totalMatches} Matches</span>
                {tournament.prizePool && (
                  <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                    <Trophy className="w-4 h-4" />{tournament.prizePool}
                  </span>
                )}
                {stages.length > 0 && (
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <Award className="w-4 h-4" />{stages.length} Stages
                  </span>
                )}
              </div>

              {/* Progress */}
              {totalMatches > 0 && (
                <div className="mt-4 max-w-md">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-white font-mono">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <button onClick={shareTwitter} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-sm">
                <Twitter className="w-4 h-4" />Tweet
              </button>
              <button onClick={shareWhatsApp} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm">
                <MessageSquare className="w-4 h-4" />Share
              </button>
              <button onClick={copyShare} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm ${copiedShare ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-gray-400"}`}>
                {copiedShare ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedShare ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Live Match Banner */}
          {(currentMatch || (isLive && lastMatch)) && (
            <div className="mt-6 glass-card rounded-xl p-4 border border-red-500/30 bg-red-500/5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div>
                    <div className="text-white font-bold text-sm">{(currentMatch || lastMatch)?.name}</div>
                    <div className="text-gray-400 text-xs flex items-center gap-2">
                      <MapPin className="w-3 h-3" />{(currentMatch || lastMatch)?.map}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {currentMatch ? "🔴 In Progress" : "Last Completed"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STAGE PROGRESSION (if stages exist) */}
      {stages.length > 0 && (
        <div className="border-b border-white/8 bg-white/2">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {stages.map((s: any, idx: number) => {
                const icons: Record<string, string> = {
                  OPEN_QUALIFIER: "🎯", CLOSED_QUALIFIER: "🎯", GROUP_STAGE: "👥",
                  SEMI_FINAL: "🔥", GRAND_FINAL: "👑", QUARTER_FINAL: "⚡",
                };
                const statusColors: Record<string, string> = {
                  COMPLETED: "bg-green-500/15 text-green-400 border-green-500/30",
                  LIVE: "bg-red-500/15 text-red-400 border-red-500/30",
                  READY: "bg-purple-500/15 text-purple-400 border-purple-500/30",
                  DRAFT: "bg-gray-500/10 text-gray-500 border-gray-500/20",
                };

                return (
                  <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setSelectedStage(s.id); setActiveTab("stages"); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${statusColors[s.status] || statusColors.DRAFT}`}
                    >
                      <span>{icons[s.type] || "🏆"}</span>
                      {s.name}
                      {s.status === "COMPLETED" && <Check className="w-3 h-3" />}
                      {s.status === "LIVE" && <Radio className="w-3 h-3 animate-pulse" />}
                    </button>
                    {idx < stages.length - 1 && <ChevronRight className="w-3 h-3 text-gray-700" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="border-b border-white/8 sticky top-14 z-30 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-500 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />{tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Teams", value: (tournament.teams || []).length, icon: Users, color: "text-blue-400" },
                { label: "Matches", value: `${completedMatches}/${totalMatches}`, icon: Play, color: "text-green-400" },
                { label: "Total Kills", value: leaderboard.reduce((a: number, t: any) => a + (t.kills || 0), 0), icon: Crosshair, color: "text-red-400" },
                { label: "Stages", value: stages.length || 1, icon: Award, color: "text-purple-400" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="glass-card rounded-xl p-4 border border-white/8 text-center">
                    <Icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                    <div className="text-2xl font-black text-white">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-3">
                {[1, 0, 2].map(idx => {
                  const t = leaderboard[idx];
                  if (!t) return null;
                  const medals = ["🥇", "🥈", "🥉"];
                  const colors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
                  return (
                    <div key={t.id} className={`glass-card rounded-xl p-5 text-center border ${
                      t.rank === 1 ? "border-yellow-500/30 bg-yellow-500/5 -translate-y-2" : "border-white/10"
                    }`}>
                      <div className="text-4xl mb-2">{medals[t.rank - 1]}</div>
                      {t.logo && <img src={t.logo} alt="" className="w-12 h-12 rounded-xl mx-auto mb-2" />}
                      <div className={`font-bold ${colors[t.rank - 1]}`}>{t.name}</div>
                      <div className="text-gray-500 text-xs mt-1">{t.wwcds}W · {t.kills}K</div>
                      <div className={`text-2xl font-black ${colors[t.rank - 1]} mt-1`}>{t.points}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Top 10 */}
            {leaderboard.length > 0 && (
              <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/8 flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />Quick Standings
                  </h3>
                  <button onClick={() => setActiveTab("standings")} className="text-blue-400 text-xs hover:text-blue-300">
                    View all →
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {leaderboard.slice(0, 10).map((t: any) => (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/3">
                      <span className={`font-mono font-black w-8 text-sm ${
                        t.rank === 1 ? "text-yellow-400" : t.rank === 2 ? "text-gray-300" : t.rank === 3 ? "text-amber-600" : "text-gray-500"
                      }`}>
                        {t.rank <= 3 ? ["🥇","🥈","🥉"][t.rank-1] : `#${t.rank}`}
                      </span>
                      <span className="flex-1 text-white font-medium text-sm">{t.name}</span>
                      <span className="text-orange-400 font-mono text-xs">{t.kills}K</span>
                      <span className={`font-mono font-bold text-sm ${t.rank <= 3 ? "text-yellow-400" : "text-white"}`}>{t.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STANDINGS */}
        {activeTab === "standings" && (
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Rank</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Squad</th>
                    <th className="text-center py-3 px-2 text-yellow-500 text-xs uppercase">WWCD</th>
                    <th className="text-center py-3 px-2 text-orange-400 text-xs uppercase">Kills</th>
                    <th className="text-center py-3 px-2 text-blue-400 text-xs uppercase">Place</th>
                    <th className="text-center py-3 px-2 text-green-400 text-xs uppercase">Kill Pts</th>
                    <th className="text-center py-3 px-4 text-white text-xs uppercase font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((t: any) => (
                    <tr key={t.id} className={`border-b border-white/5 hover:bg-white/3 ${t.rank === 1 ? "bg-yellow-500/5" : ""}`}>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-black ${
                          t.rank === 1 ? "text-yellow-400" : t.rank === 2 ? "text-gray-300" : t.rank === 3 ? "text-amber-600" : "text-gray-500"
                        }`}>
                          {t.rank <= 3 ? ["🥇","🥈","🥉"][t.rank-1] : `#${t.rank}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {t.logo && <img src={t.logo} alt="" className="w-6 h-6 rounded" />}
                          <span className="text-white font-semibold">{t.name}</span>
                          {t.rank === 1 && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center"><span className={`font-bold ${t.wwcds > 0 ? "text-yellow-400" : "text-gray-700"}`}>{t.wwcds}</span></td>
                      <td className="py-3 px-2 text-center text-orange-400 font-mono font-bold">{t.kills}</td>
                      <td className="py-3 px-2 text-center text-blue-300 font-mono">{t.placementPts}</td>
                      <td className="py-3 px-2 text-center text-green-400 font-mono">{t.killPts}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono font-black text-lg ${t.rank <= 3 ? "text-yellow-400" : "text-white"}`}>{t.points}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Standings will appear when matches are played
                </div>
              )}
            </div>
          </div>
        )}

        {/* MATCHES */}
        {activeTab === "matches" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(tournament.matches || []).map((m: any) => (
              <div key={m.id} className={`glass-card rounded-xl p-4 border ${
                m.status === "completed" ? "border-green-500/20" :
                m.status === "live" ? "border-red-500/30 animate-pulse" :
                "border-white/10"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">{m.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.status === "completed" ? "bg-green-500/20 text-green-400" :
                    m.status === "live" ? "bg-red-500/20 text-red-400" :
                    "bg-gray-500/20 text-gray-500"
                  }`}>
                    {m.status === "completed" ? "✓ Done" : m.status === "live" ? "🔴 Live" : "Pending"}
                  </span>
                </div>
                <div className="text-gray-500 text-xs flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" />{m.map}
                </div>
                {m.status === "completed" && m.results && (
                  <div className="space-y-1">
                    {m.results.slice(0, 3).map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : "text-amber-600"}`}>
                          {["🥇","🥈","🥉"][i]} {r.teamName}
                        </span>
                        <span className="text-blue-400 font-mono font-bold">{r.totalPoints}pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(tournament.matches || []).length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Play className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No matches scheduled yet
              </div>
            )}
          </div>
        )}

        {/* TEAMS */}
        {activeTab === "teams" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(tournament.teams || []).map((team: any, idx: number) => (
              <div key={team.id} className="glass-card rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  {team.logo ? (
                    <img src={team.logo} alt="" className="w-10 h-10 rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-white font-bold">
                      {team.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-white font-semibold">{team.name}</div>
                    <div className="text-gray-500 text-xs">Seed #{team.seed || idx + 1} · {(team.players || []).length} players</div>
                  </div>
                </div>
                {(team.players || []).length > 0 && (
                  <div className="space-y-1">
                    {(team.players || []).map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{p.name}</span>
                        {p.role && <span className="text-gray-600">{p.role}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === "schedule" && (
          <div className="space-y-2">
            {(tournament.matches || []).map((m: any, idx: number) => {
              const isDone = m.status === "completed";
              const isLive = m.status === "live";
              return (
                <div key={m.id} className={`flex items-center gap-4 p-3 rounded-xl border ${
                  isDone ? "border-green-500/20 bg-green-500/3" :
                  isLive ? "border-red-500/30 bg-red-500/5" :
                  "border-white/8 bg-white/2"
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDone ? "bg-green-500/20 text-green-400" :
                    isLive ? "bg-red-500/20 text-red-400 animate-pulse" :
                    "bg-white/10 text-gray-500"
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : isLive ? <Radio className="w-4 h-4" /> : <span className="text-xs font-mono">{idx + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{m.name}</div>
                    <div className="text-gray-500 text-xs">{m.map}</div>
                  </div>
                  <span className={`text-xs font-semibold ${isDone ? "text-green-400" : isLive ? "text-red-400" : "text-gray-600"}`}>
                    {isDone ? "Completed" : isLive ? "LIVE" : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* STAGES */}
        {activeTab === "stages" && stages.length > 0 && (
          <div className="space-y-4">
            {stages.map((s: any, idx: number) => {
              const icons: Record<string, string> = {
                OPEN_QUALIFIER: "🎯", CLOSED_QUALIFIER: "🎯", GROUP_STAGE: "👥",
                SEMI_FINAL: "🔥", GRAND_FINAL: "👑",
              };
              return (
                <div key={s.id} className={`glass-card rounded-xl p-5 border ${
                  s.status === "LIVE" ? "border-red-500/30 bg-red-500/5" :
                  s.status === "COMPLETED" ? "border-green-500/20 bg-green-500/3" :
                  "border-white/10"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icons[s.type] || "🏆"}</span>
                      <div>
                        <div className="text-white font-bold">{s.name}</div>
                        <div className="text-gray-500 text-xs">{s.totalTeams} teams · {s.numGroups} groups</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      s.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
                      s.status === "LIVE" ? "bg-red-500/20 text-red-400" :
                      "bg-gray-500/20 text-gray-500"
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  {s.teamsAdvancing > 0 && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-green-400 font-bold">{s.teamsAdvancing} advanced</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-red-400">{s.teamsEliminated} eliminated</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/8 mt-12 py-6 text-center">
        <p className="text-gray-600 text-sm">
          Powered by <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold">TournaOps</Link> · tournaops.com
        </p>
      </div>
    </div>
  );
}