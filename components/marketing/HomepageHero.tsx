"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface LiveTournament {
  id: string;
  name: string;
  status: string;
  teamCount?: number;
  currentMatch?: number;
  totalMatches?: number;
  map?: string;
}

interface HeroProps {
  liveTournament?: LiveTournament | null;
}

const DEMO_ROWS = [
  { pos: "01", team: "DRS GAMING", points: "128" },
  { pos: "02", team: "T2K ESPORTS", points: "119" },
  { pos: "03", team: "VENOM ESPORTS", points: "111" },
  { pos: "04", team: "NEPAL X", points: "98" },
  { pos: "05", team: "BEAST MODE", points: "87" },
];

function LiveModule({ tournament }: { tournament?: LiveTournament | null }) {
  const isLive = tournament?.status === "LIVE";
  const isUpcoming = tournament?.status === "UPCOMING" || tournament?.status === "REGISTRATION";

  return (
    <div className="live-module" style={{ minWidth: "260px", maxWidth: "320px" }}>
      {/* Header */}
      <div className="live-module-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isLive ? (
            <span className="badge-live">LIVE</span>
          ) : isUpcoming ? (
            <span className="badge-upcoming">UPCOMING</span>
          ) : (
            <span className="badge-upcoming">NO LIVE MATCH</span>
          )}
          {isLive && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--color-text-muted)",
              }}
            >
              {tournament?.currentMatch ?? "—"} / {tournament?.totalMatches ?? "—"}
            </span>
          )}
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {isLive ? (tournament?.map ?? "ERANGEL") : "TOURNAOPS"}
        </span>
      </div>

      {/* Tournament Name */}
      {isLive && tournament && (
        <div
          style={{
            padding: "8px 14px",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--color-text-secondary)",
            }}
          >
            {tournament.name}
          </span>
        </div>
      )}

      {/* Standings Preview */}
      {!isLive && (
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              textAlign: "center",
              lineHeight: "1.5",
            }}
          >
            {isUpcoming
              ? "Tournament starts soon."
              : "No live tournament right now.\nExplore upcoming events."}
          </p>
        </div>
      )}

      {/* Rows */}
      {DEMO_ROWS.map((row, i) => (
        <div key={row.pos} className={`live-module-row${i === 0 ? " rank-1" : ""}`}>
          <span className="pos">{row.pos}</span>
          <span className="team-name">{row.team}</span>
          <span className="points">{row.points}</span>
        </div>
      ))}

      {/* Footer */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            color: "var(--color-text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          SAMPLE DATA
        </span>
        <Link
          href="/tournaments"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            color: "var(--color-gold)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          VIEW ALL →
        </Link>
      </div>
    </div>
  );
}

export function HomepageHero({ liveTournament }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="hero-ops">
      <div className="hero-grid-bg" />
      <div className="hero-grid-fade" />

      <div
        className="container-ops"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "48px",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 1,
          paddingTop: "24px",
          paddingBottom: "80px",
        }}
      >
        {/* Left — Text */}
        <div style={{ flex: "1 1 400px", maxWidth: "600px" }}>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.4s ease 0.1s",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "1px",
                background: "var(--color-gold)",
              }}
            />
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
              }}
            >
              THE OPERATING SYSTEM FOR PUBG MOBILE COMPETITION
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-display"
            style={{
              color: "var(--color-text-primary)",
              marginBottom: "8px",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.5s ease 0.15s",
            }}
          >
            RUN
            <br />
            TOURNAMENTS.
          </h1>
          <h1
            className="text-display"
            style={{
              color: "var(--color-text-muted)",
              marginBottom: "32px",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.5s ease 0.2s",
            }}
          >
            NOT CHAOS.
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-text-secondary)",
              lineHeight: "1.6",
              marginBottom: "40px",
              maxWidth: "480px",
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.5s ease 0.3s",
            }}
          >
            The complete tournament operations system for competitive PUBG Mobile.
            From registration to champion — one platform.
          </p>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.5s ease 0.4s",
            }}
          >
            <Link href="/auth/register" className="btn btn-primary btn-xl">
              Create Tournament
            </Link>
            <Link href="/tournaments" className="btn btn-secondary btn-xl">
              Explore Tournaments
            </Link>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "48px",
              paddingTop: "32px",
              borderTop: "1px solid var(--color-border)",
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.5s ease 0.5s",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Platform", value: "PUBG MOBILE" },
              { label: "Format", value: "SQUAD / DUO / SOLO" },
              { label: "Scoring", value: "PMGC SYSTEM" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--color-text-primary)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginTop: "2px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Live Module */}
        <div
          style={{
            flex: "0 0 auto",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.6s ease 0.35s",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <span
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              GRAND FINAL · STANDINGS PREVIEW
            </span>
          </div>
          <LiveModule tournament={liveTournament} />
          <p
            style={{
              fontSize: "0.625rem",
              color: "var(--color-text-muted)",
              marginTop: "8px",
              textAlign: "center",
              letterSpacing: "0.06em",
            }}
          >
            SAMPLE DATA — CREATE YOUR OWN LIVE TOURNAMENT
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          opacity: 0.4,
        }}
      >
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "linear-gradient(to bottom, var(--color-border-strong), transparent)",
          }}
        />
      </div>
    </section>
  );
}