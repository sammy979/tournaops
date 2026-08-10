const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== RECENT SYSTEM ERRORS (last 24h) ===\n')

  const errors = await prisma.systemError.findMany({
    where: {
      OR: [
        { route: { contains: 'payment' } },
        { route: { contains: '/api/payments' } },
      ],
      lastSeenAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { lastSeenAt: 'desc' },
    take: 20,
  })

  if (errors.length === 0) {
    console.log('✓ No payment-related errors in last 24 hours')
    return
  }

  errors.forEach((e, i) => {
    console.log(`── Error ${i + 1} ──`)
    console.log(`  Severity: ${e.severity}`)
    console.log(`  Route:    ${e.route}`)
    console.log(`  Message:  ${e.message}`)
    console.log(`  Count:    ${e.occurrenceCount}x`)
    console.log(`  Last:     ${e.lastSeenAt}`)
    console.log()
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())