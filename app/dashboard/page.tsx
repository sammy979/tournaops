"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Users, BarChart3, Plus, Sparkles, Zap, ArrowRight, Rocket } from "lucide-react";
import { getCurrentUser, type User } from "@/lib/auth/auth";

export default function DashboardHome() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8 fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <div className="live-badge">Live</div>
          <span className="text-xs text-white/50">Dashboard v1.0</span>
        </div>
        <h1 className="font-display font-black text-3xl md:text-4xl mb-2">
          Welcome back, <span className="gradient-text">{user.displayName}</span>
        </h1>
        <p className="text-white/60">Ready to run your next tournament?</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
        {[
          { icon: Trophy, label: "Tournaments", value: "0", color: "from-indigo-500 to-purple-500" },
          { icon: Users, label: "Teams", value: "0", color: "from-purple-500 to-pink-500" },
          { icon: Zap, label: "Live Matches", value: "0", color: "from-pink-500 to-orange-500" },
          { icon: BarChart3, label: "Total Views", value: "0", color: "from-cyan-500 to-blue-500" }
        ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-white/5 hover:border-white/20 transition card-3d">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="font-display font-black text-2xl mb-1">{stat.value}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main CTA */}
      <div className="glass-heavy neon-border rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-cyan-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">GET STARTED</span>
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl mb-2">
              Create Your First Tournament
            </h2>
            <p className="text-white/60 max-w-lg">
              Setup takes less than 2 minutes. Choose from 4 formats, invite teams, and launch instantly.
            </p>
          </div>
          <Link href="/dashboard/tournaments/create" className="btn-primary text-base px-6 py-3.5 whitespace-nowrap inline-flex items-center gap-2 self-start">
            <Plus className="w-4 h-4" />
            Create Tournament
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {[
          { href: "/dashboard/tournaments/create", icon: Plus, title: "New Tournament", desc: "Start a fresh tournament", color: "from-indigo-500 to-purple-500" },
          { href: "/dashboard/tournaments", icon: Trophy, title: "My Tournaments", desc: "View & manage all", color: "from-purple-500 to-pink-500" },
          { href: "/dashboard/organization", icon: Users, title: "Team Management", desc: "Invite staff & referees", color: "from-cyan-500 to-blue-500" }
        ].map((action, i) => (
          <Link 
            key={i} 
            href={action.href}
            className="glass rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all card-3d group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
              <action.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-display font-bold text-lg mb-1">{action.title}</h3>
            <p className="text-sm text-white/60">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Empty state / recent activity */}
      <div className="mt-8 glass rounded-2xl p-8 md:p-12 border border-white/5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
          <Rocket className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="font-display font-bold text-xl mb-2">No tournaments yet</h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          Your tournaments will appear here. Create your first one to see live stats, teams, and results.
        </p>
        <Link href="/dashboard/tournaments/create" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Your First Tournament
        </Link>
      </div>
    </div>
  );
}