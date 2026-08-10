const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== RECENT ADMIN ERRORS ===\n')

  const errors = await prisma.systemError.findMany({
    where: {
      lastSeenAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
    orderBy: { lastSeenAt: 'desc' },
    take: 10,
  })

  if (errors.length === 0) {
    console.log('No errors in last 30 minutes')
    return
  }

  errors.forEach((e, i) => {
    console.log(`── Error ${i + 1} ──`)
    console.log(`  Route:    ${e.route}`)
    console.log(`  Type:     ${e.errorType}`)
    console.log(`  Severity: ${e.severity}`)
    console.log(`  Message:  ${e.message.substring(0, 500)}`)
    console.log(`  Count:    ${e.occurrenceCount}x`)
    console.log(`  Last:     ${e.lastSeenAt}`)
    console.log()
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())