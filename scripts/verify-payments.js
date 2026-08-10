const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const s = await prisma.paymentSettings.findFirst()
  if (!s) { console.log('❌ No payment settings found'); return }

  console.log('\n═══════════════════════════════════════')
  console.log('    PAYMENT SETTINGS VERIFICATION')
  console.log('═══════════════════════════════════════\n')

  console.log('📱 KHALTI')
  console.log('   Enabled:', s.khaltiEnabled ? '✓ YES' : '✗ NO')
  console.log('   Number: ', s.khaltiAccountId)
  console.log('   Name:   ', s.khaltiAccountName)
  console.log()

  console.log('🏦 NABIL BANK')
  console.log('   Enabled:', s.bankEnabled ? '✓ YES' : '✗ NO')
  console.log('   Name:   ', s.bankAccountHolder)
  console.log('   Account:', s.bankAccountNumber)
  console.log('   Branch: ', s.bankBranch)
  console.log('   QR URL: ', s.bankQrUrl ? '✓ Set' : '✗ Missing')
  if (s.bankQrUrl) console.log('   Direct: ', s.bankQrUrl)
  console.log()

  console.log('💳 eSewa:', s.esewaEnabled ? 'ENABLED' : 'disabled')
  console.log('🌍 International:', s.internationalEnabled ? 'ENABLED' : 'disabled')
  console.log()
  console.log('💰 Pro price: Rs 299 / 1 month')
  console.log('═══════════════════════════════════════\n')
}

main().catch(console.error).finally(() => prisma.$disconnect())