const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Delete errors related to the fixed bug
  const deleted = await prisma.systemError.deleteMany({
    where: {
      OR: [
        { message: { contains: 'UserWhereUniqueInput' } },
        { message: { contains: 'id: undefined' } },
      ],
    },
  })

  console.log(`Deleted ${deleted.count} old error record(s)`)
}

main().catch(console.error).finally(() => prisma.$disconnect())