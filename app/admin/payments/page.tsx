import { requireSuperAdmin } from "@/lib/auth/rbac";
import AdminShell from "@/components/ui/AdminShell";
import AdminPaymentsClient from "./AdminPaymentsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment Management - TournaOps Admin" };

export default async function AdminPaymentsPage() {
  const result = await requireSuperAdmin(null);
  // requireSuperAdmin(null) returns { authorized: false } for server components
  // fallback: call without args returns NextResponse for API style
  // We need to call as server component style with session:
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  const check = await requireSuperAdmin(session);
  if (!check?.authorized) {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard");
  }

  return (
    <AdminShell>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <div className="section-label">Admin</div>
          <h1 className="text-display" style={{ marginBottom: "6px" }}>
            Payment Management
          </h1>
          <p style={{ color: "var(--white-40)", fontSize: "0.85rem" }}>
            Review, approve and reject user payment submissions. Approvals are atomic - only the verified payment owner is upgraded.
          </p>
        </div>
        <AdminPaymentsClient />
      </div>
    </AdminShell>
  );
}