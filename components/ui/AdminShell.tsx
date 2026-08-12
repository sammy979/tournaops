"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview",      href: "/admin",                      icon: BarChart2,     exact: true  },
  { label: "Users",         href: "/admin/users",                icon: Users,         exact: false },
  { label: "Payments",      href: "/admin/payments",             icon: CreditCard,    exact: false },
  { label: "System Health", href: "/admin/system-health",        icon: Activity,      exact: true  },
  { label: "Error Logs",    href: "/admin/system-health/errors", icon: AlertTriangle, exact: false },
  { label: "Pay Settings",  href: "/admin/settings/payments",    icon: Settings,      exact: false },
];

interface AdminUser {
  id:          string;
  email:       string;
  displayName: string;
  username:    string;
  avatar:      string | null;
  role:        string;
  isAdmin:     boolean;
}

type SystemStatus = "unknown" | "healthy" | "degraded" | "down";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname() ?? "";
  const [open, setOpen]           = useState(false);
  const [user, setUser]           = useState<AdminUser | null>(null);
  const [status, setStatus]       = useState<SystemStatus>("unknown");

  // Load real user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.user) setUser(data.user);
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, []);

  // Load real system status
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/system-status", { cache: "no-store" });
        if (!res.ok) {
          if (mounted) setStatus("unknown");
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        if (data?.status === "healthy") setStatus("healthy");
        else if (data?.status === "partial" || data?.status === "degraded") setStatus("degraded");
        else if (data?.status === "error" || data?.status === "down") setStatus("down");
        else setStatus("unknown");
      } catch {
        if (mounted) setStatus("unknown");
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { /* ignore */ }
    router.push("/login");
  };

  const statusColor =
    status === "healthy"  ? "var(--green)" :
    status === "degraded" ? "var(--amber)" :
    status === "down"     ? "var(--red)"   :
    "var(--white-40)";

  const statusLabel =
    status === "healthy"  ? "All Systems Operational" :
    status === "degraded" ? "Partial Outage" :
    status === "down"     ? "System Down" :
    "Checking...";

  const displayName = user?.displayName || user?.username || "Admin";
  const initial     = displayName[0]?.toUpperCase() || "A";

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", color: "var(--white)", display: "flex" }}>

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 30,
          }}
          className="lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "240px",
          background: "var(--charcoal)",
          borderRight: "1px solid var(--border)",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          transition: "transform 200ms",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
        className="lg:!translate-x-0"
      >
        {/* Logo header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: "64px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "28px",
              height: "28px",
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Shield style={{ width: "16px", height: "16px", color: "var(--black)" }} />
            </div>
            <div>
              <p style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "0.9rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--white)",
                margin: 0,
                lineHeight: 1,
              }}>TournaOps</p>
              <p style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                color: "var(--red)",
                textTransform: "uppercase",
                margin: 0,
                marginTop: "2px",
                lineHeight: 1,
              }}>Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
            style={{
              background: "none",
              border: "none",
              color: "var(--white-40)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{
          flex: 1,
          padding: "16px 12px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setOpen(false); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: active ? "var(--gold-dim)" : "transparent",
                  borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
                  border: "none",
                  color: active ? "var(--white)" : "var(--white-40)",
                  cursor: "pointer",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <item.icon style={{
                  width: "16px",
                  height: "16px",
                  color: active ? "var(--gold)" : "var(--white-40)",
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight style={{ width: "12px", height: "12px", color: "var(--gold)" }} />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{
          padding: "12px",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}>
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={displayName}
                style={{
                  width: "32px",
                  height: "32px",
                  objectFit: "cover",
                  border: "1px solid var(--gold)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: "32px",
                height: "32px",
                background: "var(--gold-dim)",
                border: "1px solid var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "0.85rem",
                color: "var(--gold)",
              }}>{initial}</div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "0.78rem",
                color: "var(--white)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>{displayName}</p>
              <p style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.68rem",
                color: "var(--white-40)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>{user?.email || "Loading..."}</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              background: "transparent",
              border: "1px solid var(--border-2)",
              color: "var(--white-40)",
              cursor: "pointer",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <LogOut style={{ width: "12px", height: "12px" }} />
            Exit to Dashboard
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              background: "transparent",
              border: "1px solid var(--border-2)",
              color: "var(--red)",
              cursor: "pointer",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <LogOut style={{ width: "12px", height: "12px" }} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
        className="lg:ml-60"
      >
        {/* Top bar */}
        <header style={{
          height: "56px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--charcoal)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}>
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden"
            style={{
              background: "none",
              border: "none",
              color: "var(--white-40)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <Menu style={{ width: "20px", height: "20px" }} />
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: statusColor,
              animation: status === "healthy" ? "pulse-green 2s infinite" : "none",
            }} />
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: statusColor,
            }}>{statusLabel}</span>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            background: "var(--red-dim)",
            border: "1px solid var(--red)",
          }}>
            <Shield style={{ width: "14px", height: "14px", color: "var(--red)" }} />
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--red)",
            }}>Admin Mode</span>
          </div>
        </header>

        {/* Page body */}
        <main style={{ flex: 1, overflow: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}