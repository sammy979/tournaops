"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Shield,
  Users,
  CreditCard,
  Activity,
  AlertTriangle,
  Settings,
  BarChart2,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Overview",        href: "/admin",                     icon: BarChart2,     exact: true  },
  { label: "Users",           href: "/admin/users",               icon: Users,         exact: false },
  { label: "Payments",        href: "/admin/payments",            icon: CreditCard,    exact: false },
  { label: "System Health",   href: "/admin/system-health",       icon: Activity,      exact: true  },
  { label: "Error Logs",      href: "/admin/system-health/errors",icon: AlertTriangle, exact: false },
  { label: "Pay Settings",    href: "/admin/settings/payments",   icon: Settings,      exact: false },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router      = useRouter();
  const pathname    = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-[#060810] text-white flex">

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-[#080a0f] border-r border-white/[0.06] z-40 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">TournaOps</p>
              <p className="text-rose-400 text-xs font-bold leading-none mt-0.5">ADMIN</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-white/30 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  active
                    ? "bg-rose-600/20 text-rose-300 border border-rose-500/20"
                    : "text-white/40 hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-rose-400" : ""}`} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 text-rose-400/60" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-4 border-t border-white/[0.06] flex-shrink-0 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="w-7 h-7 rounded-full bg-rose-600/20 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Admin User</p>
              <p className="text-white/30 text-xs truncate">admin@tournaops.com</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">

        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#080a0f]/80 backdrop-blur-xl sticky top-0 z-20">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Operational
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg flex items-center justify-center transition-colors">
              <Bell className="w-4 h-4 text-white/50" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border border-[#080a0f]" />
            </button>
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-300 text-xs font-bold">Admin Mode</span>
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}