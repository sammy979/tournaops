import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/ui/DashboardShell";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Match Timer — TournaOps" };

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <DashboardShell
      title="Match Timer"
      subtitle="Live Timer Tool"
      breadcrumbs={[{ label: "Timer" }]}
    >
      <div style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "40px 32px",
      }}>
        <div className="section-label" style={{ marginBottom: "12px" }}>Coming Soon</div>
        <h2 style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "1.4rem",
          color: "var(--white)",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          marginBottom: "12px",
        }}>Match Timer</h2>
        <p style={{ color: "var(--white-70)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "20px", maxWidth: "560px" }}>
          Standalone match timer for live tournaments.
        </p>
        <p style={{ color: "var(--white-40)", fontSize: "0.82rem", marginBottom: "24px", maxWidth: "560px" }}>
          This section is under active development. In the meantime, access these features directly from your tournament dashboard.
        </p>
        <Link href="/dashboard" className="btn-primary">
          ← Back to Dashboard
        </Link>
      </div>
    </DashboardShell>
  );
}