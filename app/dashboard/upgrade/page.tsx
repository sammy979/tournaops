import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UpgradeClient from "@/components/payment/UpgradeClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Upgrade to Pro — TournaOps",
  description: "Unlock professional tournament operations features.",
};

async function getUserAndPayments(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      isPro: true,
      proExpiresAt: true,
      proGrantedAt: true,
    },
  });

  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    take: 10,
    select: {
      id: true,
      amount: true,
      currency: true,
      method: true,
      status: true,
      submittedAt: true,
      reviewedAt: true,
      rejectionReason: true,
    },
  });

  const paymentSettings = await prisma.paymentSettings.findFirst();

  return { user, payments, paymentSettings };
}

export default async function UpgradePage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const { user, payments, paymentSettings } = await getUserAndPayments(session.userId);
  if (!user) redirect("/auth/signin");

  const isPro = user.isPro;
  const proExpires = user.proExpiresAt;

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* HEADER */}
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
            <span style={{ color: "var(--gold)" }}>Upgrade</span>
          </div>

          <div className="section-label">TournaOps Pro</div>
          <h1 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color: "var(--white)",
            lineHeight: 1,
            marginBottom: "12px",
          }}>
            Run Tournaments at a Professional Level
          </h1>
          <p style={{
            fontSize: "0.95rem",
            color: "var(--white-70)",
            maxWidth: "580px",
            lineHeight: 1.6,
          }}>
            Everything you need to organize competitive PUBG Mobile tournaments —
            AI screenshot import, Discord sync, OBS broadcast overlays, and more.
          </p>
        </div>
      </div>

      {/* PRO STATUS BANNER */}
      {isPro && (
        <div style={{
          background: "var(--gold-dim)",
          borderBottom: "1px solid var(--gold)",
          borderTop: "1px solid var(--gold)",
        }}>
          <div className="container-ops" style={{
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "0.9rem",
                color: "var(--gold)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>✓ You are on TournaOps Pro</span>
            </div>
            {proExpires && (
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.78rem",
                color: "var(--white-70)",
              }}>
                Expires: {new Date(proExpires).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRICING + FEATURES */}
      <div className="container-ops" style={{ padding: "40px 24px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "32px",
          alignItems: "start",
        }}>
          {/* LEFT — FEATURES */}
          <div>
            <div className="section-label">What You Get</div>
            <h2 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "1.4rem",
              textTransform: "uppercase",
              color: "var(--white)",
              letterSpacing: "0.02em",
              marginBottom: "20px",
            }}>Pro Features</h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1px",
              background: "var(--border)",
              border: "1px solid var(--border)",
            }}>
              {[
                { title: "AI Screenshot Import", desc: "Extract kills and placements from PUBG screenshots with Ops AI." },
                { title: "Discord Sync", desc: "Auto-publish match results and standings to your Discord server." },
                { title: "OBS Broadcast Overlays", desc: "Six production-ready overlays for live streaming." },
                { title: "Unlimited Tournaments", desc: "Run as many tournaments as you need — no hidden limits." },
                { title: "Stages & Groups", desc: "Advanced multi-stage tournament formats with team progression." },
                { title: "Custom Scoring Presets", desc: "PMGC, PMPL, or your own scoring rules." },
                { title: "Bulk Team Import", desc: "Onboard hundreds of teams in seconds." },
                { title: "Public Tournament Pages", desc: "Every tournament gets its own esports event page." },
                { title: "Tournament Reports", desc: "Auto-generated summaries and final results." },
                { title: "Priority Support", desc: "Get help fast when it matters most." },
              ].map((f, i) => (
                <div key={i} style={{
                  background: "var(--surface)",
                  padding: "18px 20px",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}>
                    <span style={{
                      color: "var(--green)",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.85rem",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}>✓</span>
                    <div>
                      <div style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        color: "var(--white)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "4px",
                      }}>{f.title}</div>
                      <div style={{
                        fontSize: "0.8rem",
                        color: "var(--white-40)",
                        lineHeight: 1.6,
                      }}>{f.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAYMENT HISTORY */}
            {payments.length > 0 && (
              <div style={{ marginTop: "40px" }}>
                <div className="section-label">Payment History</div>
                <h3 style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--white)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "16px",
                }}>Your Payments</h3>

                <div style={{
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 100px 140px 120px",
                    padding: "10px 16px",
                    background: "var(--surface-2)",
                    borderBottom: "1px solid var(--border)",
                  }}>
                    {["Date", "Method", "Amount", "Status", "Reviewed"].map((col) => (
                      <div key={col} style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.68rem",
                        letterSpacing: "0.15em",
                        color: "var(--white-40)",
                        textTransform: "uppercase",
                      }}>{col}</div>
                    ))}
                  </div>

                  {payments.map((p: any, i: number) => (
                    <div key={p.id} style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 100px 100px 140px 120px",
                      padding: "12px 16px",
                      borderBottom: i < payments.length - 1 ? "1px solid var(--border)" : "none",
                      alignItems: "center",
                    }}>
                      <div style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.78rem",
                        color: "var(--white-70)",
                      }}>
                        {new Date(p.submittedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "var(--white-70)",
                        textTransform: "uppercase",
                      }}>{p.method}</div>
                      <div style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        color: "var(--gold)",
                      }}>Rs {p.amount}</div>
                      <div>
                        {p.status === "APPROVED" && <span className="badge-completed">Approved</span>}
                        {p.status === "PENDING" && <span className="badge-warning">Pending</span>}
                        {p.status === "REJECTED" && <span className="badge-live" style={{background: "var(--red-dim)"}}>Rejected</span>}
                      </div>
                      <div style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.72rem",
                        color: "var(--white-40)",
                      }}>
                        {p.reviewedAt
                          ? new Date(p.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — PRICING CARD */}
          <div>
            <div style={{ position: "sticky", top: "80px" }}>
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderTop: "3px solid var(--gold)",
                padding: "28px 24px",
                marginBottom: "16px",
              }}>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}>TournaOps Pro</div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                  <span style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 900,
                    fontSize: "3rem",
                    color: "var(--white)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}>Rs 299</span>
                </div>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontSize: "0.8rem",
                  color: "var(--white-40)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "24px",
                }}>Per Month · Nepal / Local Payment</div>

                <div style={{
                  padding: "14px 16px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  marginBottom: "20px",
                }}>
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    color: "var(--white-40)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: "8px",
                  }}>Included</div>
                  {[
                    "AI Screenshot Import",
                    "OBS Broadcast Overlays",
                    "Discord Integration",
                    "Unlimited Tournaments",
                    "Priority Support",
                  ].map((item) => (
                    <div key={item} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.82rem",
                      color: "var(--white-70)",
                      padding: "4px 0",
                    }}>
                      <span style={{ color: "var(--gold)" }}>✓</span> {item}
                    </div>
                  ))}
                </div>

                {isPro ? (
                  <div style={{
                    background: "var(--green-dim)",
                    border: "1px solid var(--green)",
                    padding: "12px 16px",
                    textAlign: "center",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "var(--green)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}>✓ Active Subscription</div>
                ) : (
                  <UpgradeClient
                    userId={user.id}
                    userEmail={user.email}
                    paymentSettings={paymentSettings as any}
                  />
                )}
              </div>

              <div style={{
                fontSize: "0.75rem",
                color: "var(--white-40)",
                lineHeight: 1.6,
                padding: "0 4px",
              }}>
                Payments are manually reviewed by our team. Pro access is granted within 24 hours of payment verification.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}