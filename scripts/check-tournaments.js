const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== ALL TOURNAMENTS ===\n')

  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { teams: true } },
      stages: {
        include: {
          _count: { select: { matches: true } },
        },
      },
    },
  })

  if (tournaments.length === 0) {
    console.log('No tournaments found')
    return
  }

  tournaments.forEach((t, i) => {
    console.log(`── Tournament ${i + 1} ──`)
    console.log(`  Name:    ${t.name}`)
    console.log(`  ID:      ${t.id}`)
    console.log(`  Status:  ${t.status}`)
    console.log(`  Owner:   ${t.userId}`)
    console.log(`  Teams:   ${t._count.teams}`)
    console.log(`  Stages:  ${t.stages.length}`)
    t.stages.forEach(s => {
      console.log(`    - ${s.name} (${s.status || 'no status'}) - ${s._count.matches} matches`)
    })
    console.log(`  Created: ${t.createdAt}`)
    console.log()
  })

  // Status summary
  console.log('=== STATUS SUMMARY ===')
  const statuses = {}
  tournaments.forEach(t => {
    const s = t.status || 'null'
    statuses[s] = (statuses[s] || 0) + 1
  })
  Object.entries(statuses).forEach(([s, c]) => {
    console.log(`  ${s}: ${c}`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())