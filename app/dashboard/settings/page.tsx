import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/dashboard/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, email: true, username: true, displayName: true,
      avatar: true, isPro: true, role: true, createdAt: true,
      organizerName: true, organizerBio: true, organizerLogo: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 900, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>SETTINGS</h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1.5rem" }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "0.875rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Account Info</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[
              { label: "Display Name", value: user.displayName },
              { label: "Username",     value: user.username },
              { label: "Email",        value: user.email },
              { label: "Plan",         value: user.isPro ? "Pro ★" : "Free" },
              { label: "Role",         value: user.role },
              { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString() },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.375rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</span>
                <span style={{ fontSize: "0.875rem", color: f.label === "Plan" && user.isPro ? "#D4AF37" : "#fff", fontWeight: f.label === "Plan" ? 700 : 400 }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1.5rem" }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "0.875rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Links</h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {[
              { label: "Organizer Profile", href: "/dashboard/settings/organizer" },
              { label: "Upgrade to Pro",    href: "/dashboard/upgrade" },
              { label: "View Public Site",  href: "/" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.375rem", color: "#D4AF37", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", minHeight: "44px" }}>
                <span>{l.label}</span>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1.5rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Danger Zone</h2>
          <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: "0 0 1rem" }}>These actions cannot be undone.</p>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", color: "#f87171", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", minHeight: "44px" }}>
              Sign Out
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}