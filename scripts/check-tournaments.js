const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== ALL TOURNAMENTS ===\n')

  // Simpler query - avoids stage.matches count issue
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { teams: true } },
      stages: { select: { id: true, name: true, order: true } },
      matches: { select: { id: true, status: true } },
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
    console.log(`  Matches: ${t.matches.length} (${t.matches.filter(m => m.status === 'completed').length} completed)`)
    t.stages.forEach(s => {
      console.log(`    - ${s.name}`)
    })
    console.log(`  Created: ${t.createdAt}`)
    console.log()
  })

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