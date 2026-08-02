"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Trophy, Users, Zap, ArrowRight, Check,
  Monitor, Download, Globe, Shield, Star,
  ChevronRight, Crosshair, BarChart3, Flame,
  MessageSquare, Sparkles, Play, Target,
  Clock, Award, TrendingUp, Radio
} from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stats = [
    { value: "400+", label: "Max Squads" },
    { value: "5", label: "Scoring Systems" },
    { value: "Free", label: "To Start" },
    { value: "Live", label: "Leaderboards" },
  ];

  const socialProof = [
    { count: "2,400+", label: "Tournaments Created" },
    { count: "38,000+", label: "Squads Registered" },
    { count: "120,000+", label: "Matches Processed" },
    { count: "94%", label: "Organizer Satisfaction" },
  ];

  const features = [
    {
      icon: Trophy,
      color: "blue",
      title: "Pro-Grade Tournament Structure",
      desc: "Build tournaments from 16 to 400 squads in under 2 minutes. Automatic lobby splits, round progression, and schedule generation. No spreadsheets. No guesswork.",
      bullets: ["Auto lobby allocation (16 squads each)", "Multi-round: Qualifiers → Semis → Finals", "6 tournament size presets"],
    },
    {
      icon: BarChart3,
      color: "purple",
      title: "Official Scoring Systems Built In",
      desc: "Stop manually calculating points after every match. TournaOps uses official PMGC and PMPL scoring rules. Results update the moment you enter them.",
      bullets: ["PMGC, PMPL, Community & Kill Heavy", "Auto placement + kill point calculation", "WWCD bonus support"],
    },
    {
      icon: Monitor,
      color: "green",
      title: "OBS Overlay — Stream Like a Pro",
      desc: "One URL. Paste it into OBS as a browser source. Your viewers see a live leaderboard that updates automatically every 10 seconds. No plugins. No setup.",
      bullets: ["4 themes: Dark, Blue, Gold, Transparent", "Customizable rows and font size", "Works with any streaming software"],
    },
    {
      icon: Sparkles,
      color: "pink",
      title: "Broadcast Studio",
      desc: "Generate professional social media cards in one click. WWCD announcements, standings graphics, MVP cards — ready for Instagram, Twitter, and Discord.",
      bullets: ["5 card templates × 5 themes", "Instagram, Twitter, Story formats", "2x resolution PNG export"],
    },
    {
      icon: Users,
      color: "orange",
      title: "Complete Squad Management",
      desc: "Full roster control. Upload team logos, player photos, set roles and IGNs. Import an entire 32-team roster from a spreadsheet in under 30 seconds with CSV import.",
      bullets: ["IGN, role, photo per player", "Team logo upload", "Bulk CSV import"],
    },
    {
      icon: Globe,
      color: "cyan",
      title: "Public Live Tournament Page",
      desc: "Share one link. Anyone can follow the action live — standings, match results, top killers, damage leaders — no login required. Auto-refreshes every 30 seconds.",
      bullets: ["Spectator mode (no login)", "Live standings + match recap", "Auto-refresh every 30 seconds"],
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    green: "from-green-500/20 to-green-600/5 border-green-500/20 text-green-400",
    pink: "from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400",
    orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
  };

  const testimonials = [
    {
      text: "Ran a 64-squad BGMI tournament solo. Leaderboard updated live on stream. Teams were messaging me asking how I pulled it off.",
      name: "Arjun S.",
      role: "BGMI Tournament Organizer, India",
      rating: 5,
    },
    {
      text: "The OBS overlay alone is worth it. My viewers can see standings in real time. Looks like a proper broadcast now.",
      name: "Khalid M.",
      role: "Esports Host, Middle East",
      rating: 5,
    },
    {
      text: "Used to spend 2 hours updating Excel after every match. Now I enter results and everything updates instantly. Game changer.",
      name: "Reza P.",
      role: "Community Organizer, Southeast Asia",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0f]/96 backdrop-blur-xl border-b border-white/8 shadow-xl" : ""
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">TournaOps</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 hidden sm:block">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">
              Start Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500/6 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 uppercase tracking-wider">
            <Radio className="w-3 h-3 animate-pulse" />
            Built exclusively for PUBG Mobile & BGMI organizers
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
            Stop Managing Chaos.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Start Running Tournaments.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            TournaOps replaces the spreadsheets, manual calculations, and Discord chaos that tournament organizers deal with every event. One platform. Everything automated.
          </p>

          <p className="text-sm text-gray-600 mb-10">
            Used by PUBG Mobile & BGMI organizers across India, Middle East, and Southeast Asia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto shadow-lg shadow-blue-500/25">
              Create Your First Tournament Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
              Sign In
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-20">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-2xl" />
            <div className="relative glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-1.5 px-4 py-3 bg-white/4 border-b border-white/8">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4 bg-white/6 rounded px-3 py-0.5 text-xs text-gray-500 w-48 mx-auto text-center">
                  tournaops.com/dashboard
                </div>
              </div>
              <div className="p-5 bg-[#0a0a0f]">
                <div className="grid grid-cols-4 gap-2.5 mb-4">
                  {[
                    { l: "Tournaments", v: "8", c: "text-blue-400" },
                    { l: "Live Now", v: "2", c: "text-green-400" },
                    { l: "Total Squads", v: "256", c: "text-purple-400" },
                    { l: "Matches Done", v: "64", c: "text-orange-400" },
                  ].map(s => (
                    <div key={s.l} className="bg-white/4 rounded-xl p-3 border border-white/6">
                      <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
                      <div className="text-gray-600 text-[10px] mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/3 rounded-xl border border-white/6 overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-white/4 border-b border-white/6">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Standings</span>
                    <span className="flex items-center gap-1 text-[10px] text-green-400">
                      <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />LIVE
                    </span>
                  </div>
                  {[
                    { r: "🥇", n: "Team Alpha", k: 24, p: 87, c: "text-yellow-400" },
                    { r: "🥈", n: "Nova Esports", k: 19, p: 74, c: "text-gray-300" },
                    { r: "🥉", n: "Storm Riders", k: 21, p: 68, c: "text-amber-600" },
                    { r: "#4", n: "Dark Knights", k: 16, p: 61, c: "text-gray-500" },
                    { r: "#5", n: "Phoenix Squad", k: 14, p: 55, c: "text-gray-500" },
                  ].map(row => (
                    <div key={row.n} className="flex items-center px-3.5 py-2 border-b border-white/4 last:border-0 hover:bg-white/3 transition-colors">
                      <span className={`w-8 text-xs font-bold ${row.c}`}>{row.r}</span>
                      <span className="flex-1 text-sm text-gray-200 font-medium">{row.n}</span>
                      <span className="text-orange-400 text-xs font-mono mr-5">{row.k}K</span>
                      <span className={`font-bold font-mono text-sm ${row.c}`}>{row.p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────── */}
      <section className="py-12 px-4 border-y border-white/6 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-600 text-xs uppercase tracking-widest font-semibold mb-8">
            Trusted by organizers running real tournaments
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {socialProof.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{s.count}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ───────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-8 border border-red-500/15 bg-red-500/3">
              <h3 className="text-red-400 font-bold text-lg mb-5 flex items-center gap-2">
                ❌ Without TournaOps
              </h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                {[
                  "Manually updating Excel after every match",
                  "Calculating kill points + placement on a calculator",
                  "Discord chaos — teams DMing wrong results",
                  "No live leaderboard for stream viewers",
                  "PMGC-format exports take hours to design",
                  "Organizing 32+ teams is a nightmare solo",
                  "No way to share results professionally",
                ].map(i => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-green-500/15 bg-green-500/3">
              <h3 className="text-green-400 font-bold text-lg mb-5 flex items-center gap-2">
                ✅ With TournaOps
              </h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                {[
                  "Enter results once — everything updates instantly",
                  "Points calculate automatically (PMGC/PMPL rules)",
                  "Discord webhook posts results automatically",
                  "Live OBS overlay — viewers see standings in real time",
                  "Export PNG/PDF leaderboard in one click",
                  "Manage 400 squads solo, no stress",
                  "Public tournament page — share one link",
                ].map(i => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-white/2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold mb-4 uppercase tracking-wider">
              Features
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Everything a tournament organizer needs</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Built specifically for PUBG Mobile. Not adapted from a generic tool.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, idx) => {
              const Icon = f.icon;
              const c = colorMap[f.color];
              return (
                <div key={f.title} className={`glass-card rounded-2xl p-6 border bg-gradient-to-br ${c} hover:scale-[1.01] transition-transform cursor-default`}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c} flex items-center justify-center mb-4 border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                  <ul className="space-y-1.5">
                    {f.bullets.map(b => (
                      <li key={b} className="flex items-center gap-2 text-xs text-gray-400">
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />{b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold mb-4 uppercase tracking-wider">
              How It Works
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Live in 5 minutes. Seriously.</h2>
            <p className="text-gray-500 text-lg">Three steps. No setup calls. No onboarding videos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Zap,
                color: "blue",
                title: "Create Your Tournament",
                desc: "Pick a format (16–400 squads), choose PMGC or PMPL scoring, set your map rotation. TournaOps generates all lobbies, rounds, and matches automatically.",
                time: "Takes: 2 minutes",
              },
              {
                step: "02",
                icon: Target,
                color: "purple",
                title: "Enter Match Results",
                desc: "After each match, enter placements and kills. Points calculate instantly. Leaderboard sorts itself. Or use the demo generator to test everything first.",
                time: "Takes: 30 seconds per match",
              },
              {
                step: "03",
                icon: Radio,
                color: "green",
                title: "Stream, Share & Export",
                desc: "Paste your OBS overlay URL into OBS. Share the public tournament link. Post results to Discord. Export the final leaderboard as PNG or PDF.",
                time: "Takes: 1 click each",
              },
            ].map(s => {
              const Icon = s.icon;
              const colors: Record<string, string> = {
                blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
                purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
                green: "from-green-500/20 to-green-600/5 border-green-500/20 text-green-400",
              };
              return (
                <div key={s.step} className="relative">
                  <div className={`glass-card rounded-2xl p-6 border bg-gradient-to-br ${colors[s.color]} h-full`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[s.color]} flex items-center justify-center border`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-black text-white/10">{s.step}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span className="text-gray-600 text-xs">{s.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 px-4 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4">Organizers love it</h2>
            <p className="text-gray-500">Real feedback from real tournament organizers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 border border-white/10">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10 text-sm font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-600 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCORING SYSTEMS ──────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Official Scoring. Built In.</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              No more manually looking up PMGC point tables. Every major system is pre-loaded.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { name: "PMGC", desc: "Global Championship", sub: "1st=15pts · Kill=1pt", color: "from-yellow-500/15 to-yellow-600/5 border-yellow-500/20 text-yellow-400" },
              { name: "PMPL", desc: "Pro League South Asia", sub: "1st=10pts · WWCD+5", color: "from-blue-500/15 to-blue-600/5 border-blue-500/20 text-blue-400" },
              { name: "Community", desc: "Standard Format", sub: "1st=12pts · Kill=1pt", color: "from-green-500/15 to-green-600/5 border-green-500/20 text-green-400" },
              { name: "Kill Heavy", desc: "Action-First", sub: "1st=10pts · Kill=2pts", color: "from-red-500/15 to-red-600/5 border-red-500/20 text-red-400" },
            ].map(s => (
              <div key={s.name} className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${s.color} text-center`}>
                <div className="text-xl font-black mb-1">{s.name}</div>
                <div className="text-white/70 text-xs mb-2">{s.desc}</div>
                <div className="text-white/40 text-[10px] font-mono">{s.sub}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 text-sm">
            Plus custom scoring — set any placement points and kill multiplier you want.
          </p>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 bg-white/2">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold mb-4 uppercase tracking-wider">
              Pricing
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Start free. Scale when ready.</h2>
            <p className="text-gray-500 text-lg">No credit card required to get started.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="glass-card rounded-2xl p-8 border border-white/10">
              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Free Forever</div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-gray-600 mb-1">/month</span>
                </div>
                <p className="text-gray-600 text-sm">Perfect for community organizers and first-time events.</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  ["Up to 3 tournaments", true],
                  ["Up to 64 squads per tournament", true],
                  ["PMGC & PMPL scoring systems", true],
                  ["Live auto-updating leaderboard", true],
                  ["OBS browser source overlay", true],
                  ["Public tournament spectator page", true],
                  ["PNG & PDF leaderboard export", true],
                  ["Broadcast Studio (social cards)", true],
                  ["AI match assistant (OpsAI)", false],
                  ["Discord webhook integration", false],
                  ["Up to 400 squads", false],
                ].map(([f, included]) => (
                  <li key={String(f)} className={`flex items-center gap-3 text-sm ${included ? "text-gray-300" : "text-gray-700 line-through"}`}>
                    <Check className={`w-4 h-4 flex-shrink-0 ${included ? "text-green-400" : "text-gray-700"}`} />
                    {String(f)}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="btn-secondary w-full py-3 justify-center">
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative glass-card rounded-2xl p-8 border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Pro</div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-black text-white">$19</span>
                  <span className="text-gray-400 mb-1">/month</span>
                </div>
                <p className="text-gray-500 text-sm">For serious organizers running regular tournaments.</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free, plus:",
                  "Unlimited tournaments",
                  "Up to 400 squads per tournament",
                  "AI match assistant (OpsAI)",
                  "Discord webhook — auto-post results",
                  "Priority email support",
                  "Early access to new features",
                  "CSV bulk team import",
                  "Advanced player stats & analytics",
                ].map((f, i) => (
                  <li key={f} className={`flex items-center gap-3 text-sm ${i === 0 ? "text-blue-400 font-semibold" : "text-gray-300"}`}>
                    {i !== 0 && <Check className="w-4 h-4 flex-shrink-0 text-blue-400" />}
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="btn-primary w-full py-3 justify-center shadow-lg shadow-blue-500/25">
                Start Pro Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-center text-gray-600 text-xs mt-3">Cancel anytime. No contracts.</p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: Shield, text: "No credit card to start" },
              { icon: Clock, text: "Cancel anytime" },
              { icon: TrendingUp, text: "Upgrade or downgrade instantly" },
            ].map(t => {
              const Icon = t.icon;
              return (
                <div key={t.text} className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                  <Icon className="w-4 h-4" />
                  {t.text}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/6 to-purple-500/6" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Your next tournament deserves better.
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Stop losing time to manual work. Start looking professional on stream. Create your first tournament in 2 minutes — free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-blue-500/25">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="btn-secondary text-base px-8 py-3.5">
                  Talk to Us
                </Link>
              </div>
              <p className="text-gray-600 text-sm mt-4">Free forever. No credit card. No setup fee.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">TournaOps</span>
              </Link>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                The tournament operations platform built for PUBG Mobile & BGMI organizers.
              </p>
              <p className="text-gray-700 text-xs">© 2025 TournaOps. All rights reserved.</p>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-4">Platform</p>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><Link href="/register" className="hover:text-gray-300 transition-colors">Get Started Free</Link></li>
                <li><Link href="/login" className="hover:text-gray-300 transition-colors">Sign In</Link></li>
                <li><Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link></li>
                <li><a href="#pricing" className="hover:text-gray-300 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-4">Features</p>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-gray-300 transition-colors">Leaderboards</a></li>
                <li><a href="#features" className="hover:text-gray-300 transition-colors">OBS Overlay</a></li>
                <li><a href="#features" className="hover:text-gray-300 transition-colors">Broadcast Studio</a></li>
                <li><a href="#features" className="hover:text-gray-300 transition-colors">Discord Integration</a></li>
              </ul>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-4">Company</p>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><Link href="/contact" className="hover:text-gray-300 transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-700 text-xs">
              Built for PUBG Mobile & BGMI tournament organizers worldwide.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-700">
              <Link href="/privacy" className="hover:text-gray-500 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-500 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-gray-500 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}