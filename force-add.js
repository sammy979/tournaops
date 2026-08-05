const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const t = await p.tournament.findFirst({
    where: { overlayToken: "cmsd2t2nd0003l2046as9534x" },
  });
  if (!t) { console.log("Not found!"); return; }
  console.log("Tournament:", t.name);

  const teams = await p.team.findMany({
    where: { tournamentId: t.id },
    take: 16,
  });
  console.log("Teams:", teams.length);
  
  if (teams.length === 0) { console.log("No teams!"); return; }

  const matches = await p.match.findMany({
    where: { tournamentId: t.id },
    take: 3,
    orderBy: { matchNumber: "asc" },
  });
  console.log("Matches to update:", matches.length);

  for (const match of matches) {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const results = shuffled.slice(0, Math.min(16, teams.length)).map((team, i) => ({
      teamId: team.id,
      placement: i + 1,
      kills: Math.floor(Math.random() * 15) + 1,
      wwcd: i === 0,
    }));

    await p.match.update({
      where: { id: match.id },
      data: { 
        status: "completed",
        results: results,
      },
    });
    console.log("Updated:", match.name, "with", results.length, "results");
  }
  
  console.log("\nDone! Test at:");
  console.log("https://www.tournaops.com/api/overlay/" + t.overlayToken);
}

main().catch((e) => console.error("ERROR:", e)).finally(() => p.$disconnect());