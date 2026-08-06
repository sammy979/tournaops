"use client";
import TournamentStatusManager from "@/components/tournament/TournamentStatusManager";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft, Trophy, Users, MapPin, Play,
  BarChart3, Shield, Crosshair, Zap, Download,
  Edit, Eye, Award, Flame
} from "lucide-react";
import { getTournamentById, getLeaderboard, getTopPlayers, generateDemoResults, submitMatchResults } from "@/lib/storage/tournaments";
import { Tournament, Match, Team } from "@/types/tournament";

const TeamEditor = dynamic(() => import("@/components/tournament/TeamEditor"), { ssr: false });
const MatchResultEntry = dynamic(() => import("@/components/tournament/MatchResultEntry"), { ssr: false });
const FullLeaderboard = dynamic(() => import("@/components/tournament/FullLeaderboard"), { ssr: false });

type Tab = "overview" | "matches" | "standings" | "teams";

export default function TournamentDetailPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [showTeamEditor, setShowTeamEditor] = useState(false);
  const [showMatchEntry, setShowMatchEntry] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedMatchTeams, setSelectedMatchTeams] = useState<Team[]>([]);
  const [generatingDemo, setGeneratingDemo] = useState<string | null>(null);

  useEffect(() => {
    const id = params?.id as string;
    if (id) {
      const t = getTournamentById(id);
      t.then((resolved) => setTournament(resolved ?? null));
    }
    setLoading(false);
  }, [params?.id]);

  const handleDemoResult = async (matchId: string) => {
    if (!tournament) return;
    setGeneratingDemo(matchId);
    await new Promise(r => setTimeout(r, 600));
    const results = generateDemoResults(tournament, matchId);
    const updated = submitMatchResults(tournament.id, matchId, results);
    if (updated) updated.then((r: typeof updated extends Promise<infer U> ? U : updated) => setTournament((r as any) ?? null));
    setGeneratingDemo(null);
  };

  const handleEnterResults = (match: Match) => {
    if (!tournament) return;
    const lobby = tournament.rounds.flatMap(r => r.lobbies).find(l => l.matchIds.includes(match.id));
    const matchTeams = lobby
      ? tournament.teams.filter(t => lobby.teamIds.includes(t.id))
      : tournament.teams.slice(0, 16);
    setSelectedMatch(match);
    setSelectedMatchTeams(matchTeams);
    setShowMatchEntry(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Tournament not found</p>
        <Link href="/dashboard/tournaments" className="btn-primary mt-4 inline-block px-6 py-2">Back</Link>
      </div>
    );
  }

  const leaderboard = getLeaderboard(tournament);
  const { topKillers, topDamage } = getTopPlayers(tournament);
  const completedMatches = tournament.matches.filter(m => m.status === "completed").length;
  const totalMatches = tournament.matches.length;
  const progress = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "matches", label: "Matches", icon: Play },
    { key: "standings", label: "Standings", icon: Trophy },
    { key: "teams", label: "Teams", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/tournaments" className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${tournament.status === "live" ? "bg-green-500/20 text-green-400 border border-green-500/30" : tournament.status === "completed" ? "bg-gray-500/20 text-gray-400" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"}`}>
                {tournament.status === "draft" ? "Draft" : tournament.status === "live" ? "Live" : "Completed"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-sm flex-wrap">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{tournament.teams.length} squads</span>
              <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" />{completedMatches}/{totalMatches} matches</span>
              {tournament.prizePool && <span className="flex items-center gap-1.5 text-yellow-400"><Trophy className="w-3.5 h-3.5" />{tournament.prizePool}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowLeaderboard(true)} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
            <Download className="w-4 h-4" />Export
          </button>
          <button onClick={() => setShowTeamEditor(true)} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
            <Edit className="w-4 h-4" />Edit Squads
          </button>
          <Link href={`/tournaments/${tournament.slug}`} target="_blank" className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
            <Eye className="w-4 h-4" />Public View
          </Link>
        </div>
      </div>

      {totalMatches > 0 && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-medium">{progress}% ({completedMatches}/{totalMatches})</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}



      {/* Tournament Status Controls */}
      <TournamentStatusManager
        tournamentId={tournament.id}
        currentStatus={tournament.status}
        tournamentName={tournament.name}
        onUpdate={() => {
          getTournamentById(tournament.id).then((r) => setTournament((r as any) ?? null));
        }}
      />
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
            >
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Squads", value: tournament.teams.length, color: "blue", Icon: Users },
              { label: "Matches Played", value: `${completedMatches}/${totalMatches}`, color: "green", Icon: Play },
              { label: "Total Kills", value: leaderboard.reduce((a, e) => a + (e.totalKills || 0), 0), color: "red", Icon: Crosshair },
              { label: "Rounds", value: tournament.rounds.length, color: "purple", Icon: Award },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                  <stat.Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Crosshair className="w-4 h-4 text-red-400" />Top Killers</h3>
              {topKillers.length > 0 ? (
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
              ) : <p className="text-gray-600 text-sm">No match data yet</p>}
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" />Top Damage</h3>
              {topDamage.length > 0 ? (
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
              ) : <p className="text-gray-600 text-sm">No match data yet</p>}
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-purple-400" />Round Structure</h3>
            <div className="space-y-3">
              {tournament.rounds.map((round, idx) => {
                const roundMatches = tournament.matches.filter(m => m.roundId === round.id);
                const roundCompleted = roundMatches.filter(m => m.status === "completed").length;
                return (
                  <div key={round.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">{idx + 1}</div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{round.name}</p>
                      <p className="text-gray-500 text-xs">{round.lobbies.length} lobbies · {round.matchesPerLobby} matches each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">{roundCompleted}/{roundMatches.length}</p>
                      <p className="text-xs text-gray-600">done</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${roundCompleted === roundMatches.length && roundMatches.length > 0 ? "bg-green-400" : roundCompleted > 0 ? "bg-yellow-400" : "bg-gray-600"}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "matches" && (
        <div className="space-y-6">
          {tournament.rounds.map((round) => (
            <div key={round.id}>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />{round.name}
              </h3>
              {round.lobbies.map((lobby) => {
                const lobbyMatches = tournament.matches.filter(m => lobby.matchIds.includes(m.id));
                return (
                  <div key={lobby.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <h4 className="text-gray-300 font-medium text-sm">{lobby.name}</h4>
                      <span className="text-gray-600 text-xs">({lobby.teamIds.length} squads)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {lobbyMatches.map((match) => (
                        <div key={match.id} className={`glass-card rounded-xl p-4 border transition-all ${match.status === "completed" ? "border-green-500/20 bg-green-500/5" : "border-white/10 hover:border-white/20"}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-white font-semibold text-sm">{match.name}</p>
                              <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{match.map}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                              {match.status === "completed" ? "Done" : "Pending"}
                            </span>
                          </div>
                          {match.status === "completed" && match.results && match.results.length > 0 && (
                            <div className="mb-3 space-y-1">
                              {match.results.slice(0, 3).map((r, i) => (
                                <div key={r.teamId} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : "text-amber-600"}`}>#{r.placement}</span>
                                    <span className="text-gray-300 truncate max-w-[80px]">{r.teamName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-red-400">{r.kills}K</span>
                                    <span className="text-blue-400 font-bold">{r.totalPoints}pts</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => handleEnterResults(match)} className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                              <Edit className="w-3 h-3" />
                              {match.status === "completed" ? "Edit" : "Enter Results"}
                            </button>
                            <button
                              onClick={() => handleDemoResult(match.id)}
                              disabled={generatingDemo === match.id}
                              className="px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs transition-colors flex items-center gap-1 border border-yellow-500/20"
                            >
                              <Zap className="w-3 h-3" />
                              {generatingDemo === match.id ? "..." : "Demo"}
                            </button>
                          </div>
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

      {activeTab === "standings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Live Standings</h3>
            <button onClick={() => setShowLeaderboard(true)} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
              <Download className="w-4 h-4" />Export PNG / PDF
            </button>
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase">Rank</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase">Squad</th>
                    {tournament.matches.slice(0, 8).map((m, i) => (
                      <th key={m.id} className="text-center py-3 px-2 text-gray-600 font-medium text-xs">M{i+1}</th>
                    ))}
                    <th className="text-center py-3 px-4 text-gray-500 font-medium text-xs uppercase">Kills</th>
                    <th className="text-center py-3 px-4 text-gray-500 font-medium text-xs uppercase">Place</th>
                    <th className="text-center py-3 px-4 text-blue-400 font-bold text-xs uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr key={entry.teamId} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${entry.rank === 1 ? "bg-yellow-500/5" : entry.rank === 2 ? "bg-gray-400/5" : entry.rank === 3 ? "bg-amber-700/5" : ""}`}>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold ${entry.rank === 1 ? "text-yellow-400" : entry.rank === 2 ? "text-gray-300" : entry.rank === 3 ? "text-amber-600" : "text-gray-500"}`}>
                          {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank-1] : `#${entry.rank}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">{entry.teamName}</td>
                      {tournament.matches.slice(0, 8).map((m) => {
                        const r = entry.matchResults?.[m.id];
                        return (
                          <td key={m.id} className="py-3 px-2 text-center">
                            {r ? <span className="text-gray-300 font-mono text-xs">{r.totalPoints}</span> : <span className="text-gray-700 text-xs">—</span>}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center text-orange-400 font-mono font-bold">{entry.totalKills || 0}</td>
                      <td className="py-3 px-4 text-center text-blue-300 font-mono">{entry.placementPoints || 0}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono font-bold text-lg ${entry.rank <= 3 ? "text-yellow-400" : "text-white"}`}>{entry.totalPoints}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No results yet. Enter match results to see standings.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "teams" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">{tournament.teams.length} Squads</h3>
            <button onClick={() => setShowTeamEditor(true)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              <Edit className="w-4 h-4" />Edit All Squads
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tournament.teams.map((team) => (
              <div key={team.id} className="glass-card rounded-xl p-5 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10 overflow-hidden">
                    {(team as any).logo ? (
                      <img src={(team as any).logo} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-white">{team.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{team.name}</h4>
                    <p className="text-gray-500 text-xs">{team.players.length} players</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {team.players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-gray-600" />
                        <span className="text-gray-300">{player.name}</span>
                      </div>
                      {player.role && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${player.role === "IGL" ? "bg-purple-500/20 text-purple-400" : player.role === "Fragger" ? "bg-red-500/20 text-red-400" : player.role === "Sniper" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}>
                          {player.role}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTeamEditor && (
        <TeamEditor
          tournament={tournament}
          onClose={() => setShowTeamEditor(false)}
          onSave={(updated) => { const handle = (r: any) => setTournament(r ?? null); if (updated && typeof (updated as any).then === "function") { (updated as any).then(handle); } else { handle(updated); } setShowTeamEditor(false); }}
        />
      )}

      {showMatchEntry && selectedMatch && (
        <MatchResultEntry
          tournament={tournament}
          match={selectedMatch}
          teams={selectedMatchTeams}
          onClose={() => { setShowMatchEntry(false); setSelectedMatch(null); }}
          onSave={(updated) => { const handle = (r: any) => setTournament(r ?? null); if (updated && typeof (updated as any).then === "function") { (updated as any).then(handle); } else { handle(updated); } setShowMatchEntry(false); setSelectedMatch(null); }}
        />
      )}

      {showLeaderboard && (
        <FullLeaderboard
          tournament={tournament}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}