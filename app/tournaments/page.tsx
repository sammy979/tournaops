import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getTournaments() {
  try {
    return await prisma.tournament.findMany({
      where: {
        status: { in: ["PUBLISHED", "LIVE", "COMPLETED"] },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        game: true,
        prizePool: true,
        createdAt: true,
        _count: { select: { teams: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: "Open",      color: "var(--accent)"      },
  LIVE:      { label: "Live",      color: "var(--color-live)"  },
  COMPLETED: { label: "Completed", color: "var(--gold-bright)" },
};

export default async function TournamentsPublicPage() {
  const tournaments = await getTournaments();

  const live      = tournaments.filter((t) => t.status === "LIVE");
  const open      = tournaments.filter((t) => t.status === "PUBLISHED");
  const completed = tournaments.filter((t) => t.status === "COMPLETED");

  return (
    <>
      <PublicNav />

      <main style={{ paddingTop: "56px", minHeight: "100vh", background: "var(--black-rich)" }}>

        {/* Header */}
        <div style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
          <div className="container">
            <p className="label-section" style={{ marginBottom: "10px" }}>TournaOps</p>
            <h1 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 52px)",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: "var(--white)",
              marginBottom: "12px",
            }}>
              Tournaments
            </h1>
            <p style={{ color: "var(--muted-light)", fontSize: "14px" }}>
              Browse all active, open, and completed tournaments.
            </p>
          </div>
        </div>

        <div className="section" style={{ paddingTop: "40px" }}>
          <div className="container">

            {tournaments.length === 0 ? (
              <div style={{
                padding: "80px",
                textAlign: "center",
                background: "var(--charcoal)",
                border: "1px solid var(--border)",
              }}>
                <p className="label-section-muted" style={{ marginBottom: "12px" }}>No Tournaments Yet</p>
                <p style={{ color: "var(--muted-light)", fontSize: "14px" }}>
                  Check back soon for upcoming tournaments.
                </p>
              </div>
            ) : (
              <>
                {/* Live */}
                {live.length > 0 && (
                  <Section title="🔴 Live Now" tournaments={live} />
                )}

                {/* Open */}
                {open.length > 0 && (
                  <Section title="Open Registration" tournaments={open} />
                )}

                {/* Completed */}
                {completed.length > 0 && (
                  <Section title="Completed" tournaments={completed} />
                )}
              </>
            )}

          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}

function Section({
  title,
  tournaments,
}: {
  title: string;
  tournaments: any[];
}) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <h2 style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 800,
        fontSize: "22px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "var(--white)",
        marginBottom: "20px",
        paddingBottom: "10px",
        borderBottom: "1px solid var(--border)",
      }}>
        {title}
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "16px",
      }}>
        {tournaments.map((t) => {
          const s = STATUS_STYLE[t.status] ?? STATUS_STYLE.PUBLISHED;
          return (
            <Link
              key={t.id}
              href={`/tournaments/${t.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div style={{
                background: "var(--charcoal)",
                border: "1px solid var(--border)",
                padding: "24px",
                transition: "border-color 0.15s",
                cursor: "pointer",
              }}>
                {/* Status + Game */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: s.color,
                    border: `1px solid ${s.color}`,
                    padding: "2px 8px",
                  }}>
                    {s.label}
                  </span>
                  {t.game && (
                    <span style={{ fontSize: "11px", color: "var(--muted-light)" }}>
                      {t.game}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  color: "var(--white)",
                  marginBottom: "16px",
                  lineHeight: 1.2,
                }}>
                  {t.name}
                </h3>

                {/* Meta */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontSize: "12px",
                    color: "var(--muted-light)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}>
                    {t._count.teams} teams
                  </span>
                  {t.prizePool && (
                    <span style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--gold-bright)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}>
                      {t.prizePool}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}