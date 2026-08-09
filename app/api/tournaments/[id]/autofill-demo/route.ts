import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import type { Prisma } from "@prisma/client";

// ============================================================
// DEMO DATA GENERATOR
// Fills a tournament with realistic testing data
// ============================================================

const TEAM_NAMES = [
  "Fnatic", "Team Liquid", "T1", "TSM", "Cloud9", "G2 Esports", "Faze Clan", "NAVI",
  "Team Vitality", "OG", "Astralis", "MIBR", "Team Envy", "Sentinels", "100 Thieves",
  "Complexity", "NRG", "Evil Geniuses", "Rogue", "Excel Esports", "Made in Brazil",
  "Team BDS", "Karmine Corp", "Team SoloMid", "Team Empire", "Virtus Pro", "Gambit",
  "Team Spirit", "Team Secret", "Alliance", "Nigma Galaxy", "Ninjas in Pyjamas",
  "Team Vitality", "Movistar Riders", "Heroic", "BIG", "Endpoint", "SAW Esports",
  "GamerLegion", "Eternal Fire", "Cloud9 White", "Nemiga", "Aurora Gaming", "Falcons",
  "PaiN Gaming", "LOUD", "Furia", "9z Team", "Ares Esports", "Bad News Eagles",
  "M80", "Nouns Esports", "9INE", "Sashi Esports", "Ninjas in Pyjamas", "Astralis Talent",
  "Vexed Gaming", "MOUZ NXT", "500", "Guild Eagles", "Aurora", "Metizport", "Boss",
  "Talon Esports", "IHC Esports"
];

const TEAM_TAGS = [
  "FNC", "TL", "T1", "TSM", "C9", "G2", "FZ", "NAV", "VIT", "OG", "AST", "MBR", "ENV",
  "SEN", "100T", "CX", "NRG", "EG", "RGE", "XL", "MIB", "BDS", "KC", "SLO", "EMP",
  "VP", "GMB", "SPT", "TSC", "ALI", "NGX", "NIP", "VTL", "MOV", "HRC", "BIG", "END",
  "SAW", "GL", "EF", "C9W", "NGA", "AUR", "FLC", "PN", "LDG", "FUR", "9z", "ARE",
  "BNE", "M80", "NN", "9N", "SAS", "AS", "VXD", "MNXT", "500", "GLD", "AU", "MTZ"
];

const PLAYER_ROLES = ["IGL", "Fragger", "Support", "Entry", "Scout"];

const PLAYER_FIRST_NAMES = [
  "Alex", "Sam", "Jake", "Ryan", "Kai", "Leo", "Nova", "Max", "Zed", "Dex",
  "Rio", "Ace", "Blitz", "Chaos", "Duke", "Echo", "Frost", "Ghost", "Havoc", "Iron",
  "Jinx", "Kilo", "Lynx", "Maze", "Nyx", "Onyx", "Pulse", "Quest", "Raze", "Storm",
  "Talon", "Ursa", "Vex", "Wolf", "Xen", "Yang", "Zeus"
];

const SPONSOR_TIERS: Array<{ tier: string; count: number }> = [
  { tier: "title", count: 1 },
  { tier: "platinum", count: 2 },
  { tier: "gold", count: 4 },
  { tier: "silver", count: 6 },
];

const SPONSORS = [
  { name: "Red Bull", desc: "Gives you wings" },
  { name: "NVIDIA", desc: "The way it's meant to be played" },
  { name: "Logitech G", desc: "Play advanced" },
  { name: "Razer", desc: "For gamers, by gamers" },
  { name: "HyperX", desc: "We're all gamers" },
  { name: "SteelSeries", desc: "Pro-level gear" },
  { name: "Corsair", desc: "Ambition. Power. Performance." },
  { name: "ASUS ROG", desc: "Republic of Gamers" },
  { name: "Monster Energy", desc: "Unleash the beast" },
  { name: "Twitch", desc: "Live streaming for gamers" },
  { name: "Discord", desc: "Your place to talk" },
  { name: "YouTube Gaming", desc: "Where gaming lives" },
  { name: "Epic Games", desc: "Games that inspire" },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generatePlayer(idx: number) {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name: `${randomFrom(PLAYER_FIRST_NAMES)}${Math.floor(Math.random() * 999)}`,
    ign: `${randomFrom(PLAYER_FIRST_NAMES).toLowerCase()}_${Math.floor(Math.random() * 9999)}`,
    role: PLAYER_ROLES[idx % PLAYER_ROLES.length],
    isCaptain: idx === 0,
  };
}

function generateTeam(seed: number, allNames: string[], allTags: string[]) {
  const nameIdx = (seed - 1) % allNames.length;
  return {
    name: allNames[nameIdx] + (seed > allNames.length ? ` ${Math.ceil(seed / allNames.length)}` : ""),
    tag: allTags[nameIdx % allTags.length],
    seed,
    players: Array.from({ length: 4 }, (_, i) => generatePlayer(i)),
  };
}

function generateMatchResult(teamIds: string[], teamsMap: Map<string, any>, scoringRule: any) {
  const shuffledIds = shuffled(teamIds);
  const killPoints = Number(scoringRule.killPoints) || 1;
  const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;
  let placementPoints: number[] = [10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0];
  if (Array.isArray(scoringRule.placementPoints)) {
    placementPoints = scoringRule.placementPoints;
  } else if (scoringRule.placementPoints && typeof scoringRule.placementPoints === "object") {
    placementPoints = Object.values(scoringRule.placementPoints).map(Number);
  }

  return shuffledIds.map((teamId, idx) => {
    const placement = idx + 1;
    const team = teamsMap.get(teamId);
    // Higher placement = generally fewer kills, but random spread
    const baseKills = Math.max(0, Math.floor(Math.random() * 15) - Math.floor(idx / 3));
    const kills = Math.min(20, baseKills + Math.floor(Math.random() * 4));
    const isWWCD = placement === 1;
    const pPts = placementPoints[Math.max(0, placement - 1)] || 0;
    const kPts = kills * killPoints;
    const bonus = isWWCD ? wwcdBonus : 0;

    return {
      teamId,
      teamName: team?.name || "Team",
      teamTag: team?.tag || null,
      teamLogo: team?.logo || null,
      placement,
      kills,
      damage: kills * (350 + Math.floor(Math.random() * 300)),
      placementPoints: pPts,
      killPoints: kPts,
      totalPoints: pPts + kPts + bonus,
      wwcd: isWWCD,
    };
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const body = await req.json();
    const options = {
      fillTeams: body.fillTeams !== false,
      fillSponsors: body.fillSponsors !== false,
      fillBranding: body.fillBranding !== false,
      simulateMatches: body.simulateMatches !== false,
      teamCount: Number(body.teamCount) || 0, // 0 = fill to max
    };

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true, stages: { include: { groups: true } }, matches: true },
    });
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const report: any = { actions: [], details: {} };

    // ── 1. FILL TEAMS ──────────────────────────────────────────
    if (options.fillTeams && tournament.teams.length < tournament.maxTeams) {
      const needed = options.teamCount > 0
        ? Math.min(options.teamCount, tournament.maxTeams - tournament.teams.length)
        : tournament.maxTeams - tournament.teams.length;

      const shuffledNames = shuffled(TEAM_NAMES);
      const shuffledTags = shuffled(TEAM_TAGS);
      const teamsToCreate: Prisma.TeamCreateManyInput[] = [];

      for (let i = 0; i < needed; i++) {
        const seed = tournament.teams.length + i + 1;
        const t = generateTeam(seed, shuffledNames, shuffledTags);
        teamsToCreate.push({
          tournamentId: id,
          name: t.name,
          tag: t.tag,
          seed: t.seed,
          players: t.players as any,
        });
      }

      if (teamsToCreate.length > 0) {
        await prisma.team.createMany({ data: teamsToCreate });
        report.actions.push(`Created ${teamsToCreate.length} demo teams`);
        report.details.teamsAdded = teamsToCreate.length;
      }
    }

    // ── 2. FILL SPONSORS + BRANDING ─────────────────────────────
    if (options.fillSponsors || options.fillBranding) {
      const currentBranding = (tournament.brandingData as any) || {};

      const brandingUpdate: any = { ...currentBranding };

      if (options.fillBranding) {
        brandingUpdate.orgName = brandingUpdate.orgName || "TournaOps Demo Org";
        brandingUpdate.tagline = brandingUpdate.tagline || "The ultimate PUBG Mobile championship";
        brandingUpdate.primaryColor = brandingUpdate.primaryColor || "#f59e0b";
        brandingUpdate.accentColor = brandingUpdate.accentColor || "#f97316";
        brandingUpdate.discordUrl = brandingUpdate.discordUrl || "https://discord.gg/tournaops";
        brandingUpdate.websiteUrl = brandingUpdate.websiteUrl || "https://www.tournaops.com";
      }

      if (options.fillSponsors) {
        const currentSponsors = Array.isArray(brandingUpdate.sponsors) ? brandingUpdate.sponsors : [];
        if (currentSponsors.length === 0) {
          const generatedSponsors: any[] = [];
          const availableSponsors = shuffled(SPONSORS);
          let sponsorIdx = 0;

          for (const tierCfg of SPONSOR_TIERS) {
            for (let i = 0; i < tierCfg.count && sponsorIdx < availableSponsors.length; i++) {
              const s = availableSponsors[sponsorIdx++];
              generatedSponsors.push({
                id: `sp_${Date.now()}_${sponsorIdx}`,
                name: s.name,
                logo: "",
                tier: tierCfg.tier,
                website: `https://${s.name.toLowerCase().replace(/\s+/g, "")}.com`,
                description: s.desc,
              });
            }
          }

          brandingUpdate.sponsors = generatedSponsors;
          report.actions.push(`Added ${generatedSponsors.length} demo sponsors (1 title, 2 platinum, 4 gold, 6 silver)`);
        }
      }

      await prisma.tournament.update({
        where: { id },
        data: { brandingData: brandingUpdate as any },
      });
    }

    // ── 3. ASSIGN TEAMS TO STAGE 1 GROUPS ───────────────────────
    const freshTournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true, stages: { include: { groups: true }, orderBy: { order: "asc" } } },
    });

    if (freshTournament && freshTournament.stages.length > 0) {
      const stage1 = freshTournament.stages[0];
      const allTeamIds = freshTournament.teams.map(t => t.id);
      const teamsPerGroup = stage1.teamsPerGroup || Math.ceil(allTeamIds.length / stage1.groups.length);

      // Snake seeding: distribute teams
      const groupTeams: string[][] = stage1.groups.map(() => []);
      let direction = 1;
      let groupIdx = 0;
      const shuffledTeams = shuffled(allTeamIds);

      for (const tid of shuffledTeams) {
        groupTeams[groupIdx].push(tid);
        if (groupTeams[groupIdx].length >= teamsPerGroup) {
          if (direction === 1) {
            if (groupIdx === stage1.groups.length - 1) direction = -1;
            else groupIdx++;
          } else {
            if (groupIdx === 0) direction = 1;
            else groupIdx--;
          }
        }
      }

      // Update groups
      for (let i = 0; i < stage1.groups.length; i++) {
        await prisma.stageGroup.update({
          where: { id: stage1.groups[i].id },
          data: { teamIds: groupTeams[i] },
        });
      }

      report.actions.push(`Assigned ${allTeamIds.length} teams to ${stage1.groups.length} groups in "${stage1.name}"`);
      report.details.teamsAssigned = allTeamIds.length;
    }

    // ── 4. SIMULATE MATCH RESULTS ───────────────────────────────
    if (options.simulateMatches) {
      const t2 = await prisma.tournament.findUnique({
        where: { id },
        include: {
          teams: true,
          matches: true,
          stages: { include: { groups: true }, orderBy: { order: "asc" } },
        },
      });

      if (t2) {
        const teamsMap = new Map(t2.teams.map(t => [t.id, t]));
        const scoringRule = t2.scoringRule as any || {};
        let simulatedCount = 0;

        // Only simulate matches in the FIRST stage's groups
        const firstStage = t2.stages[0];
        if (firstStage) {
          for (const group of firstStage.groups) {
            if (group.teamIds.length === 0) continue;
            const groupMatches = t2.matches.filter(
              m => m.stageId === firstStage.id && m.groupId === group.id && m.status !== "completed"
            );

            for (const match of groupMatches) {
              const results = generateMatchResult(group.teamIds, teamsMap, scoringRule);
              await prisma.match.update({
                where: { id: match.id },
                data: {
                  results: results as any,
                  status: "completed",
                  endTime: new Date(),
                },
              });
              simulatedCount++;
            }
          }
        }

        if (simulatedCount > 0) {
          report.actions.push(`Simulated ${simulatedCount} matches with realistic BR results`);
          report.details.matchesSimulated = simulatedCount;
        }
      }
    }

    return NextResponse.json({
      success: true,
      report,
      message: report.actions.length > 0 ? report.actions.join("; ") : "No actions needed",
    });
  } catch (err: any) {
    console.error("[AUTOFILL_DEMO]", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}