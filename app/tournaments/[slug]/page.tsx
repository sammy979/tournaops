"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Command, Trophy, Users, Zap, Eye, ExternalLink } from "lucide-react";
import { getTournamentBySlug } from "@/lib/storage/tournaments";
import type { Tournament, Match, Team } from "@/types/tournament";

export default function PublicTournamentPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const load = () => {
      const t = getTournamentBySlug(params.slug as string);
      setTournament(t);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [params.slug]);

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60">Tournament not found</p>
        <Link href="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const standings = [...tournament.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.wins - a.wins;
  });

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-br ${tournament.bannerColor || "from-indigo-500 to-purple-500"} py-16 px-4`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="live-badge">Live · Spectator Mode</div>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl mb-2">{tournament.name}</h1>
          <p className="text-lg text-white/80 mb-4">{tournament.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur">{tournament.game}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {tournament.teams.length} Teams</span>
            <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> {tournament.matches.filter(m => m.status === "completed").length}/{tournament.matches.length} Matches</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* Standings */}
        <div className="md:col-span-2">
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Standings
          </h2>
          <div className="glass rounded-2xl overflow-hidden border border-white/5">
            <table className="w-full">
              <thead className="bg-black/30 text-xs uppercase text-white/50">
                <tr>
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
        </div>

        {/* Recent Matches */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" /> Recent Matches
          </h2>
          <div className="space-y-2">
            {tournament.matches.filter(m => m.status === "completed").slice(0, 8).map(m => (
              <div key={m.id} className="glass rounded-xl p-3 border border-white/5">
                <div className="text-[10px] text-white/50 mb-1">Match {m.matchNumber}</div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className={m.winner?.id === m.team1?.id ? "font-bold text-green-400" : ""}>{m.team1?.name}</span>
                  <span className="font-black">{m.score1}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={m.winner?.id === m.team2?.id ? "font-bold text-green-400" : ""}>{m.team2?.name}</span>
                  <span className="font-black">{m.score2}</span>
                </div>
              </div>
            ))}
            {tournament.matches.filter(m => m.status === "completed").length === 0 && (
              <div className="text-center text-white/50 text-sm py-8">No matches played yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center py-8 text-sm text-white/40">
        Powered by <Link href="/" className="text-cyan-400 hover:text-white font-bold">TournaOps</Link>
      </div>
    </main>
  );
}