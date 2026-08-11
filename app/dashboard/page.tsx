import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

async function getDashboardData(userId: string) {
  try {
    const [tournaments, recentMatches] = await Promise.all([
      prisma.tournament.findMany({
        where: { userId },
        include: {
          teams: { select: { id: true } },
          rounds: {
            include: {
              matches: {
                select: { id: true, status: true, matchNumber: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.match.findMany({
        where: {
          round: {
            tournament: { userId },
          },
          status: { in: ["LIVE", "COMPLETED"] },
        },
        include: {
          round: {
            include: {
              tournament: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

    const live = tournaments.filter((t) => t.status === "LIVE");
    const upcoming = tournaments.filter((t) =>
      ["UPCOMING", "REGISTRATION"].includes(t.status)
    );
    const completed = tournaments.filter((t) => t.status === "COMPLETED");

    return { tournaments, live, upcoming, completed, recentMatches };
  } catch {
    return { tournaments: [], live: [], upcoming: [], completed: [], recentMatches: [] };
  }
}

const STATUS_COLORS: Record<string, string> = {
  LIVE: "var(--red-live)",
  UPCOMING: "#60a5fa",
  REGISTRATION: "var(--gold-bright)",
  COMPLETED: "var(--green-bright)",
  DRAFT: "var(--muted-light)",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { tournaments, live, upcoming, completed, recentMatches } =
    await getDashboardData(session.userId);

  return (
    <div style={{ minHeight: "100vh", background: "var(--black-rich)" }}>
      {/* Dashboard Header */}
      <div
        style={{
          background: "var(--charcoal-deep)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", borderBottom: "1px solid var(--border)" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{ width: "26px", height: "26px", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: "12px", color: "#0a0a0a" }}>TO</span>
              </div>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "16px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--white)" }}>
                TournaOps
              </span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted-light)", letterSpacing: "0.08em" }}>
                {session.username || session.email}
              </span>
              <Link href="/api/auth/logout" className="btn-ghost" style={{ fontSize: "10px" }}>
                Log Out
              </Link>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: "0", height: "44px", alignItems: "stretch" }}>
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Tournaments", href: "/dashboard/tournaments" },
              { label: "Command Center", href: "/dashboard/command-center" },
              { label: "Upgrade", href: "/dashboard/upgrade" },
              { label: "Settings", href: "/dashboard/settings" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "0 18px",
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--muted-light)",
                  textDecoration: "none",
                  borderBottom: "2px solid transparent",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                className="dash-nav-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Dashboard Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p className="label-section-muted" style={{ marginBottom: "6px" }}>Operations Dashboard</p>
            <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "28px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--white)" }}>
              {session.username || "Organizer"}
            </h1>
          </div>
          <Link href="/dashboard/tournaments/new" className="btn-primary">
            + Create Tournament
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
            marginBottom: "32px",
          }}
          className="stats-grid"
        >
          {[
            { label: "Total Tournaments", value: tournaments.length },
            { label: "Live Now", value: live.length, highlight: live.length > 0 },
            { label: "Upcoming", value: upcoming.length },
            { label: "Completed", value: completed.length },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--charcoal)",
                padding: "20px",
              }}
            >
              <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "6px" }}>
                {s.label}
              </p>
              <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "36px", color: s.highlight ? "var(--red-live)" : "var(--white)", lineHeight: 1 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Live Alerts */}
        {live.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            {live.map((t) => {
              const allMatches = t.rounds.flatMap((r) => r.matches);
              const liveMatch = allMatches.find((m) => m.status === "LIVE");
              return (
                <Link
                  key={t.id}
                  href={`/dashboard/tournaments/${t.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 20px",
                    background: "rgba(230,57,70,0.06)",
                    border: "1px solid rgba(230,57,70,0.25)",
                    borderLeft: "3px solid var(--red-live)",
                    textDecoration: "none",
                    marginBottom: "8px",
                    transition: "background 0.15s",
                  }}
                >
                  <span className="live-dot" />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--white)" }}>
                      {t.name}
                    </span>
                    {liveMatch && (
                      <span style={{ marginLeft: "12px", fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted-light)" }}>
                        Match {liveMatch.matchNumber} — Live
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted-light)", letterSpacing: "0.08em" }}>
                    Manage →
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Tournaments List */}
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p className="label-section">Your Tournaments</p>
          <Link href="/dashboard/tournaments" className="btn-ghost" style={{ fontSize: "10px" }}>
            View All →
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center", background: "var(--charcoal)", border: "1px solid var(--border)" }}>
            <p className="label-section-muted" style={{ marginBottom: "8px" }}>No Tournaments Yet</p>
            <p style={{ color: "var(--muted-light)", fontSize: "13px", marginBottom: "20px" }}>
              Create your first tournament to get started.
            </p>
            <Link href="/dashboard/tournaments/new" className="btn-primary">
              Create Tournament
            </Link>
          </div>
        ) : (
          <div style={{ border: "1px solid var(--border)", background: "var(--charcoal)", overflow: "hidden" }}>
            {tournaments.slice(0, 10).map((t) => {
              const allMatches = t.rounds.flatMap((r) => r.matches);
              const completed = allMatches.filter((m) => m.status === "COMPLETED");
              return (
                <Link
                  key={t.id}
                  href={`/dashboard/tournaments/${t.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  className="tournament-row"
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.name}
                    </p>
                    <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.06em", marginTop: "2px" }}>
                      {t.teams.length} teams · {completed.length}/{allMatches.length} matches
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: STATUS_COLORS[t.status] || "var(--muted)",
                    }}
                  >
                    {t.status}
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.08em" }}>→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .dash-nav-link:hover { color: var(--white) !important; border-bottom-color: var(--gold) !important; }
        .tournament-row:hover { background: var(--charcoal-mid) !important; }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}