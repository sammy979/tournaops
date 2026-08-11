import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOrganizerData(userId: string) {
  try {
    const [tournaments, notifications] = await Promise.all([
      prisma.tournament.findMany({
        where: { userId },
        select: {
          id: true, name: true, slug: true, status: true,
          createdAt: true,
          _count: { select: { teams: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.notification?.findMany({
        where: { userId, read: false },
        take: 5,
        orderBy: { createdAt: "desc" },
      }).catch(() => []),
    ]);
    return { tournaments, notifications: notifications ?? [] };
  } catch {
    return { tournaments: [], notifications: [] };
  }
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: "Draft",     color: "var(--muted-light)" },
  PUBLISHED: { label: "Open",      color: "var(--accent)"      },
  LIVE:      { label: "Live",      color: "var(--live)"        },
  COMPLETED: { label: "Completed", color: "var(--success)"     },
  CANCELLED: { label: "Cancelled", color: "var(--danger)"      },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { tournaments, notifications } = await getOrganizerData(session.userId);

  const live      = tournaments.filter(t => t.status === "LIVE");
  const open      = tournaments.filter(t => t.status === "PUBLISHED");
  const draft     = tournaments.filter(t => t.status === "DRAFT");
  const completed = tournaments.filter(t => t.status === "COMPLETED");

  return (
    <div style={{ minHeight: "100vh", background: "var(--black-rich)", paddingTop: "var(--nav-height)" }}>

      {/* Page Header */}
      <div style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "28px 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-light)", marginBottom: "6px" }}>
                Welcome back
              </p>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "28px", textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--white)" }}>
                {session.username ?? "Organizer"}
              </h1>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/dashboard/command-center" className="btn btn-secondary btn-sm">
                Command Center
              </Link>
              <Link href="/dashboard/tournaments/create" className="btn btn-primary btn-sm">
                + New Tournament
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>

        {/* Status Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", background: "var(--border)", marginBottom: "32px" }}>
          {[
            { label: "Live",      value: live.length,      color: "var(--live)"        },
            { label: "Open",      value: open.length,      color: "var(--accent)"      },
            { label: "Draft",     value: draft.length,     color: "var(--muted-light)" },
            { label: "Completed", value: completed.length, color: "var(--success)"     },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--charcoal)", padding: "20px 24px" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: 700, color: s.color, marginBottom: "4px" }}>
                {s.value}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-light)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>

          {/* Tournaments List */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--white)" }}>
                Your Tournaments
              </h2>
              <Link href="/dashboard/tournaments" className="btn btn-ghost btn-sm">View All</Link>
            </div>

            {tournaments.length === 0 ? (
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", padding: "48px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-light)", marginBottom: "12px" }}>
                  No Tournaments Yet
                </p>
                <p style={{ fontSize: "13px", color: "var(--muted-light)", marginBottom: "20px" }}>
                  Create your first tournament to get started.
                </p>
                <Link href="/dashboard/tournaments/create" className="btn btn-primary btn-sm">
                  Create Tournament
                </Link>
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)" }}>
                {tournaments.map((t, i) => {
                  const cfg = STATUS_CFG[t.status] ?? STATUS_CFG.DRAFT;
                  return (
                    <Link key={t.id} href={`/dashboard/tournaments/${t.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "14px 20px",
                        borderBottom: i < tournaments.length - 1 ? "1px solid var(--border)" : "none",
                        background: "var(--charcoal)",
                        transition: "background 0.15s",
                      }}>
                        {t.status === "LIVE" && <span className="live-dot" />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--white)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {t.name}
                          </p>
                          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted-light)" }}>
                            {t._count.teams} teams · {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: cfg.color, flexShrink: 0 }}>
                          {cfg.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Quick Actions */}
            <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-light)" }}>
                  Quick Actions
                </p>
              </div>
              <div style={{ padding: "8px" }}>
                {[
                  { href: "/dashboard/tournaments/create",   label: "New Tournament"    },
                  { href: "/dashboard/command-center",       label: "Command Center"    },
                  { href: "/dashboard/scoring",              label: "Scoring Presets"   },
                  { href: "/dashboard/overlay",              label: "OBS Overlays"      },
                  { href: "/dashboard/discord",              label: "Discord"           },
                  { href: "/dashboard/ai",                   label: "Ops AI"            },
                  { href: "/dashboard/settings",             label: "Settings"          },
                ].map(a => (
                  <Link key={a.href} href={a.href} style={{
                    display: "block", padding: "10px 12px",
                    fontSize: "12px", fontWeight: 600,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "color 0.15s",
                  }}>
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-light)" }}>
                    Notifications
                  </p>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: "var(--accent)" }}>
                    {notifications.length}
                  </span>
                </div>
                {(notifications as any[]).map((n: any) => (
                  <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{n.message ?? n.title}</p>
                  </div>
                ))}
                <div style={{ padding: "10px 16px" }}>
                  <Link href="/dashboard/notifications" style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    View All →
                  </Link>
                </div>
              </div>
            )}

            {/* Upgrade prompt for free users */}
            {!session.isPro && (
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                <div style={{ padding: "20px" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "8px" }}>
                    Upgrade to Pro
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--muted-light)", lineHeight: 1.5, marginBottom: "14px" }}>
                    Unlock unlimited tournaments, advanced AI, and priority support.
                  </p>
                  <Link href="/dashboard/upgrade" className="btn btn-primary btn-sm btn-full">
                    View Plans
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}