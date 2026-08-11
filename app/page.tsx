import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";

/* ── Data fetching ─────────────────────────────────────── */
async function getLiveTournaments() {
  try {
    return await prisma.tournament.findMany({
      where: { status: { in: ["LIVE", "PUBLISHED", "COMPLETED"] } },
      select: {
        id: true, name: true, slug: true, status: true,
        game: true, startDate: true,
        _count: { select: { teams: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 6,
    });
  } catch { return []; }
}

async function getLiveMatchData() {
  try {
    const t = await prisma.tournament.findFirst({
      where: { status: "LIVE" },
      include: {
        rounds: {
          orderBy: { order: "desc" },
          take: 1,
          include: {
            matches: {
              where: { status: { in: ["LIVE", "COMPLETED"] } },
              orderBy: { matchNumber: "desc" },
              take: 1,
              include: {
                results: {
                  orderBy: { totalPoints: "desc" },
                  take: 6,
                  include: { team: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!t) return null;
    const match = t.rounds[0]?.matches[0];
    if (!match) return null;
    return {
      tournamentName: t.name,
      matchNumber: match.matchNumber,
      status: match.status,
      results: match.results.map((r: any) => ({
        team: r.team,
        placement: r.placement,
        kills: r.kills ?? 0,
        totalPoints: r.totalPoints ?? 0,
      })),
    };
  } catch { return null; }
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  LIVE:      { label: "Live",      color: "var(--live)"    },
  PUBLISHED: { label: "Open",      color: "var(--accent)"  },
  COMPLETED: { label: "Completed", color: "var(--success)" },
};

const WORKFLOW = [
  { n: "01", title: "Registration", desc: "Teams register through one shareable link." },
  { n: "02", title: "Groups",       desc: "Organize and seed teams into groups." },
  { n: "03", title: "Matches",      desc: "Run matches and collect results." },
  { n: "04", title: "Results",      desc: "Import, review and verify each result." },
  { n: "05", title: "Scoring",      desc: "Points calculated automatically." },
  { n: "06", title: "Broadcast",    desc: "Push standings to OBS and Discord." },
  { n: "07", title: "Champion",     desc: "Crown the winner." },
];

const OVERLAYS = [
  "Live Standings", "Chicken Dinner", "Top Fragger",
  "Final Results", "Next Match", "Current Match",
];

/* ── Page ──────────────────────────────────────────────── */
export default async function HomePage() {
  const [tournaments, liveMatch] = await Promise.all([
    getLiveTournaments(),
    getLiveMatchData(),
  ]);

  const live      = tournaments.filter(t => t.status === "LIVE");
  const open      = tournaments.filter(t => t.status === "PUBLISHED");
  const completed = tournaments.filter(t => t.status === "COMPLETED");

  return (
    <>
      <PublicNav />

      <main style={{ paddingTop: "var(--nav-height)" }}>

        {/* ══ HERO ══════════════════════════════════════ */}
        <section style={{
          background: "var(--black-rich)",
          borderBottom: "1px solid var(--border)",
          padding: "80px 0 0",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Grid bg */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.4,
          }} />

          <div className="container" style={{ position: "relative" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "64px", alignItems: "flex-start" }}>

              {/* Left */}
              <div>
                <p className="label-section" style={{ marginBottom: "20px" }}>
                  The Operating System for PUBG Mobile Competition
                </p>
                <h1 className="display-hero" style={{ marginBottom: "24px" }}>
                  Run Tournaments.<br />
                  <span style={{ color: "var(--accent)" }}>Not Chaos.</span>
                </h1>
                <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "480px", lineHeight: 1.7, marginBottom: "36px" }}>
                  Professional tournament operations from registration to trophy.
                  Groups, matches, scoring, broadcast and Discord — all in one platform.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link href="/auth/register" className="btn btn-primary btn-lg">
                    Create Tournament
                  </Link>
                  <Link href="/tournaments" className="btn btn-secondary btn-lg">
                    Explore Tournaments
                  </Link>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: "40px", marginTop: "48px", paddingTop: "32px", borderTop: "1px solid var(--border)" }}>
                  {[
                    { v: tournaments.length.toString(), l: "Tournaments" },
                    { v: live.length.toString(), l: "Live Now" },
                    { v: "PUBG Mobile", l: "Primary Game" },
                  ].map(s => (
                    <div key={s.l}>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: 700, color: "var(--white)", marginBottom: "4px" }}>{s.v}</p>
                      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-light)" }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Live Match Module */}
              <div style={{ paddingBottom: "0" }}>
                <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", overflow: "hidden" }}>
                  {/* Module header */}
                  <div style={{ background: "var(--charcoal-mid)", padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {liveMatch ? (
                        <>
                          <span className="live-dot" />
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--live)" }}>Live</span>
                        </>
                      ) : (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-light)" }}>Tournament Feed</span>
                      )}
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted-light)" }}>TournaOps</span>
                  </div>

                  {liveMatch ? (
                    <>
                      <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", textTransform: "uppercase", color: "var(--white)", marginBottom: "4px" }}>
                          {liveMatch.tournamentName}
                        </p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)" }}>
                          Match {liveMatch.matchNumber}
                        </p>
                      </div>
                      {liveMatch.results.slice(0, 6).map((r: any, i: number) => (
                        <div key={r.team.id} style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          padding: "10px 16px",
                          borderBottom: "1px solid var(--border-subtle)",
                          background: i === 0 ? "rgba(255,215,0,0.04)" : "transparent",
                        }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: i === 0 ? "var(--gold-bright)" : "var(--muted-light)", minWidth: "20px", fontWeight: 700 }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "var(--white)" }}>{r.team.name}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)" }}>{r.kills}K</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: "var(--white)", minWidth: "32px", textAlign: "right" }}>{r.totalPoints}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", textTransform: "uppercase", color: "var(--white)" }}>
                          {open.length > 0 ? open[0].name : "No Live Match"}
                        </p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)", marginTop: "4px" }}>
                          {open.length > 0 ? "Registration Open" : "Check back soon"}
                        </p>
                      </div>
                      {tournaments.slice(0, 5).map((t, i) => {
                        const cfg = STATUS_CFG[t.status] ?? STATUS_CFG.PUBLISHED;
                        return (
                          <div key={t.id} style={{
                            display: "flex", alignItems: "center", gap: "12px",
                            padding: "10px 16px",
                            borderBottom: "1px solid var(--border-subtle)",
                          }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)", minWidth: "20px" }}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "var(--white)" }}>{t.name}</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div style={{ padding: "12px 16px" }}>
                    <Link href="/tournaments" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none" }}>
                      View All Tournaments →
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ LIVE TOURNAMENTS ═══════════════════════════ */}
        {live.length > 0 && (
          <section style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "48px 0" }}>
            <div className="container">
              <div className="section-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="live-dot" />
                  <h2 className="section-title">Live Now</h2>
                </div>
                <Link href="/tournaments" className="btn btn-ghost btn-sm">View All</Link>
              </div>
              <div className="grid-auto">
                {live.map(t => (
                  <Link key={t.id} href={`/tournaments/${t.slug || t.id}`} style={{ textDecoration: "none" }}>
                    <div className="tournament-tile">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="live-dot" />
                          <span className="label-live">Live</span>
                        </div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)" }}>{t.game ?? "PUBG Mobile"}</span>
                      </div>
                      <h3 className="display-card">{t.name}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted-light)" }}>{t._count.teams} teams</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ OPEN TOURNAMENTS ═══════════════════════════ */}
        {open.length > 0 && (
          <section style={{ background: "var(--black-rich)", borderBottom: "1px solid var(--border)", padding: "48px 0" }}>
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Open Registration</h2>
                <Link href="/tournaments" className="btn btn-ghost btn-sm">View All</Link>
              </div>
              <div className="grid-auto">
                {open.map(t => (
                  <Link key={t.id} href={`/tournaments/${t.slug || t.id}`} style={{ textDecoration: "none" }}>
                    <div className="tournament-tile">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="status-badge status-open">Open</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)" }}>{t.game ?? "PUBG Mobile"}</span>
                      </div>
                      <h3 className="display-card">{t.name}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted-light)" }}>{t._count.teams} teams</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Register →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ WORKFLOW ════════════════════════════════════ */}
        <section style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "64px 0" }}>
          <div className="container">
            <div style={{ marginBottom: "40px" }}>
              <p className="label-section" style={{ marginBottom: "10px" }}>How It Works</p>
              <h2 className="display-title">Tournament Workflow</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", background: "var(--border)" }}>
              {WORKFLOW.map((s, i) => (
                <div key={s.n} style={{ background: "var(--charcoal)", padding: "24px 16px", position: "relative" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "12px" }}>{s.n}</p>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--white)", marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted-light)", lineHeight: 1.5 }}>{s.desc}</p>
                  {i < WORKFLOW.length - 1 && (
                    <div style={{ position: "absolute", right: "-8px", top: "50%", transform: "translateY(-50%)", zIndex: 1, fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--border-light)", pointerEvents: "none" }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CONTROL ROOM PREVIEW ════════════════════════ */}
        <section style={{ background: "var(--black-rich)", borderBottom: "1px solid var(--border)", padding: "64px 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 520px", gap: "64px", alignItems: "center" }}>
              <div>
                <p className="label-section" style={{ marginBottom: "10px" }}>Organizer</p>
                <h2 className="display-title" style={{ marginBottom: "20px" }}>Tournament Control Room</h2>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px", maxWidth: "400px" }}>
                  Everything a tournament director needs in one operational view.
                  Current match, results queue, standings, health status — all live.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
                  {["Current & next match status","Results queue with review actions","Live standings update","Tournament health diagnostic","Discord + OBS one-click publish"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "var(--success)", fontSize: "12px", flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/register" className="btn btn-primary">
                  Start For Free
                </Link>
              </div>

              {/* Control room mock */}
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                <div style={{ background: "var(--charcoal-mid)", padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-light)" }}>Command Center</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["#333","#333","#333"].map((c,i) => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />)}
                  </div>
                </div>
                {[
                  { label: "Current Match", value: "Match 18 — Erangel", status: "LIVE", color: "var(--live)" },
                  { label: "Results Queue", value: "3 Pending Review", status: "ACTION", color: "var(--warning)" },
                  { label: "Standings", value: "Updated 2 min ago", status: "GOOD", color: "var(--success)" },
                  { label: "Discord", value: "Connected", status: "GOOD", color: "var(--success)" },
                  { label: "OBS Overlay", value: "Streaming", status: "LIVE", color: "var(--live)" },
                  { label: "Teams", value: "64 / 64 Registered", status: "GOOD", color: "var(--success)" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-light)", marginBottom: "2px" }}>{row.label}</p>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--white)" }}>{row.value}</p>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", color: row.color, border: `1px solid ${row.color}`, padding: "2px 8px" }}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ BROADCAST ═══════════════════════════════════ */}
        <section style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "64px 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "520px 1fr", gap: "64px", alignItems: "center" }}>
              {/* Overlay grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {OVERLAYS.map(ov => (
                  <div key={ov} style={{ background: "var(--black-rich)", border: "1px solid var(--border)", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-light)", textAlign: "center" }}>{ov}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="label-section" style={{ marginBottom: "10px" }}>OBS Integration</p>
                <h2 className="display-title" style={{ marginBottom: "20px" }}>Built for Broadcast</h2>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px", maxWidth: "380px" }}>
                  Make your tournament look professional on stream.
                  Browser-source overlays that update live as results come in.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "32px" }}>
                  {OVERLAYS.map(ov => (
                    <div key={ov} style={{ padding: "10px 14px", background: "var(--charcoal)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                      {ov}
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/overlay" className="btn btn-secondary">
                  View Broadcast Overlays
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══ DISCORD ═════════════════════════════════════ */}
        <section style={{ background: "var(--black-rich)", borderBottom: "1px solid var(--border)", padding: "64px 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: "64px", alignItems: "center" }}>
              <div>
                <p className="label-section" style={{ marginBottom: "10px" }}>Discord Integration</p>
                <h2 className="display-title" style={{ marginBottom: "20px" }}>Discord Sync</h2>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px", maxWidth: "400px" }}>
                  Post match announcements, results and standings directly to your Discord server.
                  One click from the control room.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {["Match announcements","Result summaries","Live standings updates","Tournament reminders"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "var(--success)", fontSize: "12px" }}>✓</span>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discord mock */}
              <div style={{ background: "#1e1f22", border: "1px solid #2e2f33", overflow: "hidden" }}>
                <div style={{ background: "#2b2d31", padding: "10px 16px", borderBottom: "1px solid #1e1f22", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#80848e" }}>#</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#dbdee1" }}>results</span>
                </div>
                {[
                  { icon: "🏆", title: "Match 18 Results Published", lines: ["✅ Results imported","✅ Scores calculated","✅ Standings updated","✅ Posted to #results"] },
                ].map(msg => (
                  <div key={msg.title} style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                        {msg.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#dbdee1", marginBottom: "6px" }}>TournaOps {msg.title}</p>
                        {msg.lines.map(l => (
                          <p key={l} style={{ fontSize: "12px", color: "#80848e", marginBottom: "3px" }}>{l}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ AI ══════════════════════════════════════════ */}
        <section style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "64px 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: "64px", alignItems: "center" }}>
              {/* AI flow */}
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
                <div style={{ background: "var(--charcoal-mid)", padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-light)" }}>Ops AI — Screenshot Import</span>
                </div>
                {[
                  { step: "01", label: "Upload Screenshot",  status: "Done",        color: "var(--success)" },
                  { step: "02", label: "AI Extraction",       status: "Processing",  color: "var(--warning)" },
                  { step: "03", label: "Review Results",      status: "Pending",     color: "var(--muted-light)" },
                  { step: "04", label: "Save & Update",       status: "Pending",     color: "var(--muted-light)" },
                ].map(s => (
                  <div key={s.step} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted-light)" }}>{s.step}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--white)" }}>{s.label}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: s.color }}>{s.status}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="label-section" style={{ marginBottom: "10px" }}>AI Infrastructure</p>
                <h2 className="display-title" style={{ marginBottom: "20px" }}>Ops AI</h2>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px", maxWidth: "400px" }}>
                  AI that works behind the scenes to make tournament operations faster.
                  Screenshot result extraction, analysis, and operational assistance.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                  {["Screenshot result extraction","Match analysis and reports","Operational assistance","Error detection"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "var(--accent)", fontSize: "12px" }}>✓</span>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/register" className="btn btn-ghost">
                  Try Ops AI →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA ═════════════════════════════════════════ */}
        <section style={{ background: "var(--black-rich)", padding: "80px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <p className="label-section" style={{ marginBottom: "16px", justifyContent: "center", display: "flex" }}>Get Started</p>
            <h2 className="display-title" style={{ marginBottom: "20px" }}>
              Ready to Run Your Tournament?
            </h2>
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 36px", lineHeight: 1.7 }}>
              Join tournament organizers already using TournaOps for professional PUBG Mobile competition.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/register" className="btn btn-primary btn-xl">
                Create Tournament — Free
              </Link>
              <Link href="/tournaments" className="btn btn-secondary btn-xl">
                Browse Tournaments
              </Link>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </>
  );
}