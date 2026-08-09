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
    const { searchParams } = new URL(req.url);
    const stageId = searchParams.get("stage");

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: true,
        matches: true,
        stages: { include: { groups: true }, orderBy: { order: "asc" } },
      },
    });

    if (!tournament) {
      return new Response("Tournament not found", { status: 404 });
    }

    // Determine which teams and matches to include
    let activeStage: any = null;
    let stageTeamIds: Set<string> | null = null;
    let stageMatches = tournament.matches;
    let stageLabel = "OVERALL STANDINGS";

    if (stageId) {
      // Specific stage requested
      activeStage = tournament.stages.find(s => s.id === stageId);
      if (activeStage) {
        stageTeamIds = new Set<string>();
        for (const g of activeStage.groups) {
          for (const tid of g.teamIds) stageTeamIds.add(tid);
        }
        stageMatches = tournament.matches.filter(m => m.stageId === stageId);
        stageLabel = activeStage.name.toUpperCase() + " STANDINGS";
      }
    } else if (tournament.stages.length > 0) {
      // Auto-detect current active stage (highest-order with any completed matches)
      const stagesWithMatches = tournament.stages
        .filter(s => tournament.matches.some(m => m.stageId === s.id && m.status === "completed"))
        .sort((a, b) => b.order - a.order);

      if (stagesWithMatches.length > 0) {
        activeStage = stagesWithMatches[0];
        stageTeamIds = new Set<string>();
        for (const g of activeStage.groups) {
          for (const tid of g.teamIds) stageTeamIds.add(tid);
        }
        stageMatches = tournament.matches.filter(m => m.stageId === activeStage.id);
        stageLabel = activeStage.name.toUpperCase() + " STANDINGS";
      }
    }

    // Calculate standings
    const scoringRule: any = (activeStage?.scoringRule && Object.keys(activeStage.scoringRule).length > 0)
      ? activeStage.scoringRule
      : (tournament.scoringRule || {});
    const killPoints = Number(scoringRule.killPoints) || 1;
    const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;
    let placementPoints: number[] = [10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0];
    if (Array.isArray(scoringRule.placementPoints)) {
      placementPoints = scoringRule.placementPoints;
    } else if (scoringRule.placementPoints && typeof scoringRule.placementPoints === "object") {
      placementPoints = Object.values(scoringRule.placementPoints).map(Number);
    }

    // Only include teams that are in this stage (or all teams if no stage)
    const eligibleTeams = stageTeamIds
      ? tournament.teams.filter(t => stageTeamIds!.has(t.id))
      : tournament.teams;

    const teamStats = new Map<string, any>();
    for (const team of eligibleTeams) {
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
    let totalMatchesPlayed = 0;
    for (const match of stageMatches) {
      if (match.status !== "completed" || !Array.isArray(match.results)) continue;
      totalMatchesPlayed++;
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

    // Sort standings — include ALL eligible stage teams (even 0-match ones)
    const standings = Array.from(teamStats.values())
      .sort((a: any, b: any) => b.points - a.points || b.wwcds - a.wwcds || b.kills - a.kills)
      .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    const branding = tournament.brandingData as any || {};
    const primaryColor = branding.primaryColor || "#f59e0b";
    const orgName = branding.orgName || "Tournament";

    // Dynamic sizing
    const rowHeight = standings.length > 24 ? 42 : 52;
    const imageHeight = Math.max(1200, 340 + (standings.length * rowHeight));

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
            marginBottom: "24px",
            borderBottom: "4px solid " + primaryColor,
            paddingBottom: "18px",
          }}>
            <div style={{ color: primaryColor, fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
              {stageLabel}
            </div>
            <div style={{ color: "#ffffff", fontSize: "44px", fontWeight: 900, lineHeight: 1.1 }}>
              {tournament.name}
            </div>
            <div style={{ display: "flex", color: "#9ca3af", fontSize: "18px", marginTop: "12px" }}>
              <span style={{ marginRight: "24px" }}>{eligibleTeams.length} Teams</span>
              <span style={{ marginRight: "24px" }}>{totalMatchesPlayed}/{stageMatches.length} Matches</span>
              <span>{totalKills} Total Kills</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {standings.length === 0 ? (
              <div style={{ display: "flex", color: "#6b7280", fontSize: "24px", justifyContent: "center", marginTop: "100px" }}>
                No teams in this stage
              </div>
            ) : standings.map((s: any, i: number) => {
              const isFirst = s.rank === 1;
              const isSecond = s.rank === 2;
              const isThird = s.rank === 3;
              const rankColor = isFirst ? "#fbbf24" : isSecond ? "#e5e7eb" : isThird ? "#f97316" : "#6b7280";
              const compact = standings.length > 24;
              return (
                <div key={s.id} style={{
                  display: "flex",
                  alignItems: "center",
                  padding: compact ? "8px 16px" : "12px 18px",
                  marginBottom: compact ? "2px" : "4px",
                  background: (isFirst || isSecond || isThird) ? rankColor + "15" : (i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent"),
                  borderLeft: "5px solid " + ((isFirst || isSecond || isThird) ? rankColor : "transparent"),
                  borderRadius: "8px",
                }}>
                  <div style={{
                    width: "60px",
                    color: rankColor,
                    fontSize: compact ? "20px" : "24px",
                    fontWeight: 900,
                    display: "flex",
                  }}>
                    #{s.rank}
                  </div>
                  <div style={{ flex: 1, color: "#ffffff", fontSize: compact ? "17px" : "20px", fontWeight: 700, display: "flex" }}>
                    {s.tag ? "[" + s.tag + "] " + s.name : s.name}
                  </div>
                  <div style={{ width: "80px", textAlign: "center", color: s.wwcds > 0 ? primaryColor : "#4b5563", fontSize: compact ? "16px" : "18px", fontWeight: 800, display: "flex", justifyContent: "center" }}>
                    {s.wwcds}W
                  </div>
                  <div style={{ width: "80px", textAlign: "center", color: "#f87171", fontSize: compact ? "16px" : "18px", fontWeight: 700, display: "flex", justifyContent: "center" }}>
                    {s.kills}K
                  </div>
                  <div style={{ width: "110px", textAlign: "right", color: (isFirst || isSecond || isThird) ? rankColor : "#ffffff", fontSize: compact ? "22px" : "26px", fontWeight: 900, display: "flex", justifyContent: "flex-end" }}>
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
            marginTop: "24px",
            paddingTop: "18px",
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
        height: imageHeight,
      }
    );
  } catch (e: any) {
    console.error("[STANDINGS_IMAGE] Error:", e?.message, e?.stack);
    return new Response("Image generation failed: " + (e?.message || "unknown"), { status: 500 });
  }
}