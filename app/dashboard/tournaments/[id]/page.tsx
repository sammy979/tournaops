import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

async function getTournament(id: string, userId: string) {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: { id, userId },
      include: {
        user: { select: { username: true } },
        teams: { orderBy: { name: "asc" } },
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

const MAP_COLORS: Record<string, string> = {
  ERANGEL: "#7ec8a0",
  MIRAMAR: "#d4a94a",
  SANHOK: "#6bbf7a",
  VIKENDI: "#8ab4d4",
  LIVIK: "#c4a882",
};

export default async function TournamentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const tournament = await getTournament(params.id, session.userId);
  if (!tournament) notFound();

  const allMatches = tournament.rounds.flatMap((r) => r.matches);
  const completedMatches = allMatches.filter((m) => m.status === "COMPLETED");
  const liveMatch = allMatches.find((m) => m.status === "LIVE");
  const pendingMatches = allMatches.filter((m) => m.status === "PENDING");

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
    .sort((a, b) => b.points - a.points);

  const defaultMap = (tournament as any).defaultMap || "ERANGEL";
  const mapColor = MAP_COLORS[defaultMap?.toUpperCase()] || "var(--text-secondary)";

  const navItems = [
    { label: "Overview", href: `/dashboard/tournaments/${tournament.id}` },
    { label: "Teams", href: `/dashboard/tournaments/${tournament.id}/teams` },
    { label: "Groups", href: `/dashboard/tournaments/${tournament.id}/groups` },
    { label: "Schedule", href: `/dashboard/tournaments/${tournament.id}/schedule` },
    { label: "Results", href: `/dashboard/tournaments/${tournament.id}/results` },
    { label: "Standings", href: `/dashboard/tournaments/${tournament.id}/standings` },
    { label: "AI Import", href: `/dashboard/tournaments/${tournament.id}/ai-import` },
    { label: "Broadcast", href: `/dashboard/tournaments/${tournament.id}/broadcast` },
    { label: "Discord", href: `/dashboard/tournaments/${tournament.id}/discord` },
    { label: "Settings", href: `/dashboard/tournaments/${tournament.id}/settings` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--black-rich)" }}>
      {/* Top bar */}
      <div style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "0 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link href="/dashboard" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted-light)", textDecoration: "none", letterSpacing: "0.08em" }}>
                ← Dashboard
              </Link>
              <span style={{ color: "var(--border-light)" }}>·</span>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--white)" }}>
                {tournament.name}
              </span>
              {tournament.status === "LIVE" && <span className="status-live">Live</span>}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href={`/tournaments/${tournament.id}`} className="btn-ghost" style={{ fontSize: "10px" }}>
                Public View →
              </Link>
              <Link href={`/dashboard/tournaments/${tournament.id}/ai-import`} className="btn-action">
                AI Import
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament sub-nav */}
      <div style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "0 24px", overflowX: "auto" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", height: "40px", alignItems: "stretch" }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted-light)",
                textDecoration: "none",
                borderBottom: "2px solid transparent",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
              className="t-nav-link"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px" }}>
        {/* Live match alert */}
        {liveMatch && (
          <div
            style={{
              marginBottom: "24px",
              padding: "14px 20px",
              background: "rgba(230,57,70,0.06)",
              border: "1px solid rgba(230,57,70,0.25)",
              borderLeft: "3px solid var(--red-live)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="live-dot" />
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "16px", textTransform: "uppercase", color: "var(--white)" }}>
                Match {liveMatch.matchNumber} — Live
              </span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted-light)" }}>
                {(liveMatch as any).map || defaultMap}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href={`/dashboard/tournaments/${tournament.id}/results`} className="btn-action">
                Import Results
              </Link>
              <Link href={`/dashboard/tournaments/${tournament.id}/ai-import`} className="btn-action">
                AI Import
              </Link>
            </div>
          </div>
        )}

        {/* Command grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
            marginBottom: "24px",
          }}
          className="cmd-grid"
        >
          {/* Match Progress */}
          <div style={{ background: "var(--charcoal)", padding: "20px" }}>
            <p className="label-section-muted" style={{ marginBottom: "12px" }}>Match Progress</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "36px", color: "var(--white)", lineHeight: 1 }}>
                {completedMatches.length}
              </span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--muted-light)" }}>
                / {allMatches.length} matches
              </span>
            </div>
            <div style={{ height: "4px", background: "var(--charcoal-mid)" }}>
              <div
                style={{
                  height: "100%",
                  width: allMatches.length > 0 ? `${Math.round((completedMatches.length / allMatches.length) * 100)}%` : "0%",
                  background: "var(--gold)",
                  transition: "width 0.4s",
                }}
              />
            </div>
            <p style={{ marginTop: "6px", fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.08em" }}>
              {allMatches.length > 0 ? Math.round((completedMatches.length / allMatches.length) * 100) : 0}% complete
            </p>
          </div>

          {/* Teams */}
          <div style={{ background: "var(--charcoal)", padding: "20px" }}>
            <p className="label-section-muted" style={{ marginBottom: "12px" }}>Teams</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "36px", color: "var(--white)", lineHeight: 1 }}>
                {tournament.teams.length}
              </span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--muted-light)" }}>
                / {(tournament as any).maxTeams || 64}
              </span>
            </div>
            <p style={{ marginTop: "8px", fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)" }}>
              registered
            </p>
            <Link href={`/dashboard/tournaments/${tournament.id}/teams`} className="btn-action" style={{ marginTop: "12px" }}>
              Manage Teams
            </Link>
          </div>

          {/* Quick actions */}
          <div style={{ background: "var(--charcoal)", padding: "20px" }}>
            <p className="label-section-muted" style={{ marginBottom: "12px" }}>Quick Actions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href={`/dashboard/tournaments/${tournament.id}/results`} className="btn-action" style={{ justifyContent: "flex-start" }}>
                Import Results
              </Link>
              <Link href={`/dashboard/tournaments/${tournament.id}/ai-import`} className="btn-action" style={{ justifyContent: "flex-start" }}>
                AI Screenshot
              </Link>
              <Link href={`/dashboard/tournaments/${tournament.id}/standings`} className="btn-action" style={{ justifyContent: "flex-start" }}>
                Standings
              </Link>
              <Link href={`/dashboard/tournaments/${tournament.id}/broadcast`} className="btn-action" style={{ justifyContent: "flex-start" }}>
                OBS Overlays
              </Link>
            </div>
          </div>
        </div>

        {/* Standings + Recent Matches */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "24px",
            alignItems: "flex-start",
          }}
          className="content-grid"
        >
          {/* Standings */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <p className="label-section">Standings</p>
              <Link href={`/dashboard/tournaments/${tournament.id}/standings`} className="btn-ghost" style={{ fontSize: "10px" }}>
                Full Standings →
              </Link>
            </div>

            {standings.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                <p style={{ color: "var(--muted-light)", fontSize: "13px" }}>No results yet. Complete matches to see standings.</p>
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)", overflow: "hidden" }} className="scroll-x">
                <table className="standings-table" style={{ background: "var(--charcoal)" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "44px" }}>Pos</th>
                      <th>Team</th>
                      <th style={{ textAlign: "right" }}>M</th>
                      <th style={{ textAlign: "right" }}>K</th>
                      <th style={{ textAlign: "right" }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.slice(0, 15).map((team, i) => (
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

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Recent matches */}
            <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <p className="label-section-muted">Recent Matches</p>
              </div>
              {completedMatches.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)" }}>NO COMPLETED MATCHES</p>
                </div>
              ) : (
                <div>
                  {completedMatches.slice(-5).reverse().map((match) => (
                    <div
                      key={match.id}
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", color: "var(--text-primary)" }}>
                          Match {String(match.matchNumber || 0).padStart(2, "0")} — {(match as any).map || defaultMap}
                        </p>
                        <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
                          {match.results?.length || 0} results
                        </p>
                      </div>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--green-bright)", fontWeight: 700, letterSpacing: "0.1em" }}>
                        ✓
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tournament info */}
            <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <p className="label-section-muted">Tournament Info</p>
              </div>
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Status", value: tournament.status },
                  { label: "Format", value: (tournament as any).format || "Squad" },
                  { label: "Map", value: defaultMap, color: mapColor },
                  { label: "Rounds", value: tournament.rounds.length.toString() },
                ].map((info) => (
                  <div key={info.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {info.label}
                    </span>
                    <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "13px", color: info.color || "var(--text-primary)", textTransform: "uppercase" }}>
                      {info.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .t-nav-link:hover { color: var(--white) !important; border-bottom-color: var(--gold) !important; }
        @media (max-width: 900px) {
          .cmd-grid { grid-template-columns: 1fr 1fr !important; }
          .content-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .cmd-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}