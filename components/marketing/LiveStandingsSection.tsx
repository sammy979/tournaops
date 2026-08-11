import Link from "next/link";

interface StandingRow {
  pos: number;
  team: string;
  matches: number;
  kills: number;
  points: number;
}

interface LiveStandingsSectionProps {
  standings?: StandingRow[];
  tournamentName?: string;
  tournamentId?: string;
}

const SAMPLE_STANDINGS: StandingRow[] = [
  { pos: 1, team: "DRS GAMING", matches: 18, kills: 42, points: 128 },
  { pos: 2, team: "T2K ESPORTS", matches: 18, kills: 38, points: 119 },
  { pos: 3, team: "VENOM ESPORTS", matches: 18, kills: 35, points: 111 },
  { pos: 4, team: "NEPAL X", matches: 18, kills: 30, points: 98 },
  { pos: 5, team: "BEAST MODE", matches: 18, kills: 27, points: 87 },
  { pos: 6, team: "STORM RIDERS", matches: 18, kills: 24, points: 79 },
  { pos: 7, team: "SHADOW CLAN", matches: 18, kills: 22, points: 71 },
  { pos: 8, team: "ALPHA SQUAD", matches: 17, kills: 19, points: 64 },
];

export function LiveStandingsSection({
  standings,
  tournamentName,
  tournamentId,
}: LiveStandingsSectionProps) {
  const rows = standings || SAMPLE_STANDINGS;
  const isSample = !standings;

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
              <span className="label-section-accent">Standings</span>
            </div>
            <h2 className="section-title">
              {tournamentName ? tournamentName.toUpperCase() : "LIVE STANDINGS"}
            </h2>
            {isSample && (
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--color-text-muted)",
                  marginTop: "6px",
                  letterSpacing: "0.06em",
                }}
              >
                SAMPLE DATA — CREATE A TOURNAMENT TO SEE REAL STANDINGS
              </p>
            )}
          </div>
          {tournamentId && (
            <Link
              href={`/tournaments/${tournamentId}?tab=standings`}
              className="btn btn-ghost btn-sm"
            >
              Full Standings →
            </Link>
          )}
        </div>

        {/* Table */}
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <table className="standings-table" style={{ background: "var(--color-surface-1)" }}>
            <thead style={{ background: "var(--color-surface-2)" }}>
              <tr>
                <th style={{ width: "40px" }}>POS</th>
                <th>TEAM</th>
                <th className="text-right hide-mobile">MATCHES</th>
                <th className="text-right hide-mobile">KILLS</th>
                <th className="text-right">PTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.pos}
                  className={idx === 0 ? "row-gold" : ""}
                >
                  <td>
                    <span className="pos-num">{String(row.pos).padStart(2, "0")}</span>
                  </td>
                  <td>
                    <span
                      className="team-name-cell"
                      style={{ fontWeight: idx === 0 ? 700 : 600 }}
                    >
                      {row.team}
                    </span>
                  </td>
                  <td className="stat-cell hide-mobile">{row.matches}</td>
                  <td className="stat-cell hide-mobile">{row.kills}</td>
                  <td className="points-cell">
                    <span
                      style={{
                        color: idx === 0 ? "var(--color-gold)" : "var(--color-text-primary)",
                      }}
                    >
                      {row.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}