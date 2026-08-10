const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.paymentSettings.findFirst()
  if (!existing) { console.log('No payment settings'); return }

  const updated = await prisma.paymentSettings.update({
    where: { id: existing.id },
    data: {
      khaltiAccountName: 'Bhupen Pun',
      bankAccountHolder: 'Bhupen Pun',
    },
  })

  console.log('Updated account names:')
  console.log('  Khalti Name: ', updated.khaltiAccountName)
  console.log('  Bank Holder: ', updated.bankAccountHolder)
}

main().catch(console.error).finally(() => prisma.$disconnect())