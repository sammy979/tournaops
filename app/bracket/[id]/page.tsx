"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Eye } from "lucide-react";
import BracketTree from "@/components/BracketTree";
import StandingsTable from "@/components/StandingsTable";
import { getTournament } from "@/lib/storage";
import { calculateStandings } from "@/lib/bracket-engine";
import type { Tournament } from "@/types/tournament";

export default function BracketView() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const load = () => {
      const t = getTournament(params.id as string);
      setTournament(t);
    };
    load();
    // Auto-refresh every 5s for live updates
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-purple-300">Tournament not found or loading...</p>
        <Link href="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const isBracket = tournament.format === "single_elim" || tournament.format === "double_elim";
  const standings = calculateStandings(tournament);

  return (
    <main className="min-h-screen grid-bg">
      <div className="glass border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black">{tournament.name}</h1>
                <p className="text-xs text-purple-300 uppercase tracking-wider">
                  {tournament.game} · {tournament.teamCount} teams · <Eye className="w-3 h-3 inline" /> Spectator Mode
                </p>
              </div>
            </div>
            <Link href="/" className="btn-ghost text-sm">TryWebPulse AI Brackets</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isBracket ? (
          <div className="glass rounded-2xl p-4">
            <BracketTree matches={tournament.matches} editable={false} />
          </div>
        ) : (
          <div className="space-y-6">
            <StandingsTable standings={standings} />
          </div>
        )}
      </div>

      <div className="text-center py-6 text-sm text-purple-300/60">
        Powered by <a href="https://trywebpulseai.com" className="text-purple-400 hover:text-white">TryWebPulse AI</a> Bracket Maker
      </div>
    </main>
  );
}