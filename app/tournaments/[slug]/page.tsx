"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, Share2, Loader2, Target, ChevronLeft,
  Shield, User, Crown, Flame, Crosshair, Calendar,
  ExternalLink, Copy, Check, MapPin, Sparkles, Award
} from "lucide-react";

export default function PublicTournamentPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "teams" | "results">("overview");
  const [copied, setCopied] = useState(false);

  async function loadData() {
    try {
      const res = await fetch(`/api/public/tournaments/${slug}`);
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  function share() {
    if (navigator.share) {
      navigator.share({ title: data?.tournament?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data?.tournament) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center" }}>
          <Trophy style={{ width: "4rem", height: "4rem", color: "#374151", margin: "0 auto 1rem" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>Tournament Not Found</h1>
          <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>This tournament may be private or has been removed.</p>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "#f59e0b", color: "#000",
            padding: "0.625rem 1.5rem", borderRadius: "0.75rem",
            fontWeight: 700, fontSize: "0.875rem",
            textDecoration: "none",
          }}>
            <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { tournament, standings = [], organizer, branding, topFraggers = [] } = data;
  const primaryColor = branding?.primaryColor || "#f59e0b";
  const accentColor = branding?.accentColor || "#f97316";
  const orgName = branding?.orgName || organizer?.displayName || organizer?.username || "Organizer";
  const orgLogo = branding?.orgLogo || organizer?.avatar;

  const teams = tournament.teams || [];
  const matches = tournament.matches || [];

  const TeamAvatar = ({ team, size = 48 }: any) => {
    const src = team?.teamLogo || team?.logo;
    const label = (team?.teamName || team?.name || "?")[0].toUpperCase();
    if (src) {
      return <img src={src} alt={team.teamName || team.name} style={{ width: size, height: size, objectFit: "cover", borderRadius: "0.625rem" }} />;
    }
    return (
      <div style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${primaryColor}25, ${accentColor}15)`,
        borderRadius: "0.625rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${primaryColor}30`,
      }}>
        <span style={{ color: primaryColor, fontWeight: 800, fontSize: size / 2.5 }}>{label}</span>
      </div>
    );
  };

  const statusInfo: Record<string, { label: string; bg: string; color: string; border: string }> = {
    live: { label: "LIVE", bg: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "rgba(239,68,68,0.4)" },
    registration: { label: "REGISTRATION OPEN", bg: "rgba(34,197,94,0.15)", color: "#4ade80", border: "rgba(34,197,94,0.4)" },
    completed: { label: "COMPLETED", bg: "rgba(168,85,247,0.15)", color: "#c084fc", border: "rgba(168,85,247,0.4)" },
    draft: { label: "COMING SOON", bg: "rgba(107,114,128,0.15)", color: "#9ca3af", border: "rgba(107,114,128,0.4)" },
    cancelled: { label: "CANCELLED", bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.4)" },
  };
  const status = statusInfo[tournament.status] || statusInfo.draft;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        minHeight: "24rem",
        overflow: "hidden",
        background: "#000",
      }}>
        {/* Background image */}
        {(tournament.bannerImage || tournament.coverImage) ? (
          <img
            src={tournament.bannerImage || tournament.coverImage}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            alt=""
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${primaryColor}25, #000)`,
          }} />
        )}

        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(10,10,15,0.6), rgba(10,10,15,0.9) 60%, #0a0a0f)",
        }} />

        {/* Noise texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          opacity: 0.5,
        }} />

        {/* Top Bar - Organizer badge */}
        <div style={{
          position: "absolute", top: "1rem", right: "1rem",
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
          padding: "0.375rem 0.875rem",
          borderRadius: "9999px",
          zIndex: 5,
        }}>
          {orgLogo ? (
            <img src={orgLogo} style={{ width: "1.25rem", height: "1.25rem", borderRadius: "50%", objectFit: "cover" }} alt="" />
          ) : (
            <div style={{
              width: "1.25rem", height: "1.25rem",
              borderRadius: "50%",
              background: primaryColor,
              color: "#000",
              fontWeight: 700, fontSize: "0.65rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {orgName[0].toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#fff" }}>by {orgName}</span>
        </div>

        {/* Content */}
        <div style={{
          position: "relative", maxWidth: "1280px", margin: "0 auto",
          height: "100%", minHeight: "24rem",
          padding: "1.5rem",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
        }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: "0.25rem",
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.75rem", fontWeight: 500,
            textDecoration: "none",
            marginBottom: "1rem", width: "fit-content",
          }}>
            <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />
            Back
          </Link>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", minWidth: 0, flex: 1 }}>
              {tournament.trophyImage && (
                <img
                  src={tournament.trophyImage}
                  style={{ width: "5rem", height: "5rem", objectFit: "contain", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.6))" }}
                  alt="Trophy"
                />
              )}
              <div style={{ minWidth: 0 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.65rem", fontWeight: 800,
                  background: status.bg,
                  color: status.color,
                  border: `1px solid ${status.border}`,
                  marginBottom: "0.5rem",
                }}>
                  {tournament.status === "live" && (
                    <span style={{ width: "0.35rem", height: "0.35rem", borderRadius: "50%", background: "#f87171", animation: "pulse 2s infinite" }} />
                  )}
                  {status.label}
                </span>
                <h1 style={{
                  fontSize: "clamp(1.75rem, 5vw, 3rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: "#fff",
                  textShadow: "0 4px 20px rgba(0,0,0,0.6)",
                  marginBottom: "0.5rem",
                }}>
                  {tournament.name}
                </h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.85)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                    <Users style={{ width: "0.875rem", height: "0.875rem", color: primaryColor }} />
                    {teams.length}/{tournament.maxTeams} Teams
                  </span>
                  {tournament.prizePool && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: primaryColor, fontWeight: 700 }}>
                      <Trophy style={{ width: "0.875rem", height: "0.875rem" }} />
                      {tournament.prizePool}
                    </span>
                  )}
                  {matches.length > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                      <Target style={{ width: "0.875rem", height: "0.875rem", color: primaryColor }} />
                      {matches.length} Matches
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              {tournament.status === "registration" && (
                <Link
                  href={`/tournaments/${slug}/register`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.375rem",
                    padding: "0.75rem 1.5rem",
                    background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                    color: "#000",
                    borderRadius: "0.75rem",
                    fontWeight: 800, fontSize: "0.875rem",
                    textDecoration: "none",
                    boxShadow: `0 8px 25px ${primaryColor}40`,
                  }}
                >
                  Register Team
                </Link>
              )}
              <button
                onClick={share}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "0.75rem",
                  fontWeight: 600, fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {copied ? (
                  <><Check style={{ width: "0.875rem", height: "0.875rem", color: "#4ade80" }} />Copied</>
                ) : (
                  <><Share2 style={{ width: "0.875rem", height: "0.875rem" }} />Share</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sponsor strip */}
        {tournament.sponsorLogos && Array.isArray(tournament.sponsorLogos) && tournament.sponsorLogos.length > 0 && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "0.625rem 1rem",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "1.5rem", flexWrap: "wrap",
              maxWidth: "1280px", margin: "0 auto",
            }}>
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.1em" }}>SPONSORS</span>
              {tournament.sponsorLogos.slice(0, 5).map((logo: string, i: number) => (
                <img
                  key={i}
                  src={logo}
                  style={{ height: "1.75rem", objectFit: "contain", opacity: 0.7, transition: "opacity 0.2s" }}
                  alt="Sponsor"
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── TABS ─────────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(10,10,15,0.9)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", gap: "0.25rem", overflowX: "auto" }} className="scrollbar-hide">
            {[
              { id: "overview", label: "Overview", icon: Trophy },
              { id: "teams", label: `Teams (${teams.length})`, icon: Users },
              { id: "results", label: "Results", icon: Target },
            ].map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    fontSize: "0.85rem", fontWeight: 600,
                    borderBottom: active ? `2px solid ${primaryColor}` : "2px solid transparent",
                    color: active ? primaryColor : "#9ca3af",
                    background: "transparent",
                    border: "none",
                    borderBottomWidth: "2px",
                    borderBottomStyle: "solid",
                    borderBottomColor: active ? primaryColor : "transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "color 0.15s",
                  }}
                >
                  <Icon style={{ width: "0.875rem", height: "0.875rem" }} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                { icon: Users, value: teams.length, label: "Teams Registered", color: primaryColor },
                { icon: Target, value: matches.length, label: "Total Matches", color: primaryColor },
                { icon: Trophy, value: tournament.prizePool || "TBA", label: "Prize Pool", color: primaryColor, big: true },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                  }}>
                    <div style={{
                      width: "2.5rem", height: "2.5rem",
                      borderRadius: "0.625rem",
                      background: `${stat.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "1rem",
                    }}>
                      <Icon style={{ width: "1.25rem", height: "1.25rem", color: stat.color }} />
                    </div>
                    <div style={{ fontSize: stat.big ? "1.5rem" : "2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.375rem" }}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Organizer Card */}
            <div style={{
              background: `linear-gradient(135deg, ${primaryColor}08, transparent)`,
              border: `1px solid ${primaryColor}30`,
              borderRadius: "1rem",
              padding: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}>
              {orgLogo ? (
                <img src={orgLogo} style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", objectFit: "cover", border: `2px solid ${primaryColor}` }} alt="" />
              ) : (
                <div style={{
                  width: "3.5rem", height: "3.5rem",
                  borderRadius: "50%",
                  background: primaryColor, color: "#000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "1.5rem",
                }}>
                  {orgName[0].toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.125rem" }}>Tournament Organizer</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>{orgName}</div>
                {organizer?.username && (
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>@{organizer.username}</div>
                )}
              </div>
            </div>

            {/* Description */}
            {tournament.description && (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles style={{ width: "1rem", height: "1rem", color: primaryColor }} />
                  About This Tournament
                </h2>
                <p style={{ color: "#d1d5db", fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {tournament.description}
                </p>
              </div>
            )}

            {/* Rules */}
            {tournament.rules && (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Shield style={{ width: "1rem", height: "1rem", color: primaryColor }} />
                  Rules & Regulations
                </h2>
                <p style={{ color: "#d1d5db", fontSize: "0.85rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {tournament.rules}
                </p>
              </div>
            )}

            {/* Map Rotation */}
            {tournament.mapRotation && tournament.mapRotation.length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MapPin style={{ width: "1rem", height: "1rem", color: primaryColor }} />
                  Map Rotation
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {tournament.mapRotation.map((map: string, i: number) => (
                    <span key={i} style={{
                      padding: "0.375rem 0.875rem",
                      borderRadius: "0.5rem",
                      background: `${primaryColor}15`,
                      color: primaryColor,
                      fontSize: "0.75rem", fontWeight: 600,
                      border: `1px solid ${primaryColor}25`,
                    }}>
                      {map}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEAMS */}
        {tab === "teams" && (
          <div>
            {teams.length === 0 ? (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "2px dashed rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                padding: "4rem 2rem",
                textAlign: "center",
              }}>
                <Users style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
                <p style={{ color: "#9ca3af", fontWeight: 600, fontSize: "1rem" }}>No teams yet</p>
                <p style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: "0.375rem" }}>Teams will appear once registration begins</p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "0.75rem",
              }}>
                {teams.map((team: any) => (
                  <div
                    key={team.id}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "0.875rem",
                      padding: "1rem",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${primaryColor}40`;
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <TeamAvatar team={team} size={48} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {team.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.7rem", marginTop: "0.125rem" }}>
                          {team.tag && (
                            <span style={{ color: primaryColor, fontWeight: 600 }}>[{team.tag}]</span>
                          )}
                          {team.countryFlag && <span>{team.countryFlag}</span>}
                        </div>
                        {team.playersList?.length > 0 && (
                          <div style={{ color: "#6b7280", fontSize: "0.7rem", marginTop: "0.25rem" }}>
                            {team.playersList.length} players
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESULTS */}
        {tab === "results" && (
          <div>
            {standings.length === 0 ? (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "2px dashed rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                padding: "4rem 2rem",
                textAlign: "center",
              }}>
                <Target style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
                <p style={{ color: "#9ca3af", fontWeight: 600, fontSize: "1rem" }}>No results yet</p>
                <p style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: "0.375rem" }}>Standings will appear once matches begin</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* Champion Card */}
                <div style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "1.25rem",
                  border: `2px solid ${primaryColor}`,
                  boxShadow: `0 20px 60px ${primaryColor}30`,
                  background: "#000",
                }}>
                  {(standings[0].teamBanner || tournament.bannerImage) ? (
                    <img
                      src={standings[0].teamBanner || tournament.bannerImage}
                      style={{ width: "100%", height: "20rem", objectFit: "cover" }}
                      alt=""
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "20rem",
                      background: `linear-gradient(135deg, ${primaryColor}30, #000)`,
                    }} />
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.7) 40%, transparent)",
                  }} />
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "2rem",
                    textAlign: "center",
                  }}>
                    <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}>
                      <TeamAvatar team={standings[0]} size={72} />
                    </div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "0.375rem",
                      padding: "0.25rem 1rem",
                      borderRadius: "9999px",
                      background: primaryColor, color: "#000",
                      fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.15em",
                      marginBottom: "0.5rem",
                    }}>
                      <Crown style={{ width: "0.875rem", height: "0.875rem" }} />
                      CHAMPION
                    </span>
                    {standings[0].teamTag && (
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: primaryColor, marginBottom: "0.25rem" }}>
                        [{standings[0].teamTag}]
                      </div>
                    )}
                    <h2 style={{
                      fontSize: "clamp(2rem, 6vw, 3.5rem)",
                      fontWeight: 900,
                      color: "#fff",
                      marginBottom: "1rem",
                      textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                    }}>
                      {standings[0].teamName}
                    </h2>
                    <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                      {[
                        { label: "POINTS", value: standings[0].totalPoints, color: primaryColor },
                        { label: "KILLS", value: standings[0].totalKills, color: "#f87171" },
                        { label: "WWCD", value: standings[0].wwcdCount, color: primaryColor },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "2rem", fontWeight: 900, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.85)", letterSpacing: "0.15em", fontWeight: 700 }}>
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Silver + Bronze */}
                {standings.length > 1 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                    {[1, 2].map(idx => {
                      if (!standings[idx]) return null;
                      const rank = idx + 1;
                      const c = rank === 2 ? "#94a3b8" : "#f97316";
                      const emoji = rank === 2 ? "🥈" : "🥉";
                      const label = rank === 2 ? "2ND PLACE" : "3RD PLACE";
                      return (
                        <div key={idx} style={{
                          background: "rgba(255,255,255,0.03)",
                          border: `2px solid ${c}`,
                          borderRadius: "1rem",
                          padding: "1.25rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}>
                          <TeamAvatar team={standings[idx]} size={64} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.65rem", fontWeight: 900, color: c, letterSpacing: "0.15em", marginBottom: "0.125rem" }}>
                              {emoji} {label}
                            </div>
                            {standings[idx].teamTag && (
                              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: c }}>[{standings[idx].teamTag}]</div>
                            )}
                            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {standings[idx].teamName}
                            </h3>
                            <div style={{ fontSize: "1rem", fontWeight: 700, color: c, marginTop: "0.25rem" }}>
                              {standings[idx].totalPoints} pts
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Top Fraggers */}
                {topFraggers.length > 0 && (
                  <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${primaryColor}30`,
                    borderRadius: "1rem",
                    padding: "1.5rem",
                  }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff" }}>
                      <Crosshair style={{ width: "1rem", height: "1rem", color: primaryColor }} />
                      Top Killers
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem" }}>
                      {topFraggers.slice(0, 5).map((p: any, i: number) => (
                        <div key={i} style={{ textAlign: "center" }}>
                          {p.photo ? (
                            <img
                              src={p.photo}
                              style={{
                                width: "4rem", height: "4rem",
                                borderRadius: "50%",
                                objectFit: "cover",
                                margin: "0 auto",
                                border: `2px solid ${i === 0 ? primaryColor : "#4b5563"}`,
                              }}
                              alt=""
                            />
                          ) : (
                            <div style={{
                              width: "4rem", height: "4rem",
                              borderRadius: "50%",
                              margin: "0 auto",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              border: `2px solid ${i === 0 ? primaryColor : "#4b5563"}`,
                              background: "#1f2937",
                              color: primaryColor,
                              fontSize: "1.25rem", fontWeight: 900,
                            }}>
                              {p.name[0]}
                            </div>
                          )}
                          <div style={{ fontWeight: 700, fontSize: "0.75rem", marginTop: "0.5rem", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name}
                          </div>
                          {p.teamTag && (
                            <div style={{ fontSize: "0.65rem", color: primaryColor }}>[{p.teamTag}]</div>
                          )}
                          <div style={{
                            fontSize: "1.125rem", fontWeight: 900,
                            color: i === 0 ? primaryColor : "#fff",
                            marginTop: "0.25rem",
                          }}>
                            {p.kills}K
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Standings Table */}
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      {orgLogo && <img src={orgLogo} style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", objectFit: "cover" }} alt="" />}
                      <div>
                        <h3 style={{ fontWeight: 800, color: "#fff", fontSize: "0.95rem" }}>Full Standings</h3>
                        <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>Presented by {orgName}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>#</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>Team</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>M</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>WWCD</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kills</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.65rem", fontWeight: 700, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((s: any) => (
                          <tr key={s.teamId} style={{
                            borderTop: "1px solid rgba(255,255,255,0.04)",
                            background: s.rank === 1 ? `${primaryColor}08` : "transparent",
                          }}>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: 800, color: s.rank === 1 ? primaryColor : s.rank === 2 ? "#94a3b8" : s.rank === 3 ? "#f97316" : "#6b7280" }}>
                              {s.rank === 1 ? "🏆" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : `#${s.rank}`}
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <TeamAvatar team={s} size={28} />
                                <div>
                                  {s.teamTag && <span style={{ color: primaryColor, marginRight: "0.25rem", fontWeight: 700 }}>[{s.teamTag}]</span>}
                                  <span style={{ color: "#fff", fontWeight: 600 }}>{s.teamName}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#9ca3af" }}>{s.matchesPlayed}</td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                              {s.wwcdCount > 0 && <span style={{ color: primaryColor, fontWeight: 700 }}>{s.wwcdCount}</span>}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#f87171", fontWeight: 600 }}>{s.totalKills}</td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: primaryColor, fontWeight: 800, fontSize: "0.9rem" }}>{s.totalPoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "3rem" }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "1.5rem",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {orgLogo ? (
              <img src={orgLogo} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", objectFit: "cover" }} alt="" />
            ) : (
              <div style={{
                width: "2.5rem", height: "2.5rem",
                borderRadius: "50%",
                background: primaryColor, color: "#000",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700,
              }}>
                {orgName[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>Organized by</div>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem" }}>{orgName}</div>
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            Powered by{" "}
            <Link href="/" style={{ color: primaryColor, fontWeight: 600, textDecoration: "none" }}>
              TournaOps
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}