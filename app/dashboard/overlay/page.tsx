import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/ui/DashboardShell";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Broadcast Overlays — TournaOps" };

export default async function OverlayPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tournaments = await prisma.tournament.findMany({
    where: { userId: session.userId },
    select: { id: true, slug: true, name: true, status: true, overlayToken: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell
      title="Broadcast Overlays"
      subtitle="OBS Integration"
      breadcrumbs={[{ label: "Overlays" }]}
    >
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: "3px solid var(--gold)",
          padding: "16px 20px",
        }}>
          <div className="section-label" style={{ marginBottom: "6px" }}>How to Use</div>
          <p style={{ color: "var(--white-70)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            In OBS Studio, add a Browser Source and paste the overlay URL. Overlays update in real-time.
          </p>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <div style={{
          border: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "48px",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--white-40)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "12px",
          }}>No Tournaments Yet</div>
          <Link href="/dashboard/tournaments/create" className="btn-gold">Create Tournament</Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1px",
          background: "var(--border)",
          border: "1px solid var(--border)",
        }}>
          {tournaments.map((t: any) => (
            <div key={t.id} style={{
              background: "var(--surface)",
              padding: "20px",
            }}>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                color: "var(--white)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "12px",
              }}>{t.name}</div>

              <Link
                href={`/dashboard/tournaments/${t.id}/overlays`}
                className="btn-primary"
                style={{ display: "inline-flex", padding: "7px 14px", width: "100%", justifyContent: "center" }}
              >
                Get Overlay URLs →
              </Link>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}