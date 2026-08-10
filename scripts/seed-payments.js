const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("Configuring payment settings...")

  // Check if settings exist
  const existing = await prisma.paymentSettings.findFirst()

  const settingsData = {
    // Khalti configuration
    khaltiEnabled: true,
    khaltiAccountName: "Sammy Magar",
    khaltiAccountId: "9814484105",
    khaltiInstructions: "Send Rs 299 to this Khalti number. Copy the transaction ID from your Khalti app and paste it below. Your Pro will be activated after verification.",

    // Nabil Bank configuration (we'll add QR URL below)
    bankEnabled: true,
    bankName: "Nabil Bank",
    bankAccountHolder: "Sammy Magar",
    bankAccountNumber: "UPDATE_WITH_YOUR_ACCOUNT_NUMBER",
    bankBranch: "UPDATE_WITH_YOUR_BRANCH",
    bankInstructions: "Send Rs 299 to this Nabil Bank account. Include the transaction reference from your bank slip when submitting. Pro will activate after verification.",

    // eSewa - disabled for now (user didn't provide details)
    esewaEnabled: false,

    // International - kept disabled
    internationalEnabled: false,
  }

  let result
  if (existing) {
    result = await prisma.paymentSettings.update({
      where: { id: existing.id },
      data: settingsData,
    })
    console.log("✓ Payment settings UPDATED")
  } else {
    result = await prisma.paymentSettings.create({ data: settingsData })
    console.log("✓ Payment settings CREATED")
  }

  console.log("\n=== Current Settings ===")
  console.log("Khalti enabled:", result.khaltiEnabled)
  console.log("Khalti number:", result.khaltiAccountId)
  console.log("Bank enabled:", result.bankEnabled)
  console.log("Bank name:", result.bankName)
  console.log("\nNOTE: Update bank account number and branch via /admin/settings/payments")
  console.log("Upload Nabil Bank QR to Imgur/ImgBB and add URL via that page too")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())