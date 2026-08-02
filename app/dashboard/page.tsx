"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Users, Zap, Plus, Sparkles, ArrowRight, Rocket, BarChart3 } from "lucide-react";

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const u = localStorage.getItem("tournaops_current_user");
      if (u) setUser(JSON.parse(u));
      
      const t = localStorage.getItem("tournaops_tournaments");
      if (t) {
        const all = JSON.parse(t);
        const current = JSON.parse(u || "{}");
        setTournaments(all.filter((x: any) => x.createdBy === current?.id));
      }
    } catch {}
  }, []);

  const totalSquads = tournaments.reduce((a: number, t: any) => a + (t.totalSlots || t.teams?.length || 0), 0);
  const completedMatches = tournaments.reduce((a: number, t: any) => a + (t.matches?.filter((m: any) => m.status === "completed")?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-in-up">
        <h1 className="font-display font-black text-2xl md:text-3xl mb-2">
          Welcome back{user ? `, ${user.displayName}` : ""}
        </h1>
        <p className="text-white/60 text-sm">PUBG Mobile Tournament Command Center</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Trophy, label: "Tournaments", value: tournaments.length, color: "from-yellow-500 to-orange-500" },
          { icon: Users, label: "Total Squads", value: totalSquads, color: "from-indigo-500 to-purple-500" },
          { icon: Zap, label: "Matches Done", value: completedMatches, color: "from-pink-500 to-red-500" },
          { icon: BarChart3, label: "Total Players", value: totalSquads * 4, color: "from-cyan-500 to-blue-500" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4 border border-white/5 card-3d">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="font-display font-black text-2xl">{stat.value}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="glass-heavy neon-border rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-yellow-500/30 mb-3 text-xs font-bold text-yellow-300">
              <Sparkles className="w-3.5 h-3.5" /> PUBG Mobile
            </div>
            <h2 className="font-display font-black text-xl md:text-2xl mb-1">Create PUBG Mobile Tournament</h2>
            <p className="text-white/60 text-sm">16 to 400 squads. PMGC scoring. Lobbies & rounds. Ready in 2 minutes.</p>
          </div>
          <Link href="/dashboard/tournaments/create" className="btn-primary whitespace-nowrap inline-flex items-center gap-2" style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>
            <Plus className="w-4 h-4" /> Create Tournament
          </Link>
        </div>
      </div>

      {/* Recent tournaments */}
      {tournaments.length > 0 ? (
        <div>
          <h3 className="font-display font-bold text-lg mb-3">Recent Tournaments</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tournaments.slice(0, 6).map((t: any) => (
              <Link key={t.id} href={`/dashboard/tournaments/${t.id}`} className="glass rounded-xl p-4 border border-white/5 hover:border-white/20 transition card-3d group">
                <div className={`h-16 rounded-lg bg-gradient-to-r ${t.bannerColor || "from-yellow-500 to-orange-500"} mb-3 flex items-end p-3`}>
                  <span className="px-2 py-0.5 rounded bg-black/50 text-[10px] font-bold uppercase">{t.status}</span>
                </div>
                <h4 className="font-bold truncate group-hover:text-yellow-400 transition">{t.name}</h4>
                <div className="flex gap-3 text-xs text-white/50 mt-1">
                  <span>{t.totalSlots || t.teams?.length} squads</span>
                  <span>{t.matches?.length || 0} matches</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 md:p-12 text-center border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="font-display font-bold text-xl mb-2">No tournaments yet</h3>
          <p className="text-white/60 text-sm mb-6">Create your first PUBG Mobile tournament</p>
          <Link href="/dashboard/tournaments/create" className="btn-primary inline-flex items-center gap-2" style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>
            <Plus className="w-4 h-4" /> Create Tournament
          </Link>
        </div>
      )}
    </div>
  );
}