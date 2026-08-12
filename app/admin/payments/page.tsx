import { requireSuperAdmin } from "@/lib/auth";
import AdminPaymentsClient from "./AdminPaymentsClient";

export const metadata = { title: "Payment Management — TournaOps Admin" };

export default async function AdminPaymentsPage() {
  await requireSuperAdmin();

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--white)",
          letterSpacing: "0.02em",
          marginBottom: "0.5rem",
        }}>
          Payment Management
        </h1>
        <p style={{ color: "var(--white-40)", fontSize: "0.875rem" }}>
          Review, approve and reject user payment submissions. Approvals are atomic — only the verified payment owner is upgraded.
        </p>
      </div>
      <AdminPaymentsClient />
    </div>
  );
}