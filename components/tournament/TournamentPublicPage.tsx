"use client";
import { useState } from "react";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  logo?: string | null;
  points?: number | null;
  kills?: number | null;
  placement?: number | null;
}

interface Match {
  id: string;
  matchNumber: number;
  map?: string | null;
  status: string;
  scheduledAt?: string | null;
  completedAt?: string | null;
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  game?: string | null;
  format?: string | null;
  region?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  maxTeams?: number | null;
  description?: string | null;
  rules?: string | null;
  prizePool?: string | null;
  entryFee?: string | null;
  scoringPreset?: string | null;
  organizer?: {
    name?: string | null;
    username?: string | null;
    image?: string | null;
  } | null;
  teams: Team[];
  matches: Match[];
  _count: { teams: number; matches: number };
}

type Tab = "overview" | "standings" | "matches" | "teams" | "rules";

export default function TournamentPublicPage({
  tournament,
  session,
}: {
  tournament: Tournament;
  session: any;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const isLive = tournament.status === "LIVE";
  const isUpcoming = tournament.status === "UPCOMING" || tournament.status === "REGISTRATION";
  const isCompleted = tournament.status === "COMPLETED";

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "standings", label: "Standings" },
    { key: "matches", label: "Matches" },
    { key: "teams", label: "Teams" },
    { key: "rules", label: "Rules" },
  ];

  return (
    <div>
      {/* TOURNAMENT HERO */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* BG ACCENT */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: isLive
            ? "linear-gradient(180deg, rgba(230,57,70,0.08) 0%, transparent 60%)"
            : "linear-gradient(180deg, rgba(201,168,76,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />

        <div className="container-ops" style={{ padding: "48px 24px 0" }}>
          {/* TOP META */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}>
            {isLive && <span className="badge-live">Live</span>}
            {isUpcoming && <span className="badge-upcoming">{tournament.status}</span>}
            {isCompleted && <span className="badge-completed">Completed</span>}

            {tournament.format && (
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                color: "var(--white-40)",
                textTransform: "uppercase",
                padding: "3px 10px",
                border: "1px solid var(--border)",
              }}>{tournament.format}</span>
            )}
            {tournament.region && (
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                color: "var(--white-40)",
                textTransform: "uppercase",
                padding: "3px 10px",
                border: "1px solid var(--border)",
              }}>{tournament.region.replace("_", " ")}</span>
            )}
          </div>

          {/* TOURNAMENT NAME */}
          <h1 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color: "var(--white)",
            lineHeight: 1,
            marginBottom: "20px",
            maxWidth: "800px",
          }}>{tournament.name}</h1>

          {/* STATS ROW */}
          <div style={{
            display: "flex",
            gap: "32px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}>
            <StatItem
              value={`${tournament._count.teams}${tournament.maxTeams ? `/${tournament.maxTeams}` : ""}`}
              label="Teams"
            />
            <StatItem value={String(tournament._count.matches)} label="Matches" />
            {tournament.format && (
              <StatItem value={tournament.format} label="Format" />
            )}
            {tournament.game && (
              <StatItem value={tournament.game} label="Game" />
            )}
            {tournament.scoringPreset && (
              <StatItem value={tournament.scoringPreset} label="Scoring" />
            )}
          </div>

          {/* ORGANIZER ROW */}
          {tournament.organizer && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              paddingBottom: "20px",
            }}>
              <div style={{
                width: "28px",
                height: "28px",
                background: "var(--surface-3)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  color: "var(--white-40)",
                }}>
                  {(tournament.organizer.name || tournament.organizer.username || "O")[0].toUpperCase()}
                </span>
              </div>
              <span style={{
                fontSize: "0.82rem",
                color: "var(--white-40)",
              }}>
                Organized by{" "}
                <span style={{ color: "var(--white-70)" }}>
                  {tournament.organizer.name || tournament.organizer.username}
                </span>
              </span>
            </div>
          )}

          {/* TABS */}
          <div style={{
            display: "flex",
            gap: "0",
            borderTop: "1px solid var(--border)",
            overflowX: "auto",
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "14px 20px",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.key
                    ? "2px solid var(--gold)"
                    : "2px solid transparent",
                  color: activeTab === tab.key ? "var(--white)" : "var(--white-40)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease",
                }}
              >{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="container-ops" style={{ padding: "32px 24px" }}>
        {activeTab === "overview" && (
          <OverviewTab tournament={tournament} session={session} />
        )}
        {activeTab === "standings" && (
          <StandingsTab teams={tournament.teams} />
        )}
        {activeTab === "matches" && (
          <MatchesTab matches={tournament.matches} tournamentId={tournament.id} />
        )}
        {activeTab === "teams" && (
          <TeamsTab teams={tournament.teams} />
        )}
        {activeTab === "rules" && (
          <RulesTab rules={tournament.rules} />
        )}
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 800,
        fontSize: "1.1rem",
        letterSpacing: "0.04em",
        color: "var(--white)",
        textTransform: "uppercase",
      }}>{value}</div>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontSize: "0.65rem",
        letterSpacing: "0.12em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginTop: "2px",
      }}>{label}</div>
    </div>
  );
}

function OverviewTab({ tournament, session }: { tournament: Tournament; session: any }) {
  const isReg = tournament.status === "REGISTRATION";
  const spotsLeft = tournament.maxTeams
    ? tournament.maxTeams - tournament._count.teams
    : null;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: "32px",
      alignItems: "start",
    }}>
      {/* LEFT */}
      <div>
        {tournament.description && (
          <div style={{ marginBottom: "32px" }}>
            <div className="section-label" style={{ marginBottom: "12px" }}>About</div>
            <p style={{
              fontSize: "0.9rem",
              color: "var(--white-70)",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}>{tournament.description}</p>
          </div>
        )}

        {/* QUICK STATS */}
        <div className="section-label" style={{ marginBottom: "12px" }}>Tournament Info</div>
        <div style={{
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          {[
            { label: "Game", value: tournament.game || "PUBG Mobile" },
            { label: "Format", value: tournament.format || "—" },
            { label: "Region", value: tournament.region?.replace("_", " ") || "—" },
            { label: "Teams", value: `${tournament._count.teams}${tournament.maxTeams ? `/${tournament.maxTeams}` : ""}` },
            { label: "Matches", value: String(tournament._count.matches) },
            { label: "Start Date", value: tournament.startDate ? new Date(tournament.startDate).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) : "—" },
            { label: "Scoring", value: tournament.scoringPreset || "Standard" },
            { label: "Entry Fee", value: tournament.entryFee || "Free" },
            { label: "Prize Pool", value: tournament.prizePool || "—" },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "11px 16px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                color: "var(--white-40)",
                textTransform: "uppercase",
              }}>{row.label}</span>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "var(--white)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — ACTION CARD */}
      <div>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: isReg ? "3px solid var(--gold)" : "1px solid var(--border)",
        }}>
          <div style={{ padding: "20px" }}>
            {isReg ? (
              <>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  letterSpacing: "0.06em",
                  color: "var(--white)",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}>Registration Open</div>
                {spotsLeft !== null && (
                  <div style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.75rem",
                    color: spotsLeft <= 8 ? "var(--amber)" : "var(--white-40)",
                    marginBottom: "16px",
                  }}>
                    {spotsLeft > 0 ? `${spotsLeft} spots remaining` : "FULL"}
                  </div>
                )}
                {session ? (
                  <Link
                    href={`/tournaments/${tournament.id}/register`}
                    className="btn-gold"
                    style={{ display: "block", textAlign: "center" }}
                  >
                    Register Team
                  </Link>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="btn-secondary"
                    style={{ display: "block", textAlign: "center" }}
                  >
                    Log In to Register
                  </Link>
                )}
              </>
            ) : (
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "var(--white-40)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textAlign: "center",
                padding: "8px 0",
              }}>
                {tournament.status === "LIVE" ? "Tournament In Progress" :
                 tournament.status === "COMPLETED" ? "Tournament Completed" :
                 "Registration Closed"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StandingsTab({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));

  if (sorted.length === 0) {
    return (
      <div style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "48px",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
          color: "var(--white-40)",
          textTransform: "uppercase",
        }}>No Results Yet</div>
        <p style={{ color: "var(--white-40)", fontSize: "0.8rem", marginTop: "8px" }}>
          Standings will appear after the first match is completed.
        </p>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
      {/* HEADER */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "48px 1fr 80px 80px 100px",
        padding: "10px 20px",
        background: "var(--surface-2)",
        borderBottom: "1px solid var(--border)",
      }}>
        {["#", "Team", "Matches", "Kills", "Points"].map((col, i) => (
          <div key={col} style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 600,
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            color: "var(--white-40)",
            textTransform: "uppercase",
            textAlign: i > 1 ? "right" : "left",
          }}>{col}</div>
        ))}
      </div>

      {/* ROWS */}
      {sorted.map((team, i) => (
        <div key={team.id} style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 80px 80px 100px",
          padding: "12px 20px",
          borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none",
          background: i === 0 ? "var(--gold-dim)" : "transparent",
          alignItems: "center",
        }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: i === 0 ? "var(--gold)" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "var(--white-40)",
          }}>{String(i + 1).padStart(2, "0")}</div>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--white)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>{team.name}</div>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.85rem",
            color: "var(--white-70)",
            textAlign: "right",
          }}>—</div>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.85rem",
            color: "var(--white-70)",
            textAlign: "right",
          }}>{team.kills ?? "—"}</div>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 600,
            fontSize: "0.95rem",
            color: i === 0 ? "var(--gold)" : "var(--white)",
            textAlign: "right",
          }}>{team.points ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}

function MatchesTab({ matches, tournamentId }: { matches: Match[]; tournamentId: string }) {
  if (matches.length === 0) {
    return (
      <div style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "48px",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
          color: "var(--white-40)",
          textTransform: "uppercase",
        }}>No Matches Scheduled</div>
        <p style={{ color: "var(--white-40)", fontSize: "0.8rem", marginTop: "8px" }}>
          Matches will appear here once scheduled.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1px",
      background: "var(--border)",
      border: "1px solid var(--border)",
    }}>
      {matches.map((match) => {
        const isLive = match.status === "LIVE" || match.status === "IN_PROGRESS";
        const isDone = match.status === "COMPLETED";

        return (
          <div key={match.id} style={{
            background: "var(--surface)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderLeft: isLive ? "3px solid var(--red)" : isDone ? "3px solid var(--green)" : "3px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  color: "var(--white)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}>Match {match.matchNumber}</div>
                <div style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.72rem",
                  color: "var(--white-40)",
                  marginTop: "2px",
                }}>
                  {match.map || "Map TBD"}
                  {match.scheduledAt && ` · ${new Date(match.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {isLive && <span className="badge-live">Live</span>}
              {isDone && <span className="badge-completed">Completed</span>}
              {!isLive && !isDone && <span className="badge-upcoming">Scheduled</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TeamsTab({ teams }: { teams: Team[] }) {
  if (teams.length === 0) {
    return (
      <div style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "48px",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
          color: "var(--white-40)",
          textTransform: "uppercase",
        }}>No Teams Yet</div>
        <p style={{ color: "var(--white-40)", fontSize: "0.8rem", marginTop: "8px" }}>
          Teams will appear here once registered.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "1px",
      background: "var(--border)",
      border: "1px solid var(--border)",
    }}>
      {teams.map((team) => (
        <div key={team.id} style={{
          background: "var(--surface)",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "0.85rem",
              color: "var(--white-40)",
            }}>{team.name[0].toUpperCase()}</span>
          </div>
          <div>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "var(--white)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>{team.name}</div>
            {team.points !== null && team.points !== undefined && (
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.72rem",
                color: "var(--gold)",
                marginTop: "2px",
              }}>{team.points} pts</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RulesTab({ rules }: { rules?: string | null }) {
  if (!rules) {
    return (
      <div style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "48px",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
          color: "var(--white-40)",
          textTransform: "uppercase",
        }}>No Rules Published</div>
        <p style={{ color: "var(--white-40)", fontSize: "0.8rem", marginTop: "8px" }}>
          The organizer has not published rules for this tournament yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid var(--border)",
      background: "var(--surface)",
      padding: "32px",
      maxWidth: "720px",
    }}>
      <div className="section-label" style={{ marginBottom: "16px" }}>Tournament Rules</div>
      <div style={{
        fontSize: "0.88rem",
        color: "var(--white-70)",
        lineHeight: 1.9,
        whiteSpace: "pre-wrap",
        fontFamily: "Barlow, sans-serif",
      }}>{rules}</div>
    </div>
  );
}