import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

async function getPlayer(id: string) {
  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                format: true,
                prizePool: true,
              },
            },
            playersList: {
              select: {
                id: true,
                name: true,
                ign: true,
                role: true,
                isCaptain: true,
              },
            },
          },
        },
      },
    });
    return player;
  } catch {
    return null;
  }
}

export default async function PlayerProfilePage({ params }: Props) {
  const player = await getPlayer(params.id);

  if (!player) {
    notFound();
  }

  const team       = player.team;
  const tournament = team.tournament;
  const teammates  = team.playersList.filter((p) => p.id !== player.id);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--black)" }}>
      <SiteHeader />

      <main style={{ flex: 1 }}>
        {/* BREADCRUMB */}
        <div style={{
          background: "var(--charcoal)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 0",
        }}>
          <div className="container-ops" style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.78rem",
            color: "var(--white-40)",
            fontFamily: "Barlow, sans-serif",
          }}>
            <Link href="/rankings" style={{ color: "var(--white-40)", textDecoration: "none" }}>Rankings</Link>
            <span>/</span>
            <Link href={`/tournaments/${tournament.slug}`} style={{ color: "var(--white-40)", textDecoration: "none" }}>{tournament.name}</Link>
            <span>/</span>
            <span style={{ color: "var(--white-70)" }}>{player.name}</span>
          </div>
        </div>

        {/* HERO */}
        <div style={{
          background: "var(--charcoal)",
          borderBottom: "1px solid var(--border)",
          padding: "40px 0",
        }}>
          <div className="container-ops">
            <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>

              {/* AVATAR */}
              <div style={{
                width: "80px",
                height: "80px",
                background: "var(--surface-2)",
                border: "2px solid var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {player.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.photo} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 900,
                    fontSize: "2rem",
                    color: "var(--gold)",
                  }}>{player.name[0].toUpperCase()}</span>
                )}
              </div>

              {/* INFO */}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <h1 style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 900,
                    fontSize: "2rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--white)",
                    margin: 0,
                  }}>{player.name}</h1>

                  {player.isCaptain && (
                    <span style={{
                      background: "var(--gold-dim)",
                      border: "1px solid var(--gold)",
                      color: "var(--gold)",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "3px 10px",
                    }}>Captain</span>
                  )}

                  {player.isSubstitute && (
                    <span style={{
                      background: "var(--amber-dim)",
                      border: "1px solid var(--amber)",
                      color: "var(--amber)",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "3px 10px",
                    }}>Sub</span>
                  )}
                </div>

                {player.ign && (
                  <p style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.85rem",
                    color: "var(--white-40)",
                    marginBottom: "4px",
                  }}>{player.ign}</p>
                )}

                {player.pubgId && (
                  <p style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.75rem",
                    color: "var(--white-20)",
                    marginBottom: "12px",
                  }}>PUBG ID: {player.pubgId}</p>
                )}

                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--white-40)", fontFamily: "Barlow Condensed, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Team</span>
                    <p style={{ color: "var(--white)", fontWeight: 700, fontFamily: "Barlow Condensed, sans-serif", fontSize: "0.9rem", marginTop: "2px" }}>
                      {team.name}{team.tag ? ` [${team.tag}]` : ""}
                    </p>
                  </div>

                  {player.role && (
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--white-40)", fontFamily: "Barlow Condensed, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Role</span>
                      <p style={{ color: "var(--white)", fontWeight: 700, fontFamily: "Barlow Condensed, sans-serif", fontSize: "0.9rem", marginTop: "2px" }}>{player.role}</p>
                    </div>
                  )}

                  {player.country && (
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--white-40)", fontFamily: "Barlow Condensed, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Country</span>
                      <p style={{ color: "var(--white)", fontWeight: 700, fontFamily: "Barlow Condensed, sans-serif", fontSize: "0.9rem", marginTop: "2px" }}>
                        {player.countryFlag ? `${player.countryFlag} ` : ""}{player.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="container-ops" style={{ padding: "40px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px", alignItems: "start" }}>

            {/* LEFT — TOURNAMENT */}
            <div>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: "var(--white-40)",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}>Current Tournament</div>

              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <Link
                      href={`/tournaments/${tournament.slug}`}
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "var(--white)",
                        textDecoration: "none",
                      }}
                    >
                      {tournament.name}
                    </Link>

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                      {tournament.format && (
                        <span style={{ fontSize: "0.78rem", color: "var(--white-40)", fontFamily: "Barlow, sans-serif" }}>
                          {tournament.format}
                        </span>
                      )}
                      {tournament.prizePool && (
                        <span style={{ fontSize: "0.78rem", color: "var(--gold)", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700 }}>
                          {tournament.prizePool}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {tournament.status === "LIVE" && (
                      <span className="badge-live">Live</span>
                    )}
                    {tournament.status === "COMPLETED" && (
                      <span className="badge-completed">Completed</span>
                    )}
                    {tournament.status === "draft" && (
                      <span className="badge-upcoming">Upcoming</span>
                    )}
                  </div>
                </div>
              </div>

              {/* TEAMMATES */}
              {teammates.length > 0 && (
                <div style={{ marginTop: "32px" }}>
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    color: "var(--white-40)",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}>Teammates</div>

                  <div style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                  }}>
                    {teammates.map((tm, i) => (
                      <div key={tm.id} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "12px 20px",
                        borderBottom: i < teammates.length - 1 ? "1px solid var(--border)" : "none",
                      }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <span style={{
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 800,
                            fontSize: "0.8rem",
                            color: "var(--white-40)",
                          }}>{tm.name[0].toUpperCase()}</span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: "var(--white)",
                            margin: 0,
                          }}>
                            {tm.name}
                            {tm.isCaptain && (
                              <span style={{ marginLeft: "8px", color: "var(--gold)", fontSize: "0.65rem", letterSpacing: "0.1em" }}>C</span>
                            )}
                          </p>
                          {tm.ign && (
                            <p style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: "0.72rem",
                              color: "var(--white-40)",
                              margin: 0,
                            }}>{tm.ign}</p>
                          )}
                        </div>

                        {tm.role && (
                          <span style={{
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--white-40)",
                          }}>{tm.role}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — TEAM CARD */}
            <div>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: "var(--white-40)",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}>Team</div>

              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "20px",
              }}>
                {team.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={team.logo} alt={team.name} style={{ width: "48px", height: "48px", objectFit: "contain", marginBottom: "12px" }} />
                ) : (
                  <div style={{
                    width: "48px",
                    height: "48px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}>
                    <span style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 900,
                      fontSize: "1.2rem",
                      color: "var(--gold)",
                    }}>{team.name[0].toUpperCase()}</span>
                  </div>
                )}

                <p style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--white)",
                  margin: "0 0 4px",
                }}>{team.name}</p>

                {team.tag && (
                  <p style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.78rem",
                    color: "var(--white-40)",
                    margin: "0 0 16px",
                  }}>[{team.tag}]</p>
                )}

                {team.country && (
                  <p style={{ fontSize: "0.82rem", color: "var(--white-40)", margin: "0 0 16px" }}>
                    {team.countryFlag ? `${team.countryFlag} ` : ""}{team.country}
                  </p>
                )}

                <Link
                  href={`/tournaments/${tournament.slug}`}
                  className="btn-secondary"
                  style={{ fontSize: "0.78rem", padding: "8px 16px", display: "inline-flex" }}
                >
                  View Tournament
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}