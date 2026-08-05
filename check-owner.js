const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const t = await p.tournament.findUnique({
    where: { id: "cmsd2t2nd0002l204r42z4m36" },
    select: { id: true, name: true, slug: true, userId: true, status: true },
  });
  console.log("Tournament:", t);
  
  if (t) {
    const user = await p.user.findUnique({
      where: { id: t.userId },
      select: { id: true, username: true, email: true },
    });
    console.log("Owner:", user);
  }
  
  const allUsers = await p.user.findMany({ select: { id: true, username: true, email: true } });
  console.log("\nAll users:");
  allUsers.forEach(u => console.log(`  ${u.username} - ${u.email} (${u.id})`));
}

main().catch(console.error).finally(() => p.$disconnect());