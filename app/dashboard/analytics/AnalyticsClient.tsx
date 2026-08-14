"use client";

interface AnalyticsData {
  totalTournaments: number;
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  totalRegistrations: number;
  approvedRegistrations: number;
  totalPrizeValue: number;
  tournaments: Array<{
    id: string;
    name: string;
    status: string;
    game: string;
    _count: { teams: number; matches: number; registrations: number };
    startDate?: string;
  }>;
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const stats = [
    { label: "Tournaments", value: data.totalTournaments, icon: "🏆", color: "#D4AF37" },
    { label: "Teams", value: data.totalTeams, icon: "👥", color: "#60a5fa" },
    { label: "Matches", value: data.totalMatches, icon: "🎮", color: "#34d399" },
    { label: "Completed", value: data.completedMatches, icon: "✅", color: "#a78bfa" },
    { label: "Registrations", value: data.totalRegistrations, icon: "📋", color: "#fb923c" },
    { label: "Prize Pool", value: data.totalPrizeValue > 0 ? `Rs ${data.totalPrizeValue.toLocaleString()}` : "—", icon: "💰", color: "#f472b6", isText: true },
  ];

  const getStatusColor = (status: string) => {
    if (status === "live") return "#22c55e";
    if (status === "completed") return "#D4AF37";
    if (status === "draft") return "#6b7280";
    return "#60a5fa";
  };

  const completionRate = data.totalMatches > 0 ? Math.round((data.completedMatches / data.totalMatches) * 100) : 0;
  const approvalRate = data.totalRegistrations > 0 ? Math.round((data.approvedRegistrations / data.totalRegistrations) * 100) : 0;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "0.05em" }}>ANALYTICS</h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Real-time stats from your tournaments</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
            <div style={{ fontSize: s.isText ? "1rem" : "1.75rem", fontWeight: 800, color: s.color, fontFamily: s.isText ? "inherit" : "var(--font-mono, monospace)", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Match Completion</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>{data.completedMatches}/{data.totalMatches}</span>
            <span style={{ color: "#D4AF37", fontWeight: 700 }}>{completionRate}%</span>
          </div>
          <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completionRate}%`, background: "#D4AF37", borderRadius: "4px", transition: "width 0.5s ease" }} />
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Registration Approval</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>{data.approvedRegistrations}/{data.totalRegistrations}</span>
            <span style={{ color: "#22c55e", fontWeight: 700 }}>{approvalRate}%</span>
          </div>
          <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${approvalRate}%`, background: "#22c55e", borderRadius: "4px", transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Tournaments</h2>
        </div>
        {data.tournaments.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#4b5563" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
            <div>No tournaments yet. Create your first tournament to see analytics.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Tournament", "Status", "Teams", "Matches", "Regs"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.tournaments.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < data.tournaments.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.875rem" }}>{t.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase" }}>{t.game.replace("_", " ")}</div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ background: `${getStatusColor(t.status)}20`, color: getStatusColor(t.status), border: `1px solid ${getStatusColor(t.status)}40`, borderRadius: "0.25rem", padding: "0.2rem 0.5rem", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.875rem" }}>{t._count.teams}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.875rem" }}>{t._count.matches}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.875rem" }}>{t._count.registrations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}