import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import NepalPaymentSection from "@/components/marketing/NepalPaymentSection";

export const dynamic = "force-dynamic";

async function getPaymentSettings() {
  try { return await prisma.paymentSettings.findFirst(); }
  catch { return null; }
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/dashboard");

  const [tournaments, paymentSettings, userInfo] = await Promise.all([
    prisma.tournament.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, slug: true, name: true, status: true,
        maxTeams: true, createdAt: true,
        _count: { select: { teams: true, matches: true } },
      },
    }),
    getPaymentSettings(),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { isPro: true, username: true, email: true },
    }),
  ]);

  const liveCount     = tournaments.filter((t: any) => t.status === "live").length;
  const upcomingCount = tournaments.filter((t: any) => t.status === "upcoming").length;
  const totalTeams    = tournaments.reduce((s: number, t: any) => s + (t._count?.teams ?? 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* HEADER */}
      <div style={{ background: "var(--black)", borderBottom: "1px solid var(--border)" }}>
        <div className="container-ops" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
        }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <Image src="/logo.png" alt="TournaOps" width={30} height={30} priority style={{ objectFit: "contain" }} />
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "1.05rem",
              letterSpacing: "0.08em",
              color: "var(--white)",
              textTransform: "uppercase",
            }}>TournaOps</span>
            <span style={{
              padding: "2px 8px",
              background: "var(--gold-dim)",
              color: "var(--gold)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginLeft: "6px",
            }}>Dashboard</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/dashboard/upgrade" style={{
              padding: "8px 14px",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: userInfo?.isPro ? "var(--white-40)" : "var(--gold)",
              background: userInfo?.isPro ? "transparent" : "var(--gold-dim)",
              textDecoration: "none",
            }}>{userInfo?.isPro ? "Pro Active" : "Upgrade"}</Link>
            <Link href="/dashboard/tournaments/create" style={{
              padding: "8px 18px",
              background: "var(--gold)",
              color: "var(--black)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}>+ New Tournament</Link>
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "28px 0" }}>
        <div className="container-ops">
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}>Your Operations</div>
          <h1 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "2rem",
            color: "var(--white)",
            textTransform: "uppercase",
            lineHeight: 1,
          }}>{userInfo?.username ?? "Organizer"} Command Center</h1>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ background: "var(--black)", padding: "24px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container-ops" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}>
          {[
            { label: "Tournaments", value: tournaments.length, accent: "var(--white)" },
            { label: "Live Now",    value: liveCount,           accent: "var(--red)"   },
            { label: "Upcoming",    value: upcomingCount,       accent: "var(--gold)"  },
            { label: "Total Teams", value: totalTeams,          accent: "var(--green)" },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderLeft: `3px solid ${s.accent}`,
              padding: "18px 20px",
            }}>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                color: "var(--white-40)",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>{s.label}</div>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "2rem",
                color: s.accent,
                lineHeight: 1,
              }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TOURNAMENT LIST */}
      <div className="container-ops" style={{ padding: "32px 24px" }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "0.9rem",
          letterSpacing: "0.12em",
          color: "var(--white)",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}>Your Tournaments</div>

        {tournaments.length === 0 ? (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "48px",
            textAlign: "center",
          }}>
            <div style={{ color: "var(--white-40)", fontSize: "0.9rem", marginBottom: "16px" }}>
              You haven't created any tournaments yet.
            </div>
            <Link href="/dashboard/tournaments/create" style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "var(--gold)",
              color: "var(--black)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}>Create Your First Tournament</Link>
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto auto auto",
              gap: "16px",
              padding: "14px 20px",
              background: "var(--charcoal)",
              borderBottom: "1px solid var(--border)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              color: "var(--white-40)",
              textTransform: "uppercase",
            }}>
              <span>Tournament</span>
              <span style={{ textAlign: "center" }}>Status</span>
              <span style={{ textAlign: "center" }}>Teams</span>
              <span style={{ textAlign: "center" }}>Matches</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {tournaments.map((t: any, i: number) => {
              const statusColor = t.status === "live" ? "var(--red)"
                : t.status === "upcoming" ? "var(--gold)"
                : t.status === "completed" ? "var(--green)" : "var(--white-40)";
              return (
                <div key={t.id} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto auto",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: i < tournaments.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ color: "var(--white)", fontSize: "0.95rem", fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: "var(--white-40)", fontSize: "0.75rem" }}>
                      Created {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    padding: "3px 10px",
                    background: `${statusColor}22`,
                    color: statusColor,
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}>
                    {t.status === "live" && "● "}{t.status}
                  </span>
                  <span style={{ textAlign: "center", color: "var(--white)", fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem" }}>
                    {t._count?.teams ?? 0}/{t.maxTeams}
                  </span>
                  <span style={{ textAlign: "center", color: "var(--white)", fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem" }}>
                    {t._count?.matches ?? 0}
                  </span>
                  <Link href={`/dashboard/tournaments/${t.id}`} style={{
                    padding: "6px 12px",
                    color: "var(--gold)",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    textAlign: "right",
                  }}>Manage →</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEPAL PAYMENT — only show if user is not Pro */}
      {!userInfo?.isPro && paymentSettings && (
        <NepalPaymentSection settings={paymentSettings} variant="dashboard" />
      )}
    </div>
  );
}