import Link from "next/link";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import TournamentTile from "@/components/marketing/TournamentTile";
import WorkflowSection from "@/components/marketing/WorkflowSection";
import BroadcastSection from "@/components/marketing/BroadcastSection";
import DiscordSection from "@/components/marketing/DiscordSection";
import OrganizerCTA from "@/components/marketing/OrganizerCTA";
import LiveMatchModule from "@/components/marketing/LiveMatchModule";
import { prisma } from "@/lib/prisma";

async function getPublicTournaments() {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        status: { in: ["LIVE", "UPCOMING", "REGISTRATION", "COMPLETED"] },
      },
      include: {
        user: { select: { username: true } },
        teams: { select: { id: true } },
        rounds: { include: { matches: { select: { id: true, status: true } } } },
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
      take: 12,
    });

    return tournaments.map((t) => {
      const allMatches = t.rounds.flatMap((r) => r.matches);
      const completedMatches = allMatches.filter((m) => m.status === "COMPLETED");

      return {
        id: t.id,
        name: t.name,
        status: t.status,
        teamCount: t.teams.length,
        maxTeams: t.maxTeams || 64,
        matchCount: allMatches.length,
        currentMatch: completedMatches.length || null,
        format: (t as any).format || "SQUAD",
        map: (t as any).defaultMap || "ERANGEL",
        startDate: t.startDate ? t.startDate.toISOString() : null,
        organizer: t.user?.username || "TournaOps",
        slug: (t as any).slug || null,
      };
    });
  } catch {
    return [];
  }
}

async function getLiveMatchData() {
  try {
    const liveTournament = await prisma.tournament.findFirst({
      where: { status: "LIVE" },
      include: {
        user: { select: { username: true } },
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
        rounds: {
          orderBy: { order: "asc" },
          include: {
            matches: {
              orderBy: { matchNumber: "asc" },
              where: { status: "LIVE" },
              include: {
                results: {
                  include: {
                    team: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!liveTournament) return null;

    const allMatches = liveTournament.rounds.flatMap((r) => r.matches);
    const liveMatch = allMatches[0];

    if (!liveMatch) return null;

    const totalMatches = liveTournament.rounds.reduce(
      (acc, r) => acc + r.matches.length,
      0
    );

    // Build top teams from results
    const teamPoints: Record<string, { name: string; points: number }> = {};
    liveTournament.rounds.flatMap((r) =>
      r.matches.flatMap((m) =>
        m.results?.forEach((res: any) => {
          const tid = res.team?.id;
          if (!tid) return;
          if (!teamPoints[tid]) {
            teamPoints[tid] = { name: res.team.name, points: 0 };
          }
          teamPoints[tid].points += (res.totalPoints || 0);
        })
      )
    );

    const topTeams = Object.values(teamPoints)
      .sort((a, b) => b.points - a.points)
      .slice(0, 4)
      .map((t, i) => ({ rank: i + 1, name: t.name, points: t.points }));

    const submissions = liveMatch.results?.length || 0;

    return {
      tournamentName: liveTournament.name,
      tournamentId: liveTournament.id,
      matchNumber: liveMatch.matchNumber || 1,
      totalMatches,
      map: (liveMatch as any).map || "ERANGEL",
      status: "LIVE",
      submissionsReceived: submissions,
      totalTeams: liveTournament.teams.length,
      topTeams,
    };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [tournaments, liveData] = await Promise.all([
    getPublicTournaments(),
    getLiveMatchData(),
  ]);

  const liveTournaments = tournaments.filter((t) => t.status === "LIVE");
  const upcomingTournaments = tournaments.filter(
    (t) => t.status === "UPCOMING" || t.status === "REGISTRATION"
  );
  const recentTournaments = tournaments.filter((t) => t.status === "COMPLETED");
  const featuredTournaments = [
    ...liveTournaments,
    ...upcomingTournaments,
    ...recentTournaments,
  ].slice(0, 6);

  return (
    <>
      <PublicNav />

      {/* ============================================
          HERO
          ============================================ */}
      <main>
        <section
          style={{
            paddingTop: "56px",
            background: "var(--black-rich)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderBottom: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
              opacity: 0.25,
              pointerEvents: "none",
            }}
          />

          <div className="container-wide" style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 420px",
                gap: "64px",
                alignItems: "center",
                padding: "80px 0",
              }}
              className="hero-grid"
            >
              {/* Left — Headline */}
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      borderLeft: "2px solid var(--gold)",
                      paddingLeft: "10px",
                    }}
                  >
                    The Operating System For PUBG Mobile Competition
                  </span>
                </div>

                <h1 className="text-hero">
                  Run
                  <br />
                  Tournaments.
                  <br />
                  <span style={{ color: "var(--gold)" }}>Not Chaos.</span>
                </h1>

                <p
                  style={{
                    marginTop: "24px",
                    color: "var(--text-secondary)",
                    fontSize: "16px",
                    lineHeight: 1.7,
                    maxWidth: "480px",
                  }}
                >
                  The complete tournament operations system for competitive PUBG Mobile.
                  Registration, groups, matches, scoring, standings, OBS overlays and Discord sync.
                </p>

                {/* Journey line */}
                <div
                  style={{
                    marginTop: "28px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {["Register", "Group", "Match", "Score", "Broadcast", "Champion"].map((step, i, arr) => (
                    <span key={step} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "9px",
                          fontWeight: 600,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: i === arr.length - 1 ? "var(--gold)" : "var(--muted-light)",
                        }}
                      >
                        {step}
                      </span>
                      {i < arr.length - 1 && (
                        <span style={{ color: "var(--border-light)", fontSize: "10px" }}>→</span>
                      )}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "36px",
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link href="/auth/register" className="btn-primary">
                    Create Tournament
                  </Link>
                  <Link href="/tournaments" className="btn-secondary">
                    Explore Tournaments
                  </Link>
                </div>

                {/* Stats row */}
                <div
                  style={{
                    marginTop: "48px",
                    display: "flex",
                    gap: "32px",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { value: tournaments.length.toString(), label: "Active Tournaments" },
                    { value: liveTournaments.length.toString(), label: "Live Now" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p
                        style={{
                          fontFamily: "Barlow Condensed, sans-serif",
                          fontWeight: 800,
                          fontSize: "36px",
                          color: "var(--white)",
                          lineHeight: 1,
                        }}
                      >
                        {s.value}
                      </p>
                      <p
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "10px",
                          color: "var(--muted)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginTop: "4px",
                        }}
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Live match module */}
              <div>
                <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="label-section-muted">Live Control</span>
                </div>
                <LiveMatchModule data={liveData} />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            LIVE TOURNAMENTS
            ============================================ */}
        {liveTournaments.length > 0 && (
          <section
            className="section-tight"
            style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)" }}
          >
            <div className="container">
              <div className="section-title-row" style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="live-dot" />
                  <p className="label-section" style={{ color: "var(--red-live)" }}>
                    Live Now
                  </p>
                </div>
                <Link href="/tournaments?status=LIVE" className="btn-ghost">
                  View All →
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1px",
                  background: "var(--border)",
                  border: "1px solid var(--border)",
                }}
                className="tournament-grid-live"
              >
                {liveTournaments.map((t) => (
                  <TournamentTile key={t.id} tournament={t} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================
            TOURNAMENT DISCOVERY
            ============================================ */}
        <section className="section" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div className="section-title-row">
              <div>
                <p className="label-section" style={{ marginBottom: "10px" }}>Tournaments</p>
                <h2 className="section-title">Discover Tournaments</h2>
              </div>
              <Link href="/tournaments" className="btn-secondary">
                View All →
              </Link>
            </div>

            {featuredTournaments.length === 0 ? (
              <div
                style={{
                  padding: "64px",
                  textAlign: "center",
                  background: "var(--charcoal)",
                  border: "1px solid var(--border)",
                }}
              >
                <p className="label-section-muted" style={{ marginBottom: "8px" }}>No Tournaments</p>
                <p style={{ color: "var(--muted-light)", fontSize: "13px" }}>
                  No tournaments available right now.
                </p>
                <Link href="/auth/register" className="btn-primary" style={{ marginTop: "20px", display: "inline-flex" }}>
                  Create First Tournament
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1px",
                  background: "var(--border)",
                  border: "1px solid var(--border)",
                }}
                className="tournament-grid"
              >
                {featuredTournaments.map((t) => (
                  <TournamentTile key={t.id} tournament={t} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ============================================
            WORKFLOW
            ============================================ */}
        <WorkflowSection />

        {/* ============================================
            CONTROL ROOM PREVIEW
            ============================================ */}
        <section className="section" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div style={{ marginBottom: "48px" }}>
              <p className="label-section" style={{ marginBottom: "12px" }}>Organizer Tools</p>
              <h2 className="section-title">Tournament Control Room</h2>
              <p style={{ color: "var(--muted-light)", fontSize: "15px", marginTop: "12px", maxWidth: "500px" }}>
                Every tournament you run is managed from a dedicated command center.
                Real-time match status, results queue and live standings in one view.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
                marginBottom: "24px",
              }}
              className="control-grid"
            >
              {/* Current Match */}
              <div style={{ background: "var(--charcoal)", padding: "20px" }}>
                <p className="label-section-muted" style={{ marginBottom: "14px" }}>Current Match</p>
                <div style={{ borderLeft: "3px solid var(--red-live)", paddingLeft: "14px" }}>
                  <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--red-live)", letterSpacing: "0.12em", marginBottom: "6px" }}>
                    LIVE
                  </p>
                  <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "20px", textTransform: "uppercase", color: "var(--white)", marginBottom: "4px" }}>
                    Match 18
                  </p>
                  <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    Erangel
                  </p>
                  <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
                    <span className="btn-action" style={{ cursor: "default" }}>Import Results</span>
                    <span className="btn-action" style={{ cursor: "default" }}>Review</span>
                  </div>
                </div>
              </div>

              {/* Results Queue */}
              <div style={{ background: "var(--charcoal)", padding: "20px" }}>
                <p className="label-section-muted" style={{ marginBottom: "14px" }}>Results Queue</p>
                {[
                  { match: "Match 18", map: "Erangel", time: "2 min ago", status: "pending" },
                  { match: "Match 17", map: "Miramar", time: "14 min ago", status: "verified" },
                  { match: "Match 16", map: "Sanhok", time: "28 min ago", status: "verified" },
                ].map((r) => (
                  <div
                    key={r.match}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", color: "var(--text-primary)" }}>
                        {r.match} — {r.map}
                      </p>
                      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.08em", marginTop: "2px" }}>
                        {r.time}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: r.status === "pending" ? "var(--amber)" : "var(--green-bright)",
                      }}
                    >
                      {r.status === "pending" ? "Review" : "✓"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tournament Health */}
              <div style={{ background: "var(--charcoal)", padding: "20px" }}>
                <p className="label-section-muted" style={{ marginBottom: "14px" }}>Tournament Health</p>
                {[
                  { label: "Teams", status: "good" },
                  { label: "Groups", status: "good" },
                  { label: "Schedule", status: "good" },
                  { label: "Results", status: "warning" },
                  { label: "Discord", status: "good" },
                ].map((h) => (
                  <div key={h.label} className="health-row">
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{h.label}</span>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color:
                          h.status === "good"
                            ? "var(--green-bright)"
                            : h.status === "warning"
                            ? "var(--amber)"
                            : "var(--red-live)",
                      }}
                    >
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <Link href="/auth/register" className="btn-primary">
                Access Your Command Center
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================
            LIVE STANDINGS PREVIEW
            ============================================ */}
        <section
          className="section-tight"
          style={{ background: "var(--charcoal-deep)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="container">
            <div className="section-title-row" style={{ marginBottom: "20px" }}>
              <div>
                <p className="label-section" style={{ marginBottom: "8px" }}>Standings</p>
                <h2 className="section-title">Live Standings</h2>
              </div>
              <Link href="/tournaments" className="btn-ghost">
                View Tournaments →
              </Link>
            </div>

            {recentTournaments.length > 0 || liveTournaments.length > 0 ? (
              <div style={{ overflow: "hidden", border: "1px solid var(--border)" }}>
                <div
                  style={{
                    padding: "12px 20px",
                    background: "var(--charcoal)",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-primary)",
                    }}
                  >
                    {liveTournaments[0]?.name || recentTournaments[0]?.name || "Tournament Standings"}
                  </p>
                  {liveTournaments.length > 0 && (
                    <span className="status-live">Live</span>
                  )}
                </div>

                <div className="scroll-x">
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
                      {liveData?.topTeams && liveData.topTeams.length > 0 ? (
                        liveData.topTeams.map((team, i) => (
                          <tr key={team.name}>
                            <td>
                              <span className={`rank-cell rank-${i + 1}`}>
                                {String(i + 1).padStart(2, "0")}
                              </span>
                            </td>
                            <td className="team-name-cell">{team.name}</td>
                            <td style={{ textAlign: "right", color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>—</td>
                            <td style={{ textAlign: "right", color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>—</td>
                            <td style={{ textAlign: "right" }}>
                              <span className="points-cell">{team.points}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--muted-light)", fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
                            NO STANDINGS DATA — MATCHES IN PROGRESS
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "48px",
                  textAlign: "center",
                  background: "var(--charcoal)",
                  border: "1px solid var(--border)",
                }}
              >
                <p className="label-section-muted">No standings yet</p>
                <p style={{ color: "var(--muted-light)", fontSize: "13px", marginTop: "8px" }}>
                  Standings will appear here when tournaments are running.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ============================================
            AI RESULT IMPORT
            ============================================ */}
        <section className="section" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "64px",
                alignItems: "center",
              }}
              className="ai-grid"
            >
              {/* Left */}
              <div>
                <p className="label-section" style={{ marginBottom: "12px" }}>Ops AI</p>
                <h2 className="section-title" style={{ marginBottom: "16px" }}>
                  AI Result Import
                </h2>
                <p style={{ color: "var(--muted-light)", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
                  Screenshot your PUBG Mobile results screen. OpsAI extracts team names,
                  kills and placements automatically. Review and save in seconds.
                </p>

                {/* Workflow */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[
                    { step: "01", label: "Upload Screenshot", desc: "Drag your result screenshot" },
                    { step: "02", label: "AI Extraction", desc: "Teams, kills and placements detected" },
                    { step: "03", label: "Review", desc: "Verify before saving" },
                    { step: "04", label: "Save & Update", desc: "Standings update instantly" },
                  ].map((s, i) => (
                    <div
                      key={s.step}
                      style={{
                        display: "flex",
                        gap: "14px",
                        paddingBottom: i < 3 ? "16px" : "0",
                        paddingTop: i > 0 ? "0" : "0",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "var(--charcoal-mid)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 700, color: "var(--gold)" }}>
                            {s.step}
                          </span>
                        </div>
                        {i < 3 && (
                          <div style={{ width: "1px", flex: 1, background: "var(--border)", minHeight: "20px" }} />
                        )}
                      </div>
                      <div style={{ paddingTop: "6px" }}>
                        <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", color: "var(--white)", marginBottom: "2px" }}>
                          {s.label}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--muted-light)" }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Preview panel */}
              <div>
                <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--charcoal-deep)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="label-section-muted">Ops AI Extraction</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--green-bright)", letterSpacing: "0.1em" }}>
                      CONFIDENCE: HIGH
                    </span>
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ background: "var(--charcoal-deep)", border: "1px dashed var(--border-light)", padding: "24px", textAlign: "center", marginBottom: "14px" }}>
                      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.1em" }}>
                        MATCH RESULTS SCREENSHOT
                      </p>
                      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", marginTop: "4px" }}>
                        ERANGEL · MATCH 18
                      </p>
                    </div>

                    <p className="label-section-muted" style={{ marginBottom: "10px" }}>Detected Results</p>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", padding: "4px 6px", borderBottom: "1px solid var(--border)" }}>Pos</th>
                          <th style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", padding: "4px 6px", borderBottom: "1px solid var(--border)" }}>Team</th>
                          <th style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right", padding: "4px 6px", borderBottom: "1px solid var(--border)" }}>Kills</th>
                          <th style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right", padding: "4px 6px", borderBottom: "1px solid var(--border)" }}>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { pos: "01", team: "DRS GAMING", kills: "8", pts: "22" },
                          { pos: "02", team: "T2K ESPORTS", kills: "5", pts: "14" },
                          { pos: "03", team: "VENOM", kills: "4", pts: "12" },
                        ].map((r) => (
                          <tr key={r.pos}>
                            <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--muted)", padding: "6px" }}>{r.pos}</td>
                            <td style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", color: "var(--text-primary)", padding: "6px" }}>{r.team}</td>
                            <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--text-secondary)", padding: "6px" }}>{r.kills}</td>
                            <td style={{ textAlign: "right", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--gold-bright)", padding: "6px" }}>{r.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
                      <span className="btn-success" style={{ flex: 1, justifyContent: "center", cursor: "default" }}>✓ Save Results</span>
                      <span className="btn-ghost" style={{ cursor: "default" }}>Edit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            BROADCAST
            ============================================ */}
        <BroadcastSection />

        {/* ============================================
            DISCORD SYNC
            ============================================ */}
        <DiscordSection />

        {/* ============================================
            ORGANIZER CTA
            ============================================ */}
        <OrganizerCTA />
      </main>

      <PublicFooter />

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            padding: 60px 0 !important;
          }
          .control-grid {
            grid-template-columns: 1fr !important;
          }
          .ai-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 768px) {
          .tournament-grid,
          .tournament-grid-live {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}