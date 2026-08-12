"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Command {
  id: string;
  label: string;
  category: string;
  action: () => void;
  keywords?: string[];
}

interface Props {
  tournamentId?: string;
}

export default function CommandPalette({ tournamentId }: Props) {
  const [open, setOpen]               = useState(false);
  const [query, setQuery]             = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const inputRef                      = useRef<HTMLInputElement>(null);
  const router                        = useRouter();

  // Fetch real tournaments for jump commands
  useEffect(() => {
    if (open && tournaments.length === 0) {
      fetch("/api/dashboard/tournaments")
        .then((r) => r.json())
        .then((data) => setTournaments(data.tournaments || data || []))
        .catch(() => {});
    }
  }, [open, tournaments.length]);

  // Global keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const go = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  // Base commands — only real verified routes
  const baseCommands: Command[] = [
    // NAVIGATION
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      category: "Navigation",
      action: () => go("/dashboard"),
      keywords: ["home", "main"],
    },
    {
      id: "nav-tournaments",
      label: "Browse Tournaments",
      category: "Navigation",
      action: () => go("/tournaments"),
      keywords: ["public", "list", "all"],
    },
    {
      id: "nav-rankings",
      label: "View Rankings",
      category: "Navigation",
      action: () => go("/rankings"),
      keywords: ["leaderboard", "standings", "top"],
    },
    {
      id: "nav-pricing",
      label: "Pricing",
      category: "Navigation",
      action: () => go("/pricing"),
      keywords: ["pro", "plan", "cost"],
    },

    // CREATE
    {
      id: "create-tournament",
      label: "Create New Tournament",
      category: "Create",
      action: () => go("/dashboard/tournaments/create"),
      keywords: ["new", "add", "start"],
    },

    // DASHBOARD
    {
      id: "dash-overview",
      label: "Dashboard Overview",
      category: "Dashboard",
      action: () => go("/dashboard"),
      keywords: ["home"],
    },
    {
      id: "dash-analytics",
      label: "Analytics",
      category: "Dashboard",
      action: () => go("/dashboard/analytics"),
      keywords: ["stats", "data", "metrics"],
    },
    {
      id: "dash-registrations",
      label: "Registrations",
      category: "Dashboard",
      action: () => go("/dashboard/registrations"),
      keywords: ["teams", "signup", "entries"],
    },
    {
      id: "dash-scoring",
      label: "Scoring Presets",
      category: "Dashboard",
      action: () => go("/dashboard/scoring"),
      keywords: ["points", "rules", "preset"],
    },
    {
      id: "dash-schedule",
      label: "Schedule",
      category: "Dashboard",
      action: () => go("/dashboard/schedule"),
      keywords: ["time", "calendar", "dates"],
    },
    {
      id: "dash-prizes",
      label: "Prizes",
      category: "Dashboard",
      action: () => go("/dashboard/prizes"),
      keywords: ["money", "reward", "pool"],
    },
    {
      id: "dash-discord",
      label: "Discord Integration",
      category: "Dashboard",
      action: () => go("/dashboard/discord"),
      keywords: ["bot", "server", "sync"],
    },
    {
      id: "dash-overlay",
      label: "OBS Overlay",
      category: "Dashboard",
      action: () => go("/dashboard/overlay"),
      keywords: ["obs", "stream", "broadcast"],
    },
    {
      id: "dash-ai",
      label: "AI Assistant",
      category: "Dashboard",
      action: () => go("/dashboard/ai"),
      keywords: ["groq", "gemini", "assistant", "chat"],
    },
    {
      id: "dash-ai-images",
      label: "AI Image Generator",
      category: "Dashboard",
      action: () => go("/dashboard/ai-images"),
      keywords: ["image", "banner", "generate"],
    },
    {
      id: "dash-assets",
      label: "Assets",
      category: "Dashboard",
      action: () => go("/dashboard/assets"),
      keywords: ["files", "upload", "media"],
    },
    {
      id: "dash-branding",
      label: "Branding",
      category: "Dashboard",
      action: () => go("/dashboard/branding"),
      keywords: ["logo", "colors", "identity"],
    },
    {
      id: "dash-notifications",
      label: "Notifications",
      category: "Dashboard",
      action: () => go("/dashboard/notifications"),
      keywords: ["alerts", "messages"],
    },
    {
      id: "dash-timer",
      label: "Match Timer",
      category: "Dashboard",
      action: () => go("/dashboard/timer"),
      keywords: ["clock", "countdown"],
    },
    {
      id: "dash-upgrade",
      label: "Upgrade to Pro",
      category: "Dashboard",
      action: () => go("/dashboard/upgrade"),
      keywords: ["pro", "billing", "payment", "subscribe"],
    },
    {
      id: "dash-settings",
      label: "Settings",
      category: "Dashboard",
      action: () => go("/dashboard/settings"),
      keywords: ["profile", "account"],
    },
    {
      id: "dash-settings-organizer",
      label: "Organizer Profile",
      category: "Dashboard",
      action: () => go("/dashboard/settings/organizer"),
      keywords: ["brand", "bio", "logo"],
    },

    // TOURNAMENT-SPECIFIC — only when inside a tournament context
    ...(tournamentId ? [
      {
        id: "t-overview",
        label: "Tournament Overview",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/overview`),
        keywords: ["summary", "home"],
      },
      {
        id: "t-teams",
        label: "Manage Teams",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/teams`),
        keywords: ["roster", "players"],
      },
      {
        id: "t-matches",
        label: "Manage Matches",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/matches`),
        keywords: ["games", "lobby"],
      },
      {
        id: "t-match-results",
        label: "Import Match Results",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/match-results`),
        keywords: ["upload", "score", "result"],
      },
      {
        id: "t-standings",
        label: "Standings",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/standings`),
        keywords: ["scores", "points", "rank"],
      },
      {
        id: "t-stages",
        label: "Stages & Groups",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/stages`),
        keywords: ["qualifier", "groups", "bracket"],
      },
      {
        id: "t-bracket",
        label: "Bracket",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/bracket`),
        keywords: ["elimination", "tree"],
      },
      {
        id: "t-leaderboard",
        label: "Leaderboard",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/leaderboard`),
        keywords: ["rank", "top"],
      },
      {
        id: "t-ai-import",
        label: "AI Screenshot Import",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/ai-import`),
        keywords: ["ai", "extract", "screenshot", "ocr"],
      },
      {
        id: "t-bulk-import",
        label: "Bulk Import Teams",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/bulk-import`),
        keywords: ["import", "csv", "paste"],
      },
      {
        id: "t-broadcast",
        label: "Broadcast & Overlays",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/broadcast`),
        keywords: ["stream", "obs"],
      },
      {
        id: "t-overlays",
        label: "OBS Overlays",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/overlays`),
        keywords: ["obs", "stream", "token"],
      },
      {
        id: "t-discord",
        label: "Discord Integration",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/discord`),
        keywords: ["bot", "sync", "announce"],
      },
      {
        id: "t-branding",
        label: "Tournament Branding",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/branding`),
        keywords: ["logo", "banner", "colors"],
      },
      {
        id: "t-insights",
        label: "Tournament Insights",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/insights`),
        keywords: ["analytics", "stats", "data"],
      },
      {
        id: "t-export",
        label: "Export Data",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/export`),
        keywords: ["download", "csv", "json"],
      },
      {
        id: "t-settings",
        label: "Tournament Settings",
        category: "Tournament",
        action: () => go(`/dashboard/tournaments/${tournamentId}/settings`),
        keywords: ["config", "edit"],
      },
    ] : []),
  ];

  // Real tournament jump commands from API
  const tournamentCommands: Command[] = tournaments.slice(0, 8).map((t: any) => ({
    id: `jump-${t.id}`,
    label: `-> ${t.name}`,
    category: "Jump to Tournament",
    action: () => go(`/dashboard/tournaments/${t.id}/overview`),
    keywords: [t.name.toLowerCase(), t.slug || ""],
  }));

  const allCommands = [...baseCommands, ...tournamentCommands];

  // Filter by query
  const q = query.toLowerCase().trim();
  const filtered = q === ""
    ? allCommands
    : allCommands.filter((cmd) => {
        const matchLabel    = cmd.label.toLowerCase().includes(q);
        const matchCategory = cmd.category.toLowerCase().includes(q);
        const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
        return matchLabel || matchCategory || matchKeywords;
      });

  // Group by category
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  // Keyboard navigation within results
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, selectedIndex, filtered]);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--charcoal)",
          border: "1px solid var(--border-2)",
          borderTop: "3px solid var(--gold)",
          width: "min(640px, 92vw)",
          maxHeight: "72vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            color: "var(--gold)",
            textTransform: "uppercase",
          }}>TournaOps Command</span>
          <div style={{ flex: 1 }} />
          <kbd style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.68rem",
            color: "var(--white-40)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            padding: "2px 6px",
          }}>ESC</kbd>
        </div>

        {/* SEARCH INPUT */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, tournaments, actions..."
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--white)",
              fontSize: "1.05rem",
              fontFamily: "Barlow, sans-serif",
            }}
          />
        </div>

        {/* RESULTS */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--white-40)",
              fontSize: "0.85rem",
              fontFamily: "Barlow, sans-serif",
            }}>
              No commands match &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div style={{
                  padding: "8px 20px 6px",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.18em",
                  color: "var(--white-40)",
                  textTransform: "uppercase",
                  background: "var(--surface)",
                }}>{category}</div>

                {cmds.map((cmd) => {
                  runningIndex++;
                  const isSelected = runningIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => {
                        const idx = filtered.findIndex((f) => f.id === cmd.id);
                        if (idx >= 0) setSelectedIndex(idx);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 20px",
                        background: isSelected ? "var(--gold-dim)" : "transparent",
                        border: "none",
                        borderLeft: isSelected
                          ? "2px solid var(--gold)"
                          : "2px solid transparent",
                        color: isSelected ? "var(--white)" : "var(--white-70)",
                        fontFamily: "Barlow, sans-serif",
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "background 0.1s ease",
                      }}
                    >
                      <span>{cmd.label}</span>
                      {isSelected && (
                        <span style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.7rem",
                          color: "var(--gold)",
                        }}>&#8629;</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div style={{
          padding: "10px 20px",
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.7rem",
          color: "var(--white-40)",
        }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>&#8593;&#8595; Navigate</span>
            <span>&#8629; Select</span>
            <span>ESC Close</span>
          </div>
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}>{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}