const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Delete all errors older than 5 minutes ago
  const cutoff = new Date(Date.now() - 5 * 60 * 1000)

  const deleted = await prisma.systemError.deleteMany({
    where: { lastSeenAt: { lt: cutoff } },
  })

  console.log(`Deleted ${deleted.count} old error(s) (older than 5 minutes)`)
  console.log('Now any new errors that appear are from AFTER the fix.')
}

main().catch(console.error).finally(() => prisma.$disconnect())