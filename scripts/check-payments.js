const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== ALL PAYMENTS IN DATABASE ===\n')

  const payments = await prisma.payment.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      user: { select: { email: true, username: true } },
    },
  })

  if (payments.length === 0) {
    console.log('❌ NO PAYMENTS FOUND IN DATABASE')
    console.log('The payment submission never reached the database.')
    console.log('This means either:')
    console.log('  1. The form submission failed silently')
    console.log('  2. The API returned an error but the frontend showed success')
    console.log('  3. Network issue during submission')
    return
  }

  console.log(`Found ${payments.length} payment(s):\n`)

  payments.forEach((p, i) => {
    console.log(`── Payment ${i + 1} ──`)
    console.log(`  ID:        ${p.id}`)
    console.log(`  User:      ${p.user.email} (${p.user.username})`)
    console.log(`  Amount:    ${p.currency} ${p.amount}`)
    console.log(`  Method:    ${p.method}`)
    console.log(`  Reference: ${p.transactionReference}`)
    console.log(`  Status:    ${p.status}`)
    console.log(`  Submitted: ${p.submittedAt}`)
    console.log(`  Proof URL: ${p.proofUrl || '(none)'}`)
    console.log(`  Note:      ${p.note || '(none)'}`)
    console.log()
  })

  // Summary
  const pending = payments.filter(p => p.status === 'PENDING').length
  const approved = payments.filter(p => p.status === 'APPROVED').length
  const rejected = payments.filter(p => p.status === 'REJECTED').length

  console.log('=== SUMMARY ===')
  console.log(`  Pending:  ${pending}`)
  console.log(`  Approved: ${approved}`)
  console.log(`  Rejected: ${rejected}`)
}

main().catch(e => console.error('ERROR:', e)).finally(() => prisma.$disconnect())