"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Tournament {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  maxTeams: number | null;
  teamCount: number;
  game: string;
  format: string | null;
  region: string | null;
  prizePool: string | null;
  entryFee: string | null;
  coverImage: string | null;
  organizer: { name?: string | null; username?: string | null } | null;
}

interface Props {
  tournaments: Tournament[];
  counts: { all: number; live: number; upcoming: number; completed: number };
  activeStatus: string;
  activeFormat: string;
  activeRegion: string;
  search: string;
}

const STATUSES = [
  { value: "ALL", label: "All" },
  { value: "LIVE", label: "Live" },
  { value: "REGISTRATION", label: "Registration" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "COMPLETED", label: "Completed" },
];

const FORMATS = [
  { value: "ALL", label: "All Formats" },
  { value: "SOLO", label: "Solo" },
  { value: "DUO", label: "Duo" },
  { value: "SQUAD", label: "Squad" },
];

const REGIONS = [
  { value: "ALL", label: "All Regions" },
  { value: "NEPAL", label: "Nepal" },
  { value: "SOUTH_ASIA", label: "South Asia" },
  { value: "GLOBAL", label: "Global" },
];

export default function TournamentDiscovery({
  tournaments,
  counts,
  activeStatus,
  activeFormat,
  activeRegion,
  search,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchVal, setSearchVal] = useState(search);

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.status && params.status !== "ALL") sp.set("status", params.status);
    if (params.format && params.format !== "ALL") sp.set("format", params.format);
    if (params.region && params.region !== "ALL") sp.set("region", params.region);
    if (params.search) sp.set("search", params.search);
    const q = sp.toString();
    return `/tournaments${q ? `?${q}` : ""}`;
  }

  function navigate(overrides: Record<string, string>) {
    const current = {
      status: activeStatus,
      format: activeFormat,
      region: activeRegion,
      search: searchVal,
    };
    startTransition(() => {
      router.push(buildUrl({ ...current, ...overrides }));
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: searchVal });
  }

  return (
    <div>
      {/* PAGE HEADER */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
        padding: "40px 0 0",
      }}>
        <div className="container-ops">
          <div className="section-label">PUBG Mobile</div>
          <h1 className="text-display" style={{ marginBottom: "24px" }}>
            Tournament Discovery
          </h1>

          {/* STATUS TABS */}
          <div style={{
            display: "flex",
            gap: "0",
            borderTop: "1px solid var(--border)",
            marginTop: "8px",
            overflowX: "auto",
          }}>
            {STATUSES.map((s) => {
              const isActive = activeStatus === s.value;
              const count =
                s.value === "ALL" ? counts.all
                : s.value === "LIVE" ? counts.live
                : s.value === "REGISTRATION" ? counts.upcoming
                : s.value === "UPCOMING" ? counts.upcoming
                : s.value === "COMPLETED" ? counts.completed
                : 0;

              return (
                <button
                  key={s.value}
                  onClick={() => navigate({ status: s.value })}
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "12px 20px",
                    background: "none",
                    border: "none",
                    borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                    color: isActive ? "var(--white)" : "var(--white-40)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    whiteSpace: "nowrap",
                    transition: "color 0.15s ease",
                  }}
                >
                  {s.value === "LIVE" && isActive && (
                    <span className="live-dot" />
                  )}
                  {s.label}
                  <span style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.7rem",
                    color: isActive ? "var(--gold)" : "var(--white-20)",
                  }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTERS + SEARCH BAR */}
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "16px 0",
      }}>
        <div className="container-ops" style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}>
          {/* FORMAT FILTER */}
          <div style={{ display: "flex", gap: "0" }}>
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => navigate({ format: f.value })}
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "7px 14px",
                  background: activeFormat === f.value ? "var(--white)" : "transparent",
                  color: activeFormat === f.value ? "var(--black)" : "var(--white-40)",
                  border: "1px solid var(--border)",
                  borderRight: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >{f.label}</button>
            ))}
            <div style={{ width: "1px", background: "var(--border)" }} />
          </div>

          {/* REGION FILTER */}
          <select
            value={activeRegion}
            onChange={(e) => navigate({ region: e.target.value })}
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 600,
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "7px 14px",
              background: "var(--surface-2)",
              color: "var(--white-70)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          {/* SPACER */}
          <div style={{ flex: 1 }} />

          {/* SEARCH */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0" }}>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search tournaments..."
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.85rem",
                padding: "7px 14px",
                background: "var(--surface-2)",
                color: "var(--white)",
                border: "1px solid var(--border)",
                borderRight: "none",
                outline: "none",
                width: "220px",
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "7px 16px",
                background: "var(--gold)",
                color: "var(--black)",
                border: "none",
                cursor: "pointer",
              }}
            >Search</button>
          </form>
        </div>
      </div>

      {/* RESULTS */}
      <div className="container-ops" style={{ padding: "32px 24px" }}>
        {isPending && (
          <div style={{
            textAlign: "center",
            padding: "16px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            color: "var(--white-40)",
            textTransform: "uppercase",
          }}>Filtering...</div>
        )}

        {tournaments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* RESULTS COUNT */}
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.75rem",
              color: "var(--white-40)",
              marginBottom: "20px",
            }}>
              {tournaments.length} TOURNAMENT{tournaments.length !== 1 ? "S" : ""} FOUND
            </div>

            {/* GRID */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1px",
              background: "var(--border)",
              border: "1px solid var(--border)",
            }}>
              {tournaments.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const isLive = t.status === "LIVE";
  const isReg = t.status === "REGISTRATION";
  const isUpcoming = t.status === "UPCOMING";
  const isCompleted = t.status === "COMPLETED";

  const formatDate = (d: string | null) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const spotsLeft = t.maxTeams ? t.maxTeams - t.teamCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <Link
      href={`/tournaments/${t.slug || t.id}`}
      style={{ textDecoration: "none", display: "block", background: "var(--surface)" }}
    >
      {/* CARD TOP */}
      <div style={{
        height: "80px",
        background: "var(--surface-2)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: "16px",
        overflow: "hidden",
      }}>
        {/* BG ACCENT */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: isLive
            ? "linear-gradient(90deg, rgba(230,57,70,0.1) 0%, transparent 50%)"
            : isReg || isUpcoming
            ? "linear-gradient(90deg, rgba(59,130,246,0.06) 0%, transparent 50%)"
            : "none",
        }} />

        {/* GAME TAG */}
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 900,
          fontSize: "1.6rem",
          color: "var(--border-2)",
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          userSelect: "none",
          position: "relative",
        }}>
          {t.game?.split(" ")[0] || "PUBG"}
        </div>

        {/* STATUS */}
        <div style={{ position: "absolute", top: "12px", right: "12px" }}>
          {isLive && <span className="badge-live">Live</span>}
          {isReg && <span className="badge-upcoming">Registration</span>}
          {isUpcoming && <span className="badge-upcoming">Upcoming</span>}
          {isCompleted && <span className="badge-completed">Completed</span>}
        </div>

        {/* FORMAT */}
        {t.format && (
          <div style={{
            position: "absolute",
            bottom: "10px",
            right: "12px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            color: "var(--white-40)",
            textTransform: "uppercase",
          }}>{t.format}</div>
        )}
      </div>

      {/* CARD BODY */}
      <div style={{ padding: "16px 20px" }}>
        {/* NAME */}
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "1rem",
          letterSpacing: "0.02em",
          color: "var(--white)",
          textTransform: "uppercase",
          lineHeight: 1.2,
          marginBottom: "12px",
        }}>{t.name}</div>

        {/* META ROW */}
        <div style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "14px",
        }}>
          {/* TEAMS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: isFull ? "var(--red)" : "var(--white)",
            }}>
              {t.teamCount}{t.maxTeams ? `/${t.maxTeams}` : ""}
            </span>
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              color: "var(--white-40)",
              textTransform: "uppercase",
            }}>Teams</span>
          </div>

          {/* DATE */}
          {t.startDate && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "var(--white)",
              }}>{formatDate(t.startDate)}</span>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: "var(--white-40)",
                textTransform: "uppercase",
              }}>Start Date</span>
            </div>
          )}

          {/* REGION */}
          {t.region && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "var(--white-70)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>{t.region.replace("_", " ")}</span>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: "var(--white-40)",
                textTransform: "uppercase",
              }}>Region</span>
            </div>
          )}
        </div>

        {/* SPOTS LEFT WARNING */}
        {!isCompleted && spotsLeft !== null && spotsLeft <= 8 && spotsLeft > 0 && (
          <div style={{
            background: "var(--amber-dim)",
            border: "1px solid var(--amber)",
            padding: "4px 10px",
            marginBottom: "12px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            color: "var(--amber)",
            textTransform: "uppercase",
          }}>
            {spotsLeft} SPOT{spotsLeft !== 1 ? "S" : ""} LEFT
          </div>
        )}

        {isFull && !isCompleted && (
          <div style={{
            background: "var(--red-dim)",
            border: "1px solid var(--red)",
            padding: "4px 10px",
            marginBottom: "12px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            color: "var(--red)",
            textTransform: "uppercase",
          }}>FULL</div>
        )}

        {/* FOOTER */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "12px",
          borderTop: "1px solid var(--border)",
        }}>
          <span style={{
            fontSize: "0.75rem",
            color: "var(--white-40)",
            fontFamily: "Barlow, sans-serif",
          }}>
            {t.organizer?.name || t.organizer?.username || "Organizer"}
          </span>
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            color: "var(--gold)",
            textTransform: "uppercase",
          }}>
            {isCompleted ? "View Results â†’" : isReg ? "Register â†’" : "View â†’"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div style={{
      border: "1px solid var(--border)",
      background: "var(--surface)",
      padding: "64px 48px",
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "1rem",
        letterSpacing: "0.1em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "8px",
      }}>No Tournaments Found</div>
      <p style={{
        color: "var(--white-40)",
        fontSize: "0.85rem",
        marginBottom: "24px",
        maxWidth: "360px",
        margin: "0 auto 24px",
      }}>
        No tournaments match your current filters. Try adjusting the filters or check back later.
      </p>
      <Link href="/tournaments" className="btn-secondary">
        Clear Filters
      </Link>
    </div>
  );
}