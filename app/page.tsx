import { getServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const user = await getServerUser();

  const recentTournaments = await prisma.tournament.findMany({
    where: { status: "published", isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true, name: true, game: true, status: true, slug: true,
      maxTeams: true, createdAt: true, startDate: true, prizePool: true,
      teams: { select: { id: true } },
    },
  });

  const totalTournaments = await prisma.tournament.count();
  const totalUsers = await prisma.user.count();
  const totalTeams = await prisma.team.count();

  return (
    <main style={{ background: "#0a0a0a", color: "#fff", overflow: "hidden", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes glitch { 0%,100% { transform: translate(0); } 20% { transform: translate(-2px,2px); } 40% { transform: translate(-2px,-2px); } 60% { transform: translate(2px,2px); } 80% { transform: translate(2px,-2px); } }
        @keyframes pulse-gold { 0%,100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.6); } 50% { box-shadow: 0 0 40px 8px rgba(212,175,55,0.2); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes drift { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes tick { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bg-move { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
        @keyframes crosshair-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .grid-bg { background-image: linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px); background-size: 60px 60px; animation: bg-move 20s linear infinite; }
        .scanline { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent); animation: scanline 8s linear infinite; pointer-events: none; }
        .shine-text { background: linear-gradient(90deg, #D4AF37 0%, #fff 50%, #D4AF37 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: shine 3s linear infinite; }
        .fade-up { animation: fadeUp 0.8s ease-out forwards; opacity: 0; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.3s; }
        .fade-up-3 { animation-delay: 0.5s; }
        .fade-up-4 { animation-delay: 0.7s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(212,175,55,0.4); }
        .btn-primary { transition: all 0.2s; }
        .tournament-card:hover { border-color: #D4AF37 !important; transform: translateY(-4px); }
        .tournament-card { transition: all 0.3s; }
        .feature-card:hover { background: #141414 !important; border-color: #D4AF37 !important; }
        .feature-card { transition: all 0.3s; }
        .stat-num { position: relative; }
        .stat-num::after { content: ""; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 40px; height: 2px; background: #D4AF37; }
        .crosshair { animation: crosshair-rotate 20s linear infinite; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,175,55,0.15)",
        padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "36px", height: "36px", background: "#D4AF37",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: "900", color: "#0a0a0a",
            fontSize: "1.1rem",
          }}>T</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.5rem", fontWeight: "900", letterSpacing: "0.05em" }}>
            TOURNA<span style={{ color: "#D4AF37" }}>OPS</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {user ? (
            <Link href="/dashboard" style={{
              padding: "0.6rem 1.5rem", background: "#D4AF37", color: "#0a0a0a",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: "700",
              textDecoration: "none", letterSpacing: "0.1em",
            }}>DASHBOARD →</Link>
          ) : (
            <>
              <Link href="/login" style={{
                padding: "0.6rem 1.25rem", background: "transparent", color: "#fff",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem",
                textDecoration: "none", letterSpacing: "0.1em",
              }}>LOGIN</Link>
              <Link href="/register" className="btn-primary" style={{
                padding: "0.6rem 1.5rem", background: "#D4AF37", color: "#0a0a0a",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: "700",
                textDecoration: "none", letterSpacing: "0.1em",
              }}>GET STARTED</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", padding: "6rem 2rem 8rem", overflow: "hidden", minHeight: "90vh" }}>
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
        <div className="scanline" style={{ top: 0 }} />

        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "800px", height: "800px",
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Floating crosshair decorations */}
        <div style={{ position: "absolute", top: "15%", right: "8%", opacity: 0.15 }}>
          <svg width="120" height="120" viewBox="0 0 100 100" className="crosshair">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#D4AF37" strokeWidth="1" />
            <line x1="50" y1="0" x2="50" y2="20" stroke="#D4AF37" strokeWidth="1" />
            <line x1="50" y1="80" x2="50" y2="100" stroke="#D4AF37" strokeWidth="1" />
            <line x1="0" y1="50" x2="20" y2="50" stroke="#D4AF37" strokeWidth="1" />
            <line x1="80" y1="50" x2="100" y2="50" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="50" cy="50" r="2" fill="#D4AF37" />
          </svg>
        </div>

        <div style={{ position: "absolute", bottom: "20%", left: "5%", opacity: 0.1, animation: "float 6s ease-in-out infinite" }}>
          <svg width="80" height="80" viewBox="0 0 100 100">
            <polygon points="50,10 60,40 90,40 65,60 75,90 50,70 25,90 35,60 10,40 40,40" fill="#D4AF37" />
          </svg>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2, textAlign: "center" }}>

          {/* Badge */}
          <div className="fade-up fade-up-1" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", border: "1px solid rgba(212,175,55,0.3)",
            background: "rgba(212,175,55,0.05)", marginBottom: "2rem",
          }}>
            <span style={{
              width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%",
              animation: "tick 1.5s ease-in-out infinite",
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem",
              color: "#D4AF37", letterSpacing: "0.2em", fontWeight: "600",
            }}>
              ESPORTS OPS · NEPAL EDITION · v2.5
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="fade-up fade-up-2" style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(3rem, 8vw, 7rem)",
            fontWeight: "900",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
            textTransform: "uppercase",
          }}>
            WINNER<br />
            <span className="shine-text">WINNER</span><br />
            <span style={{ color: "#D4AF37" }}>CHICKEN DINNER</span>
          </h1>

          {/* Tagline */}
          <p className="fade-up fade-up-3" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(0.9rem, 1.4vw, 1.1rem)",
            color: "#b8b8b8",
            maxWidth: "620px",
            margin: "0 auto 3rem",
            lineHeight: 1.7,
          }}>
            The complete tournament operating system for PUBG Mobile, BGMI, and battle royale organizers.
            Brackets, scoring, live overlays — no spreadsheets, no chaos.
          </p>

          {/* CTAs */}
          <div className="fade-up fade-up-4" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}>
            {user ? (
              <Link href="/dashboard" className="btn-primary" style={{
                padding: "1.1rem 2.5rem", background: "#D4AF37", color: "#0a0a0a",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: "700",
                textDecoration: "none", letterSpacing: "0.15em",
                animation: "pulse-gold 2s infinite",
              }}>OPEN COMMAND CENTER →</Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary" style={{
                  padding: "1.1rem 2.5rem", background: "#D4AF37", color: "#0a0a0a",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: "700",
                  textDecoration: "none", letterSpacing: "0.15em",
                  animation: "pulse-gold 2s infinite",
                }}>🎮 DROP IN FREE →</Link>
                <Link href="/tournaments" style={{
                  padding: "1.1rem 2.5rem", background: "transparent", color: "#fff",
                  border: "1px solid #3a3a3a",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: "700",
                  textDecoration: "none", letterSpacing: "0.15em",
                }}>WATCH LIVE</Link>
              </>
            )}
          </div>

          {/* Trust bar */}
          <div className="fade-up fade-up-4" style={{
            display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap",
            fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#666",
            letterSpacing: "0.15em",
          }}>
            <span>✓ NO SPREADSHEETS</span>
            <span>✓ REAL-TIME OVERLAYS</span>
            <span>✓ NEPAL PAYMENT SUPPORT</span>
            <span>✓ PMGC & PMPL PRESETS</span>
          </div>
        </div>
      </section>

      {/* LIVE STATS BAR */}
      <section style={{ borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", background: "#0f0f0f" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
          {[
            { num: totalTournaments, label: "TOURNAMENTS RUN", icon: "🏆" },
            { num: totalUsers, label: "ACTIVE ORGANIZERS", icon: "👑" },
            { num: totalTeams, label: "SQUADS REGISTERED", icon: "⚔️" },
            { num: 299, label: "NPR / MONTH PRO", icon: "💎", prefix: "Rs " },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
              <div className="stat-num" style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "2.5rem", fontWeight: "900",
                color: "#D4AF37", lineHeight: 1, marginBottom: "1rem",
              }}>
                {s.prefix || ""}{s.num.toLocaleString()}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem",
                color: "#8a8a8a", letterSpacing: "0.2em", fontWeight: "600",
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE TOURNAMENTS */}
      <section style={{ padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem",
                color: "#ef4444", letterSpacing: "0.2em", marginBottom: "0.75rem", fontWeight: "700",
              }}>
                <span style={{
                  width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%",
                  animation: "tick 1.2s infinite",
                }} />
                LIVE NOW · BROADCASTING
              </div>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900",
                textTransform: "uppercase", letterSpacing: "-0.02em", margin: 0,
              }}>
                Active <span style={{ color: "#D4AF37" }}>Battlegrounds</span>
              </h2>
            </div>
            {user && (
              <Link href="/dashboard/tournaments/create" className="btn-primary" style={{
                padding: "0.75rem 1.5rem", background: "transparent", color: "#D4AF37",
                border: "1px solid #D4AF37",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: "700",
                textDecoration: "none", letterSpacing: "0.15em",
              }}>+ NEW TOURNAMENT</Link>
            )}
          </div>

          {recentTournaments.length === 0 ? (
            <div style={{
              padding: "6rem 2rem", textAlign: "center",
              border: "1px dashed #2a2a2a", background: "rgba(20,20,20,0.5)",
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "1.5rem", opacity: 0.4 }}>🎯</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem",
                color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "1rem", fontWeight: "700",
              }}>DROP ZONE EMPTY</div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.5rem",
                color: "#b8b8b8", marginBottom: "2rem", fontWeight: "700",
              }}>Be the first to deploy a tournament</div>
              <Link href={user ? "/dashboard/tournaments/create" : "/register"} className="btn-primary" style={{
                padding: "1rem 2.5rem", background: "#D4AF37", color: "#0a0a0a",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: "700",
                textDecoration: "none", letterSpacing: "0.15em", display: "inline-block",
              }}>DEPLOY NOW →</Link>
            </div>
          ) : (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "1.5rem",
            }}>
              {recentTournaments.map((t, i) => (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.slug}`}
                  className="tournament-card"
                  style={{
                    background: "linear-gradient(135deg, #141414 0%, #0f0f0f 100%)",
                    border: "1px solid #2a2a2a",
                    padding: "1.5rem",
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Corner accent */}
                  <div style={{
                    position: "absolute", top: 0, right: 0,
                    width: "60px", height: "60px",
                    background: "linear-gradient(135deg, transparent 50%, rgba(212,175,55,0.15) 50%)",
                  }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", position: "relative" }}>
                    <div style={{
                      padding: "0.25rem 0.6rem", background: "rgba(212,175,55,0.1)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem",
                      color: "#D4AF37", letterSpacing: "0.15em", fontWeight: "700",
                    }}>
                      {t.game.toUpperCase().replace("_", " ")}
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.35rem",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem",
                      color: "#22c55e", letterSpacing: "0.15em", fontWeight: "700",
                    }}>
                      <span style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", animation: "tick 1.5s infinite" }} />
                      {t.status.toUpperCase()}
                    </div>
                  </div>

                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.5rem",
                    fontWeight: "900", textTransform: "uppercase", marginBottom: "1rem",
                    lineHeight: 1.1, color: "#fff", letterSpacing: "-0.01em",
                  }}>
                    {t.name}
                  </div>

                  <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#666", letterSpacing: "0.15em", marginBottom: "0.2rem" }}>SQUADS</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", color: "#fff", fontWeight: "700" }}>
                        {t.teams.length}<span style={{ color: "#666" }}>/{t.maxTeams}</span>
                      </div>
                    </div>
                    {t.prizePool && (
                      <div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#666", letterSpacing: "0.15em", marginBottom: "0.2rem" }}>PRIZE POOL</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", color: "#D4AF37", fontWeight: "700" }}>{t.prizePool}</div>
                      </div>
                    )}
                  </div>

                  <div style={{
                    borderTop: "1px solid #2a2a2a", paddingTop: "0.75rem",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#8a8a8a",
                  }}>
                    <span>{t.startDate ? "STARTS " + new Date(t.startDate).toLocaleDateString("en-NP", { month: "short", day: "numeric" }).toUpperCase() : "TBD"}</span>
                    <span style={{ color: "#D4AF37", fontWeight: "700" }}>VIEW →</span>
                  </div>

                  {/* Fill bar */}
                  <div style={{ marginTop: "0.75rem", height: "3px", background: "#0a0a0a" }}>
                    <div style={{
                      height: "100%", background: "#D4AF37",
                      width: `${Math.min(100, (t.teams.length / t.maxTeams) * 100)}%`,
                    }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: "6rem 2rem", background: "#0f0f0f", position: "relative", overflow: "hidden" }}>
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem",
              color: "#D4AF37", letterSpacing: "0.3em", marginBottom: "0.75rem", fontWeight: "700",
            }}>THE ARSENAL</div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em", margin: 0,
            }}>
              Everything an <span style={{ color: "#D4AF37" }}>organizer</span> needs
            </h2>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}>
            {[
              { icon: "⚡", title: "LIVE BRACKETS", desc: "Auto-advancing brackets with real-time score sync from screenshots", tag: "REAL-TIME" },
              { icon: "🎯", title: "SCORING ENGINE", desc: "PMGC, PMPL presets. Or build custom kill + placement point rules", tag: "CUSTOMIZABLE" },
              { icon: "📡", title: "OBS OVERLAYS", desc: "Broadcaster-ready standings, top fragger, chicken dinner overlays", tag: "STREAM READY" },
              { icon: "🏆", title: "PRIZE POOLS", desc: "Position-based cash + item prize distribution. NPR/USD support", tag: "FLEXIBLE" },
              { icon: "📋", title: "REGISTRATIONS", desc: "Squad sign-ups, approval workflow, waitlist, seed management", tag: "AUTOMATED" },
              { icon: "🤖", title: "AI TOOLS", desc: "Screenshot result extraction, live commentary, match summaries", tag: "AI POWERED" },
              { icon: "💳", title: "NEPAL PAYMENTS", desc: "Khalti, eSewa, Bank Transfer. Manual verification in 24h", tag: "LOCAL" },
              { icon: "📊", title: "ANALYTICS", desc: "Real-time stats, top fraggers, participation, tournament ROI", tag: "INSIGHTS" },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{
                background: "#0a0a0a", border: "1px solid #2a2a2a", padding: "2rem 1.5rem",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "1rem", right: "1rem",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem",
                  color: "#D4AF37", letterSpacing: "0.15em", fontWeight: "700",
                  padding: "0.15rem 0.5rem", border: "1px solid rgba(212,175,55,0.3)",
                  background: "rgba(212,175,55,0.05)",
                }}>{f.tag}</div>
                <div style={{ fontSize: "2rem", marginBottom: "1rem", filter: "grayscale(0.3)" }}>{f.icon}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.15rem",
                  fontWeight: "800", color: "#fff", marginBottom: "0.5rem",
                  textTransform: "uppercase", letterSpacing: "0.02em",
                }}>{f.title}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem",
                  color: "#8a8a8a", lineHeight: 1.6,
                }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING CTA */}
      <section style={{
        padding: "6rem 2rem", position: "relative", overflow: "hidden",
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a1500 50%, #0a0a0a 100%)",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{
            display: "inline-block",
            fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem",
            color: "#D4AF37", letterSpacing: "0.3em", marginBottom: "1rem", fontWeight: "700",
            padding: "0.4rem 1rem", border: "1px solid rgba(212,175,55,0.3)",
          }}>🇳🇵 NEPAL PRICING</div>

          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900",
            textTransform: "uppercase", letterSpacing: "-0.02em",
            marginBottom: "1rem", color: "#fff",
          }}>
            Only <span className="shine-text">Rs 299</span><br />
            <span style={{ fontSize: "0.6em", color: "#b8b8b8" }}>per month · unlimited tournaments</span>
          </h2>

          <p style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem",
            color: "#b8b8b8", maxWidth: "500px", margin: "0 auto 2.5rem", lineHeight: 1.7,
          }}>
            Less than one cup of coffee per week.
            Run unlimited tournaments with full access to overlays, AI, and analytics.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {!user ? (
              <Link href="/register" className="btn-primary" style={{
                padding: "1.25rem 3rem", background: "#D4AF37", color: "#0a0a0a",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", fontWeight: "900",
                textDecoration: "none", letterSpacing: "0.15em",
                animation: "pulse-gold 2s infinite",
              }}>🎮 START FREE →</Link>
            ) : (
              <Link href="/dashboard/upgrade" className="btn-primary" style={{
                padding: "1.25rem 3rem", background: "#D4AF37", color: "#0a0a0a",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", fontWeight: "900",
                textDecoration: "none", letterSpacing: "0.15em",
                animation: "pulse-gold 2s infinite",
              }}>UPGRADE TO PRO →</Link>
            )}
          </div>

          <div style={{
            display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap",
            fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#8a8a8a",
            letterSpacing: "0.1em",
          }}>
            <span>💳 KHALTI</span>
            <span>💳 ESEWA</span>
            <span>🏦 BANK TRANSFER</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid #1a1a1a", padding: "3rem 2rem 2rem",
        background: "#0a0a0a",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ width: "28px", height: "28px", background: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: "900", color: "#0a0a0a", fontSize: "0.85rem" }}>T</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.25rem", fontWeight: "900" }}>
                  TOURNA<span style={{ color: "#D4AF37" }}>OPS</span>
                </div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#666", lineHeight: 1.7 }}>
                The tournament operating system built for Nepal's competitive esports scene.
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "1rem", fontWeight: "700" }}>PRODUCT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[["Features","/#features"],["Pricing","/pricing"],["Tournaments","/tournaments"]].map(([label, href]) => (
                  <Link key={label} href={href} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#b8b8b8", textDecoration: "none" }}>{label}</Link>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "1rem", fontWeight: "700" }}>COMPANY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"]].map(([label, href]) => (
                  <Link key={label} href={href} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#b8b8b8", textDecoration: "none" }}>{label}</Link>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "1rem", fontWeight: "700" }}>SUPPORT</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#b8b8b8", lineHeight: 1.7 }}>
                📧 support@tournaops.com<br />
                🇳🇵 Kathmandu, Nepal
              </div>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid #1a1a1a", paddingTop: "2rem",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
            fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#666",
          }}>
            <div>© {new Date().getFullYear()} TOURNAOPS · BUILT IN NEPAL 🇳🇵</div>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", animation: "tick 1.5s infinite" }} />
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}