const { PrismaClient } = require("@prisma/client");
const { nanoid } = require("nanoid");

const prisma = new PrismaClient();

async function main() {
  const tournaments = await prisma.tournament.findMany({
    where: { overlayToken: null },
    select: { id: true, name: true },
  });
  
  console.log(`Found ${tournaments.length} tournaments without overlayToken`);
  
  for (const t of tournaments) {
    const token = nanoid(24);
    await prisma.tournament.update({
      where: { id: t.id },
      data: { overlayToken: token },
    });
    console.log(`Updated: ${t.name} -> token: ${token}`);
  }
  
  console.log("Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());