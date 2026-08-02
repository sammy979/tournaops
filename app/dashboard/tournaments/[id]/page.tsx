"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, Trophy, Users, Zap, GitBranch, ListChecks, BarChart3,
  Trash2, Share2, Copy, Check, Play, RotateCcw, Sparkles
} from "lucide-react";
import { getTournamentById, updateMatchWinner, deleteTournament, saveTournament } from "@/lib/storage/tournaments";
import type { Tournament, Match, Team } from "@/types/tournament";

type Tab = "bracket" | "matches" | "teams" | "standings";

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("bracket");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = getTournamentById(params.id as string);
    if (!t) {
      router.push("/dashboard/tournaments");
      return;
    }
    setTournament(t);
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
    const url = `${window.location.origin}/tournaments/${tournament.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBracket = tournament.format === "single_elim" || tournament.format === "double_elim";
  const completedMatches = tournament.matches.filter(m => m.status === "completed").length;
  const totalMatches = tournament.matches.length;
  
  // Sort teams by points for standings
  const standings = [...tournament.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });

  const tabs = [
    { id: "bracket" as Tab, name: "Bracket", icon: GitBranch, show: isBracket },
    { id: "standings" as Tab, name: "Standings", icon: BarChart3, show: !isBracket || completedMatches > 0 },
    { id: "matches" as Tab, name: "All Matches", icon: ListChecks, show: true },
    { id: "teams" as Tab, name: "Teams", icon: Users, show: true },
  ].filter(t => t.show);

  return (
    <div className="max-w-7xl mx-auto">
      <Link href="/dashboard/tournaments" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      {/* Header */}
      <div className="glass-heavy rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-30 bg-gradient-to-r ${tournament.bannerColor || "from-indigo-500 to-purple-500"}`}></div>
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-bold uppercase backdrop-blur-md">
                {tournament.status}
              </span>
              <span className="text-xs text-white/60">{tournament.game}</span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-4xl mb-1">{tournament.name}</h1>
            <p className="text-white/70 text-sm">{tournament.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {tournament.teams.length} teams</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> {completedMatches}/{totalMatches} matches</span>
              <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {tournament.format.replace("_", " ")}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyShareLink} className="btn-ghost text-xs py-2 px-3">
              {copied ? <><Check className="w-3.5 h-3.5 mr-1" /> Copied</> : <><Share2 className="w-3.5 h-3.5 mr-1" /> Share</>}
            </button>
            <button onClick={handleDelete} className="btn-ghost text-xs py-2 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10">
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
            className={`px-5 py-3 font-semibold text-sm whitespace-nowrap transition relative ${
              activeTab === tab.id ? "text-cyan-400" : "text-white/60 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "bracket" && isBracket && <BracketView matches={tournament.matches} onSetWinner={handleSetWinner} />}
      {activeTab === "matches" && <MatchesGrid matches={tournament.matches} onSetWinner={handleSetWinner} />}
      {activeTab === "teams" && <TeamsGrid teams={tournament.teams} />}
      {activeTab === "standings" && <StandingsTable standings={standings} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BRACKET VIEW
// ═══════════════════════════════════════════════════════════════
function BracketView({ matches, onSetWinner }: { matches: Match[]; onSetWinner: (matchId: string, teamId: string) => void }) {
  const rounds: Record<number, Match[]> = {};
  matches.forEach(m => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });
  const roundKeys = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max p-2">
        {roundKeys.map(r => (
          <div key={r} className="flex flex-col">
            <div className="text-center mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
                  {r === roundKeys[roundKeys.length - 1] ? "🏆 Final" : `Round ${r}`}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4 justify-around flex-1" style={{minHeight: `${Math.pow(2, roundKeys.indexOf(r)) * 80}px`}}>
              {rounds[r].sort((a, b) => a.matchNumber - b.matchNumber).map(m => (
                <MatchCard key={m.id} match={m} onSetWinner={onSetWinner} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MATCH CARD
// ═══════════════════════════════════════════════════════════════
function MatchCard({ match, onSetWinner }: { match: Match; onSetWinner: (matchId: string, teamId: string) => void }) {
  const isWinner1 = match.winner?.id === match.team1?.id;
  const isWinner2 = match.winner?.id === match.team2?.id;
  const isComplete = match.status === "completed";
  const canPlay = match.team1 && match.team2 && !isComplete;

  return (
    <div className={`match-card rounded-xl p-3 min-w-[240px] ${isComplete ? "winner" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
          Match {match.matchNumber}
        </span>
        <span className="text-[10px] font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded-full">
          BO{match.bestOf}
        </span>
      </div>

      {/* Team 1 */}
      <div
        onClick={() => canPlay && match.team1 && onSetWinner(match.id, match.team1.id)}
        className={`flex items-center justify-between p-2.5 rounded-lg mb-1 transition ${
          isWinner1 
            ? "bg-green-500/20 border border-green-500/50" 
            : canPlay ? "bg-white/5 hover:bg-white/10 cursor-pointer" : "bg-white/5"
        }`}
      >
        <span className={`text-sm font-semibold truncate ${!match.team1 ? "text-white/30 italic" : ""}`}>
          {match.team1?.name || "TBD"}
        </span>
        <span className={`text-lg font-black ${isWinner1 ? "text-green-400" : "text-white/40"}`}>
          {match.score1}
        </span>
      </div>

      {/* Team 2 */}
      <div
        onClick={() => canPlay && match.team2 && onSetWinner(match.id, match.team2.id)}
        className={`flex items-center justify-between p-2.5 rounded-lg transition ${
          isWinner2 
            ? "bg-green-500/20 border border-green-500/50" 
            : canPlay ? "bg-white/5 hover:bg-white/10 cursor-pointer" : "bg-white/5"
        }`}
      >
        <span className={`text-sm font-semibold truncate ${!match.team2 ? "text-white/30 italic" : ""}`}>
          {match.team2?.name || "TBD"}
        </span>
        <span className={`text-lg font-black ${isWinner2 ? "text-green-400" : "text-white/40"}`}>
          {match.score2}
        </span>
      </div>

      {canPlay && (
        <div className="mt-2 text-[10px] text-center text-cyan-400/60">
          Click a team to set winner
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MATCHES GRID
// ═══════════════════════════════════════════════════════════════
function MatchesGrid({ matches, onSetWinner }: { matches: Match[]; onSetWinner: (matchId: string, teamId: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map(m => (
        <MatchCard key={m.id} match={m} onSetWinner={onSetWinner} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TEAMS GRID
// ═══════════════════════════════════════════════════════════════
function TeamsGrid({ teams }: { teams: Team[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team, i) => (
        <div key={team.id} className="glass rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black">
              {team.seed}
            </div>
            <div>
              <div className="font-display font-bold">{team.name}</div>
              <div className="text-xs text-white/50">Seed #{team.seed}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-green-400 font-black text-lg">{team.wins}</div>
              <div className="text-white/50">Wins</div>
            </div>
            <div>
              <div className="text-red-400 font-black text-lg">{team.losses}</div>
              <div className="text-white/50">Losses</div>
            </div>
            <div>
              <div className="text-cyan-400 font-black text-lg">{team.points}</div>
              <div className="text-white/50">Pts</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STANDINGS TABLE
// ═══════════════════════════════════════════════════════════════
function StandingsTable({ standings }: { standings: Team[] }) {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/5">
      <div className="p-5 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Live Standings
        </h3>
      </div>
      <table className="w-full">
        <thead className="bg-black/30">
          <tr className="text-xs uppercase text-white/50">
            <th className="p-3 text-left">Rank</th>
            <th className="p-3 text-left">Team</th>
            <th className="p-3 text-center">W</th>
            <th className="p-3 text-center">L</th>
            <th className="p-3 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, i) => (
            <tr key={team.id} className={`border-t border-white/5 ${i < 3 ? "bg-yellow-500/5" : ""}`}>
              <td className="p-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                  i === 0 ? "bg-yellow-500 text-black" :
                  i === 1 ? "bg-gray-400 text-black" :
                  i === 2 ? "bg-orange-500 text-white" :
                  "bg-white/10 text-white/70"
                }`}>
                  {i + 1}
                </div>
              </td>
              <td className="p-3 font-bold">{team.name}</td>
              <td className="p-3 text-center text-green-400 font-black">{team.wins}</td>
              <td className="p-3 text-center text-red-400 font-black">{team.losses}</td>
              <td className="p-3 text-center text-cyan-400 font-black text-lg">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}