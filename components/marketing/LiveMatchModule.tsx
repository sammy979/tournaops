interface MatchResult {
  team: { id: string; name: string };
  placement: number | null;
  kills: number;
  totalPoints: number;
}

interface LiveMatchModuleProps {
  tournamentName: string;
  matchNumber: number;
  results: MatchResult[];
}

export default function LiveMatchModule({
  tournamentName,
  matchNumber,
  results,
}: LiveMatchModuleProps) {
  const sorted = [...results].sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99));

  return (
    <div style={{
      background: "var(--charcoal)",
      border: "1px solid var(--border)",
      overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{
        background: "var(--charcoal-deep)",
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--color-live)",
            display: "inline-block",
            animation: "live-pulse 1.5s ease-in-out infinite",
          }} />
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-live)",
          }}>
            Live
          </span>
        </div>
        <span style={{
          fontSize: "12px",
          color: "var(--muted-light)",
          fontFamily: "JetBrains Mono, monospace",
        }}>
          Match {matchNumber}
        </span>
      </div>

      {/* Tournament Name */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
        <p style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "16px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--white)",
        }}>
          {tournamentName}
        </p>
      </div>

      {/* Results */}
      {sorted.length === 0 ? (
        <div style={{ padding: "32px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "var(--muted-light)" }}>
            Match in progress — results pending
          </p>
        </div>
      ) : (
        <div>
          {sorted.slice(0, 8).map((r, i) => (
            <div key={r.team.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 20px",
              borderBottom: i < sorted.slice(0, 8).length - 1 ? "1px solid var(--border)" : "none",
              background: i === 0 ? "rgba(255,200,0,0.04)" : "transparent",
            }}>
              <span style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                color: i === 0 ? "var(--gold-bright)" : "var(--muted-light)",
                minWidth: "24px",
                fontWeight: i === 0 ? 700 : 400,
              }}>
                #{r.placement ?? i + 1}
              </span>
              <span style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--white)",
                flex: 1,
              }}>
                {r.team.name}
              </span>
              <span style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                color: "var(--text-secondary)",
              }}>
                {r.kills}K
              </span>
              <span style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--white)",
                minWidth: "32px",
                textAlign: "right",
              }}>
                {r.totalPoints}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}