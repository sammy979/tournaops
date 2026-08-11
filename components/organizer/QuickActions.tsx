"use client";
import Link from "next/link";

interface QuickActionsProps {
  tournamentId?: string;
}

export function QuickActions({ tournamentId }: QuickActionsProps) {
  const base = tournamentId ? `/dashboard/tournaments/${tournamentId}` : "/dashboard";

  const groups = [
    {
      label: "Results",
      actions: [
        { label: "Add Match Result",  href: `${base}/match-results` },
        { label: "AI Screenshot",     href: `${base}/ai-import`     },
        { label: "Review Results",    href: `${base}/matches`        },
      ],
    },
    {
      label: "Tournament",
      actions: [
        { label: "Manage Teams",      href: `${base}/teams`          },
        { label: "Group Seeding",     href: `${base}/stages`         },
        { label: "Edit Schedule",     href: `${base}/schedule`       },
        { label: "Standings",         href: `${base}/standings`      },
      ],
    },
    {
      label: "Broadcast",
      actions: [
        { label: "OBS Overlays",      href: `${base}/overlays`       },
        { label: "Discord",           href: `${base}/discord`        },
        { label: "Broadcast Studio",  href: `${base}/broadcast`      },
        { label: "Export",            href: `${base}/export`         },
      ],
    },
  ];

  return (
    <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--muted-light)",
        }}>
          Quick Actions
        </p>
      </div>

      {groups.map((group, gi) => (
        <div key={group.label}>
          <div style={{
            padding: "8px 16px 4px",
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}>
            {group.label}
          </div>
          {group.actions.map((a, ai) => (
            <Link
              key={a.href}
              href={a.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textDecoration: "none",
                borderBottom: "1px solid var(--border-subtle)",
                transition: "color 0.15s, background 0.15s",
                letterSpacing: "0.01em",
              }}
            >
              <span>{a.label}</span>
              <span style={{ color: "var(--muted)", fontSize: "11px" }}>→</span>
            </Link>
          ))}
          {gi < groups.length - 1 && (
            <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default QuickActions;