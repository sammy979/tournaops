import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/ui/DashboardShell";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Discord Integration — TournaOps" };

export default async function DiscordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <DashboardShell
      title="Discord Integration"
      subtitle="Automated Sync"
      breadcrumbs={[{ label: "Discord" }]}
    >
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        alignItems: "start",
      }}>
        <div>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderTop: "3px solid var(--gold)",
            padding: "24px",
            marginBottom: "16px",
          }}>
            <h2 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "var(--white)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "12px",
            }}>How Discord Sync Works</h2>
            <p style={{ color: "var(--white-70)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "16px" }}>
              TournaOps automatically publishes match results, standings, and announcements
              to your Discord server. Configure Discord for each tournament.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Match result announcements",
                "Live standings updates",
                "Next match reminders",
                "Tournament announcements",
              ].map((item) => (
                <div key={item} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.85rem",
                  color: "var(--white-70)",
                }}>
                  <span style={{ color: "var(--green)" }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Link href="/dashboard" className="btn-secondary" style={{ display: "inline-flex" }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div>
          <div style={{
            background: "#1e1f22",
            border: "1px solid #2b2d31",
            overflow: "hidden",
          }}>
            <div style={{
              background: "#2b2d31",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{ color: "#949ba4", fontSize: "0.85rem", fontWeight: 600 }}># tournament-results</span>
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  background: "var(--gold)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 900,
                    fontSize: "0.7rem",
                    color: "var(--black)",
                  }}>TO</span>
                </div>
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ color: "var(--gold)", fontSize: "0.85rem", fontWeight: 600 }}>TournaOps</span>
                    <span style={{
                      background: "#5865f2",
                      color: "white",
                      fontSize: "0.6rem",
                      padding: "1px 5px",
                      borderRadius: "2px",
                      fontWeight: 700,
                    }}>BOT</span>
                  </div>
                  <div style={{
                    background: "#2b2d31",
                    borderLeft: "4px solid var(--green)",
                    padding: "10px 14px",
                    borderRadius: "0 4px 4px 0",
                  }}>
                    <div style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      color: "var(--white)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "6px",
                    }}>MATCH 18 RESULTS</div>
                    <div style={{ fontSize: "0.78rem", color: "#b5bac1", lineHeight: 1.5 }}>
                      🥇 DRS GAMING — 24 pts<br />
                      🥈 T2K ESPORTS — 18 pts<br />
                      🥉 VENOM ESPORTS — 14 pts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: "16px",
            padding: "12px 14px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--gold)",
            fontSize: "0.78rem",
            color: "var(--white-40)",
            lineHeight: 1.6,
          }}>
            Configure Discord webhook URL in each tournament&apos;s settings to enable auto-sync.
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}