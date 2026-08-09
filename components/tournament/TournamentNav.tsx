"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy, Sparkles, Radio, ClipboardList, Home,
  Palette, Users, Layers, Play, Monitor
} from "lucide-react";

interface TournamentNavProps {
  tournamentId: string;
}

const NAV_ITEMS = [
  { icon: Home,        label: "Overview",      href: "/overview" },
  { icon: Trophy,      label: "Standings",     href: "/standings" },
  { icon: ClipboardList, label: "Results",     href: "/match-results" },
  { icon: Play,        label: "Matches",       href: "/matches" },
  { icon: Users,       label: "Teams",         href: "/teams" },
  { icon: Layers,      label: "Stages",        href: "/stages" },
  { icon: Monitor,     label: "Overlays",      href: "/overlays" },
  { icon: Radio,       label: "Broadcast",     href: "/broadcast" },
  { icon: Sparkles,    label: "AI Insights",   href: "/insights" },
  { icon: Palette,     label: "Branding",      href: "/branding" },
];

export default function TournamentNav({ tournamentId }: TournamentNavProps) {
  const pathname = usePathname();
  const basePath = "/dashboard/tournaments/" + tournamentId;

  return (
    <nav style={{
      marginBottom: "1.5rem",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "0.875rem",
      padding: "0.375rem",
      border: "1px solid rgba(255,255,255,0.08)",
      position: "sticky",
      top: "3.5rem",
      zIndex: 30,
      backdropFilter: "blur(20px)",
    }}>
      <div style={{ display: "flex", gap: "0.125rem", overflowX: "auto" }} className="scrollbar-hide">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const fullPath = basePath + item.href;
          const isActive = pathname === fullPath ||
            (item.href === "/overview" && pathname === basePath);

          return (
            <Link
              key={item.href}
              href={fullPath}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.625rem",
                fontSize: "0.8rem",
                fontWeight: isActive ? 700 : 500,
                whiteSpace: "nowrap",
                textDecoration: "none",
                background: isActive ? "rgba(245,158,11,0.15)" : "transparent",
                color: isActive ? "#f59e0b" : "#6b7280",
                transition: "all 0.15s",
                minHeight: "2.25rem",
              }}
            >
              <Icon style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .nav-label { display: none; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </nav>
  );
}