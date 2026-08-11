import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/ui/DashboardShell";
import NotificationsClient from "@/components/dashboard/NotificationsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications — TournaOps" };

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <DashboardShell
      title="Notifications"
      subtitle="Recent Activity"
      breadcrumbs={[{ label: "Notifications" }]}
    >
      <NotificationsClient />
    </DashboardShell>
  );
}