"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Trophy, LayoutDashboard, Settings, LogOut,
  ChevronLeft, ChevronRight, Menu, X,
  BarChart3, Users, Calendar, Palette,
  MessageSquare, Radio, Zap, Crown,
  Image as ImageIcon, DollarSign,
  Bot, Clock, Shield
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Trophy, label: "Tournaments", href: "/dashboard/tournaments" },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    ],
  },
  {
    label: "Tools",
    items: [
      { icon: Calendar, label: "Schedule", href: "/dashboard/schedule" },
      { icon: Users, label: "Registrations", href: "/dashboard/registrations" },
      { icon: DollarSign, label: "Prizes", href: "/dashboard/prizes" },
      { icon: Clock, label: "Timer", href: "/dashboard/timer" },
    ],
  },
  {
    label: "Broadcast",
    items: [
      { icon: Radio, label: "OBS Overlay", href: "/dashboard/overlay" },
      { icon: Bot, label: "AI Assistant", href: "/dashboard/ai" },
      { icon: ImageIcon, label: "AI Images", href: "/dashboard/ai-images" },
    ],
  },
  {
    label: "Setup",
    items: [
      { icon: Palette, label: "Branding", href: "/dashboard/branding" },
      { icon: ImageIcon, label: "Assets", href: "/dashboard/assets" },
      { icon: MessageSquare, label: "Discord", href: "/dashboard/discord" },
      { icon: Zap, label: "Scoring", href: "/dashboard/scoring" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
      { icon: Crown, label: "Upgrade Pro", href: "/dashboard/upgrade" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarWidth = collapsed ? "4rem" : "14rem";

  const SidebarContent = () => (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
    }}>
      <div style={{
        padding: collapsed ? "1rem 0.75rem" : "1rem 1.25rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        flexShrink: 0,
        minHeight: "4.5rem",
      }}>
        {collapsed ? (
          <div style={{
            width: "4rem", height: "4rem",
            background: "transparent",
            borderRadius: "0.5rem",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Image src="/logo.png" alt="TournaOps" width={64} height={64} style={{ objectFit: "contain" }} />
          </div>
        ) : (
          <>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
              <div style={{
                width: "4rem", height: "4rem",
                background: "transparent",
                borderRadius: "0.5rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Image src="/logo.png" alt="TournaOps" width={64} height={64} style={{ objectFit: "contain" }} />
              </div>
              <span style={{ fontWeight: 800, color: "#fff", fontSize: "1rem", whiteSpace: "nowrap" }}>TournaOps</span>
            </Link>
            {isDesktop && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.5rem",
                  width: "1.75rem", height: "1.75rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: "#6b7280",
                  flexShrink: 0,
                }}
              >
                <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />
              </button>
            )}
            {!isDesktop && (
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.5rem",
                  width: "4rem", height: "4rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                <X style={{ width: "1rem", height: "1rem" }} />
              </button>
            )}
          </>
        )}
        {collapsed && isDesktop && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              position: "absolute",
              right: "-0.75rem",
              top: "1.25rem",
              background: "#0d0d14",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              width: "1.5rem", height: "1.5rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "#9ca3af",
              zIndex: 45,
            }}
          >
            <ChevronRight style={{ width: "0.75rem", height: "0.75rem" }} />
          </button>
        )}
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: "0.75rem",
      }} className="scrollbar-hide">
        {(user?.isAdmin || user?.role === "SUPER_ADMIN") && (
          <div style={{ marginBottom: "1.25rem" }}>
            {!collapsed && (
              <div style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#f59e0b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "0 0.5rem",
                marginBottom: "0.375rem",
              }}>
                Super Admin
              </div>
            )}
            <Link
              href="/admin"
              title={collapsed ? "Admin" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.75rem",
                borderRadius: "0.625rem",
                marginBottom: "0.125rem",
                textDecoration: "none",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive("/admin") ? "rgba(239,68,68,0.12)" : "transparent",
                color: isActive("/admin") ? "#f87171" : "#9ca3af",
                fontWeight: isActive("/admin") ? 600 : 500,
                fontSize: "0.9rem",
                minHeight: "44px",
              }}
            >
              <Shield style={{ width: "1.125rem", height: "1.125rem", flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: "nowrap" }}>Admin Panel</span>}
            </Link>
          </div>
        )}

        {NAV_ITEMS.map(group => (
          <div key={group.label} style={{ marginBottom: "1.25rem" }}>
            {!collapsed && (
              <div style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#4b5563",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "0 0.5rem",
                marginBottom: "0.375rem",
              }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: collapsed ? "0.75rem" : "0.75rem 0.75rem",
                    borderRadius: "0.625rem",
                    marginBottom: "0.125rem",
                    textDecoration: "none",
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: active ? "rgba(245,158,11,0.12)" : "transparent",
                    color: active ? "#f59e0b" : "#9ca3af",
                    fontWeight: active ? 600 : 500,
                    fontSize: "0.9rem",
                    transition: "all 0.15s ease",
                    minHeight: "44px",
                  }}
                >
                  <Icon style={{ width: "1.125rem", height: "1.125rem", flexShrink: 0 }} />
                  {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: collapsed ? "0.75rem" : "0.75rem 1rem",
        flexShrink: 0,
      }}>
        {!collapsed && user && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.625rem",
            borderRadius: "0.75rem",
            background: "rgba(255,255,255,0.04)",
            marginBottom: "0.5rem",
          }}>
            <div style={{
              width: "4rem", height: "4rem",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700, color: "#fff",
              flexShrink: 0,
            }}>
              {(user.displayName || user.username || "U").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.displayName || user.username}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.isPro ? "Pro Plan" : "Free Plan"}
              </div>
            </div>
            {user.isPro && (
              <Crown style={{ width: "0.875rem", height: "0.875rem", color: "#f59e0b", flexShrink: 0 }} />
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "0.5rem",
            padding: "0.75rem",
            borderRadius: "0.625rem",
            background: "transparent",
            border: "none",
            color: "#6b7280",
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s",
            minHeight: "44px",
          }}
        >
          <LogOut style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", position: "relative" }}>

      {isDesktop && (
        <aside
          style={{
            width: sidebarWidth,
            background: "rgba(255,255,255,0.02)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 40,
            transition: "width 0.2s ease",
          }}
        >
          <SidebarContent />
        </aside>
      )}

      {!isDesktop && mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {!isDesktop && (
        <aside
          style={{
            position: "fixed",
            top: 0, left: 0, bottom: 0,
            width: "80%",
            maxWidth: "18rem",
            zIndex: 60,
            background: "#0d0d14",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
            boxShadow: mobileOpen ? "0 20px 60px rgba(0,0,0,0.5)" : "none",
          }}
        >
          <SidebarContent />
        </aside>
      )}

      <div style={{
        marginLeft: isDesktop ? sidebarWidth : 0,
        transition: "margin-left 0.2s ease",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}>

        <header style={{
          height: "3.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
          background: "rgba(10,10,15,0.9)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 30,
          flexShrink: 0,
        }}>
          {!isDesktop ? (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.5rem",
                width: "3.25rem", height: "3.25rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: "#9ca3af",
              }}
            >
              <Menu style={{ width: "1.125rem", height: "1.125rem" }} />
            </button>
          ) : <div />}

          {!isDesktop && (
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
              <div style={{
                width: "3.25rem", height: "3.25rem",
                background: "transparent",
                borderRadius: "0.375rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Image src="/logo.png" alt="TournaOps" width={52} height={52} style={{ objectFit: "contain" }} />
              </div>
              <span style={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}>TournaOps</span>
            </Link>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {user && !user.isPro && (
              <Link
                href="/dashboard/upgrade"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: "0.5rem",
                  padding: "0.375rem 0.625rem",
                  color: "#f59e0b",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  minHeight: "36px",
                }}
              >
                <Crown style={{ width: "0.75rem", height: "0.75rem" }} />
                <span className="hidden sm:inline">Upgrade</span>
              </Link>
            )}
            <Link
              href="/"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.5rem",
                padding: "0.375rem 0.625rem",
                color: "#9ca3af",
                fontSize: "0.7rem",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                minHeight: "36px",
              }}
            >
              View Site
            </Link>
          </div>
        </header>

        <div style={{ flex: 1, padding: "1rem" }} className="dashboard-content">
          {children}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .dashboard-content { padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
