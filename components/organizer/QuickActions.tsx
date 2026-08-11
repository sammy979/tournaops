"use client";
import Link from "next/link";
import { useState } from "react";

interface Props {
  tournamentId: string;
  overlayToken?: string;
}

interface ActionItem {
  label: string;
  href: string;
  category: "primary" | "match" | "teams" | "broadcast" | "sync";
  external?: boolean;
  description?: string;
}

export function QuickActions({ tournamentId, overlayToken }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const actions: ActionItem[] = [
    // PRIMARY — Match operations
    {
      label: "Import Results",
      href: `/dashboard/tournaments/${tournamentId}/match-results`,
      category: "primary",
      description: "Upload match results",
    },
    {
      label: "AI Screenshot",
      href: `/dashboard/tournaments/${tournamentId}/ai-import`,
      category: "primary",
      description: "Extract results from screenshot",
    },
    {
      label: "Match Results",
      href: `/dashboard/tournaments/${tournamentId}/match-results`,
      category: "match",
      description: "View all match results",
    },

    // MATCH
    {
      label: "Matches",
      href: `/dashboard/tournaments/${tournamentId}/matches`,
      category: "match",
      description: "Manage matches",
    },
    {
      label: "Standings",
      href: `/dashboard/tournaments/${tournamentId}/standings`,
      category: "match",
      description: "View live standings",
    },
    {
      label: "Stages",
      href: `/dashboard/tournaments/${tournamentId}/stages`,
      category: "match",
      description: "Group and stage management",
    },

    // TEAMS
    {
      label: "Manage Teams",
      href: `/dashboard/tournaments/${tournamentId}/teams`,
      category: "teams",
      description: "Team roster",
    },
    {
      label: "Bulk Import",
      href: `/dashboard/tournaments/${tournamentId}/bulk-import`,
      category: "teams",
      description: "Import teams in bulk",
    },
    {
      label: "Registrations",
      href: `/dashboard/tournaments/${tournamentId}/settings`,
      category: "teams",
      description: "Registration settings",
    },

    // BROADCAST
    {
      label: "OBS Overlays",
      href: `/dashboard/tournaments/${tournamentId}/overlays`,
      category: "broadcast",
      description: "Get broadcast overlay URLs",
    },
    {
      label: "Broadcast",
      href: `/dashboard/tournaments/${tournamentId}/broadcast`,
      category: "broadcast",
      description: "Broadcast tools",
    },
    {
      label: "Branding",
      href: `/dashboard/tournaments/${tournamentId}/branding`,
      category: "broadcast",
      description: "Tournament branding",
    },

    // SYNC
    {
      label: "Discord Sync",
      href: `/dashboard/tournaments/${tournamentId}/discord`,
      category: "sync",
      description: "Discord integration",
    },
    {
      label: "Export",
      href: `/dashboard/tournaments/${tournamentId}/export`,
      category: "sync",
      description: "Export tournament data",
    },
    {
      label: "Settings",
      href: `/dashboard/tournaments/${tournamentId}/settings`,
      category: "sync",
      description: "Tournament settings",
    },
  ];

  const categories = [
    { key: "all", label: "All" },
    { key: "primary", label: "Primary" },
    { key: "match", label: "Match" },
    { key: "teams", label: "Teams" },
    { key: "broadcast", label: "Broadcast" },
    { key: "sync", label: "Sync" },
  ];

  const filtered = activeCategory === "all"
    ? actions
    : actions.filter((a) => a.category === activeCategory);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* HEADER */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          color: "var(--white-40)",
          textTransform: "uppercase",
        }}>Quick Actions</span>

        {/* CATEGORY TABS */}
        <div style={{ display: "flex", gap: "0" }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "4px 10px",
                background: activeCategory === cat.key ? "var(--gold)" : "transparent",
                color: activeCategory === cat.key ? "var(--black)" : "var(--white-40)",
                border: "1px solid var(--border)",
                borderRight: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >{cat.label}</button>
          ))}
        </div>
      </div>

      {/* ACTIONS GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px",
        background: "var(--border)",
      }}>
        {filtered.map((action, i) => (
          <Link
            key={`${action.label}-${i}`}
            href={action.href}
            style={{
              background: "var(--surface)",
              padding: "14px 16px",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              transition: "background 0.15s ease",
              borderLeft: action.category === "primary" ? "2px solid var(--gold)" : "2px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface)";
            }}
          >
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.04em",
              color: action.category === "primary" ? "var(--white)" : "var(--white-70)",
              textTransform: "uppercase",
            }}>{action.label}</span>
            {action.description && (
              <span style={{
                fontSize: "0.7rem",
                color: "var(--white-40)",
                lineHeight: 1.4,
              }}>{action.description}</span>
            )}
          </Link>
        ))}
      </div>

      {/* MOBILE — 2 columns */}
      <style>{`
        @media (max-width: 640px) {
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default QuickActions;