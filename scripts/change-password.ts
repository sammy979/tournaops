import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "magarsammy7@gmail.com";
  const newPassword = "magarbhai";

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("User not found: " + email);
    console.log("Register first at tournaops.com/register");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log("=====================================");
  console.log("PASSWORD CHANGED SUCCESSFULLY!");
  console.log("=====================================");
  console.log("Email:    " + updated.email);
  console.log("Password: " + newPassword);
  console.log("Username: " + updated.username);
  console.log("Admin:    " + updated.isAdmin);
  console.log("=====================================");
  console.log("");
  console.log("Login at: https://www.tournaops.com/login");
}

main()
  .catch(e => { console.error("ERROR:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());