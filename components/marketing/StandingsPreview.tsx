import Link from "next/link";

interface TeamStanding {
  position: number;
  teamName: string;
  matches: number;
  kills: number;
  points: number;
}

interface Props {
  standings: TeamStanding[];
  tournamentName?: string;
  tournamentId?: string;
}

export default function StandingsPreview({ standings, tournamentName, tournamentId }: Props) {
  const display = standings.slice(0, 8);

  if (display.length === 0) return null;

  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="container-ops">
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div>
            <div className="section-label">Current Standings</div>
            <h2 className="text-display">{tournamentName || "Live Standings"}</h2>
          </div>
          {tournamentId && (
            <Link href={`/tournaments/${tournamentId}`} className="btn-secondary" style={{ padding: "8px 18px" }}>
              Full Standings →
            </Link>
          )}
        </div>

        <div style={{
          border: "1px solid var(--border)",
          overflow: "hidden",
          background: "var(--surface)",
        }}>
          {/* TABLE HEADER */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 80px 80px 100px",
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}>
            {["#", "TEAM", "MATCHES", "KILLS", "POINTS"].map((col, i) => (
              <div key={i} style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: "var(--white-40)",
                textAlign: i > 1 ? "right" : "left",
              }}>{col}</div>
            ))}
          </div>

          {/* TABLE ROWS */}
          {display.map((row, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 80px 80px 100px",
              padding: "12px 20px",
              borderBottom: i < display.length - 1 ? "1px solid var(--border)" : "none",
              background: i === 0 ? "var(--gold-dim)" : "transparent",
              alignItems: "center",
              transition: "background 0.1s ease",
            }}>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: i === 0 ? "var(--gold)" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "var(--white-40)",
              }}>
                {String(row.position).padStart(2, "0")}
              </div>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "0.04em",
                color: "var(--white)",
                textTransform: "uppercase",
              }}>{row.teamName}</div>
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.85rem",
                color: "var(--white-70)",
                textAlign: "right",
              }}>{row.matches}</div>
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.85rem",
                color: "var(--white-70)",
                textAlign: "right",
              }}>{row.kills}</div>
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: i === 0 ? "var(--gold)" : "var(--white)",
                textAlign: "right",
              }}>{row.points}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}