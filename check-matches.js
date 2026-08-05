const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const t = await p.tournament.findFirst({
    where: { overlayToken: "cmsd2t2nd0003l2046as9534x" },
    select: { id: true, name: true, status: true },
  });
  console.log("Tournament:", t);

  if (!t) { console.log("Not found!"); return; }

  const teams = await p.team.count({ where: { tournamentId: t.id } });
  console.log("Teams:", teams);

  const matches = await p.match.findMany({
    where: { tournamentId: t.id },
    select: { id: true, name: true, status: true, results: true },
    take: 5,
  });
  console.log("\nMatches (first 5):");
  matches.forEach((m) => {
    console.log(`  ${m.name} | status: ${m.status} | has results: ${m.results !== null}`);
    if (m.results) {
      console.log("    Results:", JSON.stringify(m.results).substring(0, 100));
    }
  });

  const totalMatches = await p.match.count({ where: { tournamentId: t.id } });
  const withResults = await p.match.count({ 
    where: { tournamentId: t.id, results: { not: null } } 
  });
  console.log(`\nTotal matches: ${totalMatches}`);
  console.log(`With results: ${withResults}`);
}

main().catch(console.error).finally(() => p.$disconnect());