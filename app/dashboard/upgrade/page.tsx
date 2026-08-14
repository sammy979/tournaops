import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import UpgradeClient from "@/components/payment/UpgradeClient";

export const dynamic = "force-dynamic";

async function getPaymentSettings() {
  try { return await prisma.paymentSettings.findFirst(); }
  catch { return null; }
}

export default async function UpgradePage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/dashboard/upgrade");

  const [paymentSettings, userInfo] = await Promise.all([
    getPaymentSettings(),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { isPro: true, username: true, displayName: true, email: true },
    }),
  ]);

  if (userInfo?.isPro) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>★</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#D4AF37", textTransform: "uppercase", marginBottom: "0.5rem" }}>Pro Active</h1>
        <p style={{ color: "#9ca3af", fontSize: "1rem" }}>You already have TournaOps Pro. All features unlocked.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.75rem", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Upgrade</div>
        <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", margin: 0, lineHeight: 1 }}>
          Go Pro — Rs 299/year
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "1rem", marginTop: "0.5rem" }}>
          Unlimited tournaments · AI tools · OBS overlays · Priority support
        </p>
      </div>
      <UpgradeClient
        userId={session.userId}
        userEmail={session.email}
        paymentSettings={paymentSettings}
      />
    </div>
  );
}