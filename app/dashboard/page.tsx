import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/dashboard");

  const [tournaments, userInfo] = await Promise.all([
    prisma.tournament.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, slug: true, name: true, status: true,
        maxTeams: true, createdAt: true,
        _count: { select: { teams: true, matches: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { isPro: true, username: true, displayName: true, email: true },
    }),
  ]);

  const liveCount     = tournaments.filter((t: any) => t.status === "live").length;
  const upcomingCount = tournaments.filter((t: any) => t.status === "upcoming" || t.status === "published").length;
  const totalTeams    = tournaments.reduce((s: number, t: any) => s + (t._count?.teams ?? 0), 0);
  const totalMatches  = tournaments.reduce((s: number, t: any) => s + (t._count?.matches ?? 0), 0);

  const name = userInfo?.displayName || userInfo?.username || "Organizer";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

      {/* WELCOME */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.75rem", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
          Welcome back
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>
          {name}
        </h1>
        {userInfo?.isPro && (
          <span style={{ display: "inline-block", marginTop: "0.5rem", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "0.25rem", padding: "0.2rem 0.75rem", fontSize: "0.7rem", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            ★ Pro Plan Active
          </span>
        )}
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Tournaments", value: tournaments.length, color: "#fff" },
          { label: "Live Now",    value: liveCount,           color: "#ef4444" },
          { label: "Upcoming",    value: upcomingCount,       color: "#D4AF37" },
          { label: "Total Teams", value: totalTeams,          color: "#22c55e" },
          { label: "Matches",     value: totalMatches,        color: "#60a5fa" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `3px solid ${s.color}`, borderRadius: "0.5rem", padding: "1rem" }}>
            <div style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{s.label}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: s.color, fontFamily: "var(--font-mono, monospace)", lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "New Tournament", href: "/dashboard/tournaments/create", gold: true },
          { label: "Schedule",       href: "/dashboard/schedule",           gold: false },
          { label: "Registrations",  href: "/dashboard/registrations",      gold: false },
          { label: "Analytics",      href: "/dashboard/analytics",          gold: false },
        ].map(a => (
          <Link key={a.label} href={a.href} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.875rem 1rem", background: a.gold ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${a.gold ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "0.5rem", color: a.gold ? "#D4AF37" : "#9ca3af", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", minHeight: "44px", transition: "all 0.15s" }}>
            {a.label}
          </Link>
        ))}
      </div>

      {/* TOURNAMENTS LIST */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Tournaments</h2>
          <Link href="/dashboard/tournaments/create" style={{ fontSize: "0.75rem", color: "#D4AF37", fontWeight: 600, textDecoration: "none" }}>+ Create New</Link>
        </div>

        {tournaments.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🏆</div>
            <div style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.25rem" }}>No tournaments yet. Create your first one.</div>
            <Link href="/dashboard/tournaments/create" style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "0.5rem", color: "#D4AF37", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Create Tournament
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Tournament", "Status", "Teams", "Matches", ""].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t: any, i: number) => {
                  const sc = t.status === "live" ? "#ef4444" : t.status === "upcoming" || t.status === "published" ? "#D4AF37" : t.status === "completed" ? "#22c55e" : "#6b7280";
                  return (
                    <tr key={t.id} style={{ borderBottom: i < tournaments.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.875rem" }}>{t.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ background: `${sc}20`, color: sc, border: `1px solid ${sc}40`, borderRadius: "0.25rem", padding: "0.2rem 0.5rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>
                          {t.status === "live" && "● "}{t.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.875rem", fontFamily: "monospace" }}>
                        {t._count?.teams ?? 0}/{t.maxTeams}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.875rem", fontFamily: "monospace" }}>
                        {t._count?.matches ?? 0}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                        <Link href={`/dashboard/tournaments/${t.id}`} style={{ color: "#D4AF37", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRO UPGRADE CARD — only if not pro */}
      {!userInfo?.isPro && (
        <div style={{ marginTop: "1.5rem", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "0.75rem", padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>TournaOps Pro</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>Unlock AI tools, OBS overlays, unlimited tournaments</div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>Rs 299/year · Khalti · eSewa · Bank</div>
          </div>
          <Link href="/dashboard/upgrade" style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", background: "#D4AF37", color: "#0a0a0a", borderRadius: "0.5rem", fontWeight: 800, fontSize: "0.875rem", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", flexShrink: 0 }}>
            Upgrade — Rs 299
          </Link>
        </div>
      )}

    </div>
  );
}