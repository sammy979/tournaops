import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import { prisma } from "@/lib/prisma";

async function getTeamRankings() {
  try {
    // Aggregate results across all completed tournaments
    const results = await prisma.matchResult.findMany({
      where: {
        match: {
          status: "COMPLETED",
          round: {
            tournament: {
              status: "COMPLETED",
            },
          },
        },
      },
      include: {
        team: { select: { id: true, name: true } },
        match: {
          include: {
            round: {
              include: {
                tournament: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    const teamStats: Record<
      string,
      {
        name: string;
        tournaments: Set<string>;
        matches: number;
        kills: number;
        points: number;
        wwcd: number;
      }
    > = {};

    results.forEach((res: any) => {
      const tid = res.team?.id;
      const name = res.team?.name;
      const tournamentId = res.match?.round?.tournament?.id;
      if (!tid || !name) return;

      if (!teamStats[tid]) {
        teamStats[tid] = {
          name,
          tournaments: new Set(),
          matches: 0,
          kills: 0,
          points: 0,
          wwcd: 0,
        };
      }
      teamStats[tid].matches += 1;
      teamStats[tid].kills += res.kills || 0;
      teamStats[tid].points += res.totalPoints || 0;
      if (res.placement === 1) teamStats[tid].wwcd += 1;
      if (tournamentId) teamStats[tid].tournaments.add(tournamentId);
    });

    return Object.entries(teamStats)
      .map(([id, s]) => ({
        id,
        name: s.name,
        tournaments: s.tournaments.size,
        matches: s.matches,
        kills: s.kills,
        points: s.points,
        wwcd: s.wwcd,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 50);
  } catch {
    return [];
  }
}

export default async function RankingsPage() {
  const rankings = await getTeamRankings();

  return (
    <>
      <PublicNav />

      <main style={{ paddingTop: "56px", minHeight: "100vh", background: "var(--black-rich)" }}>
        {/* Header */}
        <div style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
          <div className="container">
            <p className="label-section" style={{ marginBottom: "10px" }}>TournaOps</p>
            <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: "clamp(32px, 5vw, 52px)", textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--white)", marginBottom: "12px" }}>
              Team Rankings
            </h1>
            <p style={{ color: "var(--muted-light)", fontSize: "14px" }}>
              Cumulative performance across all completed TournaOps tournaments.
            </p>
          </div>
        </div>

        <div className="section" style={{ paddingTop: "40px" }}>
          <div className="container">
            {rankings.length === 0 ? (
              <div style={{ padding: "80px", textAlign: "center", background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                <p className="label-section-muted" style={{ marginBottom: "12px" }}>No Ranking Data</p>
                <p style={{ color: "var(--muted-light)", fontSize: "14px" }}>
                  Rankings will appear after tournaments are completed and results are recorded.
                </p>
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)", overflow: "hidden" }} className="scroll-x">
                <table className="standings-table" style={{ background: "var(--charcoal)" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "52px" }}>Rank</th>
                      <th>Team</th>
                      <th style={{ textAlign: "right" }}>Tournaments</th>
                      <th style={{ textAlign: "right" }}>Matches</th>
                      <th style={{ textAlign: "right" }}>WWCD</th>
                      <th style={{ textAlign: "right" }}>Kills</th>
                      <th style={{ textAlign: "right" }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((team, i) => (
                      <tr key={team.id}>
                        <td>
                          <div
                            className={`pos-badge ${i < 3 ? `pos-${i + 1}` : ""}`}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </div>
                        </td>
                        <td className="team-name-cell">{team.name}</td>
                        <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {team.tournaments}
                        </td>
                        <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {team.matches}
                        </td>
                        <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: team.wwcd > 0 ? "var(--gold-bright)" : "var(--text-secondary)" }}>
                          {team.wwcd}
                        </td>
                        <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {team.kills}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="points-cell">{team.points}</span>
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