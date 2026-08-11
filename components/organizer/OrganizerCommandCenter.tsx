"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Props {
  tournamentId: string;
}

export default function OrganizerCommandCenter({ tournamentId }: Props) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/tournaments/${tournamentId}/summary`)
      .then((r) => r.json())
      .then((data) => { setSummary(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tournamentId]);

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          color: "var(--white-40)",
          textTransform: "uppercase",
        }}>Loading Command Center...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)" }}>
      {/* TOP BAR */}
      <div style={{
        background: "var(--charcoal)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "2px solid var(--gold)",
      }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "0.85rem",
          letterSpacing: "0.12em",
          color: "var(--white)",
          textTransform: "uppercase",
        }}>TournaOps Command Center</div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href={`/dashboard/tournaments/${tournamentId}`} style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 600,
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            color: "var(--white-40)",
            textDecoration: "none",
            textTransform: "uppercase",
            transition: "color 0.15s ease",
          }}>Tournament Home</Link>
        </div>
      </div>

      {/* CURRENT MATCH — PRIMARY MODULE */}
      <CurrentMatchModule summary={summary} tournamentId={tournamentId} />

      {/* TWO COLUMN — RESULTS + NEXT MATCH */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1px",
        background: "var(--border)",
      }}>
        <ResultsQueueModule summary={summary} tournamentId={tournamentId} />
        <NextMatchModule summary={summary} tournamentId={tournamentId} />
      </div>

      {/* TOURNAMENT HEALTH */}
      <TournamentHealthModule summary={summary} />

      {/* RECENT ACTIVITY */}
      <RecentActivityModule summary={summary} />
    </div>
  );
}

function CurrentMatchModule({ summary, tournamentId }: any) {
  const currentMatch = summary?.currentMatch;

  return (
    <div style={{
      background: "var(--surface)",
      padding: "20px",
      borderLeft: currentMatch ? "3px solid var(--red)" : "3px solid var(--border)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          color: "var(--white-40)",
          textTransform: "uppercase",
        }}>Current Match</div>
        {currentMatch && <span className="badge-live">Live</span>}
      </div>

      {currentMatch ? (
        <div>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "1.8rem",
            letterSpacing: "0.05em",
            color: "var(--white)",
            textTransform: "uppercase",
            lineHeight: 1,
            marginBottom: "4px",
          }}>Match {currentMatch.matchNumber || "—"}</div>

          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.75rem",
            color: "var(--white-40)",
            marginBottom: "16px",
          }}>
            {currentMatch.map || "—"} · {currentMatch.submissionsReceived || 0}/{currentMatch.totalTeams || 0} SUBMISSIONS
          </div>

          {currentMatch.pendingCount > 0 && (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--amber-dim)",
              border: "1px solid var(--amber)",
              padding: "4px 12px",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              color: "var(--amber)",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}>
              {currentMatch.pendingCount} PENDING REVIEW
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link href={`/dashboard/tournaments/${tournamentId}/matches/${currentMatch.id}/results`}
              className="btn-primary" style={{ padding: "8px 16px" }}>
              Import Results
            </Link>
            {currentMatch.pendingCount > 0 && (
              <Link href={`/dashboard/tournaments/${tournamentId}/results`}
                className="btn-danger">
                Review Pending
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "var(--white-40)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "8px",
          }}>No Active Match</div>
          <p style={{ fontSize: "0.8rem", color: "var(--white-40)", marginBottom: "16px" }}>
            No match is currently in progress.
          </p>
          <Link href={`/dashboard/tournaments/${tournamentId}/matches/new`}
            className="btn-secondary" style={{ padding: "8px 16px" }}>
            Create Match
          </Link>
        </div>
      )}
    </div>
  );
}

function ResultsQueueModule({ summary, tournamentId }: any) {
  const queue = summary?.resultsQueue || [];

  return (
    <div style={{ background: "var(--surface)", padding: "20px" }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "16px",
      }}>Results Queue</div>

      {queue.length === 0 ? (
        <div style={{ fontSize: "0.8rem", color: "var(--white-40)", padding: "8px 0" }}>
          No results pending review.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {queue.slice(0, 4).map((item: any, i: number) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i < Math.min(queue.length, 4) - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--white)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>Match {item.matchNumber}</div>
                <div style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.7rem",
                  color: "var(--white-40)",
                }}>{item.map} · {item.timeAgo}</div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {item.status === "PENDING" ? (
                  <Link href={`/dashboard/tournaments/${tournamentId}/results/${item.id}`}
                    className="btn-danger" style={{ padding: "4px 10px" }}>
                    Review
                  </Link>
                ) : (
                  <span className="badge-completed">Verified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NextMatchModule({ summary, tournamentId }: any) {
  const next = summary?.nextMatch;

  return (
    <div style={{ background: "var(--surface)", padding: "20px" }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "16px",
      }}>Next Match</div>

      {next ? (
        <div>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "1.4rem",
            color: "var(--white)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "4px",
          }}>Match {next.matchNumber}</div>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.75rem",
            color: "var(--white-40)",
            marginBottom: "16px",
          }}>{next.map || "TBD"} · {next.scheduledTime || "Time TBD"}</div>
          <Link href={`/dashboard/tournaments/${tournamentId}/matches/${next.id}`}
            className="btn-secondary" style={{ padding: "8px 16px" }}>
            Manage Match
          </Link>
        </div>
      ) : (
        <div style={{ fontSize: "0.8rem", color: "var(--white-40)" }}>
          No upcoming match scheduled.
        </div>
      )}
    </div>
  );
}

function TournamentHealthModule({ summary }: any) {
  const health = summary?.health || {};
  const items = [
    { label: "Teams", status: health.teams || "good" },
    { label: "Groups", status: health.groups || "good" },
    { label: "Schedule", status: health.schedule || "good" },
    { label: "Results", status: health.results || "good" },
    { label: "Standings", status: health.standings || "good" },
    { label: "Discord", status: health.discord || "good" },
  ];

  return (
    <div style={{ background: "var(--surface)", padding: "20px" }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "16px",
      }}>Tournament Health</div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px",
      }}>
        {items.map((item) => (
          <div key={item.label} style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 10px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}>
            <div className={`health-dot ${item.status}`} />
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              color: "var(--white-70)",
              textTransform: "uppercase",
            }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivityModule({ summary }: any) {
  const activity = summary?.recentActivity || [];

  if (activity.length === 0) return null;

  return (
    <div style={{ background: "var(--surface)", padding: "20px" }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "16px",
      }}>Recent Activity</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {activity.slice(0, 5).map((item: any, i: number) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "8px 0",
            borderBottom: i < Math.min(activity.length, 5) - 1 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--gold)",
              marginTop: "6px",
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.82rem", color: "var(--white-70)" }}>{item.message}</div>
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.7rem",
                color: "var(--white-40)",
                marginTop: "2px",
              }}>{item.timeAgo}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}