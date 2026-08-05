const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  try {
    const count = await p.player.count();
    console.log("✅ Player table:", count);
  } catch (e) {
    console.log("❌ Player:", e.message.substring(0, 100));
  }

  try {
    const t = await p.team.findFirst();
    console.log("✅ Team fields:", Object.keys(t || {}));
  } catch (e) {
    console.log("❌ Team:", e.message.substring(0, 100));
  }

  try {
    const t = await p.tournament.findFirst({
      where: { id: "cmsd2t2nd0002l204r42z4m36" },
      include: { teams: true, matches: true, rounds: true, stages: true },
    });
    console.log("✅ Tournament works! Teams:", t?.teams?.length);
  } catch (e) {
    console.log("❌ Tournament:", e.message.substring(0, 200));
  }
}

main().catch(console.error).finally(() => p.$disconnect());