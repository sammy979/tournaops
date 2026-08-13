"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Trophy, Menu, X, ChevronDown } from "lucide-react";

export default function PublicNav() {
  const router   = useRouter();
  const pathname = usePathname() ?? "";
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Tournaments", href: "/tournaments" },
    { label: "Rankings",    href: "/rankings"    },
    { label: "Pricing",     href: "/#pricing"    },
    { label: "Contact",     href: "/contact"     },
  ];

  const isActive = (href: string) =>
    href.startsWith("/#") ? false : pathname.startsWith(href);

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07090f]/95 backdrop-blur-xl border-b border-white/[0.07] shadow-xl shadow-black/20"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:bg-yellow-500 transition-colors">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">
              Tourna<span className="text-violet-400">Ops</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-white bg-white/[0.06]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]">
              Sign In
            </Link>
            <Link href="/register"
              className="px-4 py-2 text-sm font-bold text-white bg-yellow-500 hover:bg-yellow-500 rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06]">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#07090f]/98 backdrop-blur-xl border-t border-white/[0.07] px-6 py-4 space-y-1">
            {links.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors text-center">
                Sign In
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-yellow-500 hover:bg-yellow-500 transition-colors text-center">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer for non-hero pages */}
      <div className="h-16" />
    </>
  );
}