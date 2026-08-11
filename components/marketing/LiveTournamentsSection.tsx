import Link from "next/link";

interface Tournament {
  id: string;
  name: string;
  status: "LIVE" | "UPCOMING" | "COMPLETED" | string;
  teamCount?: number;
  maxTeams?: number;
  startDate?: string | null;
  game?: string;
  format?: string;
  organizer?: { name?: string | null; username?: string | null } | null;
}

interface Props {
  tournaments: Tournament[];
}

export default function LiveTournamentsSection({ tournaments }: Props) {
  const live = tournaments.filter((t) => t.status === "LIVE");
  const upcoming = tournaments.filter((t) => t.status === "UPCOMING" || t.status === "REGISTRATION");
  const display = [...live, ...upcoming].slice(0, 6);

  if (display.length === 0) {
    return (
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container-ops">
          <div className="section-label">Tournaments</div>
          <h2 className="text-display" style={{ marginBottom: "40px" }}>Live &amp; Upcoming</h2>
          <div style={{
            border: "1px solid var(--border)",
            padding: "48px",
            textAlign: "center",
            background: "var(--surface)",
          }}>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.1em",
              color: "var(--white-40)",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}>No Live Match</div>
            <p style={{ color: "var(--white-40)", fontSize: "0.85rem", marginBottom: "20px" }}>
              There are currently no live tournaments. Check back soon.
            </p>
            <Link href="/tournaments" className="btn-secondary">Explore Tournaments</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="container-ops">
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div>
            <div className="section-label">Active Now</div>
            <h2 className="text-display">Live &amp; Upcoming</h2>
          </div>
          <Link href="/tournaments" className="btn-secondary" style={{ padding: "8px 18px" }}>
            All Tournaments →
          </Link>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1px",
          background: "var(--border)",
          border: "1px solid var(--border)",
        }}>
          {display.map((t) => (
            <TournamentTile key={t.id} tournament={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TournamentTile({ tournament: t }: { tournament: any }) {
  const isLive = t.status === "LIVE";
  const isUpcoming = t.status === "UPCOMING" || t.status === "REGISTRATION";
  const isCompleted = t.status === "COMPLETED";

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link href={`/tournaments/${t.id}`} className="tournament-tile" style={{ textDecoration: "none" }}>
      {/* TILE HEADER */}
      <div style={{
        height: "120px",
        background: "var(--surface-2)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* MAP TEXTURE IMPLICATION */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: isLive
            ? "linear-gradient(135deg, rgba(230,57,70,0.08) 0%, transparent 60%)"
            : "linear-gradient(135deg, rgba(201,168,76,0.05) 0%, transparent 60%)",
        }} />
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 900,
          fontSize: "2.5rem",
          color: "var(--border-2)",
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          userSelect: "none",
        }}>
          {t.game || "PUBG"}
        </div>
        <div style={{ position: "absolute", top: "12px", left: "12px" }}>
          {isLive && <span className="badge-live">Live</span>}
          {isUpcoming && <span className="badge-upcoming">Upcoming</span>}
          {isCompleted && <span className="badge-completed">Completed</span>}
        </div>
      </div>

      {/* TILE BODY */}
      <div style={{ padding: "16px", background: "var(--surface)" }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "1rem",
          letterSpacing: "0.02em",
          color: "var(--white)",
          textTransform: "uppercase",
          marginBottom: "8px",
          lineHeight: 1.2,
        }}>{t.name}</div>

        <div style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          {t.teamCount !== undefined && (
            <span style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.75rem",
              color: "var(--white-40)",
            }}>
              {t.teamCount}{t.maxTeams ? `/${t.maxTeams}` : ""} TEAMS
            </span>
          )}
          {t.format && (
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              color: "var(--white-40)",
              textTransform: "uppercase",
            }}>{t.format}</span>
          )}
          {formatDate(t.startDate) && (
            <span style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.75rem",
              color: "var(--white-40)",
            }}>{formatDate(t.startDate)}</span>
          )}
        </div>

        {t.organizer && (
          <div style={{
            marginTop: "10px",
            fontSize: "0.75rem",
            color: "var(--white-40)",
            fontFamily: "Barlow, sans-serif",
          }}>
            by {t.organizer.name || t.organizer.username}
          </div>
        )}
      </div>
    </Link>
  );
}