const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const tournaments = await prisma.tournament.findMany({
    select: { id: true, name: true, status: true },
    orderBy: { createdAt: 'desc' },
  })

  if (tournaments.length === 0) {
    console.log('No tournaments found')
    return
  }

  console.log('\n=== Your Tournaments ===\n')
  tournaments.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name} (${t.status})`)
  })

  console.log('\nSetting all tournaments to "live" for testing...')

  const updated = await prisma.tournament.updateMany({
    data: { status: 'live' },
  })

  console.log(`\n✓ ${updated.count} tournament(s) updated to LIVE status`)
  console.log('\nNow refresh Command Center - they will show as LIVE (green dot)')
}

main().catch(console.error).finally(() => prisma.$disconnect())