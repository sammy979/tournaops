const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Get first tournament
  const t = await p.tournament.findFirst({
    select: { id: true, name: true, overlayToken: true },
  });
  console.log("Tournament:", t);

  // Get its teams
  const teams = await p.team.findMany({
    where: { tournamentId: t.id },
    select: { id: true, name: true, tag: true },
  });
  console.log(`Teams: ${teams.length}`);
  if (teams.length > 0) console.log("First team:", teams[0]);

  // Get its matches
  const matches = await p.match.findMany({
    where: { tournamentId: t.id },
    take: 3,
  });
  console.log(`Matches: ${matches.length}`);
  if (matches.length > 0) {
    console.log("First match keys:", Object.keys(matches[0]));
    console.log("First match:", JSON.stringify(matches[0], null, 2));
  }
}

main()
  .catch((e) => console.error("Error:", e))
  .finally(() => p.$disconnect());