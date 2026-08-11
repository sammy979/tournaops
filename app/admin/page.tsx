import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [totalUsers, totalTournaments, liveTournaments, totalPayments, pendingPayments] = await Promise.all([
      prisma.user.count(),
      prisma.tournament.count(),
      prisma.tournament.count({ where: { status: "live" } }),
      prisma.payment.count({ where: { status: "APPROVED" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
    ]);
    const proUsers = await prisma.user.count({ where: { isPro: true } });
    return { totalUsers, totalTournaments, liveTournaments, totalPayments, pendingPayments, proUsers };
  } catch {
    return { totalUsers: 0, totalTournaments: 0, liveTournaments: 0, totalPayments: 0, pendingPayments: 0, proUsers: 0 };
  }
}

async function getRecentUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, email: true, username: true, role: true, isPro: true, createdAt: true },
    });
  } catch {
    return [];
  }
}

async function getRecentPayments() {
  try {
    return await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { username: true, email: true } } },
    });
  } catch {
    return [];
  }
}

function fmt(d: Date) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function AdminDashboardPage() {
  const [stats, users, payments] = await Promise.all([
    getStats(),
    getRecentUsers(),
    getRecentPayments(),
  ]);

  const cards = [
    { label: "Total Users",       value: stats.totalUsers,       accent: "var(--gold)"  },
    { label: "Pro Users",         value: stats.proUsers,         accent: "var(--green)" },
    { label: "Tournaments",       value: stats.totalTournaments, accent: "var(--white)" },
    { label: "Live Tournaments",  value: stats.liveTournaments,  accent: "var(--red)"   },
    { label: "Approved Payments", value: stats.totalPayments,    accent: "var(--green)" },
    { label: "Pending Payments",  value: stats.pendingPayments,  accent: "var(--amber)" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", color: "var(--white)" }}>
      {/* Header */}
      <header style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Image src="/logo.png" alt="TournaOps" width={28} height={28} />
            <div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.14em", color: "var(--red)", textTransform: "uppercase" }}>Super Admin</div>
              <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: "1.5rem", textTransform: "uppercase", lineHeight: 1 }}>Admin Console</h1>
            </div>
          </div>
          <nav style={{ display: "flex", gap: "6px" }}>
            {[
              { href: "/admin", label: "Overview", active: true },
              { href: "/admin/users", label: "Users" },
              { href: "/admin/payments", label: "Payments" },
              { href: "/admin/system-health", label: "Health" },
              { href: "/admin/settings/payments", label: "Settings" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: "8px 14px",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: l.active ? "var(--gold)" : "var(--white-70)",
                background: l.active ? "var(--gold-dim)" : "transparent",
                textDecoration: "none",
              }}>{l.label}</Link>
            ))}
            <Link href="/dashboard" style={{
              padding: "8px 14px",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--white-40)",
              textDecoration: "none",
              marginLeft: "8px",
            }}>← Exit</Link>
          </nav>
        </div>
      </header>

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {cards.map(c => (
            <div key={c.label} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderTop: `3px solid ${c.accent}`,
              padding: "20px",
            }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.14em", color: "var(--white-40)", textTransform: "uppercase", marginBottom: "8px" }}>
                {c.label}
              </div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: "2.2rem", color: c.accent, lineHeight: 1 }}>
                {c.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Recent Users */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Recent Users</div>
              <Link href="/admin/users" style={{ color: "var(--gold)", fontSize: "0.8rem", textDecoration: "none" }}>View All →</Link>
            </div>
            {users.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--white-40)" }}>No users yet</div>
            ) : users.map((u: any, i: number) => (
              <div key={u.id} style={{ padding: "14px 20px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", background: "var(--gold-dim)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem" }}>
                  {(u.username ?? u.email)[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "var(--white)", fontSize: "0.9rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username ?? u.email}</div>
                  <div style={{ color: "var(--white-40)", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                  <span style={{
                    padding: "2px 8px",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: u.isPro ? "var(--gold-dim)" : "var(--surface-3)",
                    color: u.isPro ? "var(--gold)" : "var(--white-40)",
                  }}>{u.isPro ? "Pro" : "Free"}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--white-40)" }}>{fmt(u.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Payments */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Recent Payments</div>
              <Link href="/admin/payments" style={{ color: "var(--gold)", fontSize: "0.8rem", textDecoration: "none" }}>View All →</Link>
            </div>
            {payments.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--white-40)" }}>No payments yet</div>
            ) : payments.map((p: any, i: number) => {
              const statusColor = p.status === "APPROVED" ? "var(--green)" : p.status === "PENDING" ? "var(--amber)" : "var(--red)";
              return (
                <div key={p.id} style={{ padding: "14px 20px", borderBottom: i < payments.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "6px", height: "36px", background: statusColor }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "var(--white)", fontSize: "0.9rem", fontWeight: 600 }}>{p.user?.username ?? p.user?.email ?? "Unknown"}</div>
                    <div style={{ color: "var(--white-40)", fontSize: "0.75rem" }}>{p.method} · {fmt(p.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--gold)" }}>Rs {p.amount}</div>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: statusColor }}>{p.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}