"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Eye, GitBranch, Users, ListChecks, Cpu } from "lucide-react";
import BracketTree from "@/components/BracketTree";
import StandingsTable from "@/components/StandingsTable";
import TeamsTable from "@/components/TeamsTable";
import MatchCard from "@/components/MatchCard";
import { getTournament } from "@/lib/storage";
import { calculateStandings } from "@/lib/bracket-engine";
import type { Tournament } from "@/types/tournament";

type TabType = "bracket" | "teams" | "standings" | "matches";

export default function BracketView() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("bracket");

  useEffect(() => {
    const load = () => {
      const t = getTournament(params.id as string);
      setTournament(t);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-purple-300">Tournament not found</p>
        <Link href="/" className="btn-primary">GO HOME</Link>
      </div>
    );
  }

  const isBracket = tournament.format === "single_elim" || tournament.format === "double_elim";
  const standings = calculateStandings(tournament);
  
  const tabs: {id: TabType; name: string; icon: any; show: boolean}[] = [
    { id: "bracket", name: "Bracket", icon: GitBranch, show: isBracket },
    { id: "standings", name: "Standings", icon: Trophy, show: !isBracket },
    { id: "teams", name: "Teams", icon: Users, show: true },
    { id: "matches", name: "Matches", icon: ListChecks, show: true }
  ].filter(t => t.show);

  return (
    <main className="min-h-screen">
      <div className="glass-heavy border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <Trophy className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-display text-2xl font-black gradient-text">{tournament.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Spectator Mode · Live Updates</span>
                </div>
              </div>
            </div>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-black text-sm">
                <span className="text-purple-400">TOURNA</span><span className="text-cyan-400">OPS</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 border-b border-purple-500/20 pb-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-display font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all relative ${
                activeTab === tab.id ? "text-cyan-400" : "text-purple-300 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "bracket" && isBracket && (
          <div className="glass rounded-3xl p-6">
            <BracketTree matches={tournament.matches} editable={false} />
          </div>
        )}
        {activeTab === "standings" && <StandingsTable standings={standings} />}
        {activeTab === "teams" && <TeamsTable teams={tournament.teams} />}
        {activeTab === "matches" && (
          <div className="glass-heavy rounded-3xl p-6 border-2 border-purple-500/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournament.matches.map(match => (
                <MatchCard key={match.id} match={match} editable={false} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-8 text-sm text-purple-300/60">
        Powered by <a href="https://tournaops.com" className="text-cyan-400 font-bold hover:text-white transition">Tournaops</a>
      </div>
    </main>
  );
}