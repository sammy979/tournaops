import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const liveTournaments = await prisma.tournament.findMany({
    where: { userId: session.userId, status: "live" },
    include: {
      _count: { select: { teams: true, matches: true } },
      matches: { where: { status: "pending" }, take: 3, orderBy: { scheduledAt: "asc" }, select: { id: true, name: true, map: true, scheduledAt: true } },
    },
    take: 5,
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 900, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>COMMAND CENTER</h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Live tournament operations</p>
      </div>

      {liveTournaments.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎮</div>
          <div style={{ color: "#6b7280", marginBottom: "1rem" }}>No live tournaments right now</div>
          <Link href="/dashboard/tournaments" style={{ display: "inline-flex", padding: "0.75rem 1.5rem", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "0.5rem", color: "#D4AF37", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", textTransform: "uppercase" }}>
            View Tournaments
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {liveTournaments.map(t => (
            <div key={t.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.75rem", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 2s infinite" }} />
                  <span style={{ fontWeight: 700, color: "#fff" }}>{t.name}</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{t._count.teams} teams · {t._count.matches} matches</span>
                  <Link href={`/dashboard/tournaments/${t.id}`} style={{ padding: "0.375rem 0.75rem", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "0.375rem", color: "#D4AF37", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none" }}>Manage</Link>
                </div>
              </div>
              {t.matches.length > 0 && (
                <div style={{ padding: "1rem" }}>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Upcoming Matches</div>
                  {t.matches.map(m => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.375rem", marginBottom: "0.375rem" }}>
                      <span style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>{m.name}</span>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{m.map}</span>
                        {m.scheduledAt && <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{new Date(m.scheduledAt).toLocaleTimeString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}