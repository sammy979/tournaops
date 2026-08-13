"use client";

import { useState, useMemo } from "react";

interface MatchData {
  status: string;
  scoreA: number | null;
  scoreB: number | null;
  scheduledAt: string | null;
}

interface StageData {
  matches: MatchData[];
}

interface RegistrationData {
  status: string;
  team: {
    name: string;
    _count: { members: number };
  } | null;
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: string;
  createdAt: string;
  maxTeams: number;
  prizePool: number | null;
  _count: {
    registrations: number;
    stages: number;
  };
  registrations: RegistrationData[];
  stages: StageData[];
}

interface Props {
  tournaments: Tournament[];
  totalTournaments: number;
  totalApprovedTeams: number;
  totalMatchesPlayed: number;
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid ${highlight ? "var(--gold)" : "var(--border)"}`,
      padding: "1.5rem",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        color: highlight ? "var(--gold)" : "var(--charcoal)",
        letterSpacing: "0.2em",
        marginBottom: "0.5rem",
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "2.5rem",
        fontWeight: "900",
        color: highlight ? "var(--gold)" : "#fff",
        lineHeight: 1,
      }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {sub && (
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--charcoal)",
          marginTop: "0.35rem",
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        marginBottom: "0.3rem",
      }}>
        <span style={{ color: "#fff" }}>{label}</span>
        <span style={{ color: "var(--gold)" }}>{value}</span>
      </div>
      <div style={{
        height: "6px",
        background: "var(--black)",
        border: "1px solid var(--border)",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color || "var(--gold)",
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

export default function AnalyticsClient({
  tournaments,
  totalTournaments,
  totalApprovedTeams,
  totalMatchesPlayed,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>("ALL");

  const selectedTournament = useMemo(
    () => tournaments.find((t) => t.id === selectedId) || null,
    [tournaments, selectedId]
  );

  const scope = selectedId === "ALL" ? tournaments : selectedTournament ? [selectedTournament] : [];

  const scopeStats = useMemo(() => {
    const allMatches = scope.flatMap((t) => t.stages.flatMap((s) => s.matches));
    const allRegs = scope.flatMap((t) => t.registrations);

    const totalMatches = allMatches.length;
    const completedMatches = allMatches.filter((m) => m.status === "COMPLETED").length;
    const liveMatches = allMatches.filter((m) => m.status === "LIVE").length;
    const pendingMatches = allMatches.filter((m) => m.status === "PENDING").length;

    const approvedRegs = allRegs.filter((r) => r.status === "APPROVED").length;
    const pendingRegs = allRegs.filter((r) => r.status === "PENDING").length;
    const rejectedRegs = allRegs.filter((r) => r.status === "REJECTED").length;
    const waitlistRegs = allRegs.filter((r) => r.status === "WAITLISTED").length;

    const totalPrizePool = scope.reduce((sum, t) => sum + (t.prizePool || 0), 0);

    const scoresA = allMatches
      .filter((m) => m.status === "COMPLETED" && m.scoreA !== null)
      .map((m) => m.scoreA as number);
    const scoresB = allMatches
      .filter((m) => m.status === "COMPLETED" && m.scoreB !== null)
      .map((m) => m.scoreB as number);
    const allScores = [...scoresA, ...scoresB];
    const avgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    const totalPlayers = allRegs
      .filter((r) => r.status === "APPROVED")
      .reduce((sum, r) => sum + (r.team?._count.members || 0), 0);

    const avgTeamSize =
      approvedRegs > 0 ? Math.round(totalPlayers / approvedRegs) : 0;

    const completionRate =
      totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

    const fillRate =
      scope.length > 0
        ? Math.round(
            (approvedRegs / scope.reduce((sum, t) => sum + t.maxTeams, 0)) * 100
          )
        : 0;

    return {
      totalMatches,
      completedMatches,
      liveMatches,
      pendingMatches,
      approvedRegs,
      pendingRegs,
      rejectedRegs,
      waitlistRegs,
      totalPrizePool,
      avgScore,
      totalPlayers,
      avgTeamSize,
      completionRate,
      fillRate,
    };
  }, [scope]);

  const tournamentBreakdown = useMemo(() => {
    return tournaments.map((t) => {
      const allMatches = t.stages.flatMap((s) => s.matches);
      const completed = allMatches.filter((m) => m.status === "COMPLETED").length;
      const approved = t.registrations.filter((r) => r.status === "APPROVED").length;
      return {
        id: t.id,
        name: t.name,
        game: t.game,
        status: t.status,
        totalMatches: allMatches.length,
        completedMatches: completed,
        approvedTeams: approved,
        maxTeams: t.maxTeams,
        prizePool: t.prizePool,
        fillRate: t.maxTeams > 0 ? Math.round((approved / t.maxTeams) * 100) : 0,
      };
    });
  }, [tournaments]);

  const maxApproved = Math.max(...tournamentBreakdown.map((t) => t.approvedTeams), 1);
  const maxMatches = Math.max(...tournamentBreakdown.map((t) => t.completedMatches), 1);

  function statusBadgeColor(status: string) {
    switch (status) {
      case "PUBLISHED": return "#22c55e";
      case "LIVE": return "var(--gold)";
      case "COMPLETED": return "var(--charcoal)";
      default: return "var(--charcoal)";
    }
  }

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "Barlow Condensed, sans-serif",
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--gold)",
          letterSpacing: "0.2em",
          marginBottom: "0.25rem",
        }}>
          DASHBOARD / ANALYTICS
        </div>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
        }}>
          Analytics
        </h1>
      </div>

      {tournaments.length === 0 ? (
        <div style={{
          padding: "4rem 2rem",
          textAlign: "center",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          color: "var(--charcoal)",
        }}>
          No tournaments yet. Create your first tournament to see analytics.
        </div>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "var(--border)",
            marginBottom: "2rem",
          }}>
            <StatCard
              label="TOTAL TOURNAMENTS"
              value={totalTournaments}
              highlight
            />
            <StatCard
              label="APPROVED TEAMS (ALL TIME)"
              value={totalApprovedTeams}
            />
            <StatCard
              label="MATCHES PLAYED (ALL TIME)"
              value={totalMatchesPlayed}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--charcoal)",
              letterSpacing: "0.15em",
              marginBottom: "0.4rem",
            }}>
              FILTER BY TOURNAMENT
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "500px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "#fff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                padding: "0.5rem 0.75rem",
                cursor: "pointer",
              }}
            >
              <option value="ALL">ALL TOURNAMENTS</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.game})
                </option>
              ))}
            </select>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "var(--border)",
            marginBottom: "2rem",
          }}>
            <StatCard
              label="TOTAL MATCHES"
              value={scopeStats.totalMatches}
            />
            <StatCard
              label="COMPLETED"
              value={scopeStats.completedMatches}
              sub={`${scopeStats.completionRate}% completion rate`}
            />
            <StatCard
              label="APPROVED TEAMS"
              value={scopeStats.approvedRegs}
              sub={`${scopeStats.fillRate}% slots filled`}
            />
            <StatCard
              label="TOTAL PLAYERS"
              value={scopeStats.totalPlayers}
              sub={scopeStats.avgTeamSize > 0 ? `avg ${scopeStats.avgTeamSize} per team` : undefined}
            />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "var(--border)",
            marginBottom: "2rem",
          }}>
            <StatCard
              label="PENDING REGISTRATIONS"
              value={scopeStats.pendingRegs}
            />
            <StatCard
              label="WAITLISTED"
              value={scopeStats.waitlistRegs}
            />
            <StatCard
              label="REJECTED"
              value={scopeStats.rejectedRegs}
            />
            <StatCard
              label="TOTAL PRIZE POOL"
              value={scopeStats.totalPrizePool > 0 ? `Rs ${scopeStats.totalPrizePool.toLocaleString()}` : "—"}
              highlight={scopeStats.totalPrizePool > 0}
            />
          </div>

          {scopeStats.liveMatches > 0 && (
            <div style={{
              background: "#001a00",
              border: "1px solid #22c55e",
              padding: "1rem 1.5rem",
              marginBottom: "2rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "#22c55e",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}>
              <span style={{ fontSize: "1rem" }}>🟢</span>
              {scopeStats.liveMatches} match{scopeStats.liveMatches > 1 ? "es" : ""} currently LIVE
            </div>
          )}

          {scopeStats.pendingMatches > 0 && (
            <div style={{
              background: "#1a1200",
              border: "1px solid var(--gold)",
              padding: "1rem 1.5rem",
              marginBottom: "2rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "var(--gold)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}>
              <span style={{ fontSize: "1rem" }}>⏳</span>
              {scopeStats.pendingMatches} match{scopeStats.pendingMatches > 1 ? "es" : ""} pending scheduling
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "1.5rem",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--gold)",
                letterSpacing: "0.15em",
                marginBottom: "1.25rem",
              }}>
                TEAMS PER TOURNAMENT
              </div>
              {tournamentBreakdown.length === 0 ? (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--charcoal)" }}>
                  No data
                </div>
              ) : (
                tournamentBreakdown.map((t) => (
                  <BarRow
                    key={t.id}
                    label={t.name}
                    value={t.approvedTeams}
                    max={maxApproved}
                  />
                ))
              )}
            </div>

            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "1.5rem",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--gold)",
                letterSpacing: "0.15em",
                marginBottom: "1.25rem",
              }}>
                MATCHES COMPLETED PER TOURNAMENT
              </div>
              {tournamentBreakdown.length === 0 ? (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--charcoal)" }}>
                  No data
                </div>
              ) : (
                tournamentBreakdown.map((t) => (
                  <BarRow
                    key={t.id}
                    label={t.name}
                    value={t.completedMatches}
                    max={maxMatches}
                    color="#22c55e"
                  />
                ))
              )}
            </div>
          </div>

          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "1.5rem",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--gold)",
              letterSpacing: "0.15em",
              marginBottom: "1.25rem",
            }}>
              TOURNAMENT BREAKDOWN TABLE
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 80px 80px 80px 80px 100px 80px",
              gap: "0.75rem",
              padding: "0.5rem 0",
              borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--charcoal)",
              letterSpacing: "0.1em",
            }}>
              <span>TOURNAMENT</span>
              <span>STATUS</span>
              <span>TEAMS</span>
              <span>MAX</span>
              <span>MATCHES</span>
              <span>PRIZE POOL</span>
              <span>FILL %</span>
            </div>

            {tournamentBreakdown.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 80px 80px 80px 80px 100px 80px",
                  gap: "0.75rem",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    color: "#fff",
                  }}>
                    {t.name}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--charcoal)",
                  }}>
                    {t.game}
                  </div>
                </div>
                <div>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: statusBadgeColor(t.status),
                    border: `1px solid ${statusBadgeColor(t.status)}`,
                    padding: "0.15rem 0.4rem",
                  }}>
                    {t.status}
                  </span>
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "#fff",
                }}>
                  {t.approvedTeams}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "var(--charcoal)",
                }}>
                  {t.maxTeams}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "#fff",
                }}>
                  {t.completedMatches}/{t.totalMatches}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: t.prizePool ? "var(--gold)" : "var(--charcoal)",
                }}>
                  {t.prizePool ? `Rs ${t.prizePool.toLocaleString()}` : "—"}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: t.fillRate >= 80 ? "var(--gold)" : t.fillRate >= 50 ? "#f97316" : "#ef4444",
                }}>
                  {t.fillRate}%
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}