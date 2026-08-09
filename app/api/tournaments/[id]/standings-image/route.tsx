import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
      return new Response("Tournament not found", { status: 404 });
    }

    // Calculate standings inline
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
        name: team.name || "Team",
        tag: team.tag || "",
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

    const allTeams = standings; // All teams that played matches
    const branding = tournament.brandingData as any || {};
    const primaryColor = branding.primaryColor || "#f59e0b";
    const orgName = branding.orgName || "Tournament";

    return new ImageResponse(
      (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0f",
          padding: "50px",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "30px",
            borderBottom: "4px solid " + primaryColor,
            paddingBottom: "20px",
          }}>
            <div style={{ color: primaryColor, fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
              LIVE STANDINGS
            </div>
            <div style={{ color: "#ffffff", fontSize: "48px", fontWeight: 900 }}>
              {tournament.name}
            </div>
            <div style={{ display: "flex", color: "#9ca3af", fontSize: "18px", marginTop: "12px" }}>
              <span style={{ marginRight: "24px" }}>{tournament.teams.length} Teams</span>
              <span style={{ marginRight: "24px" }}>{totalMatches}/{tournament.matches.length} Matches</span>
              <span>{totalKills} Total Kills</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {allTeams.length === 0 ? (
              <div style={{ display: "flex", color: "#6b7280", fontSize: "24px", justifyContent: "center", marginTop: "100px" }}>
                No results yet
              </div>
            ) : allTeams.map((s: any, i: number) => {
              const isFirst = s.rank === 1;
              const isSecond = s.rank === 2;
              const isThird = s.rank === 3;
              const rankColor = isFirst ? "#fbbf24" : isSecond ? "#e5e7eb" : isThird ? "#f97316" : "#6b7280";
              return (
                <div key={s.id} style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 18px",
                  marginBottom: "3px",
                  background: isFirst || isSecond || isThird ? rankColor + "15" : (i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent"),
                  borderLeft: "6px solid " + (isFirst || isSecond || isThird ? rankColor : "transparent"),
                  borderRadius: "10px",
                }}>
                  <div style={{
                    width: "70px",
                    color: rankColor,
                    fontSize: "26px",
                    fontWeight: 900,
                    display: "flex",
                  }}>
                    #{s.rank}
                  </div>
                  <div style={{ flex: 1, color: "#ffffff", fontSize: "20px", fontWeight: 700, display: "flex" }}>
                    {s.tag ? "[" + s.tag + "] " + s.name : s.name}
                  </div>
                  <div style={{ width: "100px", textAlign: "center", color: s.wwcds > 0 ? primaryColor : "#4b5563", fontSize: "18px", fontWeight: 800, display: "flex", justifyContent: "center" }}>
                    {s.wwcds}W
                  </div>
                  <div style={{ width: "100px", textAlign: "center", color: "#f87171", fontSize: "18px", fontWeight: 700, display: "flex", justifyContent: "center" }}>
                    {s.kills}K
                  </div>
                  <div style={{ width: "130px", textAlign: "right", color: isFirst || isSecond || isThird ? rankColor : "#ffffff", fontSize: "24px", fontWeight: 900, display: "flex", justifyContent: "flex-end" }}>
                    {s.points}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "2px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ color: "#6b7280", fontSize: "16px", display: "flex" }}>
              {orgName}
            </div>
            <div style={{ color: primaryColor, fontSize: "16px", fontWeight: 700, display: "flex" }}>
              TOURNAOPS.COM
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: Math.max(1200, 320 + (allTeams.length * 52)),
      }
    );
  } catch (e: any) {
    console.error("[STANDINGS_IMAGE] Error:", e?.message, e?.stack);
    return new Response("Image generation failed: " + (e?.message || "unknown"), { status: 500 });
  }
}