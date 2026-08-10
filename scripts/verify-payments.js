const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const s = await prisma.paymentSettings.findFirst()

  if (!s) {
    console.log('No payment settings in database yet')
    return
  }

  console.log('')
  console.log('======================================')
  console.log('  PAYMENT SETTINGS IN DATABASE')
  console.log('======================================')
  console.log('')
  console.log('KHALTI')
  console.log('  Enabled:', s.khaltiEnabled)
  console.log('  Number: ', s.khaltiAccountId)
  console.log('  Name:   ', s.khaltiAccountName)
  console.log('')
  console.log('NABIL BANK')
  console.log('  Enabled:', s.bankEnabled)
  console.log('  Name:   ', s.bankAccountHolder)
  console.log('  Account:', s.bankAccountNumber)
  console.log('  Branch: ', s.bankBranch)
  console.log('  QR URL: ', s.bankQrUrl || 'NOT SET')
  console.log('')
  console.log('eSewa:', s.esewaEnabled ? 'ENABLED' : 'disabled')
  console.log('Intl: ', s.internationalEnabled ? 'ENABLED' : 'disabled')
  console.log('')
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())