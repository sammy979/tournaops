"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, Trophy, Users, Zap, BarChart3, ListChecks,
  Trash2, Share2, Check, Sparkles, Map, Skull, Target, Crown, Award
} from "lucide-react";
import type { Tournament, Match, TeamMatchResult } from "@/types/tournament";

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTournament = () => {
    if (typeof window === "undefined") return;
    try {
      const all = JSON.parse(localStorage.getItem("tournaops_tournaments") || "[]");
      const found = all.find((t: any) => t.id === params.id);
      if (found) {
        setTournament(found);
      } else {
        router.push("/dashboard/tournaments");
      }
    } catch {
      router.push("/dashboard/tournaments");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTournament();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) return null;

  const completed = tournament.matches?.filter((m: any) => m.status === "completed")?.length || 0;
  const total = tournament.matches?.length || 0;

  // Get leaderboard
  const leaderboard = [...(tournament.teams || [])]
    .filter((t: any) => t.matchesPlayed > 0)
    .sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return (a.avgPlacement || 99) - (b.avgPlacement || 99);
    });

  // Get top players
  const playerStats: Record<string, any> = {};
  (tournament.matches || []).forEach((match: any) => {
    if (!match.results) return;
    match.results.forEach((r: any) => {
      (r.players || []).forEach((p: any) => {
        if (!playerStats[p.playerId]) {
          playerStats[p.playerId] = { ...p, teamName: r.teamName, kills: 0, deaths: 0, damage: 0, matches: 0 };
        }
        const s = playerStats[p.playerId];
        s.kills += p.kills || 0;
        s.deaths += p.deaths || 0;
        s.damage += p.damage || 0;
        s.matches++;
      });
    });
  });
  const topKillers = Object.values(playerStats).sort((a: any, b: any) => b.kills - a.kills).slice(0, 5);
  const topDamage = Object.values(playerStats).sort((a: any, b: any) => b.damage - a.damage).slice(0, 5);

  const handleDelete = () => {
    if (!confirm("Delete this tournament?")) return;
    try {
      const all = JSON.parse(localStorage.getItem("tournaops_tournaments") || "[]");
      localStorage.setItem("tournaops_tournaments", JSON.stringify(all.filter((t: any) => t.id !== tournament.id)));
      router.push("/dashboard/tournaments");
    } catch {}
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tournaments/${tournament.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit demo results for a match
  const submitDemoResults = (matchId: string) => {
    const match = tournament.matches.find((m: any) => m.id === matchId);
    if (!match || match.status === "completed") return;

    const teamIds = match.teamsInMatch || [];
    const teams = tournament.teams.filter((t: any) => teamIds.includes(t.id));
    if (teams.length === 0) return;

    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const results: any[] = shuffled.map((team: any, idx: number) => {
      const placement = idx + 1;
      const kills = Math.floor(Math.random() * 12) + (placement <= 3 ? 4 : 0);
      const damage = kills * 200 + Math.floor(Math.random() * 1000);
      const ppPts = tournament.scoringRule?.placements?.[placement] || 0;
      const kPts = kills * (tournament.scoringRule?.killPoints || 1);
      const bPts = placement === 1 ? (tournament.scoringRule?.winnerBonus || 0) : 0;

      let rk = kills;
      const players = (team.players || []).map((p: any, pi: number) => {
        const last = pi === (team.players?.length || 4) - 1;
        const pk = last ? Math.max(0, rk) : Math.min(rk, Math.floor(Math.random() * 5));
        rk = Math.max(0, rk - pk);
        return {
          playerId: p.id, name: p.name, ign: p.ign,
          kills: pk, deaths: Math.random() > 0.5 ? 1 : 0,
          assists: Math.floor(Math.random() * 3),
          damage: pk * 250 + Math.floor(Math.random() * 500),
          headshots: Math.floor(Math.random() * pk + 1),
          knockdowns: Math.floor(Math.random() * (pk + 2)),
          revives: Math.floor(Math.random() * 2),
          survived: placement <= 5, survivalTime: 1200,
        };
      });

      return {
        teamId: team.id, teamName: team.name, teamTag: team.tag || team.name.substring(0, 3),
        placement, kills, deaths: players.reduce((a: number, p: any) => a + p.deaths, 0),
        assists: players.reduce((a: number, p: any) => a + p.assists, 0), damage,
        placementPoints: ppPts, killPoints: kPts, bonusPoints: bPts, penaltyPoints: 0,
        totalPoints: ppPts + kPts + bPts, players,
      };
    });

    // Update match
    match.results = results;
    match.status = "completed";
    match.completedAt = new Date().toISOString();

    // Update team stats
    results.forEach((r: any) => {
      const team = tournament.teams.find((t: any) => t.id === r.teamId);
      if (!team) return;
      team.matchesPlayed = (team.matchesPlayed || 0) + 1;
      team.totalKills = (team.totalKills || 0) + r.kills;
      team.totalDeaths = (team.totalDeaths || 0) + r.deaths;
      team.totalDamage = (team.totalDamage || 0) + r.damage;
      team.placementPoints = (team.placementPoints || 0) + r.placementPoints;
      team.killPoints = (team.killPoints || 0) + r.killPoints;
      team.bonusPoints = (team.bonusPoints || 0) + r.bonusPoints;
      team.points = (team.points || 0) + r.totalPoints;
      if (!team.placements) team.placements = [];
      team.placements.push(r.placement);
      team.avgPlacement = +(team.placements.reduce((a: number, b: number) => a + b, 0) / team.placements.length).toFixed(1);
      if (r.placement === 1) { team.wins = (team.wins || 0) + 1; team.wwcd = (team.wwcd || 0) + 1; }
      if (!team.matchResults) team.matchResults = [];
      team.matchResults.push({ matchNumber: match.globalMatchNumber, map: match.map, placement: r.placement, kills: r.kills, points: r.totalPoints });
    });

    // Save
    try {
      const all = JSON.parse(localStorage.getItem("tournaops_tournaments") || "[]");
      const idx = all.findIndex((t: any) => t.id === tournament.id);
      if (idx >= 0) all[idx] = tournament;
      localStorage.setItem("tournaops_tournaments", JSON.stringify(all));
      setTournament({ ...tournament });
    } catch {}
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "matches", name: "Matches", icon: ListChecks },
    { id: "standings", name: "Standings", icon: Trophy },
    { id: "teams", name: "Squads", icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <Link href="/dashboard/tournaments" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      {/* Header */}
      <div className="glass-heavy rounded-2xl p-5 mb-6 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${tournament.bannerColor || "from-yellow-500 to-orange-500"}`} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-black/50 text-[10px] font-bold uppercase">{tournament.status}</span>
            <span className="text-xs text-white/60">PUBG Mobile</span>
            <span className="text-xs text-white/60">{tournament.region}</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl mb-1">{tournament.name}</h1>
              <div className="flex flex-wrap gap-3 text-xs text-white/60">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {tournament.totalSlots} squads ({tournament.totalPlayers} players)</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> {completed}/{total} matches</span>
                <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {tournament.scoringRule?.name}</span>
                {tournament.prizePool && <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {tournament.prizePool}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyLink} className="btn-ghost text-xs py-1.5 px-3">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleDelete} className="btn-ghost text-xs py-1.5 px-3 border-red-500/30 text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition relative ${activeTab === tab.id ? "text-yellow-400" : "text-white/60 hover:text-white"}`}>
            <span className="flex items-center gap-1.5"><tab.icon className="w-4 h-4" />{tab.name}</span>
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500" />}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6 fade-in-up">
          {/* Round info */}
          <div className="glass rounded-xl p-5 border border-white/10">
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2"><Map className="w-5 h-5 text-yellow-400" /> Tournament Structure</h3>
            <div className="space-y-2">
              {(tournament.rounds || []).map((round: any, i: number) => (
                <div key={round.id || i} className={`flex items-center gap-3 p-3 rounded-lg ${round.status === "live" ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-white/5"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${round.status === "live" ? "bg-yellow-500 text-black" : round.status === "completed" ? "bg-green-500 text-white" : "bg-white/10 text-white/50"}`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{round.name}</div>
                    <div className="text-xs text-white/50">{round.totalTeams} squads · {round.lobbies?.length} lobbies · {round.matchesPerLobby} matches each</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${round.status === "live" ? "bg-yellow-500/20 text-yellow-400" : round.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>{round.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top performers (if any matches completed) */}
          {topKillers.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-5 border border-red-500/20">
                <h4 className="font-display font-bold text-sm flex items-center gap-2 mb-3"><Skull className="w-4 h-4 text-red-400" /> Top Killers</h4>
                {topKillers.map((p: any, i: number) => (
                  <div key={p.playerId || i} className="flex justify-between py-1.5 border-b border-white/5 text-sm last:border-0">
                    <span><span className="text-white/50 mr-2">{i + 1}.</span> {p.ign} <span className="text-white/40 text-xs">({p.teamName})</span></span>
                    <span className="text-red-400 font-black">{p.kills}</span>
                  </div>
                ))}
              </div>
              <div className="glass rounded-xl p-5 border border-cyan-500/20">
                <h4 className="font-display font-bold text-sm flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-cyan-400" /> Top Damage</h4>
                {topDamage.map((p: any, i: number) => (
                  <div key={p.playerId || i} className="flex justify-between py-1.5 border-b border-white/5 text-sm last:border-0">
                    <span><span className="text-white/50 mr-2">{i + 1}.</span> {p.ign} <span className="text-white/40 text-xs">({p.teamName})</span></span>
                    <span className="text-cyan-400 font-black">{(p.damage || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MATCHES TAB */}
      {activeTab === "matches" && (
        <div className="space-y-4 fade-in-up">
          {(tournament.rounds || []).map((round: any, rIdx: number) => (
            <div key={round.id || rIdx}>
              <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black ${round.status === "live" ? "bg-yellow-500 text-black" : "bg-white/10"}`}>{rIdx + 1}</span>
                {round.name}
                <span className={`text-xs px-2 py-0.5 rounded ${round.status === "live" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/40"}`}>{round.status}</span>
              </h3>
              
              {(round.lobbies || []).map((lobby: any) => (
                <div key={lobby.id} className="mb-4">
                  <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                    {lobby.name}
                    <span className="text-white/30">({lobby.teamIds?.length || 0} squads)</span>
                    {lobby.code && <span className="text-yellow-400">Code: {lobby.code}</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tournament.matches
                      .filter((m: any) => m.lobbyId === lobby.id)
                      .map((match: any) => (
                        <div key={match.id} className={`match-card rounded-xl p-4 ${match.status === "completed" ? "winner" : ""}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-[10px] font-black text-yellow-400 uppercase">Match {match.matchNumber}</span>
                              <span className="text-[10px] text-white/40 ml-2">{match.map}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${match.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>
                              {match.status}
                            </span>
                          </div>

                          {match.status === "completed" && match.results ? (
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {match.results.slice(0, 8).map((r: any, i: number) => (
                                <div key={r.teamId} className={`flex items-center justify-between text-xs py-1 px-2 rounded ${i === 0 ? "bg-yellow-500/10" : ""}`}>
                                  <span className="flex items-center gap-2">
                                    <span className={`w-5 text-center font-black ${i === 0 ? "text-yellow-400" : "text-white/50"}`}>#{r.placement}</span>
                                    <span className="font-semibold truncate max-w-[100px]">{r.teamName}</span>
                                  </span>
                                  <span className="flex gap-2">
                                    <span className="text-red-400">{r.kills}K</span>
                                    <span className="text-yellow-400 font-bold">{r.totalPoints}pts</span>
                                  </span>
                                </div>
                              ))}
                              {match.results.length > 8 && <div className="text-center text-[10px] text-white/40">+{match.results.length - 8} more</div>}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-xs text-white/40">{lobby.teamIds?.length || 16} squads · Awaiting results</div>
                          )}

                          <button
                            onClick={() => match.status !== "completed" ? submitDemoResults(match.id) : null}
                            className={`w-full mt-3 py-2 text-xs font-bold rounded-lg transition ${
                              match.status === "completed"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30"
                            }`}
                          >
                            {match.status === "completed" ? (
                              <><Check className="w-3.5 h-3.5 inline mr-1" /> Results Submitted</>
                            ) : (
                              <><Sparkles className="w-3.5 h-3.5 inline mr-1" /> Generate Demo Results</>
                            )}
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* STANDINGS TAB */}
      {activeTab === "standings" && (
        <div className="fade-in-up">
          {leaderboard.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center border border-white/5">
              <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">No results yet</h3>
              <p className="text-white/50 text-sm">Submit match results to see standings</p>
            </div>
          ) : (
            <div className="glass-heavy rounded-xl overflow-hidden border border-white/10">
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="font-display font-bold">Overall Standings</h3>
                <span className="text-xs text-white/50">{leaderboard.length} squads</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-black/40 text-[10px] uppercase text-white/50">
                    <tr>
                      <th className="p-3 text-left w-12">#</th>
                      <th className="p-3 text-left">Squad</th>
                      <th className="p-3 text-center">MP</th>
                      <th className="p-3 text-center">WWCD</th>
                      <th className="p-3 text-center">Kills</th>
                      <th className="p-3 text-center">Avg Place</th>
                      <th className="p-3 text-center">Place Pts</th>
                      <th className="p-3 text-center">Kill Pts</th>
                      <th className="p-3 text-center font-bold text-yellow-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((team: any, i: number) => (
                      <tr key={team.id} className={`border-t border-white/5 hover:bg-white/5 ${i === 0 ? "bg-yellow-500/5" : i === 1 ? "bg-gray-400/5" : i === 2 ? "bg-orange-500/5" : ""}`}>
                        <td className="p-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                            i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-orange-500 text-white" : "bg-white/10 text-white/50"
                          }`}>
                            {i === 0 ? <Crown className="w-4 h-4" /> : i + 1}
                          </div>
                        </td>
                        <td className="p-3 font-bold">{team.name}</td>
                        <td className="p-3 text-center text-white/70">{team.matchesPlayed}</td>
                        <td className="p-3 text-center text-yellow-400 font-bold">{team.wwcd || 0}</td>
                        <td className="p-3 text-center text-red-400 font-bold">{team.totalKills}</td>
                        <td className="p-3 text-center text-white/70">{team.avgPlacement || "-"}</td>
                        <td className="p-3 text-center text-yellow-300">{team.placementPoints}</td>
                        <td className="p-3 text-center text-red-300">{team.killPoints}</td>
                        <td className="p-3 text-center">
                          <span className="font-display font-black text-lg text-yellow-400 bg-yellow-500/10 px-3 py-0.5 rounded border border-yellow-500/30">
                            {team.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TEAMS TAB */}
      {activeTab === "teams" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 fade-in-up">
          {(tournament.teams || []).map((team: any) => (
            <div key={team.id} className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-black text-sm">{team.seed}</div>
                <div>
                  <div className="font-bold">{team.name}</div>
                  <div className="text-[10px] text-white/50">{team.lobby} · {team.tag}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-xs mb-3">
                <div><div className="text-yellow-400 font-black">{team.points || 0}</div><div className="text-white/40">Pts</div></div>
                <div><div className="text-red-400 font-black">{team.totalKills || 0}</div><div className="text-white/40">Kills</div></div>
                <div><div className="text-green-400 font-black">{team.wwcd || 0}</div><div className="text-white/40">WWCD</div></div>
                <div><div className="text-white/70 font-black">{team.matchesPlayed || 0}</div><div className="text-white/40">MP</div></div>
              </div>
              <div className="space-y-0.5 border-t border-white/5 pt-2">
                {(team.players || []).map((p: any) => (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className="text-white/70">{p.ign}</span>
                    <span className="text-white/40">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}