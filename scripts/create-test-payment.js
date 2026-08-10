const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Find a test user (not the admin)
  const testUser = await prisma.user.findFirst({
    where: {
      NOT: { role: 'SUPER_ADMIN' },
      NOT: { email: 'magarsammy7@gmail.com' },
    },
  })

  if (!testUser) {
    console.log('No test user found')
    return
  }

  console.log('Creating test payment for:', testUser.email)

  const payment = await prisma.payment.create({
    data: {
      userId: testUser.id,
      amount: 299,
      currency: 'NPR',
      method: 'KHALTI',
      transactionReference: 'TEST-' + Date.now(),
      note: 'Manual test payment - DELETE ME',
      status: 'PENDING',
      submittedAt: new Date(),
    },
  })

  console.log('\n✓ Test payment created!')
  console.log('  ID:', payment.id)
  console.log('  Amount: Rs', payment.amount)
  console.log('  User:', testUser.email)
  console.log('\nNow refresh https://www.tournaops.com/admin/payments')
  console.log('It should appear immediately.')
  console.log('\nIf it does NOT appear, the admin page has a display bug.')
  console.log('If it DOES appear, then your original submission failed silently.')
}

main().catch(console.error).finally(() => prisma.$disconnect())