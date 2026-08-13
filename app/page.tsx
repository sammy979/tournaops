import { getServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const user = await getServerUser();

  const recentTournaments = await prisma.tournament.findMany({
    where: { status: "published", isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      name: true,
      game: true,
      status: true,
      slug: true,
      maxTeams: true,
      createdAt: true,
      startDate: true,
      teams: { select: { id: true } },
    },
  });

  const totalTournaments = await prisma.tournament.count();
  const totalUsers = await prisma.user.count();
  const totalTeams = await prisma.team.count();

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "Barlow Condensed, sans-serif",
      overflowX: "hidden",
    }}>

      <section style={{
        borderBottom: "1px solid #2a2a2a",
        padding: "5rem 2rem 4rem",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          color: "#D4AF37",
          letterSpacing: "0.2em",
          marginBottom: "1rem",
          fontWeight: "600",
        }}>
          ESPORTS TOURNAMENT OPERATIONS
        </div>
        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
          fontWeight: "900",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginBottom: "1.5rem",
          textTransform: "uppercase",
          color: "#fff",
        }}>
          RUN TOURNAMENTS.<br />
          <span style={{ color: "#D4AF37" }}>NOT SPREADSHEETS.</span>
        </h1>
        <p style={{
          fontSize: "1.05rem",
          color: "#b8b8b8",
          maxWidth: "540px",
          margin: "0 auto 2.5rem",
          lineHeight: 1.6,
          fontFamily: "var(--font-mono)",
        }}>
          Professional esports tournament management built for Nepal.
          Brackets, scoring, registrations, live overlays — all in one place.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {user ? (
            <Link href="/dashboard" style={{
              padding: "0.875rem 2.5rem",
              background: "#D4AF37",
              color: "#0a0a0a",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              fontWeight: "700",
              textDecoration: "none",
              letterSpacing: "0.1em",
            }}>
              OPEN DASHBOARD →
            </Link>
          ) : (
            <>
              <Link href="/register" style={{
                padding: "0.875rem 2.5rem",
                background: "#D4AF37",
                color: "#0a0a0a",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                fontWeight: "700",
                textDecoration: "none",
                letterSpacing: "0.1em",
              }}>
                GET STARTED FREE →
              </Link>
              <Link href="/login" style={{
                padding: "0.875rem 2.5rem",
                background: "transparent",
                color: "#fff",
                border: "1px solid #3a3a3a",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                fontWeight: "700",
                textDecoration: "none",
                letterSpacing: "0.1em",
              }}>
                SIGN IN
              </Link>
            </>
          )}
        </div>
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        borderBottom: "1px solid #2a2a2a",
        width: "100%",
        maxWidth: "100vw",
      }}>
        {[
          { label: "TOURNAMENTS CREATED", value: totalTournaments },
          { label: "ORGANIZERS", value: totalUsers },
          { label: "TEAMS REGISTERED", value: totalTeams },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: "2.5rem 1rem",
            textAlign: "center",
            borderRight: i < 2 ? "1px solid #2a2a2a" : "none",
            overflow: "hidden",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: "900",
              color: "#D4AF37",
              lineHeight: 1,
              marginBottom: "0.75rem",
            }}>
              {stat.value.toLocaleString()}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "#8a8a8a",
              letterSpacing: "0.15em",
              fontWeight: "600",
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      <section style={{ padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "#D4AF37",
                letterSpacing: "0.2em",
                marginBottom: "0.35rem",
                fontWeight: "600",
              }}>
                LIVE NOW
              </div>
              <h2 style={{
                fontSize: "1.75rem",
                fontWeight: "800",
                textTransform: "uppercase",
                color: "#fff",
                margin: 0,
              }}>
                Active Tournaments
              </h2>
            </div>
            {user && (
              <Link href="/dashboard/tournaments/create" style={{
                padding: "0.625rem 1.5rem",
                background: "transparent",
                color: "#D4AF37",
                border: "1px solid #D4AF37",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: "700",
                textDecoration: "none",
              }}>
                + CREATE TOURNAMENT
              </Link>
            )}
          </div>

          {recentTournaments.length === 0 ? (
            <div style={{
              padding: "4rem 2rem",
              textAlign: "center",
              border: "1px solid #2a2a2a",
              background: "#141414",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "#8a8a8a",
                marginBottom: "1rem",
                letterSpacing: "0.1em",
              }}>
                NO ACTIVE TOURNAMENTS
              </div>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontSize: "1.2rem",
                color: "#b8b8b8",
                marginBottom: "1.5rem",
              }}>
                Be the first to create a tournament on TournaOps
              </div>
              {user ? (
                <Link href="/dashboard/tournaments/create" style={{
                  padding: "0.875rem 2rem",
                  background: "#D4AF37",
                  color: "#0a0a0a",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "inline-block",
                }}>
                  CREATE YOUR FIRST TOURNAMENT
                </Link>
              ) : (
                <Link href="/register" style={{
                  padding: "0.875rem 2rem",
                  background: "#D4AF37",
                  color: "#0a0a0a",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "inline-block",
                }}>
                  SIGN UP TO CREATE TOURNAMENTS
                </Link>
              )}
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1px",
              background: "#2a2a2a",
            }}>
              {recentTournaments.map((t) => (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.slug}`}
                  style={{
                    background: "#141414",
                    padding: "1.5rem",
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      color: "#D4AF37",
                      letterSpacing: "0.15em",
                      fontWeight: "600",
                    }}>
                      {t.game.toUpperCase()}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "#8a8a8a",
                      padding: "0.2rem 0.5rem",
                      border: "1px solid #2a2a2a",
                      letterSpacing: "0.1em",
                    }}>
                      {t.status.toUpperCase()}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontSize: "1.35rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                    lineHeight: 1.2,
                    color: "#fff",
                  }}>
                    {t.name}
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "#8a8a8a",
                  }}>
                    <span>{t.teams.length} / {t.maxTeams} TEAMS</span>
                    {t.startDate && (
                      <span>
                        {new Date(t.startDate).toLocaleDateString("en-NP", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{
        borderTop: "1px solid #2a2a2a",
        padding: "4rem 2rem",
        background: "#141414",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "#D4AF37",
            letterSpacing: "0.2em",
            marginBottom: "0.5rem",
            fontWeight: "600",
          }}>
            EVERYTHING YOU NEED
          </div>
          <h2 style={{
            fontSize: "1.75rem",
            fontWeight: "800",
            textTransform: "uppercase",
            marginBottom: "2.5rem",
            color: "#fff",
          }}>
            Built for Esports Organizers
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1px",
            background: "#2a2a2a",
          }}>
            {[
              { icon: "⚡", title: "LIVE BRACKETS", desc: "Auto-advancing brackets with real-time score updates" },
              { icon: "📋", title: "REGISTRATION MGMT", desc: "Team sign-ups, approval workflow, waitlist handling" },
              { icon: "🏆", title: "PRIZE POOLS", desc: "Configure position-based cash and item prize distribution" },
              { icon: "📊", title: "SCORING ENGINE", desc: "PMGC, PMPL presets or fully custom scoring rules" },
              { icon: "📡", title: "LIVE OVERLAYS", desc: "OBS-ready scoreboard and standings overlays" },
              { icon: "🤖", title: "AI TOOLS", desc: "Screenshot result extraction and match summaries" },
            ].map((feature, i) => (
              <div key={i} style={{ background: "#0a0a0a", padding: "2rem 1.5rem" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{feature.icon}</div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#D4AF37",
                  letterSpacing: "0.1em",
                  marginBottom: "0.5rem",
                }}>
                  {feature.title}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem",
                  color: "#8a8a8a",
                  lineHeight: 1.5,
                }}>
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        borderTop: "1px solid #2a2a2a",
        padding: "4rem 2rem",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          color: "#D4AF37",
          letterSpacing: "0.2em",
          marginBottom: "0.5rem",
          fontWeight: "600",
        }}>
          NEPAL ONLY
        </div>
        <h2 style={{
          fontSize: "1.75rem",
          fontWeight: "800",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
          color: "#fff",
        }}>
          Pro Plan — Rs 299 / Month
        </h2>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.85rem",
          color: "#b8b8b8",
          maxWidth: "440px",
          margin: "0 auto 2rem",
          lineHeight: 1.6,
        }}>
          Pay via Khalti, eSewa, or Bank Transfer. Manual verification within 24 hours.
        </p>
        {!user && (
          <Link href="/register" style={{
            padding: "0.875rem 2.5rem",
            background: "#D4AF37",
            color: "#0a0a0a",
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            fontWeight: "700",
            textDecoration: "none",
            letterSpacing: "0.1em",
            display: "inline-block",
          }}>
            START FREE →
          </Link>
        )}
      </section>

      <footer style={{
        borderTop: "1px solid #2a2a2a",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        color: "#8a8a8a",
      }}>
        © {new Date().getFullYear()} TournaOps · Built for Nepal Esports
      </footer>
    </main>
  );
}