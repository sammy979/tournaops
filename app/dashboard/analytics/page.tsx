"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Trophy, Users, Crosshair, Flame, Calendar, Award, Clock, Target } from "lucide-react";
import { getMyTournaments, getLeaderboard, getTopPlayers, getTournamentStats } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function AnalyticsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const t = await getMyTournaments();
        setTournaments(t || []);
      } catch { setTournaments([]); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  const totalTournaments = tournaments.length;
  const liveTournaments = tournaments.filter(t => t?.status === "live").length;
  const completedTournaments = tournaments.filter(t => t?.status === "completed").length;
  const totalTeams = tournaments.reduce((a, t) => a + (t?.teams?.length || 0), 0);
  const totalMatches = tournaments.reduce((a, t) => a + (t?.matches?.length || 0), 0);
  const completedMatches = tournaments.reduce((a, t) => a + (t?.matches?.filter(m => m?.status === "completed").length || 0), 0);
  const allKills = tournaments.reduce((a, t) => a + getLeaderboard(t).reduce((b, e) => b + (e.totalKills || 0), 0), 0);
  const totalPlayers = tournaments.reduce((a, t) => a + (t?.teams?.reduce((b, tm) => b + (tm?.players?.length || 0), 0) || 0), 0);

  const overallStats = [
    { label: "Total Tournaments", value: totalTournaments, icon: Trophy, color: "text-blue-400", bg: "bg-blue-500/10", sub: `${liveTournaments} live · ${completedTournaments} done` },
    { label: "Total Squads", value: totalTeams, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", sub: `${totalPlayers} players total` },
    { label: "Matches Done", value: completedMatches, icon: Target, color: "text-green-400", bg: "bg-green-500/10", sub: `of ${totalMatches} total` },
    { label: "Total Kills", value: allKills.toLocaleString(), icon: Crosshair, color: "text-red-400", bg: "bg-red-500/10", sub: "across all tournaments" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-500 mt-1">Performance overview across all your tournaments</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overallStats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-gray-500 text-sm mt-0.5">{s.label}</div>
              <div className="text-gray-700 text-xs mt-1">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {tournaments.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Data Yet</h3>
          <p className="text-gray-500">Create tournaments to see analytics.</p>
        </div>
      )}
    </div>
  );
}