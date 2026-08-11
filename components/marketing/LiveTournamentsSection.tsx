"use client";

import Link from "next/link";

interface Tournament {
  id: string;
  name: string;
  status: string;
  teamCount?: number;
  maxTeams?: number;
  currentMatch?: number;
  totalMatches?: number;
  game?: string;
  format?: string;
  startDate?: string | null;
  endDate?: string | null;
  organizer?: { name?: string; username?: string } | null;
  coverImage?: string | null;
}

interface LiveTournamentsSectionProps {
  tournaments: Tournament[];
}

function StatusBadge({ status }: { status: string }) {
  if (status === "LIVE" || status === "IN_PROGRESS") {
    return <span className="badge-live">LIVE</span>;
  }
  if (status === "UPCOMING" || status === "REGISTRATION" || status === "REGISTRATION_OPEN") {
    return <span className="badge-upcoming">UPCOMING</span>;
  }
  if (status === "COMPLETED" || status === "FINISHED") {
    return <span className="badge-completed">COMPLETED</span>;
  }
  return <span className="badge-upcoming">{status}</span>;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function TournamentTile({ t }: { t: Tournament }) {
  const isLive = t.status === "LIVE" || t.status === "IN_PROGRESS";

  return (
    <Link
      href={`/tournaments/${t.id}`}
      className={`tournament-tile${isLive ? " is-live" : ""}`}
      style={{ textDecoration: "none" }}
    >
      {/* Image */}
      {t.coverImage ? (
        <img
          src={t.coverImage}
          alt={t.name}
          className="tournament-tile-image"
        />
      ) : (
        <div className="tournament-tile-image-placeholder">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
            }}
          >
            {t.game || "PUBG MOBILE"}
          </span>
        </div>
      )}

      {/* Body */}
      <div className="tournament-tile-body">
        <div style={{ marginBottom: "8px" }}>
          <StatusBadge status={t.status} />
        </div>

        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "0.01em",
            marginBottom: "6px",
            lineHeight: "1.3",
          }}
        >
          {t.name}
        </div>

        {t.organizer && (
          <div
            style={{
              fontSize: "0.6875rem",
              color: "var(--color-text-muted)",
              marginBottom: "10px",
              letterSpacing: "0.04em",
            }}
          >
            BY {(t.organizer.name || t.organizer.username || "ORGANIZER").toUpperCase()}
          </div>
        )}

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {t.teamCount !== undefined && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--color-text-muted)",
              }}
            >
              <span style={{ color: "var(--color-text-secondary)", fontWeight: 700 }}>
                {t.teamCount}
              </span>
              {t.maxTeams ? `/${t.maxTeams}` : ""} TEAMS
            </div>
          )}

          {isLive && t.currentMatch && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--color-live)",
                fontWeight: 700,
              }}
            >
              M{t.currentMatch}{t.totalMatches ? `/${t.totalMatches}` : ""}
            </div>
          )}

          {t.format && (
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              {t.format}
            </div>
          )}
        </div>

        {/* Date */}
        <div
          style={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid var(--color-border-subtle)",
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {formatDate(t.startDate)}
        </div>
      </div>
    </Link>
  );
}

export function LiveTournamentsSection({ tournaments }: LiveTournamentsSectionProps) {
  const live = tournaments.filter(
    (t) => t.status === "LIVE" || t.status === "IN_PROGRESS"
  );
  const upcoming = tournaments.filter(
    (t) =>
      t.status === "UPCOMING" ||
      t.status === "REGISTRATION" ||
      t.status === "REGISTRATION_OPEN"
  );
  const completed = tournaments.filter(
    (t) => t.status === "COMPLETED" || t.status === "FINISHED"
  );

  const featured = [
    ...live.slice(0, 3),
    ...upcoming.slice(0, Math.max(0, 3 - live.length)),
    ...completed.slice(0, Math.max(0, 3 - live.length - upcoming.length)),
  ].slice(0, 6);

  if (featured.length === 0) {
    return (
      <section
        className="section-ops"
        style={{ background: "var(--color-surface-0)" }}
      >
        <div className="container-ops">
          <div className="section-eyebrow">
            <span className="label-section-accent">Tournaments</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: "40px" }}>
            LIVE &amp; UPCOMING
          </h2>
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              background: "var(--color-surface-1)",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: "12px",
              }}
            >
              NO LIVE TOURNAMENTS
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                marginBottom: "20px",
              }}
            >
              There are no live tournaments right now. Be the first to start one.
            </p>
            <Link href="/auth/register" className="btn btn-primary btn-sm">
              Create Tournament
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="section-ops"
      style={{ background: "var(--color-surface-0)" }}
    >
      <div className="container-ops">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div className="section-eyebrow">
              <span className="label-section-accent">Tournaments</span>
            </div>
            <h2 className="section-title">LIVE &amp; UPCOMING</h2>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {live.length > 0 && (
              <span className="badge-live">{live.length} LIVE</span>
            )}
            <Link href="/tournaments" className="btn btn-ghost btn-sm">
              All Tournaments →
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1px",
            background: "var(--color-border)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {featured.map((t) => (
            <TournamentTile key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}