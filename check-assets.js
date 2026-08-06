const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const t = await p.tournament.findFirst({
    where: { slug: "fvs-h3k9" },
  });
  console.log("Tournament fields:", Object.keys(t));
  console.log("\nAsset fields:");
  console.log("  bannerImage:", t.bannerImage || "NULL");
  console.log("  trophyImage:", t.trophyImage || "NULL");
  console.log("  coverImage:", t.coverImage || "NULL");
  console.log("  sponsorLogos:", t.sponsorLogos ? "SET" : "NULL");
}

main().catch(console.error).finally(() => p.$disconnect());