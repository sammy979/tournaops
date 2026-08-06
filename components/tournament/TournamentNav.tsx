"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Sparkles, Radio, ClipboardList, Home, Palette, ImageIcon } from "lucide-react";

interface TournamentNavProps {
  tournamentId: string;
}

const NAV_ITEMS = [
  { icon: Home, label: "Overview", href: "" },
  { icon: Trophy, label: "Standings", href: "/standings" },
  { icon: ClipboardList, label: "Match Results", href: "/match-results" },
  { icon: Users, label: "Bulk Import", href: "/bulk-import" },
  { icon: Radio, label: "Broadcast", href: "/broadcast" },
  { icon: Sparkles, label: "AI Insights", href: "/insights" },
  { icon: Palette, label: "Branding", href: "/branding" },
];

export default function TournamentNav({ tournamentId }: TournamentNavProps) {
  const pathname = usePathname();
  const basePath = "/dashboard/tournaments/" + tournamentId;

  return (
    <nav className="mb-6 bg-neutral-900 rounded-xl p-2 border border-neutral-800 sticky top-4 z-40 backdrop-blur">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const fullPath = basePath + item.href;
          const isActive = pathname === fullPath || 
            (item.href === "" && pathname === basePath);
          
          return (
            <Link
              key={item.href}
              href={fullPath}
              className={"flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all " +
                (isActive 
                  ? "bg-yellow-500 text-black" 
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )
              }
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}