const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.paymentSettings.findFirst()
  if (!existing) { console.log('No settings found'); return }

  const updated = await prisma.paymentSettings.update({
    where: { id: existing.id },
    data: {
      bankAccountNumber: '09810017572012',
      bankBranch: 'Rajahar',
    },
  })

  console.log('Nabil Bank updated:')
  console.log('  Holder: ', updated.bankAccountHolder)
  console.log('  Account:', updated.bankAccountNumber)
  console.log('  Branch: ', updated.bankBranch)
}

main().catch(console.error).finally(() => prisma.$disconnect())