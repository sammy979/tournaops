import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrganizerCommandCenter from "@/components/organizer/OrganizerCommandCenter";
import TournamentStatusManager from "@/components/tournament/TournamentStatusManager";

export const dynamic = "force-dynamic";

async function getTournament(id: string, userId: string) {
  const tournament = await prisma.tournament.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      userId,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      game: true,
      format: true,
      maxTeams: true,
      overlayToken: true,
      createdAt: true,
      _count: {
        select: { teams: true, matches: true, stages: true },
      },
    },
  });
  return tournament;
}

export default async function TournamentDashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const tournament = await getTournament(params.id, session.userId);
  if (!tournament) notFound();

  const status = (tournament.status || "").toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* TOURNAMENT HEADER */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container-ops" style={{ padding: "24px 24px 0" }}>
          {/* BREADCRUMB */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            <Link href="/dashboard" style={{
              color: "var(--white-40)",
              textDecoration: "none",
            }}>Dashboard</Link>
            <span style={{ color: "var(--white-20)" }}>→</span>
            <Link href="/dashboard" style={{
              color: "var(--white-40)",
              textDecoration: "none",
            }}>Tournaments</Link>
            <span style={{ color: "var(--white-20)" }}>→</span>
            <span style={{ color: "var(--white-70)" }}>{tournament.name}</span>
          </div>

          {/* NAME + STATUS ROW */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <h1 style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "1.8rem",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "var(--white)",
                lineHeight: 1,
              }}>{tournament.name}</h1>

              {status === "LIVE" && <span className="badge-live">Live</span>}
              {(status === "UPCOMING" || status === "REGISTRATION") && (
                <span className="badge-upcoming">{status}</span>
              )}
              {status === "COMPLETED" && <span className="badge-completed">Completed</span>}
              {status === "DRAFT" && <span className="badge-warning">Draft</span>}
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Link
                href={`/tournaments/${tournament.slug || tournament.id}`}
                className="btn-secondary"
                style={{ padding: "7px 14px" }}
              >
                Public Page →
              </Link>
              <Link
                href={`/dashboard/tournaments/${tournament.id}/settings`}
                className="btn-primary"
                style={{ padding: "7px 14px" }}
              >
                Settings
              </Link>
            </div>
          </div>

          {/* STATS ROW */}
          <div style={{
            display: "flex",
            gap: "32px",
            paddingBottom: "20px",
            flexWrap: "wrap",
          }}>
            {[
              { label: "Teams", value: `${tournament._count.teams}${tournament.maxTeams ? `/${tournament.maxTeams}` : ""}` },
              { label: "Matches", value: String(tournament._count.matches) },
              { label: "Stages", value: String(tournament._count.stages) },
              { label: "Game", value: (tournament.game || "PUBG").toUpperCase() },
              { label: "Format", value: (tournament.format || "SQUAD").toUpperCase() },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "var(--white)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>{stat.value}</div>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  color: "var(--white-40)",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* TAB NAV */}
          <div style={{
            display: "flex",
            gap: "0",
            borderTop: "1px solid var(--border)",
            overflowX: "auto",
          }}>
            {[
              { label: "Command Center", href: `/dashboard/tournaments/${tournament.id}`, active: true },
              { label: "Overview", href: `/dashboard/tournaments/${tournament.id}/overview` },
              { label: "Teams", href: `/dashboard/tournaments/${tournament.id}/teams` },
              { label: "Stages", href: `/dashboard/tournaments/${tournament.id}/stages` },
              { label: "Matches", href: `/dashboard/tournaments/${tournament.id}/matches` },
              { label: "Standings", href: `/dashboard/tournaments/${tournament.id}/standings` },
              { label: "Results", href: `/dashboard/tournaments/${tournament.id}/match-results` },
              { label: "Broadcast", href: `/dashboard/tournaments/${tournament.id}/broadcast` },
              { label: "Discord", href: `/dashboard/tournaments/${tournament.id}/discord` },
              { label: "AI", href: `/dashboard/tournaments/${tournament.id}/ai-import` },
            ].map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "12px 16px",
                  color: tab.active ? "var(--white)" : "var(--white-40)",
                  textDecoration: "none",
                  borderBottom: tab.active ? "2px solid var(--gold)" : "2px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease",
                }}
              >{tab.label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT — Command Center */}
      <div className="container-ops" style={{ padding: "24px" }}>
        <OrganizerCommandCenter tournamentId={tournament.id} />
      </div>
    </div>
  );
}