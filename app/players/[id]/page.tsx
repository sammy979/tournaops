import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";

export const dynamic = "force-dynamic";

async function getPlayer(id: string) {
  try {
    return await prisma.player.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
            tournament: {
              select: { id: true, slug: true, name: true, status: true },
            },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const player = await getPlayer(params.id);
  if (!player) notFound();

  return (
    <>
      <SiteHeader session={session} />
      <main style={{ minHeight: "100vh", background: "var(--black)" }}>
        <div style={{
          background: "var(--charcoal)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div className="container-ops" style={{ padding: "40px 24px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              fontFamily: "Barlow Condensed, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              <Link href="/tournaments" style={{ color: "var(--white-40)", textDecoration: "none" }}>Tournaments</Link>
              <span style={{ color: "var(--white-20)" }}>→</span>
              {player.team?.tournament && (
                <>
                  <Link href={`/tournaments/${player.team.tournament.slug || player.team.tournament.id}`} style={{ color: "var(--white-40)", textDecoration: "none" }}>
                    {player.team.tournament.name}
                  </Link>
                  <span style={{ color: "var(--white-20)" }}>→</span>
                </>
              )}
              <span style={{ color: "var(--gold)" }}>Player</span>
            </div>

            <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{
                width: "96px",
                height: "96px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
                {player.photo ? (
                  <img src={player.photo} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 900,
                    fontSize: "2.4rem",
                    color: "var(--gold)",
                  }}>{player.name[0].toUpperCase()}</span>
                )}
              </div>

              <div>
                <div className="section-label">Player Profile</div>
                <h1 style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 900,
                  fontSize: "2.4rem",
                  color: "var(--white)",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}>{player.name}</h1>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {player.ign && (
                    <span style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.82rem",
                      color: "var(--gold)",
                    }}>@{player.ign}</span>
                  )}
                  {player.role && (
                    <span style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      color: "var(--white-40)",
                      textTransform: "uppercase",
                      padding: "3px 10px",
                      border: "1px solid var(--border)",
                    }}>{player.role}</span>
                  )}
                  {player.isCaptain && <span className="badge-warning">Captain</span>}
                  {player.isSubstitute && <span className="badge-upcoming">Sub</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-ops" style={{ padding: "32px 24px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "32px",
            alignItems: "start",
          }}>
            <div>
              <div className="section-label">Player Info</div>
              <div style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}>
                {[
                  { label: "Name", value: player.name },
                  { label: "IGN", value: player.ign || "—" },
                  { label: "PUBG ID", value: player.pubgId || "—" },
                  { label: "Role", value: player.role || "—" },
                  { label: "Country", value: player.country || "—" },
                  { label: "Team", value: player.team?.name || "—" },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <span style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      letterSpacing: "0.1em",
                      color: "var(--white-40)",
                      textTransform: "uppercase",
                    }}>{row.label}</span>
                    <span style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "var(--white)",
                      textTransform: "uppercase",
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {player.team && (
              <div>
                <div className="section-label">Team</div>
                <Link
                  href={`/tournaments/${player.team.tournament?.slug || player.team.tournament?.id}`}
                  style={{
                    display: "block",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderTop: "3px solid var(--gold)",
                    padding: "20px",
                    textDecoration: "none",
                  }}
                >
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: "var(--white)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "8px",
                  }}>{player.team.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--white-40)" }}>
                    {player.team.tournament?.name}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}