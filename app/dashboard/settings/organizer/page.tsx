import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrganizerProfileForm from "@/components/organizer/OrganizerProfileForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Organizer Profile — TournaOps",
  description: "Manage your organizer identity.",
};

async function getUserAndStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatar: true,
      isPro: true,
      organizerName: true,
      organizerLogo: true,
      organizerBio: true,
    },
  });

  const tournaments = await prisma.tournament.findMany({
    where: { userId },
    select: { id: true, status: true },
  });

  const stats = {
    total: tournaments.length,
    live: tournaments.filter((t: any) => (t.status || "").toLowerCase() === "live").length,
    upcoming: tournaments.filter((t: any) => {
      const s = (t.status || "").toLowerCase();
      return s === "upcoming" || s === "registration" || s === "draft";
    }).length,
    completed: tournaments.filter((t: any) => (t.status || "").toLowerCase() === "completed").length,
  };

  return { user, stats };
}

export default async function OrganizerProfilePage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const { user, stats } = await getUserAndStats(session.userId);
  if (!user) redirect("/auth/signin");

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* HEADER */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container-ops" style={{ padding: "24px 24px 24px" }}>
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
            <Link href="/dashboard/settings" style={{ color: "var(--white-40)", textDecoration: "none" }}>Settings</Link>
            <span style={{ color: "var(--white-20)" }}>→</span>
            <span style={{ color: "var(--gold)" }}>Organizer Profile</span>
          </div>

          <div className="section-label">Public Identity</div>
          <h1 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "1.8rem",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: "var(--white)",
            lineHeight: 1,
          }}>Organizer Profile</h1>
        </div>
      </div>

      <div className="container-ops" style={{ padding: "32px 24px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: "32px",
          alignItems: "start",
        }}>
          {/* LEFT — PREVIEW */}
          <div>
            <div className="section-label">Preview</div>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderTop: "3px solid var(--gold)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "60px",
                background: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(230,57,70,0.05) 100%)",
                borderBottom: "1px solid var(--border)",
              }} />

              <div style={{ padding: "0 20px 20px" }}>
                <div style={{
                  width: "72px",
                  height: "72px",
                  background: "var(--surface-2)",
                  border: "2px solid var(--charcoal)",
                  marginTop: "-36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {user.organizerLogo ? (
                    <img
                      src={user.organizerLogo}
                      alt="Logo"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 900,
                      fontSize: "1.8rem",
                      color: "var(--gold)",
                    }}>
                      {(user.organizerName || user.displayName || user.username || "O")[0].toUpperCase()}
                    </span>
                  )}
                </div>

                <div style={{ marginTop: "12px" }}>
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    letterSpacing: "0.02em",
                    color: "var(--white)",
                    textTransform: "uppercase",
                  }}>
                    {user.organizerName || user.displayName || user.username}
                  </div>
                  {user.isPro && (
                    <div style={{
                      display: "inline-block",
                      background: "var(--gold-dim)",
                      border: "1px solid var(--gold)",
                      padding: "2px 8px",
                      marginTop: "4px",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      letterSpacing: "0.15em",
                      color: "var(--gold)",
                      textTransform: "uppercase",
                    }}>Pro Organizer</div>
                  )}
                </div>

                {user.organizerBio && (
                  <p style={{
                    fontSize: "0.82rem",
                    color: "var(--white-70)",
                    lineHeight: 1.6,
                    marginTop: "12px",
                    whiteSpace: "pre-wrap",
                  }}>{user.organizerBio}</p>
                )}

                <div style={{
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border)",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "12px",
                }}>
                  {[
                    { label: "Total", value: stats.total, color: "var(--white)" },
                    { label: "Live", value: stats.live, color: "var(--red)" },
                    { label: "Upcoming", value: stats.upcoming, color: "var(--blue)" },
                    { label: "Done", value: stats.completed, color: "var(--green)" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ textAlign: "center" }}>
                      <div style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: stat.color,
                      }}>{stat.value}</div>
                      <div style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontSize: "0.6rem",
                        letterSpacing: "0.12em",
                        color: "var(--white-40)",
                        textTransform: "uppercase",
                        marginTop: "2px",
                      }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: "16px",
              padding: "12px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--border-2)",
              fontSize: "0.75rem",
              color: "var(--white-40)",
              lineHeight: 1.6,
            }}>
              This preview shows how your organizer identity appears on public tournament pages.
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div>
            <div className="section-label">Edit Profile</div>
            <OrganizerProfileForm
              initial={{
                organizerName: user.organizerName || user.displayName || "",
                organizerLogo: user.organizerLogo || "",
                organizerBio: user.organizerBio || "",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}