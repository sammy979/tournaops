import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const tournaments = await prisma.tournament.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      maxTeams: true,
      createdAt: true,
      _count: { select: { teams: true, matches: true } },
    },
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* DASHBOARD HEADER */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
        padding: "0",
      }}>
        <div className="container-ops" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link href="/" style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "1rem",
              letterSpacing: "0.08em",
              color: "var(--gold)",
              textDecoration: "none",
              textTransform: "uppercase",
            }}>TournaOps</Link>
            <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              color: "var(--white-40)",
              textTransform: "uppercase",
            }}>Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/dashboard/tournaments/create" className="btn-primary" style={{ padding: "7px 16px" }}>
              + New Tournament
            </Link>
          </div>
        </div>

        {/* SUB NAV */}
        <div style={{ borderTop: "1px solid var(--border)", overflowX: "auto" }}>
          <div className="container-ops" style={{ display: "flex", gap: "0", height: "40px" }}>
            {[
              { label: "Tournaments", href: "/dashboard" },
              { label: "Discord", href: "/dashboard/discord" },
              { label: "Overlays", href: "/dashboard/overlay" },
              { label: "Settings", href: "/dashboard/settings" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                color: "var(--white-70)",
                textDecoration: "none",
                textTransform: "uppercase",
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                borderRight: "1px solid var(--border)",
              }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container-ops" style={{ padding: "32px 24px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}>
          <div>
            <div className="section-label">Your Tournaments</div>
            <h1 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "1.6rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--white)",
            }}>
              {(session.username || session.email)}&apos;s Operations
            </h1>
          </div>
        </div>

        {tournaments.length === 0 ? (
          <div style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
            padding: "48px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.1em",
              color: "var(--white-40)",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}>No Tournaments Yet</div>
            <p style={{ color: "var(--white-40)", fontSize: "0.85rem", marginBottom: "20px" }}>
              Create your first tournament to get started.
            </p>
            <Link href="/dashboard/tournaments/create" className="btn-gold">
              Create Tournament
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 80px 80px 120px 100px",
              padding: "10px 20px",
              background: "var(--surface-2)",
            }}>
              {["Tournament", "Status", "Teams", "Matches", "Created", "Actions"].map((col, i) => (
                <div key={col} style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  color: "var(--white-40)",
                  textTransform: "uppercase",
                  textAlign: i > 1 ? "center" : "left",
                }}>{col}</div>
              ))}
            </div>

            {tournaments.map((t: any) => {
              const status = (t.status || "").toUpperCase();
              return (
                <div key={t.id} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 80px 80px 120px 100px",
                  padding: "14px 20px",
                  background: "var(--surface)",
                  borderTop: "1px solid var(--border)",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      letterSpacing: "0.04em",
                      color: "var(--white)",
                      textTransform: "uppercase",
                    }}>{t.name}</div>
                  </div>
                  <div>
                    {status === "LIVE" && <span className="badge-live">Live</span>}
                    {(status === "UPCOMING" || status === "REGISTRATION") && <span className="badge-upcoming">{status}</span>}
                    {status === "COMPLETED" && <span className="badge-completed">Completed</span>}
                    {status === "DRAFT" && <span className="badge-warning">Draft</span>}
                  </div>
                  <div style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem", color: "var(--white-70)" }}>
                    {t._count.teams}/{t.maxTeams || "∞"}
                  </div>
                  <div style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem", color: "var(--white-70)" }}>
                    {t._count.matches}
                  </div>
                  <div style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "var(--white-40)" }}>
                    {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Link href={`/dashboard/tournaments/${t.id}`} style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.1em",
                      color: "var(--gold)",
                      textDecoration: "none",
                      textTransform: "uppercase",
                    }}>Manage →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}