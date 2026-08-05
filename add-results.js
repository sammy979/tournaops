const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const t = await p.tournament.findFirst({
    where: { slug: "fvs-h3k9" },
  });
  if (!t) { console.log("fvs not found"); return; }
  
  console.log("Tournament: " + t.name);
  console.log("Overlay Token: " + t.overlayToken);
  console.log("URL: https://www.tournaops.com/overlay/" + t.overlayToken);

  const teams = await p.team.findMany({
    where: { tournamentId: t.id },
    take: 16,
    orderBy: { name: "asc" },
  });
  console.log("\nFound " + teams.length + " teams");

  const matches = await p.match.findMany({
    where: { tournamentId: t.id, status: "pending" },
    take: 3,
    orderBy: { matchNumber: "asc" },
  });
  console.log("Found " + matches.length + " pending matches");

  if (matches.length === 0) {
    console.log("No pending matches to add results to");
    const completed = await p.match.count({
      where: { tournamentId: t.id, status: "completed" }
    });
    console.log("Already completed: " + completed);
    return;
  }

  for (const match of matches) {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const results = shuffled.map((team, i) => ({
      teamId: team.id,
      placement: i + 1,
      kills: Math.floor(Math.random() * 15),
      wwcd: i === 0,
    }));

    await p.match.update({
      where: { id: match.id },
      data: {
        status: "completed",
        results: results,
      },
    });
    console.log("Added results to: " + match.name);
  }

  console.log("\nDONE! Refresh overlay to see standings!");
}

main().catch(console.error).finally(() => p.$disconnect());