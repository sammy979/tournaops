"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trophy, Users, Zap, BarChart3, ListChecks, Trash2, Share2, Check, Sparkles, Map, Skull, Target, Crown, Award } from "lucide-react";

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (typeof window === "undefined") return;
    try {
      const all = JSON.parse(localStorage.getItem("tournaops_tournaments") || "[]");
      const t = all.find((x: any) => x.id === params.id);
      if (t) setTournament(t);
      else router.push("/dashboard/tournaments");
    } catch { router.push("/dashboard/tournaments"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [params.id]);

  const save = (t: any) => {
    try {
      const all = JSON.parse(localStorage.getItem("tournaops_tournaments") || "[]");
      const idx = all.findIndex((x: any) => x.id === t.id);
      if (idx >= 0) all[idx] = t;
      localStorage.setItem("tournaops_tournaments", JSON.stringify(all));
      setTournament({...t});
    } catch {}
  };

  const submitDemo = (matchId: string) => {
    if (!tournament) return;
    const match = tournament.matches.find((m: any) => m.id === matchId);
    if (!match || match.status === "completed") return;
    const tIds = match.teamsInMatch || [];
    const teams = tournament.teams.filter((t: any) => tIds.includes(t.id));
    if (teams.length === 0) return;
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const results = shuffled.map((team: any, idx: number) => {
      const p = idx + 1;
      const k = Math.floor(Math.random() * 12) + (p <= 3 ? 4 : 0);
      const d = p > 10 ? 4 : Math.floor(Math.random() * 4);
      const dm = k * 200 + Math.floor(Math.random() * 1000);
      const pp = tournament.scoringRule?.placements?.[p] || 0;
      const kp = k * (tournament.scoringRule?.killPoints || 1);
      const bp = p === 1 ? (tournament.scoringRule?.winnerBonus || 0) : 0;
      let rk = k;
      const players = (team.players || []).map((pl: any, pi: number) => {
        const last = pi === (team.players?.length || 4) - 1;
        const pk = last ? Math.max(0, rk) : Math.min(rk, Math.floor(Math.random() * 5));
        rk = Math.max(0, rk - pk);
        return { playerId: pl.id, name: pl.name, ign: pl.ign, kills: pk, deaths: Math.random() > 0.5 ? 1 : 0, assists: Math.floor(Math.random() * 3), damage: pk * 250 + Math.floor(Math.random() * 500), headshots: Math.floor(Math.random() * (pk + 1)), knockdowns: Math.floor(Math.random() * (pk + 2)), revives: 0, survived: p <= 5, survivalTime: 1200 };
      });
      return { teamId: team.id, teamName: team.name, teamTag: team.tag || team.name.substring(0, 3), placement: p, kills: k, deaths: d, assists: players.reduce((a: number, x: any) => a + x.assists, 0), damage: dm, placementPoints: pp, killPoints: kp, bonusPoints: bp, penaltyPoints: 0, totalPoints: pp + kp + bp, players };
    });
    match.results = results;
    match.status = "completed";
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
    save(tournament);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!tournament) return null;

  const completed = tournament.matches?.filter((m: any) => m.status === "completed")?.length || 0;
  const total = tournament.matches?.length || 0;
  const leaderboard = [...(tournament.teams || [])].filter((t: any) => (t.matchesPlayed || 0) > 0).sort((a: any, b: any) => (b.points || 0) - (a.points || 0) || (b.totalKills || 0) - (a.totalKills || 0));
  const ps: Record<string, any> = {};
  (tournament.matches || []).forEach((m: any) => { (m.results || []).forEach((r: any) => { (r.players || []).forEach((p: any) => { if (!ps[p.playerId]) ps[p.playerId] = {...p, teamName: r.teamName, kills: 0, deaths: 0, damage: 0, matches: 0}; const s = ps[p.playerId]; s.kills += p.kills || 0; s.deaths += p.deaths || 0; s.damage += p.damage || 0; s.matches++; }); }); });
  const topK = Object.values(ps).sort((a: any, b: any) => b.kills - a.kills).slice(0, 5);
  const topD = Object.values(ps).sort((a: any, b: any) => b.damage - a.damage).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto">
      <Link href="/dashboard/tournaments" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 text-sm"><ChevronLeft className="w-4 h-4" /> Back</Link>
      <div className="glass-heavy rounded-2xl p-5 mb-6 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${tournament.bannerColor || "from-yellow-500 to-orange-500"}`} />
        <div className="relative flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-black/50 text-[10px] font-bold uppercase">{tournament.status}</span>
              <span className="text-xs text-white/60">PUBG Mobile</span>
              {tournament.prizePool && <span className="text-xs text-yellow-400">{tournament.prizePool}</span>}
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl mb-1">{tournament.name}</h1>
            <div className="flex flex-wrap gap-3 text-xs text-white/60">
              <span><Users className="w-3.5 h-3.5 inline" /> {tournament.totalSlots} squads</span>
              <span><Zap className="w-3.5 h-3.5 inline" /> {completed}/{total} matches</span>
              <span><Trophy className="w-3.5 h-3.5 inline" /> {tournament.scoringRule?.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(window.location.origin + "/tournaments/" + tournament.slug); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="btn-ghost text-xs py-1.5 px-3">{copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}</button>
            <button onClick={() => { if(confirm("Delete?")){ try{ const all=JSON.parse(localStorage.getItem("tournaops_tournaments")||"[]"); localStorage.setItem("tournaops_tournaments",JSON.stringify(all.filter((t:any)=>t.id!==tournament.id))); router.push("/dashboard/tournaments"); }catch{} }}} className="btn-ghost text-xs py-1.5 px-3 border-red-500/30 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto">
        {[{id:"overview",name:"Overview",icon:BarChart3},{id:"matches",name:"Matches",icon:ListChecks},{id:"standings",name:"Standings",icon:Trophy},{id:"teams",name:"Squads",icon:Users}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition relative ${activeTab === tab.id ? "text-yellow-400" : "text-white/60 hover:text-white"}`}>
            <span className="flex items-center gap-1.5"><tab.icon className="w-4 h-4" />{tab.name}</span>
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500" />}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6 fade-in-up">
          <div className="glass rounded-xl p-5 border border-white/10">
            <h3 className="font-display font-bold text-lg mb-3"><Map className="w-5 h-5 text-yellow-400 inline mr-2" />Structure</h3>
            {(tournament.rounds || []).map((r: any, i: number) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${r.status === "live" ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-white/5"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${r.status === "live" ? "bg-yellow-500 text-black" : "bg-white/10"}`}>{i + 1}</div>
                <div className="flex-1"><div className="font-bold text-sm">{r.name}</div><div className="text-xs text-white/50">{r.totalTeams} squads · {r.lobbies?.length} lobbies · {r.matchesPerLobby}M</div></div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === "live" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/40"}`}>{r.status}</span>
              </div>
            ))}
          </div>
          {topK.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-5 border border-red-500/20">
                <h4 className="font-display font-bold text-sm mb-3"><Skull className="w-4 h-4 text-red-400 inline mr-2" />Top Killers</h4>
                {topK.map((p: any, i: number) => (<div key={i} className="flex justify-between py-1.5 border-b border-white/5 text-sm last:border-0"><span><span className="text-white/50 mr-2">{i+1}.</span>{p.ign} <span className="text-white/40 text-xs">({p.teamName})</span></span><span className="text-red-400 font-black">{p.kills}</span></div>))}
              </div>
              <div className="glass rounded-xl p-5 border border-cyan-500/20">
                <h4 className="font-display font-bold text-sm mb-3"><Target className="w-4 h-4 text-cyan-400 inline mr-2" />Top Damage</h4>
                {topD.map((p: any, i: number) => (<div key={i} className="flex justify-between py-1.5 border-b border-white/5 text-sm last:border-0"><span><span className="text-white/50 mr-2">{i+1}.</span>{p.ign} <span className="text-white/40 text-xs">({p.teamName})</span></span><span className="text-cyan-400 font-black">{(p.damage||0).toLocaleString()}</span></div>))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "matches" && (
        <div className="space-y-4 fade-in-up">
          {(tournament.rounds || []).map((round: any, ri: number) => (
            <div key={ri}>
              <h3 className="font-display font-bold text-lg mb-3">{round.name}</h3>
              {(round.lobbies || []).map((lobby: any) => (
                <div key={lobby.id} className="mb-4">
                  <div className="text-xs font-bold text-white/50 uppercase mb-2">{lobby.name} ({lobby.teamIds?.length} squads)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tournament.matches.filter((m: any) => m.lobbyId === lobby.id).map((match: any) => (
                      <div key={match.id} className={`match-card rounded-xl p-4 ${match.status === "completed" ? "winner" : ""}`}>
                        <div className="flex justify-between mb-3"><span className="text-[10px] font-black text-yellow-400">Match {match.matchNumber}</span><span className="text-[10px] text-white/40">{match.map}</span></div>
                        {match.status === "completed" && match.results ? (
                          <div className="space-y-1 max-h-44 overflow-y-auto">
                            {match.results.slice(0, 10).map((r: any) => (
                              <div key={r.teamId} className={`flex justify-between text-xs py-1 px-2 rounded ${r.placement === 1 ? "bg-yellow-500/10" : ""}`}>
                                <span><span className={`w-5 inline-block text-center font-black ${r.placement === 1 ? "text-yellow-400" : "text-white/50"}`}>#{r.placement}</span> {r.teamName}</span>
                                <span><span className="text-red-400">{r.kills}K</span> <span className="text-yellow-400 font-bold ml-1">{r.totalPoints}pts</span></span>
                              </div>
                            ))}
                          </div>
                        ) : (<div className="py-4 text-center text-xs text-white/40">Awaiting results</div>)}
                        <button onClick={() => match.status !== "completed" && submitDemo(match.id)} disabled={match.status === "completed"} className={`w-full mt-3 py-2 text-xs font-bold rounded-lg transition ${match.status === "completed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30"}`}>
                          {match.status === "completed" ? "✓ Done" : "⚡ Generate Results"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {activeTab === "standings" && (
        <div className="fade-in-up">
          {leaderboard.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center"><Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" /><h3 className="font-bold text-lg mb-1">No results yet</h3><p className="text-white/50 text-sm">Submit match results to see standings</p></div>
          ) : (
            <div className="glass-heavy rounded-xl overflow-hidden border border-white/10">
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 flex items-center gap-3"><Trophy className="w-5 h-5 text-yellow-400" /><span className="font-display font-bold">Overall Standings</span></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-black/40 text-[10px] uppercase text-white/50"><tr><th className="p-3 text-left w-12">#</th><th className="p-3 text-left">Squad</th><th className="p-3 text-center">MP</th><th className="p-3 text-center">WWCD</th><th className="p-3 text-center">Kills</th><th className="p-3 text-center">Avg</th><th className="p-3 text-center">PP</th><th className="p-3 text-center">KP</th><th className="p-3 text-center text-yellow-300">Total</th></tr></thead>
                  <tbody>
                    {leaderboard.map((team: any, i: number) => (
                      <tr key={team.id} className={`border-t border-white/5 hover:bg-white/5 ${i < 3 ? ["bg-yellow-500/5","bg-gray-400/5","bg-orange-500/5"][i] : ""}`}>
                        <td className="p-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-orange-500 text-white" : "bg-white/10 text-white/50"}`}>{i === 0 ? "👑" : i + 1}</div></td>
                        <td className="p-3 font-bold">{team.name}</td>
                        <td className="p-3 text-center text-white/70">{team.matchesPlayed || 0}</td>
                        <td className="p-3 text-center text-yellow-400 font-bold">{team.wwcd || 0}</td>
                        <td className="p-3 text-center text-red-400 font-bold">{team.totalKills || 0}</td>
                        <td className="p-3 text-center text-white/70">{team.avgPlacement || "-"}</td>
                        <td className="p-3 text-center text-yellow-300">{team.placementPoints || 0}</td>
                        <td className="p-3 text-center text-red-300">{team.killPoints || 0}</td>
                        <td className="p-3 text-center"><span className="font-display font-black text-lg text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">{team.points || 0}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "teams" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 fade-in-up">
          {(tournament.teams || []).map((team: any) => (
            <div key={team.id} className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-black text-sm">{team.seed}</div>
                <div><div className="font-bold">{team.name}</div><div className="text-[10px] text-white/50">{team.lobby} · {team.tag}</div></div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-xs mb-3">
                <div><div className="text-yellow-400 font-black">{team.points||0}</div><div className="text-white/40">Pts</div></div>
                <div><div className="text-red-400 font-black">{team.totalKills||0}</div><div className="text-white/40">Kills</div></div>
                <div><div className="text-green-400 font-black">{team.wwcd||0}</div><div className="text-white/40">WWCD</div></div>
                <div><div className="text-white/70 font-black">{team.matchesPlayed||0}</div><div className="text-white/40">MP</div></div>
              </div>
              <div className="space-y-0.5 border-t border-white/5 pt-2">
                {(team.players||[]).map((p: any) => (<div key={p.id} className="flex justify-between text-xs"><span className="text-white/70">{p.ign}</span><span className="text-white/40">{p.role}</span></div>))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}