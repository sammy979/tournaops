import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getTournament(slug: string) {
  try {
    return await prisma.tournament.findUnique({
      where: { slug },
      include: {
        teams: {
          select: { id: true, name: true, seed: true },
          orderBy: { seed: "asc" },
        },
        stages: {
          select: { id: true, name: true, type: true, status: true },
          orderBy: { order: "asc" },
        },
        _count: { select: { teams: true } },
      },
    });
  } catch {
    return null;
  }
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: "Open",      color: "var(--accent)"      },
  LIVE:      { label: "Live",      color: "var(--color-live)"  },
  COMPLETED: { label: "Completed", color: "var(--gold-bright)" },
};

export default async function TournamentPublicPage({
  params,
}: {
  params: { slug: string };
}) {
  const tournament = await getTournament(params.slug);
  if (!tournament || tournament.status === "DRAFT") notFound();

  const s = STATUS_STYLE[tournament.status] ?? STATUS_STYLE.PUBLISHED;

  return (
    <>
      <PublicNav />

      <main style={{ paddingTop: "56px", minHeight: "100vh", background: "var(--black-rich)" }}>

        {/* Header */}
        <div style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
          <div className="container">

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: s.color,
                border: `1px solid ${s.color}`,
                padding: "3px 10px",
              }}>
                {s.label}
              </span>
              {(tournament as any).game && (
                <span style={{ fontSize: "12px", color: "var(--muted-light)" }}>
                  {(tournament as any).game}
                </span>
              )}
            </div>

            <h1 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px, 5vw, 52px)",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: "var(--white)",
              marginBottom: "12px",
            }}>
              {tournament.name}
            </h1>

            {(tournament as any).description && (
              <p style={{ color: "var(--muted-light)", fontSize: "14px", maxWidth: "560px" }}>
                {(tournament as any).description}
              </p>
            )}

            <div style={{ display: "flex", gap: "32px", marginTop: "20px", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: "11px", color: "var(--muted-light)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                  Teams
                </p>
                <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "22px", fontWeight: 700, color: "var(--white)" }}>
                  {tournament._count.teams}
                </p>
              </div>
              {(tournament as any).prizePool && (
                <div>
                  <p style={{ fontSize: "11px", color: "var(--muted-light)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                    Prize Pool
                  </p>
                  <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "22px", fontWeight: 700, color: "var(--gold-bright)" }}>
                    {(tournament as any).prizePool}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="section" style={{ paddingTop: "40px" }}>
          <div className="container">
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 300px",
              gap: "32px",
            }}>

              {/* Teams */}
              <div>
                <h2 style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--white)",
                  marginBottom: "16px",
                }}>
                  Participating Teams
                </h2>

                {tournament.teams.length === 0 ? (
                  <div style={{
                    padding: "40px",
                    textAlign: "center",
                    background: "var(--charcoal)",
                    border: "1px solid var(--border)",
                  }}>
                    <p style={{ color: "var(--muted-light)", fontSize: "14px" }}>
                      No teams registered yet.
                    </p>
                  </div>
                ) : (
                  <div style={{ border: "1px solid var(--border)" }}>
                    {tournament.teams.map((team, i) => (
                      <div key={team.id} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 20px",
                        borderBottom: i < tournament.teams.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                        background: "var(--charcoal)",
                      }}>
                        <span style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "12px",
                          color: "var(--muted-light)",
                          minWidth: "28px",
                        }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--white)",
                        }}>
                          {team.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stages Sidebar */}
              <div>
                <h2 style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--white)",
                  marginBottom: "16px",
                }}>
                  Stages
                </h2>

                {tournament.stages.length === 0 ? (
                  <div style={{
                    padding: "24px",
                    background: "var(--charcoal)",
                    border: "1px solid var(--border)",
                  }}>
                    <p style={{ color: "var(--muted-light)", fontSize: "13px" }}>
                      Stages not configured yet.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {tournament.stages.map((stage: any) => (
                      <div key={stage.id} style={{
                        padding: "14px 16px",
                        background: "var(--charcoal)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--white)" }}>
                          {stage.name}
                        </span>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: stage.status === "ACTIVE"
                            ? "var(--color-live)"
                            : "var(--muted-light)",
                        }}>
                          {stage.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {tournament.status === "COMPLETED" && (
                  <Link
                    href={`/tournaments/${tournament.slug}/results`}
                    style={{
                      display: "block",
                      marginTop: "16px",
                      padding: "12px 16px",
                      background: "var(--accent)",
                      color: "var(--white)",
                      textAlign: "center",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    View Results →
                  </Link>
                )}

                {tournament.status === "PUBLISHED" && (
                  <Link
                    href={`/tournaments/${tournament.slug}/register`}
                    style={{
                      display: "block",
                      marginTop: "16px",
                      padding: "12px 16px",
                      background: "var(--accent)",
                      color: "var(--white)",
                      textAlign: "center",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Register Team →
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}