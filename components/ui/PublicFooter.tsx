"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#07090f] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3 group w-fit">
              <div className="w-7 h-7 rounded-lg bg-yellow-500 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white font-black text-lg">Tourna<span className="text-violet-400">Ops</span></span>
            </Link>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              The professional tournament management platform for esports organizers worldwide.
            </p>
            <div className="flex gap-2.5 mt-4">
              {["Discord","Twitter","YouTube","Twitch"].map(s => (
                <div key={s}
                  className="w-8 h-8 bg-white/[0.04] border border-white/[0.07] rounded-lg flex items-center justify-center text-white/30 text-xs font-bold hover:text-white/60 hover:border-white/[0.14] transition-all cursor-pointer">
                  {s[0]}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: [
                { label: "Tournaments",    href: "/tournaments"  },
                { label: "Rankings",       href: "/rankings"     },
                { label: "Bracket Viewer", href: "/bracket"      },
                { label: "Timer Tool",     href: "/timer"        },
              ],
            },
            {
              title: "Organizers",
              links: [
                { label: "Dashboard",          href: "/dashboard"                   },
                { label: "Create Tournament",   href: "/dashboard/tournaments/create"},
                { label: "Upgrade to Pro",      href: "/dashboard/upgrade"           },
                { label: "Documentation",       href: "/contact"                     },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "Contact Us",    href: "/contact" },
                { label: "Privacy Policy",href: "/privacy" },
                { label: "Terms of Use",  href: "/terms"   },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">{col.title}</p>
              <div className="space-y-2">
                {col.links.map(link => (
                  <Link key={link.href} href={link.href}
                    className="block text-white/30 text-sm hover:text-white/60 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-sm">© 2025 TournaOps. All rights reserved.</p>
          <div className="flex items-center gap-2 text-white/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}