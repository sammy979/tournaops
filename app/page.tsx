"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Trophy, Users, Play, Zap, ArrowRight, Check,
  Monitor, Download, Globe, Shield, Star,
  ChevronRight, Crosshair, BarChart3, Flame
} from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/8 shadow-lg" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">TournaOps</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/6 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-blue-400/6 rounded-full blur-3xl" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            PUBG Mobile Tournament Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6">
            Run Tournaments
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
              Like a Pro
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The complete tournament operations platform for PUBG Mobile organizers.
            Live leaderboards, OBS overlays, match results, and standings — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
              Sign In
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            {[
              { value: "400+", label: "Max squads" },
              { value: "Free", label: "Forever" },
              { value: "Live", label: "Leaderboards" },
              { value: "OBS", label: "Overlay ready" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Preview Card */}
        <div className="relative max-w-4xl mx-auto mt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent rounded-3xl blur-xl" />
          <div className="relative glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/4 border-b border-white/8">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white/8 rounded-md px-3 py-1 text-xs text-gray-500 w-48 mx-auto text-center">
                  tournaops.com/dashboard
                </div>
              </div>
            </div>

            {/* Fake dashboard preview */}
            <div className="p-6 bg-[#0a0a0f]">
              {/* Top stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Tournaments", value: "12", color: "blue" },
                  { label: "Live Now", value: "3", color: "green" },
                  { label: "Total Squads", value: "384", color: "purple" },
                  { label: "Matches Done", value: "96", color: "orange" },
                ].map(s => (
                  <div key={s.label} className="bg-white/4 rounded-xl p-3 border border-white/8">
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Fake leaderboard */}
              <div className="bg-white/3 rounded-xl border border-white/8 overflow-hidden">
                <div className="px-4 py-2.5 bg-white/4 border-b border-white/8">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Standings</span>
                </div>
                {[
                  { rank: "🥇", name: "Team Alpha", kills: 24, pts: 87 },
                  { rank: "🥈", name: "Nova Esports", kills: 19, pts: 74 },
                  { rank: "🥉", name: "Storm Riders", kills: 21, pts: 68 },
                  { rank: "#4", name: "Dark Knights", kills: 16, pts: 61 },
                  { rank: "#5", name: "Phoenix Squad", kills: 14, pts: 55 },
                ].map((row) => (
                  <div key={row.name} className="flex items-center px-4 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <span className="w-8 text-sm">{row.rank}</span>
                    <span className="flex-1 text-sm text-gray-200 font-medium">{row.name}</span>
                    <span className="text-orange-400 text-xs font-mono mr-6">{row.kills}K</span>
                    <span className="text-blue-400 font-bold font-mono text-sm">{row.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium mb-4">
              FEATURES
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Built specifically for PUBG Mobile tournament organizers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Trophy,
                color: "blue",
                title: "Tournament Management",
                desc: "Create tournaments for 16 to 400 squads. Multiple rounds, lobbies, and formats all handled automatically.",
              },
              {
                icon: BarChart3,
                color: "purple",
                title: "Live Leaderboards",
                desc: "Real-time standings with PMGC, PMPL, and custom scoring systems. Auto-sorted by points, kills, and damage.",
              },
              {
                icon: Monitor,
                color: "green",
                title: "OBS Overlay",
                desc: "Browser source URL for OBS. Show live leaderboard on your stream with customizable themes.",
              },
              {
                icon: Download,
                color: "orange",
                title: "Export Results",
                desc: "Export leaderboards as PNG or PDF in PMGC table format. Perfect for social media and Discord.",
              },
              {
                icon: Users,
                color: "pink",
                title: "Team Management",
                desc: "Full squad roster with player IGNs, roles, photos, and team logos. Edit everything in one place.",
              },
              {
                icon: Globe,
                color: "cyan",
                title: "Public Tournament Page",
                desc: "Share a public link for spectators. Auto-refreshes every 30 seconds with live standings.",
              },
            ].map((f) => {
              const Icon = f.icon;
              const colors: Record<string, string> = {
                blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
                purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
                green: "from-green-500/20 to-green-600/5 border-green-500/20 text-green-400",
                orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
                pink: "from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400",
                cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
              };
              const c = colors[f.color];
              return (
                <div key={f.title} className={`glass-card rounded-2xl p-6 border bg-gradient-to-br ${c} hover:scale-[1.01] transition-transform`}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c} flex items-center justify-center mb-4 border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how" className="py-24 px-4 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Up and running in minutes</h2>
            <p className="text-gray-500 text-lg">Three steps to run your tournament professionally</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Zap,
                title: "Create Tournament",
                desc: "Choose your format — 16 to 400 squads. Select PMGC scoring, map rotation, and rounds. Done in 2 minutes.",
              },
              {
                step: "02",
                icon: Crosshair,
                title: "Enter Match Results",
                desc: "After each match, enter placements and kills. Points calculate automatically. Leaderboard updates instantly.",
              },
              {
                step: "03",
                icon: Flame,
                title: "Share & Stream",
                desc: "Share public link for spectators. Add OBS overlay to your stream. Export final standings as PNG or PDF.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 mb-5">
                    <Icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0a0a0f] border border-white/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">{s.step}</span>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SCORING SYSTEMS ─────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Pro Scoring Systems</h2>
            <p className="text-gray-500">Official and community scoring presets built in</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "PMGC", desc: "Global Championship", color: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20", text: "text-yellow-400" },
              { name: "PMPL", desc: "Pro League SA", color: "from-blue-500/20 to-blue-600/5 border-blue-500/20", text: "text-blue-400" },
              { name: "Community", desc: "Standard format", color: "from-green-500/20 to-green-600/5 border-green-500/20", text: "text-green-400" },
              { name: "Kill Heavy", desc: "2x kill points", color: "from-red-500/20 to-red-600/5 border-red-500/20", text: "text-red-400" },
            ].map(s => (
              <div key={s.name} className={`glass-card rounded-xl p-5 border bg-gradient-to-br ${s.color} text-center`}>
                <div className={`text-2xl font-bold ${s.text} mb-1`}>{s.name}</div>
                <div className="text-gray-500 text-xs">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 bg-white/2">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium mb-4">
              PRICING
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Simple, honest pricing</h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="glass-card rounded-2xl p-8 border border-white/10">
              <div className="mb-6">
                <div className="text-sm text-gray-500 font-medium mb-1">FREE</div>
                <div className="text-5xl font-bold text-white mb-1">$0</div>
                <div className="text-gray-600 text-sm">forever</div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Up to 3 tournaments",
                  "Up to 64 squads per tournament",
                  "PMGC & PMPL scoring",
                  "Live leaderboard",
                  "Public tournament page",
                  "OBS overlay",
                  "PNG & PDF export",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-secondary w-full py-3 justify-center">
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative glass-card rounded-2xl p-8 border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <div className="absolute top-4 right-4 badge badge-live">Popular</div>
              <div className="mb-6">
                <div className="text-sm text-blue-400 font-medium mb-1">PRO</div>
                <div className="text-5xl font-bold text-white mb-1">$19</div>
                <div className="text-gray-600 text-sm">per month</div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited tournaments",
                  "Up to 400 squads",
                  "All scoring systems",
                  "Priority support",
                  "Custom branding",
                  "Discord integration",
                  "AI match assistant",
                  "Advanced analytics",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-primary w-full py-3 justify-center">
                Start Pro free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-purple-500/8" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to run better tournaments?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join tournament organizers who use TournaOps to run professional PUBG Mobile events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="btn-primary text-base px-8 py-3.5">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="btn-secondary text-base px-8 py-3.5">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">TournaOps</span>
          </div>
          <p className="text-gray-600 text-sm">© 2025 TournaOps. PUBG Mobile Tournament Platform.</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}