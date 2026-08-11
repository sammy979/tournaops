"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Command {
  id: string;
  label: string;
  category: string;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
}

interface Props {
  tournamentId?: string;
}

export default function CommandPalette({ tournamentId }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch tournaments for jumping
  useEffect(() => {
    if (open && tournaments.length === 0) {
      fetch("/api/dashboard/tournaments")
        .then((r) => r.json())
        .then((data) => setTournaments(data.tournaments || data || []))
        .catch(() => {});
    }
  }, [open, tournaments.length]);

  // Global keyboard shortcut
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

  // Base commands
  const baseCommands: Command[] = [
    // NAVIGATION
    { id: "nav-dashboard", label: "Go to Dashboard", category: "Navigation", action: () => go("/dashboard"), keywords: ["home"] },
    { id: "nav-tournaments", label: "Browse Tournaments", category: "Navigation", action: () => go("/tournaments"), keywords: ["public", "list"] },
    { id: "nav-rankings", label: "View Rankings", category: "Navigation", action: () => go("/rankings"), keywords: ["leaderboard"] },
    { id: "nav-settings", label: "Settings", category: "Navigation", action: () => go("/dashboard/settings"), keywords: ["profile"] },

    // CREATE
    { id: "create-tournament", label: "Create New Tournament", category: "Create", action: () => go("/dashboard/tournaments/create"), keywords: ["new", "add"] },

    // ORGANIZER PROFILE
    { id: "profile-organizer", label: "Organizer Profile", category: "Organizer", action: () => go("/dashboard/settings/organizer"), keywords: ["brand"] },
    { id: "upgrade", label: "Upgrade to Pro", category: "Organizer", action: () => go("/dashboard/upgrade"), keywords: ["pro", "billing", "payment"] },

    // TOURNAMENT-SPECIFIC (if in tournament)
    ...(tournamentId ? [
      { id: "t-cmd", label: "Open Command Center", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}`), keywords: ["ops", "control"] },
      { id: "t-teams", label: "Manage Teams", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}/teams`) },
      { id: "t-matches", label: "Manage Matches", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}/matches`) },
      { id: "t-standings", label: "View Standings", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}/standings`), keywords: ["scores"] },
      { id: "t-results", label: "Import Match Results", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}/match-results`), keywords: ["upload"] },
      { id: "t-ai", label: "Ops AI Screenshot Import", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}/ai-import`), keywords: ["ai", "extract"] },
      { id: "t-broadcast", label: "OBS Overlays", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}/overlays`), keywords: ["stream", "broadcast"] },
      { id: "t-discord", label: "Discord Integration", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}/discord`), keywords: ["sync"] },
      { id: "t-stages", label: "Manage Stages", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}/stages`), keywords: ["groups"] },
      { id: "t-settings", label: "Tournament Settings", category: "Tournament", action: () => go(`/dashboard/tournaments/${tournamentId}/settings`) },
    ] : []),
  ];

  // Add tournament jumps
  const tournamentCommands: Command[] = tournaments.slice(0, 10).map((t: any) => ({
    id: `jump-${t.id}`,
    label: `→ ${t.name}`,
    category: "Jump to Tournament",
    action: () => go(`/dashboard/tournaments/${t.id}`),
    keywords: [t.name.toLowerCase()],
  }));

  const allCommands = [...baseCommands, ...tournamentCommands];

  // Filter
  const q = query.toLowerCase().trim();
  const filtered = q === ""
    ? allCommands
    : allCommands.filter((cmd) => {
        const matchLabel = cmd.label.toLowerCase().includes(q);
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

  // Handle keyboard navigation
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
        background: "rgba(0,0,0,0.7)",
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
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
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
            }}>
              No commands match "{query}"
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
                        borderLeft: isSelected ? "2px solid var(--gold)" : "2px solid transparent",
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
                        }}>↵</span>
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
          <div style={{ display: "flex", gap: "12px" }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
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