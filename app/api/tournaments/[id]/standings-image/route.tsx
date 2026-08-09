import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true, matches: true },
    });

    if (!tournament) {
      return new Response("Not found", { status: 404 });
    }

    // Calculate standings
    const scoringRule: any = tournament.scoringRule || {};
    const killPoints = Number(scoringRule.killPoints) || 1;
    const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;
    let placementPoints: number[] = [10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0];
    if (Array.isArray(scoringRule.placementPoints)) {
      placementPoints = scoringRule.placementPoints;
    } else if (scoringRule.placementPoints && typeof scoringRule.placementPoints === "object") {
      placementPoints = Object.values(scoringRule.placementPoints).map(Number);
    }

    const teamStats = new Map<string, any>();
    for (const team of tournament.teams) {
      teamStats.set(team.id, {
        id: team.id,
        name: team.name,
        tag: team.tag,
        points: 0,
        kills: 0,
        wwcds: 0,
        matches: 0,
      });
    }

    let totalKills = 0;
    let totalMatches = 0;
    for (const match of tournament.matches) {
      if (match.status !== "completed" || !Array.isArray(match.results)) continue;
      totalMatches++;
      const results = match.results as any[];
      for (const r of results) {
        const s = teamStats.get(r.teamId);
        if (!s) continue;
        const kills = Number(r.kills) || 0;
        const placement = Number(r.placement) || 16;
        const isWWCD = placement === 1 || r.wwcd === true;
        const pIdx = Math.max(0, placement - 1);
        s.points += (placementPoints[pIdx] || 0) + kills * killPoints + (isWWCD ? wwcdBonus : 0);
        s.kills += kills;
        if (isWWCD) s.wwcds++;
        s.matches++;
        totalKills += kills;
      }
    }

    const standings = Array.from(teamStats.values())
      .filter((s: any) => s.matches > 0)
      .sort((a: any, b: any) => b.points - a.points || b.wwcds - a.wwcds || b.kills - a.kills)
      .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    const top10 = standings.slice(0, 10);
    const branding = tournament.brandingData as any || {};
    const primaryColor = branding.primaryColor || "#f59e0b";
    const orgName = branding.orgName || "Tournament";

    return new ImageResponse(
      (
        <div style={{
          width: "1200px",
          height: "1600px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #0a0a0f 0%, #111116 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: "40px", borderBottom: `4px solid ${primaryColor}`, paddingBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ color: primaryColor, fontSize: "24px", fontWeight: 700, letterSpacing: "8px", textTransform: "uppercase" }}>
                LIVE STANDINGS
              </span>
              <span style={{ color: "#6b7280", fontSize: "18px" }}>
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div style={{ color: "#fff", fontSize: "56px", fontWeight: 900, lineHeight: 1.1 }}>
              {tournament.name}
            </div>
            <div style={{ display: "flex", gap: "32px", marginTop: "16px", color: "#9ca3af", fontSize: "20px" }}>
              <span>👥 {tournament.teams.length} Teams</span>
              <span>🎯 {totalMatches}/{tournament.matches.length} Matches</span>
              <span>💥 {totalKills.toLocaleString()} Total Kills</span>
            </div>
          </div>

          {/* Standings */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {/* Header row */}
            <div style={{ display: "flex", padding: "16px 24px", color: "#6b7280", fontSize: "14px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
              <span style={{ width: "80px" }}>RANK</span>
              <span style={{ flex: 1 }}>TEAM</span>
              <span style={{ width: "100px", textAlign: "center" }}>WWCD</span>
              <span style={{ width: "100px", textAlign: "center" }}>KILLS</span>
              <span style={{ width: "140px", textAlign: "right" }}>POINTS</span>
            </div>

            {top10.map((s: any, i: number) => {
              const isTop3 = s.rank <= 3;
              const rankColors = ["#fbbf24", "#e5e7eb", "#f97316"];
              const rankColor = isTop3 ? rankColors[s.rank - 1] : "#6b7280";
              return (
                <div key={s.id} style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "20px 24px",
                  background: isTop3 ? `${rankColor}15` : (i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent"),
                  borderLeft: isTop3 ? `6px solid ${rankColor}` : "6px solid transparent",
                  borderRadius: "12px",
                }}>
                  <span style={{ width: "80px", color: rankColor, fontSize: "32px", fontWeight: 900 }}>
                    #{s.rank}
                  </span>
                  <span style={{ flex: 1, color: "#fff", fontSize: "24px", fontWeight: 700, display: "flex", alignItems: "center", gap: "12px" }}>
                    {s.tag && <span style={{ color: primaryColor, fontSize: "18px" }}>[{s.tag}]</span>}
                    {s.name}
                  </span>
                  <span style={{ width: "100px", textAlign: "center", color: s.wwcds > 0 ? primaryColor : "#4b5563", fontSize: "22px", fontWeight: 800 }}>
                    {s.wwcds}
                  </span>
                  <span style={{ width: "100px", textAlign: "center", color: "#f87171", fontSize: "22px", fontWeight: 700 }}>
                    {s.kills}
                  </span>
                  <span style={{ width: "140px", textAlign: "right", color: isTop3 ? rankColor : "#fff", fontSize: "32px", fontWeight: 900 }}>
                    {s.points}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: "2px solid rgba(255,255,255,0.08)",
          }}>
            <span style={{ color: "#6b7280", fontSize: "18px" }}>
              {orgName}
            </span>
            <span style={{ color: primaryColor, fontSize: "18px", fontWeight: 700, letterSpacing: "4px" }}>
              TOURNAOPS.COM
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 1600,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      }
    );
  } catch (e: any) {
    console.error("[STANDINGS_IMAGE]", e);
    return new Response("Error: " + e.message, { status: 500 });
  }
}