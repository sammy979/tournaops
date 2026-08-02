"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy, Plus, Play, Users, Crosshair,
  ArrowRight, Zap, TrendingUp, Clock, Monitor
} from "lucide-react";
import { getMyTournaments, getTournamentStats } from "@/lib/storage/tournaments";
import { getCurrentUser } from "@/lib/auth/auth";
import { Tournament } from "@/types/tournament";

export default function DashboardPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    setTournaments(getMyTournaments());
  }, []);

  const totalTournaments = tournaments.length;
  const liveTournaments = tournaments.filter(t => t.status === "live").length;
  const totalTeams = tournaments.reduce((a, t) => a + t.teams.length, 0);
  const totalMatches = tournaments.reduce((a, t) => a + t.matches.filter(m => m.status === "completed").length, 0);

  const recent = tournaments.slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {greeting()}, {user?.displayName || user?.username || "Organizer"} 👋
          </h1>
          <p className="text-gray-400 mt-1">
            {totalTournaments === 0
              ? "Create your first tournament to get started"
              : `You have ${totalTournaments} tournament${totalTournaments !== 1 ? "s" : ""} · ${liveTournaments > 0 ? `${liveTournaments} live` : "none live"}`
            }
          </p>
        </div>
        <Link href="/dashboard/tournaments/create" className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <Plus className="w-4 h-4" />
          New Tournament
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tournaments", value: totalTournaments, icon: Trophy, color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-400", border: "border-blue-500/20" },
          { label: "Live Now", value: liveTournaments, icon: Play, color: "from-green-500/20 to-green-600/10", iconColor: "text-green-400", border: "border-green-500/20" },
          { label: "Total Squads", value: totalTeams, icon: Users, color: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-400", border: "border-purple-500/20" },
          { label: "Matches Done", value: totalMatches, icon: Crosshair, color: "from-orange-500/20 to-orange-600/10", iconColor: "text-orange-400", border: "border-orange-500/20" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`stat-card border ${stat.border} bg-gradient-to-br ${stat.color}`}>
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                {stat.label === "Live Now" && liveTournaments > 0 && (
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                )}
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href: "/dashboard/tournaments/create",
            icon: Plus,
            title: "Create Tournament",
            desc: "Set up a new PUBG Mobile tournament in minutes",
            color: "blue",
          },
          {
            href: "/dashboard/overlay",
            icon: Monitor,
            title: "OBS Overlay",
            desc: "Add live leaderboard to your stream",
            color: "purple",
          },
          {
            href: "/dashboard/tournaments",
            icon: Trophy,
            title: "View All",
            desc: "Manage your tournaments and results",
            color: "green",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="glass-card-hover rounded-xl p-5 flex items-start gap-4 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-${action.color}-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 text-${action.color}-400`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold text-sm">{action.title}</h3>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{action.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Tournaments */}
      {recent.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Recent Tournaments
            </h2>
            <Link href="/dashboard/tournaments" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((t) => {
              const stats = getTournamentStats(t);
              return (
                <Link
                  key={t.id}
                  href={`/dashboard/tournaments/${t.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Trophy className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{t.name}</p>
                      <span className={`badge ${t.status === "live" ? "badge-live" : t.status === "completed" ? "badge-completed" : "badge-draft"}`}>
                        {t.status === "live" ? "● Live" : t.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {t.teams.length} squads · {stats.completedMatches}/{stats.totalMatches} matches · {stats.progress}% done
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    {stats.leader !== "TBD" && (
                      <p className="text-yellow-400 text-xs font-medium">🥇 {stats.leader}</p>
                    )}
                    <p className="text-gray-600 text-xs">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-white text-xl font-bold mb-2">No Tournaments Yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Create your first PUBG Mobile tournament and start managing matches, teams, and standings.
          </p>
          <Link href="/dashboard/tournaments/create" className="btn-primary px-6 py-2.5">
            <Plus className="w-4 h-4" />
            Create First Tournament
          </Link>
        </div>
      )}
    </div>
  );
}
