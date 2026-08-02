import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "magarsammy7@gmail.com";

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("User not found. Register first at tournaops.com/register");
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log("SUCCESS! " + updated.email + " is now ADMIN");
  console.log("Display Name: " + updated.displayName);
  console.log("Username: " + updated.username);
  console.log("Admin: " + updated.isAdmin);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());