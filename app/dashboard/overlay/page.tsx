import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverlayPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/dashboard/overlay");

  const tournaments = await prisma.tournament.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, status: true, overlayToken: true },
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 900, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>OBS OVERLAYS</h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Browser source URLs for OBS Studio</p>
      </div>

      <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "#9ca3af" }}>
        <strong style={{ color: "#D4AF37" }}>How to use:</strong> Copy any URL below → OBS → Add Source → Browser → Paste URL. Set width 1920, height 1080.
      </div>

      {tournaments.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📡</div>
          <div style={{ color: "#6b7280", marginBottom: "1rem" }}>No tournaments yet. Create one to get overlay URLs.</div>
          <Link href="/dashboard/tournaments/create" style={{ display: "inline-flex", padding: "0.75rem 1.5rem", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "0.5rem", color: "#D4AF37", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", textTransform: "uppercase" }}>
            Create Tournament
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tournaments.map(t => {
            const base = `https://www.tournaops.com/overlay/${t.overlayToken}`;
            const overlays = [
              { name: "Live Match", url: `${base}/match` },
              { name: "Standings", url: `${base}` },
              { name: "Next Match", url: `${base}/next-match` },
              { name: "Chicken Dinner", url: `${base}/chicken-dinner` },
              { name: "Top Fragger", url: `${base}/top-fragger` },
              { name: "Final Results", url: `${base}/final-results` },
            ];
            return (
              <div key={t.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>{t.name}</span>
                  <span style={{ background: t.status === "live" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)", color: t.status === "live" ? "#ef4444" : "#6b7280", border: `1px solid ${t.status === "live" ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "0.25rem", padding: "0.15rem 0.5rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>
                    {t.status === "live" && "● "}{t.status}
                  </span>
                </div>
                <div style={{ padding: "1rem", display: "grid", gap: "0.5rem" }}>
                  {overlays.map(o => (
                    <div key={o.name} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.375rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: "110px" }}>{o.name}</span>
                      <code style={{ flex: 1, fontSize: "0.7rem", color: "#6b7280", fontFamily: "monospace", wordBreak: "break-all" }}>{o.url}</code>
                      <button onClick={() => navigator.clipboard.writeText(o.url)} style={{ padding: "0.375rem 0.75rem", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "0.375rem", color: "#D4AF37", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", minHeight: "36px" }}>
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}