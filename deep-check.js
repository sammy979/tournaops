const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  console.log("=== DB CHECK ===\n");
  
  const t = await p.tournament.findFirst({
    where: { overlayToken: "cmsd2t2nd0003l2046as9534x" },
  });
  console.log("Tournament found:", t?.name, "ID:", t?.id);
  
  if (!t) return;
  
  const teams = await p.team.count({ where: { tournamentId: t.id } });
  console.log("Teams:", teams);
  
  const totalMatches = await p.match.count({ where: { tournamentId: t.id } });
  console.log("Total matches:", totalMatches);
  
  const completed = await p.match.count({ 
    where: { tournamentId: t.id, status: "completed" } 
  });
  console.log("Completed matches:", completed);
  
  const withResults = await p.match.findMany({ 
    where: { 
      tournamentId: t.id,
      NOT: { results: null },
    },
    select: { id: true, name: true, status: true, results: true },
    take: 2,
  });
  console.log("Matches with results data:", withResults.length);
  
  if (withResults.length > 0) {
    console.log("\nFirst match with results:");
    console.log("  Name:", withResults[0].name);
    console.log("  Status:", withResults[0].status);
    console.log("  Results type:", typeof withResults[0].results);
    console.log("  Results is array:", Array.isArray(withResults[0].results));
    console.log("  Results count:", Array.isArray(withResults[0].results) ? withResults[0].results.length : "N/A");
    if (Array.isArray(withResults[0].results) && withResults[0].results.length > 0) {
      console.log("  First result:", JSON.stringify(withResults[0].results[0]));
    }
  }
}

main().catch(console.error).finally(() => p.$disconnect());