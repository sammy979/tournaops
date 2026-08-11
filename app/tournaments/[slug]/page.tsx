import Link from "next/link";
import { notFound } from "next/navigation";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import { prisma } from "@/lib/prisma";

async function getTournament(id: string) {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        OR: [{ id }, { slug: id } as any],
      },
      include: {
        user: { select: { username: true, id: true } },
        teams: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
        rounds: {
          orderBy: { order: "asc" },
          include: {
            matches: {
              orderBy: { matchNumber: "asc" },
              include: {
                results: {
                  include: { team: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
      },
    });
    return tournament;
  } catch {
    return null;
  }
}

const STATUS_LABELS: Record<string, string> = {
  LIVE: "Live",
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
  REGISTRATION: "Registration Open",
  DRAFT: "Draft",
};

const MAP_COLORS: Record<string, string> = {
  ERANGEL: "#7ec8a0",
  MIRAMAR: "#d4a94a",
  SANHOK: "#6bbf7a",
  VIKENDI: "#8ab4d4",
  LIVIK: "#c4a882",
};

export default async function TournamentPage({
  params,
}: {
  params: { id: string };
}) {
  const tournament = await getTournament(params.id);
  if (!tournament) notFound();

  const allMatches = tournament.rounds.flatMap((r) => r.matches);
  const completedMatches = allMatches.filter((m) => m.status === "COMPLETED");
  const liveMatch = allMatches.find((m) => m.status === "LIVE");

  // Build standings
  const teamPoints: Record<string, { name: string; points: number; kills: number; matches: number }> = {};
  completedMatches.forEach((match) => {
    match.results?.forEach((res: any) => {
      const tid = res.teamId || res.team?.id;
      const name = res.team?.name || "Unknown";
      if (!tid) return;
      if (!teamPoints[tid]) {
        teamPoints[tid] = { name, points: 0, kills: 0, matches: 0 };
      }
      teamPoints[tid].points += res.totalPoints || 0;
      teamPoints[tid].kills += res.kills || 0;
      teamPoints[tid].matches += 1;
    });
  });

  const standings = Object.values(teamPoints)
    .sort((a, b) => b.points - a.points)
    .slice(0, 20);

  const statusLabel = STATUS_LABELS[tournament.status] || tournament.status;
  const defaultMap = (tournament as any).defaultMap || "ERANGEL";
  const mapColor = MAP_COLORS[defaultMap?.toUpperCase()] || "var(--text-secondary)";

  function getStatusClass(status: string) {
    switch (status) {
      case "LIVE": return "status-live";
      case "UPCOMING": return "status-upcoming";
      case "COMPLETED": return "status-completed";
      case "REGISTRATION": return "status-registration";
      default: return "status-upcoming";
    }
  }

  return (
    <>
      <PublicNav />

      <main style={{ paddingTop: "56px", minHeight: "100vh", background: "var(--black-rich)" }}>
        {/* Tournament Hero */}
        <div
          className="tournament-hero-bg"
          style={{ padding: "48px 0", borderBottom: "1px solid var(--border)" }}
        >
          <div className="container">
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Link href="/tournaments" className="nav-link" style={{ fontSize: "11px" }}>Tournaments</Link>
              <span style={{ color: "var(--muted)", fontSize: "11px" }}>→</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--muted-light)" }}>
                {tournament.name}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "32px",
                alignItems: "flex-start",
              }}
              className="tournament-hero-grid"
            >
              <div>
                {/* Status */}
                <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span className={getStatusClass(tournament.status)}>{statusLabel}</span>
                  {liveMatch && (
                    <span className="text-match" style={{ color: "var(--muted-light)" }}>
                      Match {liveMatch.matchNumber} Running
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(32px, 6vw, 56px)",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    color: "var(--white)",
                    lineHeight: 0.95,
                    marginBottom: "12px",
                  }}
                >
                  {tournament.name}
                </h1>

                <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--muted-light)", letterSpacing: "0.1em", marginBottom: "24px" }}>
                  Organized by {tournament.user?.username || "Unknown"}
                </p>

                {/* Stats */}
                <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                  {[
                    { label: "Teams", value: tournament.teams.length.toString() },
                    { label: "Matches", value: allMatches.length.toString() },
                    { label: "Completed", value: completedMatches.length.toString() },
                    { label: "Format", value: (tournament as any).format || "Squad" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }}>
                        {s.label}
                      </p>
                      <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "22px", color: "var(--white)", textTransform: "uppercase" }}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map badge */}
              <div
                style={{
                  background: "var(--charcoal)",
                  border: "1px solid var(--border)",
                  padding: "20px 28px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Primary Map
                </p>
                <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: "28px", textTransform: "uppercase", color: mapColor, letterSpacing: "0.04em" }}>
                  {defaultMap}
                </p>
                {tournament.startDate && (
                  <>
                    <div style={{ height: "1px", background: "var(--border)", margin: "14px 0" }} />
                    <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.1em" }}>
                      {new Date(tournament.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).toUpperCase()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container" style={{ padding: "40px 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: "32px",
              alignItems: "flex-start",
            }}
            className="tournament-content-grid"
          >
            {/* Main */}
            <div>
              {/* Standings */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <p className="label-section">Standings</p>
                  {tournament.status === "LIVE" && <span className="status-live">Live</span>}
                </div>

                {standings.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                    <p className="label-section-muted">No Results Yet</p>
                    <p style={{ color: "var(--muted-light)", fontSize: "13px", marginTop: "8px" }}>
                      Standings will appear after the first match is completed.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflow: "hidden", border: "1px solid var(--border)" }} className="scroll-x">
                    <table className="standings-table" style={{ background: "var(--charcoal)" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "44px" }}>Pos</th>
                          <th>Team</th>
                          <th style={{ textAlign: "right" }}>Matches</th>
                          <th style={{ textAlign: "right" }}>Kills</th>
                          <th style={{ textAlign: "right" }}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((team, i) => (
                          <tr key={team.name}>
                            <td>
                              <span className={`rank-cell rank-${i + 1}`}>
                                {String(i + 1).padStart(2, "0")}
                              </span>
                            </td>
                            <td className="team-name-cell">{team.name}</td>
                            <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--text-secondary)" }}>{team.matches}</td>
                            <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--text-secondary)" }}>{team.kills}</td>
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

              {/* Match History */}
              <div>
                <p className="label-section" style={{ marginBottom: "16px" }}>Matches</p>
                {allMatches.length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center", background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                    <p style={{ color: "var(--muted-light)", fontSize: "13px" }}>No matches scheduled yet.</p>
                  </div>
                ) : (
                  <div style={{ border: "1px solid var(--border)", background: "var(--charcoal)", overflow: "hidden" }}>
                    {allMatches.slice(0, 20).map((match) => (
                      <div
                        key={match.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", fontWeight: 700, width: "60px" }}>
                            MATCH {String(match.matchNumber || 0).padStart(2, "0")}
                          </span>
                          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "14px", textTransform: "uppercase", color: "var(--text-primary)" }}>
                            {(match as any).map || "—"}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {match.results && match.results.length > 0 && (
                            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted-light)" }}>
                              {match.results.length} results
                            </span>
                          )}
                          <span
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: "9px",
                              fontWeight: 700,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: match.status === "LIVE" ? "var(--red-live)" : match.status === "COMPLETED" ? "var(--green-bright)" : "var(--muted)",
                            }}
                          >
                            {match.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {allMatches.length > 20 && (
                      <div style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.08em" }}>
                          + {allMatches.length - 20} more matches
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Teams */}
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <p className="label-section-muted">Teams ({tournament.teams.length})</p>
                </div>
                <div style={{ padding: "12px 0", maxHeight: "320px", overflowY: "auto" }}>
                  {tournament.teams.slice(0, 24).map((team) => (
                    <div
                      key={team.id}
                      style={{
                        padding: "8px 16px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          background: "var(--charcoal-mid)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "9px", color: "var(--muted-light)", textTransform: "uppercase" }}>
                          {team.name.slice(0, 2)}
                        </span>
                      </div>
                      <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                        {team.name}
                      </span>
                    </div>
                  ))}
                  {tournament.teams.length > 24 && (
                    <div style={{ padding: "8px 16px", textAlign: "center" }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)" }}>
                        + {tournament.teams.length - 24} more
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tournament Info */}
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <p className="label-section-muted">Info</p>
                </div>
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Status", value: statusLabel },
                    { label: "Format", value: (tournament as any).format || "Squad" },
                    { label: "Map", value: defaultMap },
                    { label: "Organizer", value: tournament.user?.username || "—" },
                    ...(tournament.startDate ? [{ label: "Date", value: new Date(tournament.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }] : []),
                  ].map((info) => (
                    <div key={info.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {info.label}
                      </span>
                      <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", textTransform: "uppercase" }}>
                        {info.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />

      <style>{`
        @media (max-width: 900px) {
          .tournament-hero-grid { grid-template-columns: 1fr !important; }
          .tournament-content-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}