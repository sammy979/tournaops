const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== DATABASE COUNTS ===\n')

  const users = await prisma.user.count()
  console.log('Users:      ', users)

  const tournaments = await prisma.tournament.count()
  console.log('Tournaments:', tournaments)

  const teams = await prisma.team.count()
  console.log('Teams:      ', teams)

  try {
    const matches = await prisma.match.count()
    console.log('Matches:    ', matches)
  } catch (e) { console.log('Matches:    ERROR -', e.message.substring(0, 60)) }

  const proUsers = await prisma.user.count({ where: { isPro: true } })
  console.log('Pro Users:  ', proUsers)

  // Check tournament statuses
  console.log('\n=== TOURNAMENT STATUSES ===')
  const statuses = await prisma.tournament.groupBy({
    by: ['status'],
    _count: { status: true },
  })
  statuses.forEach(s => console.log(`  ${s.status || 'null'}: ${s._count.status}`))

  // Sample tournament
  console.log('\n=== SAMPLE TOURNAMENT FIELDS ===')
  const sample = await prisma.tournament.findFirst()
  if (sample) {
    console.log('  id:      ', sample.id)
    console.log('  name:    ', sample.name)
    console.log('  status:  ', sample.status)
    console.log('  userId:  ', sample.userId)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())