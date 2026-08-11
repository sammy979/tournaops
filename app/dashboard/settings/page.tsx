import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings — TournaOps" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      username: true,
      displayName: true,
      isPro: true,
      proExpiresAt: true,
      createdAt: true,
    },
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container-ops" style={{ padding: "32px 24px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            <Link href="/dashboard" style={{ color: "var(--white-40)", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ color: "var(--white-20)" }}>→</span>
            <span style={{ color: "var(--gold)" }}>Settings</span>
          </div>

          <div className="section-label">Account</div>
          <h1 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "1.8rem",
            color: "var(--white)",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}>Settings</h1>
        </div>
      </div>

      <div className="container-ops" style={{ padding: "32px 24px" }}>
        {/* USER INFO */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "24px",
          marginBottom: "24px",
        }}>
          <div className="section-label" style={{ marginBottom: "12px" }}>Your Account</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}>
            {[
              { label: "Display Name", value: user?.displayName },
              { label: "Username", value: `@${user?.username}` },
              { label: "Email", value: user?.email },
              { label: "Plan", value: user?.isPro ? "Pro" : "Free", accent: user?.isPro ? "var(--gold)" : "var(--white-40)" },
            ].map((row) => (
              <div key={row.label}>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  color: "var(--white-40)",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}>{row.label}</div>
                <div style={{
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: row.accent || "var(--white)",
                }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SETTINGS SECTIONS */}
        <div className="section-label">Manage</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1px",
          background: "var(--border)",
          border: "1px solid var(--border)",
        }}>
          {[
            {
              title: "Organizer Profile",
              desc: "Manage your public identity on tournament pages",
              href: "/dashboard/settings/organizer",
              accent: true,
            },
            {
              title: "Upgrade to Pro",
              desc: user?.isPro ? "Manage your Pro subscription" : "Unlock advanced features",
              href: "/dashboard/upgrade",
            },
            {
              title: "Discord Integration",
              desc: "Connect your Discord server",
              href: "/dashboard/discord",
            },
            {
              title: "Notifications",
              desc: "Manage notification preferences",
              href: "/dashboard/notifications",
            },
            {
              title: "Overlay Settings",
              desc: "Configure OBS broadcast overlays",
              href: "/dashboard/overlay",
            },
            {
              title: "Scoring Presets",
              desc: "Create custom scoring rules",
              href: "/dashboard/scoring",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                background: "var(--surface)",
                padding: "20px 24px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                borderLeft: item.accent ? "2px solid var(--gold)" : "2px solid transparent",
                transition: "background 0.15s ease",
              }}
            >
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                color: "var(--white)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}>{item.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--white-40)", lineHeight: 1.5 }}>
                {item.desc}
              </div>
              <div style={{
                marginTop: "12px",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                color: "var(--gold)",
                textTransform: "uppercase",
              }}>Manage →</div>
            </Link>
          ))}
        </div>

        {/* LOGOUT */}
        <div style={{ marginTop: "32px" }}>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="btn-secondary"
              style={{ padding: "8px 18px" }}
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}