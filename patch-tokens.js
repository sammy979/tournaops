const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function generateToken() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function main() {
  console.log("Checking tournaments...");
  
  const all = await prisma.tournament.findMany({
    select: { id: true, name: true, overlayToken: true },
  });
  
  console.log(`Total tournaments: ${all.length}`);
  
  const missing = all.filter(t => !t.overlayToken);
  console.log(`Missing tokens: ${missing.length}`);
  
  for (const t of missing) {
    const token = generateToken();
    await prisma.tournament.update({
      where: { id: t.id },
      data: { overlayToken: token },
    });
    console.log(`Updated "${t.name}" -> token: ${token}`);
  }
  
  // Show all with tokens now
  const updated = await prisma.tournament.findMany({
    select: { id: true, name: true, overlayToken: true, slug: true },
  });
  
  console.log("\n=== ALL TOURNAMENTS ===");
  for (const t of updated) {
    console.log(`${t.name} (${t.slug})`);
    console.log(`  Token: ${t.overlayToken}`);
    console.log(`  Overlay URL: https://www.tournaops.com/overlay/${t.overlayToken}`);
    console.log("");
  }
  
  console.log("DONE!");
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());