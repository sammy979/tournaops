import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/ui/DashboardShell";
import UpgradeClient from "@/components/payment/UpgradeClient";

export const dynamic = "force-dynamic";

async function getPaymentSettings() {
  try {
    return await prisma.paymentSettings.findFirst();
  } catch {
    return null;
  }
}

export default async function UpgradePage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/dashboard/upgrade");

  const paymentSettings = await getPaymentSettings();

  return (
    <DashboardShell>
      <div style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.14em",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}>Upgrade</div>
          <h1 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "2.5rem",
            textTransform: "uppercase",
            lineHeight: 1,
            marginBottom: "8px",
          }}>Go Pro — Rs 299/month</h1>
          <p style={{ color: "var(--white-70)", fontSize: "1rem" }}>
            Unlock unlimited tournaments, AI tools, broadcast overlays, and priority support.
          </p>
        </div>

        <UpgradeClient
          userId={session.userId}
          userEmail={session.email}
          paymentSettings={paymentSettings}
        />
      </div>
    </DashboardShell>
  );
}