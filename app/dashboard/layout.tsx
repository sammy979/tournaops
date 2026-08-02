"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Trophy, Plus, Settings,
  LogOut, Menu, X, Monitor, ChevronRight,
  Zap, BarChart3, Users, Clock, DollarSign,
  Calendar, MessageSquare, Palette, Crown, Shield, Sparkles
} from "lucide-react";
import { fetchCurrentUser, logoutUser } from "@/lib/auth/auth";

const NAV_SECTIONS = [
  { label: "Main", items: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  ]},
  { label: "Tournaments", items: [
    { href: "/dashboard/tournaments", icon: Trophy, label: "My Tournaments" },
    { href: "/dashboard/tournaments/create", icon: Plus, label: "Create New" },
    { href: "/dashboard/registrations", icon: Users, label: "Registrations" },
  ]},
  { label: "Broadcast", items: [
    { href: "/dashboard/overlay", icon: Monitor, label: "OBS Overlay" },
    { href: "/dashboard/timer", icon: Clock, label: "Match Timer" },
    { href: "/dashboard/discord", icon: MessageSquare, label: "Discord" },
  ]},
  { label: "Manage", items: [
    { href: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
    { href: "/dashboard/prizes", icon: DollarSign, label: "Prize Tracker" },
    { href: "/dashboard/branding", icon: Palette, label: "Branding" },
      { href: "/dashboard/scoring", icon: Sparkles, label: "Scoring Systems" },
  ]},
  { label: "Account", items: [
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]},
];

// Admin-only section (only shown to admins)
const ADMIN_SECTION = {
  label: "Admin",
  items: [
    { href: "/admin", icon: Crown, label: "Admin Panel" },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const u = await fetchCurrentUser();
      if (!u) { router.replace("/login"); return; }
      setUser(u);
      setLoading(false);
    };
    check();
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  const isAdmin = user?.isAdmin === true;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col bg-[#08080e] border-r border-white/8 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base">TournaOps</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest px-3 mb-1">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`sidebar-link ${active ? "active" : ""}`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-sm">{item.label}</span>
                      {active && <ChevronRight className="w-3 h-3 opacity-30" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ADMIN SECTION - Only visible to admins */}
          {isAdmin && (
            <div>
              <div className="flex items-center gap-2 px-3 mb-1">
                <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">{ADMIN_SECTION.label}</p>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/30 to-transparent" />
              </div>
              <div className="space-y-0.5">
                {ADMIN_SECTION.items.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-link ${active ? "active-admin" : ""} relative`}
                      style={active ? {
                        background: "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(249,115,22,0.15))",
                        borderColor: "rgba(234,179,8,0.3)",
                        color: "#fbbf24",
                      } : {
                        color: "#eab308",
                      }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold">ADMIN</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-white/8">
          <div className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${
            isAdmin
              ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
              : "bg-white/4 border-white/8"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${
              isAdmin
                ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                : "bg-gradient-to-br from-blue-500 to-purple-600"
            }`}>
              {isAdmin ? <Crown className="w-4 h-4" /> : (user?.displayName || user?.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-white text-sm font-semibold truncate">{user?.displayName || user?.username}</p>
                {isAdmin && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/8 transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#08080e]">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10 text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white text-sm">TournaOps</span>
            {isAdmin && (
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
            )}
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}