const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.paymentSettings.findFirst()
  if (!existing) return

  await prisma.paymentSettings.update({
    where: { id: existing.id },
    data: { bankQrUrl: 'https://i.imgur.com/1nlPjI7.png' },
  })

  console.log('✓ QR URL updated to PNG')
}

main().catch(console.error).finally(() => prisma.$disconnect())