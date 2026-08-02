"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, Trophy, Users, Zap, GitBranch, ListChecks, BarChart3,
  Trash2, Share2, Copy, Check, Sparkles
} from "lucide-react";
import { getTournamentById, updateMatchWinner, deleteTournament } from "@/lib/storage/tournaments";
import FullLeaderboard from "@/components/tournament/FullLeaderboard";
import MatchResultEntry from "@/components/tournament/MatchResultEntry";
import type { Tournament, Match, Team } from "@/types/tournament";

type Tab = "bracket" | "matches" | "teams" | "standings";

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("standings");
  const [copied, setCopied] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  useEffect(() => {
    const t = getTournamentById(params.id as string);
    if (!t) { router.push("/dashboard/tournaments"); return; }
    setTournament(t);
    // Default to bracket for elim formats
    if (t.format === "single_elim" || t.format === "double_elim") {
      setActiveTab("bracket");
    }
  }, [params.id, router]);

  if (!tournament) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSetWinner = (matchId: string, teamId: string) => {
    const updated = updateMatchWinner(tournament.id, matchId, teamId);
    if (updated) setTournament(updated);
  };

  const handleDelete = () => {
    if (!confirm("Delete this tournament?")) return;
    deleteTournament(tournament.id);
    router.push("/dashboard/tournaments");
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tournaments/${tournament.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBracket = tournament.format === "single_elim" || tournament.format === "double_elim";
  const completed = tournament.matches.filter(m => m.status === "completed").length;
  const total = tournament.matches.length;
  const standings = [...tournament.teams].sort((a, b) => b.points - a.points || b.wins - a.wins);

  const allTabs = [
    { id: "bracket" as Tab, name: "Bracket", icon: GitBranch, show: isBracket },
    { id: "standings" as Tab, name: "Standings", icon: BarChart3, show: true },
    { id: "matches" as Tab, name: "Matches", icon: ListChecks, show: true },
    { id: "teams" as Tab, name: "Teams", icon: Users, show: true },
  ];
  const tabs = allTabs.filter(t => t.show);

  return (
    <div className="max-w-7xl mx-auto">
      <Link href="/dashboard/tournaments" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      {/* Header */}
      <div className="glass-heavy rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${tournament.bannerColor || "from-indigo-500 to-purple-500"}`} />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-bold uppercase">{tournament.status}</span>
              <span className="text-xs text-white/60">{tournament.game}</span>
              <span className="text-xs text-white/60">{tournament.format.replace("_", " ")}</span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl mb-1">{tournament.name}</h1>
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {tournament.teams.length} teams</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> {completed}/{total} matches</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyShareLink} className="btn-ghost text-xs py-2 px-3">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={handleDelete} className="btn-ghost text-xs py-2 px-3 border-red-500/30 text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition relative ${
              activeTab === tab.id ? "text-cyan-400" : "text-white/60 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500" />
            )}
          </button>
        ))}
      </div>

      {/* Bracket Tab */}
      {activeTab === "bracket" && isBracket && (
        <BracketView matches={tournament.matches} onSetWinner={handleSetWinner} />
      )}

      {/* Standings Tab */}
      {activeTab === "standings" && (
        <FullLeaderboard tournament={tournament} />
      )}

      {/* Matches Tab */}
      {activeTab === "matches" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournament.matches.map(m => (
            <div key={m.id} className={`match-card rounded-xl p-4 ${m.status === "completed" ? "winner" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Match {m.matchNumber}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  m.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/50"
                }`}>
                  {m.status}
                </span>
              </div>

              {/* For bracket matches */}
              {m.team1 && m.team2 && (
                <>
                  <div
                    onClick={() => m.status !== "completed" && handleSetWinner(m.id, m.team1!.id)}
                    className={`flex justify-between p-2.5 rounded-lg mb-1 transition ${
                      m.winner?.id === m.team1?.id ? "bg-green-500/20 border border-green-500/50" :
                      m.status !== "completed" ? "bg-white/5 hover:bg-white/10 cursor-pointer" : "bg-white/5"
                    }`}
                  >
                    <span className="text-sm font-semibold">{m.team1.name}</span>
                    <span className="font-black">{m.score1}</span>
                  </div>
                  <div
                    onClick={() => m.status !== "completed" && handleSetWinner(m.id, m.team2!.id)}
                    className={`flex justify-between p-2.5 rounded-lg transition ${
                      m.winner?.id === m.team2?.id ? "bg-green-500/20 border border-green-500/50" :
                      m.status !== "completed" ? "bg-white/5 hover:bg-white/10 cursor-pointer" : "bg-white/5"
                    }`}
                  >
                    <span className="text-sm font-semibold">{m.team2.name}</span>
                    <span className="font-black">{m.score2}</span>
                  </div>
                </>
              )}

              {/* For BR matches */}
              {tournament.format === "battle_royale" && (
                <div>
                  {m.status === "completed" && m.results ? (
                    <div className="text-xs text-white/60">
                      {m.results.length} teams scored | Winner: {m.results.find(r => r.placement === 1)?.teamName}
                    </div>
                  ) : (
                    <div className="text-xs text-white/50">Click below to enter results</div>
                  )}
                </div>
              )}

              {/* Enter Results button */}
              <button
                onClick={() => setEditingMatch(m)}
                className="w-full mt-3 py-2 text-xs font-bold rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition"
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                {m.status === "completed" ? "Edit Results" : "Enter Results"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === "teams" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournament.teams.map(team => (
            <div key={team.id} className="glass rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black">
                  {team.seed}
                </div>
                <div>
                  <div className="font-display font-bold">{team.name}</div>
                  <div className="text-xs text-white/50">{team.players?.length || 0} players</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                <div><div className="text-green-400 font-black text-lg">{team.wins}</div><div className="text-white/50">W</div></div>
                <div><div className="text-red-400 font-black text-lg">{team.losses}</div><div className="text-white/50">L</div></div>
                <div><div className="text-red-400 font-black text-lg">{team.totalKills}</div><div className="text-white/50">K</div></div>
                <div><div className="text-cyan-400 font-black text-lg">{team.points}</div><div className="text-white/50">Pts</div></div>
              </div>
              {/* Player list */}
              {team.players && team.players.length > 0 && (
                <div className="space-y-1 border-t border-white/5 pt-3">
                  {team.players.map(p => (
                    <div key={p.id} className="flex justify-between text-xs">
                      <span className="text-white/70">{p.ign}</span>
                      <span className="text-white/40">{p.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Match Result Entry Modal */}
      {editingMatch && (
        <MatchResultEntry
          tournament={tournament}
          match={editingMatch}
          onSubmit={(updated) => { setTournament(updated); setEditingMatch(null); }}
          onClose={() => setEditingMatch(null)}
        />
      )}
    </div>
  );
}

function BracketView({ matches, onSetWinner }: { matches: Match[]; onSetWinner: (matchId: string, teamId: string) => void }) {
  const rounds: Record<number, Match[]> = {};
  matches.forEach(m => { if (!rounds[m.round]) rounds[m.round] = []; rounds[m.round].push(m); });
  const roundKeys = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max p-2">
        {roundKeys.map((r, idx) => (
          <div key={r} className="flex flex-col">
            <div className="text-center mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-black uppercase tracking-widest text-indigo-300">
                {r === roundKeys[roundKeys.length - 1] ? "Final" : `Round ${r}`}
              </span>
            </div>
            <div className="flex flex-col gap-4 justify-around flex-1" style={{ minHeight: `${Math.pow(2, idx) * 80}px` }}>
              {rounds[r].sort((a, b) => a.matchNumber - b.matchNumber).map(m => (
                <div key={m.id} className={`match-card rounded-xl p-3 min-w-[220px] ${m.status === "completed" ? "winner" : ""}`}>
                  <div className="text-[10px] font-black text-cyan-400 mb-2">M{m.matchNumber}</div>
                  <div
                    onClick={() => m.team1 && m.team2 && m.status !== "completed" && onSetWinner(m.id, m.team1.id)}
                    className={`flex justify-between p-2 rounded-lg mb-1 transition ${
                      m.winner?.id === m.team1?.id ? "bg-green-500/20 border border-green-500/50" :
                      m.team1 && m.team2 && m.status !== "completed" ? "bg-white/5 hover:bg-white/10 cursor-pointer" : "bg-white/5"
                    }`}
                  >
                    <span className="text-sm font-semibold truncate">{m.team1?.name || "TBD"}</span>
                    <span className="font-black text-sm">{m.score1}</span>
                  </div>
                  <div
                    onClick={() => m.team1 && m.team2 && m.status !== "completed" && onSetWinner(m.id, m.team2!.id)}
                    className={`flex justify-between p-2 rounded-lg transition ${
                      m.winner?.id === m.team2?.id ? "bg-green-500/20 border border-green-500/50" :
                      m.team1 && m.team2 && m.status !== "completed" ? "bg-white/5 hover:bg-white/10 cursor-pointer" : "bg-white/5"
                    }`}
                  >
                    <span className="text-sm font-semibold truncate">{m.team2?.name || "TBD"}</span>
                    <span className="font-black text-sm">{m.score2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}