"use client";

import { useRouter } from "next/navigation";
import AdminShell from "@/components/ui/AdminShell";
import {
  Users,
  Trophy,
  CreditCard,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Globe,
  Clock,
  BarChart2,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Users",        value: "2,847",  change: "+124 this week",  trend: "up",   icon: Users,      color: "bg-violet-500/15 text-violet-400",  border: "border-violet-500/20" },
  { label: "Active Tournaments", value: "38",      change: "+5 this month",   trend: "up",   icon: Trophy,     color: "bg-amber-500/15 text-amber-400",    border: "border-amber-500/20"  },
  { label: "Revenue (MTD)",      value: "$14,280", change: "+18% vs last mo", trend: "up",   icon: CreditCard, color: "bg-emerald-500/15 text-emerald-400", border: "border-emerald-500/20"},
  { label: "Error Rate",         value: "0.12%",   change: "-0.04% today",    trend: "down", icon: Activity,   color: "bg-rose-500/15 text-rose-400",       border: "border-rose-500/20"   },
];

const RECENT_USERS = [
  { id: "u1", name: "ShadowX",     email: "shadow@email.com", plan: "Pro",   status: "active",   joined: "2h ago"   },
  { id: "u2", name: "ProStrike",   email: "pro@email.com",    plan: "Free",  status: "active",   joined: "5h ago"   },
  { id: "u3", name: "GhostRider",  email: "ghost@email.com",  plan: "Pro",   status: "active",   joined: "12h ago"  },
  { id: "u4", name: "ThunderBolt", email: "thunder@email.com",plan: "Free",  status: "suspended",joined: "1d ago"   },
  { id: "u5", name: "DarkMatter",  email: "dark@email.com",   plan: "Pro+",  status: "active",   joined: "2d ago"   },
];

const RECENT_PAYMENTS = [
  { id: "p1", user: "ShadowX",     plan: "Pro Monthly",   amount: "$19.99", status: "success",  time: "2h ago"  },
  { id: "p2", user: "GhostRider",  plan: "Pro Annual",    amount: "$179",   status: "success",  time: "8h ago"  },
  { id: "p3", user: "StarBlast",   plan: "Pro Monthly",   amount: "$19.99", status: "failed",   time: "12h ago" },
  { id: "p4", user: "DarkMatter",  plan: "Pro+ Monthly",  amount: "$49.99", status: "success",  time: "1d ago"  },
  { id: "p5", user: "Inferno",     plan: "Pro Monthly",   amount: "$19.99", status: "refunded", time: "2d ago"  },
];

const SYSTEM_HEALTH = [
  { service: "API Gateway",       status: "healthy",  latency: "12ms",  uptime: "99.98%" },
  { service: "Database",          status: "healthy",  latency: "3ms",   uptime: "99.99%" },
  { service: "Discord Bot",       status: "healthy",  latency: "45ms",  uptime: "99.95%" },
  { service: "AI Service",        status: "degraded", latency: "890ms", uptime: "98.12%" },
  { service: "Payment Gateway",   status: "healthy",  latency: "220ms", uptime: "99.97%" },
  { service: "Media CDN",         status: "healthy",  latency: "28ms",  uptime: "100%"   },
];

const ALERTS = [
  { type: "warning", message: "AI service latency elevated — investigating", time: "23m ago" },
  { type: "info",    message: "Scheduled maintenance window: Jul 20, 02:00–04:00 UTC", time: "1h ago" },
  { type: "error",   message: "Payment failure spike: 3 failed in 10min", time: "12h ago" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ServiceDot({ status }: { status: string }) {
  return (
    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
      status === "healthy"  ? "bg-emerald-400" :
      status === "degraded" ? "bg-amber-400 animate-pulse" :
      "bg-rose-400 animate-pulse"
    }`} />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const router = useRouter();

  return (
    <AdminShell>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
          <p className="text-white/40 text-sm mt-0.5">Platform health, users, and revenue at a glance</p>
        </div>

        {/* Alerts */}
        {ALERTS.length > 0 && (
          <div className="space-y-2 mb-6">
            {ALERTS.map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
                alert.type === "error"   ? "bg-rose-500/[0.08] border-rose-500/20 text-rose-300" :
                alert.type === "warning" ? "bg-amber-500/[0.08] border-amber-500/20 text-amber-300" :
                "bg-blue-500/[0.08] border-blue-500/20 text-blue-300"
              }`}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{alert.message}</span>
                <span className="text-white/30 text-xs flex-shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STATS.map((stat) => (
            <div key={stat.label} className={`bg-[#0f1117] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${stat.color} ${stat.border}`}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
                {stat.trend === "up"
                  ? <TrendingUp   className="w-4 h-4 text-emerald-400" />
                  : <TrendingDown className="w-4 h-4 text-rose-400" />
                }
              </div>
              <p className="text-2xl font-black text-white mb-0.5">{stat.value}</p>
              <p className="text-white/40 text-xs">{stat.label}</p>
              <p className={`text-xs mt-1 ${stat.trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Users */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-white font-semibold">Recent Users</h2>
                <button onClick={() => router.push("/admin/users")} className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 transition-colors">
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {RECENT_USERS.map((user, i) => (
                <div key={user.id} className={`flex items-center gap-3 px-5 py-3 ${i < RECENT_USERS.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}>
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white/60 flex-shrink-0">
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{user.name}</p>
                    <p className="text-white/30 text-xs truncate">{user.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${user.plan === "Pro+" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : user.plan === "Pro" ? "bg-violet-500/15 text-violet-400 border-violet-500/20" : "bg-white/[0.04] text-white/30 border-white/[0.08]"}`}>
                      {user.plan}
                    </span>
                    <p className="text-white/20 text-xs mt-0.5">{user.joined}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-white font-semibold">Recent Payments</h2>
                <button onClick={() => router.push("/admin/payments")} className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 transition-colors">
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {RECENT_PAYMENTS.map((p, i) => (
                <div key={p.id} className={`flex items-center gap-3 px-5 py-3 ${i < RECENT_PAYMENTS.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === "success" ? "bg-emerald-400" : p.status === "failed" ? "bg-rose-400" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.user}</p>
                    <p className="text-white/30 text-xs truncate">{p.plan}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${p.status === "failed" ? "text-rose-400 line-through opacity-50" : p.status === "refunded" ? "text-amber-400" : "text-emerald-400"}`}>{p.amount}</p>
                    <p className="text-white/20 text-xs">{p.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-white font-semibold">System Health</h2>
                <button onClick={() => router.push("/admin/system-health")} className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 transition-colors">
                  Details <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {SYSTEM_HEALTH.map((svc, i) => (
                <div key={svc.service} className={`flex items-center gap-3 px-5 py-3 ${i < SYSTEM_HEALTH.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                  <ServiceDot status={svc.status} />
                  <span className="text-white text-sm flex-1 min-w-0 truncate">{svc.service}</span>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white/50 text-xs font-mono">{svc.latency}</p>
                    <p className="text-white/25 text-xs">{svc.uptime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}