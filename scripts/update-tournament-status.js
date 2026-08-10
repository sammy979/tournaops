const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const tournamentName = args[0]
  const newStatus = args[1]

  if (!tournamentName || !newStatus) {
    console.log('Usage: node scripts/update-tournament-status.js "TOURNAMENT_NAME" "STATUS"')
    console.log('Statuses: draft, registration, live, completed, cancelled')
    console.log('\nCurrent tournaments:')
    const all = await prisma.tournament.findMany({ select: { name: true, status: true } })
    all.forEach(t => console.log(`  - ${t.name} (${t.status})`))
    return
  }

  const updated = await prisma.tournament.updateMany({
    where: { name: { contains: tournamentName, mode: 'insensitive' } },
    data: { status: newStatus.toLowerCase() },
  })

  console.log(`✓ Updated ${updated.count} tournament(s) to status: ${newStatus}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())