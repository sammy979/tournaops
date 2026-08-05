const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const t = await p.tournament.findFirst({
    where: { slug: "fvs-h3k9" },
    select: { id: true, slug: true, name: true, isPublic: true, status: true },
  });
  console.log("Tournament from DB:", t);
}

main().catch(console.error).finally(() => p.$disconnect());