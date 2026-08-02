"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Trophy, Plus, Settings,
  LogOut, Menu, X, Monitor, ChevronRight,
  Zap, User, BarChart3, Users, Bell
} from "lucide-react";
import { getCurrentUser, logoutUser } from "@/lib/auth/auth";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/tournaments", icon: Trophy, label: "Tournaments" },
  { href: "/dashboard/tournaments/create", icon: Plus, label: "Create Tournament" },
  { href: "/dashboard/registrations", icon: Users, label: "Registrations" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/overlay", icon: Monitor, label: "OBS Overlay" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center space-y-3">
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col bg-[#09090f] border-r border-white/8 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">TournaOps</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link group ${active ? "active" : ""}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 opacity-40" />}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="pt-4 pb-2">
            <div className="border-t border-white/6" />
          </div>

          <Link href="/" className="sidebar-link" target="_blank">
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">View Live Site</span>
            <span className="text-[10px] text-gray-700">↗</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {(user?.displayName || user?.username || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.displayName || user?.username}</p>
              <p className="text-gray-600 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/8 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#09090f]">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white text-sm">TournaOps</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}