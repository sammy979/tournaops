"use client";
import { useState } from "react";
import Link from "next/link";

interface TeamRank {
  rank: number;
  id: string;
  name: string;
  points: number;
  kills: number;
  placement: number | null;
  tournamentName: string | null;
  tournamentId: string | null;
  tournamentStatus: string | null;
  format: string | null;
}

interface Props {
  teams: TeamRank[];
}

const FORMATS = [
  { value: "ALL", label: "All Formats" },
  { value: "SOLO", label: "Solo" },
  { value: "DUO", label: "Duo" },
  { value: "SQUAD", label: "Squad" },
];

export default function RankingsPage({ teams }: Props) {
  const [activeFormat, setActiveFormat] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = teams.filter((t) => {
    const matchFormat = activeFormat === "ALL" || t.format === activeFormat;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    return matchFormat && matchSearch;
  });

  const reranked = filtered.map((t, i) => ({ ...t, rank: i + 1 }));

  return (
    <div>
      {/* PAGE HEADER */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
        padding: "48px 0 0",
      }}>
        <div className="container-ops">
          <div className="section-label">Competitive</div>
          <h1 className="text-display" style={{ marginBottom: "8px" }}>
            TournaOps Rankings
          </h1>
          <p style={{
            color: "var(--white-40)",
            fontSize: "0.85rem",
            marginBottom: "32px",
            maxWidth: "480px",
          }}>
            Team rankings based on points earned across completed tournaments on TournaOps.
          </p>

          {/* FORMAT TABS */}
          <div style={{
            display: "flex",
            gap: "0",
            borderTop: "1px solid var(--border)",
            overflowX: "auto",
          }}>
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFormat(f.value)}
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "12px 20px",
                  background: "none",
                  border: "none",
                  borderBottom: activeFormat === f.value
                    ? "2px solid var(--gold)"
                    : "2px solid transparent",
                  color: activeFormat === f.value ? "var(--white)" : "var(--white-40)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease",
                }}
              >{f.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH + COUNT BAR */}
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "14px 0",
      }}>
        <div className="container-ops" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          <span style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.75rem",
            color: "var(--white-40)",
          }}>
            {reranked.length} TEAM{reranked.length !== 1 ? "S" : ""} RANKED
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team..."
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.82rem",
              padding: "7px 14px",
              background: "var(--surface-2)",
              color: "var(--white)",
              border: "1px solid var(--border)",
              outline: "none",
              width: "200px",
            }}
          />
        </div>
      </div>

      {/* RANKINGS TABLE */}
      <div className="container-ops" style={{ padding: "32px 24px" }}>
        {reranked.length === 0 ? (
          <EmptyRankings />
        ) : (
          <div style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
            overflow: "hidden",
          }}>
            {/* TABLE HEADER */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 180px 80px 80px 100px",
              padding: "10px 20px",
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
            }}>
              {[
                { label: "Rank", align: "left" },
                { label: "Team", align: "left" },
                { label: "Tournament", align: "left" },
                { label: "Kills", align: "right" },
                { label: "Placement", align: "right" },
                { label: "Points", align: "right" },
              ].map((col) => (
                <div key={col.label} style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  color: "var(--white-40)",
                  textTransform: "uppercase",
                  textAlign: col.align as any,
                }}>{col.label}</div>
              ))}
            </div>

            {/* ROWS */}
            {reranked.map((team, i) => (
              <RankRow
                key={team.id}
                team={team}
                index={i}
                total={reranked.length}
              />
            ))}
          </div>
        )}

        {/* DISCLAIMER */}
        {reranked.length > 0 && (
          <div style={{
            marginTop: "24px",
            padding: "16px 20px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--border-2)",
          }}>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 600,
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              color: "var(--white-40)",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}>About These Rankings</div>
            <p style={{
              fontSize: "0.8rem",
              color: "var(--white-40)",
              lineHeight: 1.6,
            }}>
              Rankings are based on points earned in public tournaments on TournaOps.
              Global cross-tournament rankings are coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RankRow({
  team,
  index,
  total,
}: {
  team: TeamRank & { rank: number };
  index: number;
  total: number;
}) {
  const isFirst = team.rank === 1;
  const isSecond = team.rank === 2;
  const isThird = team.rank === 3;
  const isTop = isFirst || isSecond || isThird;

  const rankColor = isFirst
    ? "var(--gold)"
    : isSecond
    ? "#c0c0c0"
    : isThird
    ? "#cd7f32"
    : "var(--white-40)";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "60px 1fr 180px 80px 80px 100px",
      padding: "13px 20px",
      borderBottom: index < total - 1 ? "1px solid var(--border)" : "none",
      background: isFirst
        ? "var(--gold-dim)"
        : isTop
        ? "rgba(255,255,255,0.02)"
        : "transparent",
      alignItems: "center",
      transition: "background 0.1s ease",
    }}>
      {/* RANK */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {isFirst && <span style={{ fontSize: "0.9rem" }}>🏆</span>}
        <span style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "1.1rem",
          color: rankColor,
          letterSpacing: "0.02em",
        }}>
          {String(team.rank).padStart(2, "0")}
        </span>
      </div>

      {/* TEAM NAME */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "28px",
          height: "28px",
          background: isFirst ? "var(--gold-dim)" : "var(--surface-2)",
          border: `1px solid ${isFirst ? "rgba(201,168,76,0.4)" : "var(--border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 800,
            fontSize: "0.75rem",
            color: isFirst ? "var(--gold)" : "var(--white-40)",
          }}>
            {team.name[0].toUpperCase()}
          </span>
        </div>
        <span style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.95rem",
          letterSpacing: "0.04em",
          color: "var(--white)",
          textTransform: "uppercase",
        }}>{team.name}</span>
      </div>

      {/* TOURNAMENT */}
      <div>
        {team.tournamentId ? (
          <Link
            href={`/tournaments/${team.tournamentId}`}
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.78rem",
              color: "var(--white-40)",
              textDecoration: "none",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {team.tournamentName}
          </Link>
        ) : (
          <span style={{ fontSize: "0.78rem", color: "var(--white-20)" }}>—</span>
        )}
        {team.tournamentStatus === "LIVE" && (
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "var(--red)",
            textTransform: "uppercase",
            display: "block",
            marginTop: "2px",
          }}>● LIVE</span>
        )}
      </div>

      {/* KILLS */}
      <div style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "0.85rem",
        color: "var(--white-70)",
        textAlign: "right",
      }}>{team.kills}</div>

      {/* PLACEMENT */}
      <div style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "0.85rem",
        color: "var(--white-70)",
        textAlign: "right",
      }}>{team.placement ?? "—"}</div>

      {/* POINTS */}
      <div style={{
        fontFamily: "JetBrains Mono, monospace",
        fontWeight: 700,
        fontSize: "1rem",
        color: isFirst ? "var(--gold)" : isTop ? "var(--white)" : "var(--white-70)",
        textAlign: "right",
      }}>{team.points}</div>
    </div>
  );
}

function EmptyRankings() {
  return (
    <div style={{
      border: "1px solid var(--border)",
      background: "var(--surface)",
      padding: "64px 48px",
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "1rem",
        letterSpacing: "0.1em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "8px",
      }}>No Rankings Yet</div>
      <p style={{
        color: "var(--white-40)",
        fontSize: "0.85rem",
        margin: "0 auto 24px",
        maxWidth: "360px",
        lineHeight: 1.6,
      }}>
        Rankings will appear here after tournaments are completed on TournaOps.
      </p>
      <Link href="/tournaments" className="btn-secondary">
        Browse Tournaments
      </Link>
    </div>
  );
}