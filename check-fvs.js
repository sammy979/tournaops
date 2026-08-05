const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const fvs = await p.tournament.findFirst({
    where: { slug: { contains: "fvs" } },
    select: { id: true, name: true, slug: true, overlayToken: true },
  });
  console.log("fvs tournament:", fvs);
  
  if (fvs && fvs.overlayToken) {
    console.log("\nTest this URL:");
    console.log("https://www.tournaops.com/api/overlay/" + fvs.overlayToken);
    console.log("\nOverlay page URL:");
    console.log("https://www.tournaops.com/overlay/" + fvs.overlayToken);
  }
}

main().catch(console.error).finally(() => p.$disconnect());