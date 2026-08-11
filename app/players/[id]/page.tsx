import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getPlayer(id: string) {
  try {
    return await prisma.player.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            tournament: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                game: true,
              },
            },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

async function getPlayerStats(playerId: string) {
  try {
    return await prisma.playerStat.findMany({
      where: { playerId },
      include: {
        match: {
          include: {
            round: {
              include: {
                tournament: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function PlayerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const player = await getPlayer(params.id);
  if (!player) notFound();

  const stats = await getPlayerStats(params.id);

  const totalKills  = stats.reduce((s: number, r: any) => s + (r.kills || 0), 0);
  const totalMatches = stats.length;
  const avgKills    = totalMatches > 0 ? (totalKills / totalMatches).toFixed(1) : "0";

  return (
    <>
      <PublicNav />

      <main style={{ paddingTop: "56px", minHeight: "100vh", background: "var(--black-rich)" }}>

        {/* Header */}
        <div style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
          <div className="container">
            <p className="label-section" style={{ marginBottom: "10px" }}>Player Profile</p>
            <h1 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px, 5vw, 48px)",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: "var(--white)",
              marginBottom: "8px",
            }}>
              {(player as any).name}
            </h1>
            {(player as any).team && (
              <p style={{ color: "var(--muted-light)", fontSize: "14px" }}>
                Team:{" "}
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                  {(player as any).team.name}
                </span>
                {(player as any).team.tournament && (
                  <>
                    {" "}&middot;{" "}
                    <Link
                      href={`/tournaments/${(player as any).team.tournament.slug}`}
                      style={{ color: "var(--muted-light)", textDecoration: "underline" }}
                    >
                      {(player as any).team.tournament.name}
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="section" style={{ paddingTop: "40px" }}>
          <div className="container">

            {/* Stat Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "16px",
              marginBottom: "40px",
            }}>
              {[
                { label: "Total Kills",    value: totalKills    },
                { label: "Matches Played", value: totalMatches  },
                { label: "Avg Kills/Match", value: avgKills     },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: "var(--charcoal)",
                  border: "1px solid var(--border)",
                  padding: "24px",
                  textAlign: "center",
                }}>
                  <p style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "var(--white)",
                    marginBottom: "6px",
                  }}>
                    {stat.value}
                  </p>
                  <p style={{
                    fontSize: "11px",
                    color: "var(--muted-light)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Match History */}
            <h2 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--white)",
              marginBottom: "16px",
            }}>
              Match History
            </h2>

            {stats.length === 0 ? (
              <div style={{
                padding: "60px",
                textAlign: "center",
                background: "var(--charcoal)",
                border: "1px solid var(--border)",
              }}>
                <p style={{ color: "var(--muted-light)", fontSize: "14px" }}>
                  No match stats recorded yet.
                </p>
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)", overflow: "hidden" }} className="scroll-x">
                <table className="standings-table" style={{ background: "var(--charcoal)" }}>
                  <thead>
                    <tr>
                      <th>Tournament</th>
                      <th style={{ textAlign: "right" }}>Match</th>
                      <th style={{ textAlign: "right" }}>Kills</th>
                      <th style={{ textAlign: "right" }}>Damage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((s: any) => (
                      <tr key={s.id}>
                        <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                          {s.match?.round?.tournament?.name ?? "—"}
                        </td>
                        <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {s.match?.matchNumber ?? "—"}
                        </td>
                        <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--white)" }}>
                          {s.kills ?? 0}
                        </td>
                        <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {s.damage ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}