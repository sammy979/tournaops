"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Trophy, Users, Zap, ArrowRight, Check,
  Monitor, Download, Globe, Shield, Star,
  ChevronRight, Crosshair, BarChart3, Flame,
  MessageSquare, Sparkles, Play, Target,
  Clock, Award, TrendingUp, Radio
} from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x: x * 30, y: y * 30 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── ANIMATED BACKGROUND ORBS ────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-blob-delay" />
        <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] bg-pink-500/8 rounded-full blur-3xl animate-blob-slow" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }} />
      </div>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-blue-500/10" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-blue-500/40 bg-gradient-to-br from-blue-500 to-purple-600 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">TournaOps</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all" />
            </a>
            <a href="#how" className="hover:text-white transition-colors relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all" />
            </a>
            <a href="#pricing" className="hover:text-white transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 hidden sm:block">
              Sign In
            </Link>
            <Link href="/register" className="relative group text-sm px-5 py-2.5 rounded-xl font-semibold text-white overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500 transition-all" />
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              <span className="relative flex items-center gap-1.5">Start Free<ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-6 z-10">
        <div className="relative max-w-6xl mx-auto text-center">

          {/* Badge with 3D effect */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-white/10 text-blue-400 text-xs font-semibold mb-8 uppercase tracking-wider backdrop-blur-xl shadow-2xl shadow-blue-500/20"
            style={{
              transform: `perspective(1000px) rotateX(${mousePos.y * 0.3}deg) rotateY(${mousePos.x * 0.3}deg)`,
            }}>
            <Radio className="w-3 h-3 animate-pulse" />
            Built exclusively for PUBG Mobile & BGMI
          </div>

          {/* Headline with 3D perspective */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 tracking-tight"
            style={{
              transform: `perspective(1000px) rotateX(${mousePos.y * 0.2}deg) rotateY(${mousePos.x * 0.2}deg)`,
              transition: "transform 0.1s ease-out",
            }}>
            Stop Managing Chaos.
            <br />
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Start Winning Games.
              </span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Run professional PUBG Mobile tournaments in minutes. Live leaderboards. OBS overlays.
            Real-time Discord integration. All in one platform.
          </p>

          <p className="text-sm text-gray-600 mb-10">
            Used by BGMI organizers across India, Nepal, Middle East & Southeast Asia
          </p>

          {/* CTAs with 3D hover */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="group relative overflow-hidden rounded-2xl px-8 py-4 w-full sm:w-auto">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-105 transition-transform" />
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2 text-white font-bold text-lg">
                Create Your First Tournament Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="/login" className="glass-card px-8 py-4 rounded-2xl w-full sm:w-auto border border-white/10 hover:border-white/25 transition-all group">
              <span className="flex items-center justify-center gap-2 text-white font-semibold">
                Sign In
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Stats with 3D depth */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-20">
            {[
              { value: "400+", label: "Max Squads" },
              { value: "5", label: "Scoring Systems" },
              { value: "Free", label: "To Start" },
              { value: "24/7", label: "Live Bot" },
            ].map((s, i) => (
              <div key={s.label} className="text-center group" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 group-hover:from-blue-300 group-hover:to-purple-400 transition-all">
                  {s.value}
                </div>
                <div className="text-xs text-gray-600 mt-1 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          {/* 3D Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto perspective-2000">
            {/* Multiple layer glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent rounded-3xl blur-2xl" />

            {/* Main card with 3D tilt */}
            <div
              className="relative glass-card rounded-2xl border border-white/15 overflow-hidden shadow-2xl transition-transform duration-100"
              style={{
                transform: `perspective(1500px) rotateX(${8 + mousePos.y * 0.1}deg) rotateY(${mousePos.x * 0.15}deg)`,
                boxShadow: "0 60px 100px -20px rgba(59,130,246,0.3), 0 40px 60px -30px rgba(139,92,246,0.4)",
              }}
            >
              {/* Browser bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-gradient-to-r from-white/8 to-white/4 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/60 shadow-lg" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60 shadow-lg" />
                <div className="w-3 h-3 rounded-full bg-green-500/60 shadow-lg" />
                <div className="flex-1 mx-4 flex justify-center">
                  <div className="bg-white/8 rounded-lg px-4 py-1 text-xs text-gray-400 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    tournaops.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 bg-[#0a0a0f]">
                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { l: "Tournaments", v: "12", c: "blue" },
                    { l: "Live Now", v: "3", c: "green" },
                    { l: "Total Squads", v: "384", c: "purple" },
                    { l: "Matches Done", v: "96", c: "orange" },
                  ].map((s, i) => (
                    <div key={s.l}
                      className="relative overflow-hidden bg-gradient-to-br from-white/6 to-white/2 rounded-xl p-3 border border-white/8 hover:border-white/15 transition-all"
                      style={{ animationDelay: `${i * 100}ms` }}>
                      <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-${s.c}-500/10 blur-2xl`} />
                      <div className={`relative text-2xl font-black text-${s.c}-400`}>{s.v}</div>
                      <div className="relative text-gray-600 text-[10px] mt-0.5 uppercase tracking-wider">{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Leaderboard */}
                <div className="bg-white/3 rounded-xl border border-white/8 overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-white/5 to-transparent border-b border-white/8">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Trophy className="w-3 h-3 text-yellow-400" />Live Standings
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-mono">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-500/50" />
                      LIVE
                    </span>
                  </div>
                  {[
                    { r: "🥇", n: "Team Alpha", k: 24, p: 87, c: "text-yellow-400" },
                    { r: "🥈", n: "Nova Esports", k: 19, p: 74, c: "text-gray-300" },
                    { r: "🥉", n: "Storm Riders", k: 21, p: 68, c: "text-amber-600" },
                    { r: "#4", n: "Dark Knights", k: 16, p: 61, c: "text-gray-500" },
                    { r: "#5", n: "Phoenix Squad", k: 14, p: 55, c: "text-gray-500" },
                  ].map((row) => (
                    <div key={row.n} className="flex items-center px-4 py-2.5 border-b border-white/4 last:border-0 hover:bg-white/3 transition-colors">
                      <span className={`w-8 text-sm font-bold ${row.c}`}>{row.r}</span>
                      <span className="flex-1 text-sm text-gray-200 font-medium">{row.n}</span>
                      <span className="text-orange-400 text-xs font-mono mr-6">{row.k}K</span>
                      <span className={`font-bold font-mono text-sm ${row.c}`}>{row.p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badges around dashboard */}
            <div className="absolute -top-6 -left-6 glass-card rounded-xl px-4 py-3 border border-white/15 shadow-2xl animate-float">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-white text-xs font-bold">Match Complete</div>
                  <div className="text-gray-500 text-[10px]">+15 points to Team Alpha</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 glass-card rounded-xl px-4 py-3 border border-white/15 shadow-2xl animate-float-delay">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-white text-xs font-bold">Discord Bot</div>
                  <div className="text-gray-500 text-[10px]">Auto-detected 32 teams</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-white/8 bg-gradient-to-b from-transparent via-white/2 to-transparent relative z-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 text-xs uppercase tracking-widest font-bold mb-10">
            Trusted by organizers worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { count: "2,400+", label: "Tournaments Created" },
              { count: "38,000+", label: "Squads Registered" },
              { count: "120,000+", label: "Matches Processed" },
              { count: "94%", label: "Organizer Satisfaction" },
            ].map((s) => (
              <div key={s.label} className="text-center group">
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-1 group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                  {s.count}
                </div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES with 3D cards ──────────────────────── */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-white/10 text-blue-400 text-xs font-bold mb-4 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />Features
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Everything you need.<br/>Nothing you don't.</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Built specifically for PUBG Mobile & BGMI. Not adapted from a generic tool.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Trophy, color: "blue", title: "Pro Tournament Structure", desc: "Build 16 to 400 squads. Auto lobby splits. Multi-round progression. No spreadsheets ever again." },
              { icon: BarChart3, color: "purple", title: "Official Scoring Built In", desc: "PMGC, PMPL, Kill Heavy, custom. Points calculated instantly. Zero manual math." },
              { icon: Monitor, color: "green", title: "OBS Overlay Ready", desc: "One URL. Paste into OBS. Live leaderboard on stream. Auto-updates every 10 seconds." },
              { icon: Sparkles, color: "pink", title: "Broadcast Studio", desc: "5 card templates. 5 themes. Instant Instagram, Twitter, Story graphics. One-click PNG." },
              { icon: Users, color: "orange", title: "Squad Management", desc: "Team logos, player photos, IGN, roles. Bulk CSV import. Full roster control." },
              { icon: MessageSquare, color: "indigo", title: "Discord Bot Live", desc: "Post slot list in Discord. Bot detects it. One click to import into TournaOps. Real-time." },
            ].map((f, i) => {
              const Icon = f.icon;
              const bgColors: Record<string, string> = {
                blue: "from-blue-500/10 to-transparent",
                purple: "from-purple-500/10 to-transparent",
                green: "from-green-500/10 to-transparent",
                pink: "from-pink-500/10 to-transparent",
                orange: "from-orange-500/10 to-transparent",
                indigo: "from-indigo-500/10 to-transparent",
              };
              const iconColors: Record<string, string> = {
                blue: "text-blue-400 bg-blue-500/15 border-blue-500/20",
                purple: "text-purple-400 bg-purple-500/15 border-purple-500/20",
                green: "text-green-400 bg-green-500/15 border-green-500/20",
                pink: "text-pink-400 bg-pink-500/15 border-pink-500/20",
                orange: "text-orange-400 bg-orange-500/15 border-orange-500/20",
                indigo: "text-indigo-400 bg-indigo-500/15 border-indigo-500/20",
              };
              return (
                <div key={f.title} className={`relative group glass-card rounded-2xl p-6 border border-white/10 hover:border-white/25 transition-all overflow-hidden bg-gradient-to-br ${bgColors[f.color]}`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-${f.color}-500/20`} />
                  </div>
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${iconColors[f.color]} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS 3D ─────────────────────────────── */}
      <section id="how" className="py-24 px-6 bg-gradient-to-b from-transparent via-white/2 to-transparent relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-white/10 text-purple-400 text-xs font-bold mb-4 uppercase tracking-widest">
              <Play className="w-3 h-3" />How It Works
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Live in 5 minutes.</h2>
            <p className="text-gray-500 text-lg">Three steps. No calls. No videos to watch.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {[
              { step: "01", icon: Zap, color: "blue", title: "Create Tournament", desc: "Choose format (16-400 squads), scoring, maps. Generated instantly." },
              { step: "02", icon: Target, color: "purple", title: "Enter Results", desc: "After each match, enter placements + kills. Points calculate automatically." },
              { step: "03", icon: Radio, color: "green", title: "Stream & Share", desc: "OBS overlay ready. Public link to share. Export PNG cards for social." },
            ].map((s, idx) => {
              const Icon = s.icon;
              const colors: Record<string, string> = {
                blue: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30",
                purple: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30",
                green: "from-green-500/20 to-green-600/5 text-green-400 border-green-500/30",
              };
              return (
                <div key={s.step} className="relative group">
                  <div className={`glass-card rounded-2xl p-8 border bg-gradient-to-br ${colors[s.color]} hover:scale-[1.02] transition-all shadow-2xl`}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[s.color]} flex items-center justify-center border`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-5xl font-black text-white/5">{s.step}</span>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-3">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING 3D ──────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-white/10 text-green-400 text-xs font-bold mb-4 uppercase tracking-widest">
              <Award className="w-3 h-3" />Pricing
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Simple. Honest.</h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="relative glass-card rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all">
              <div className="mb-6">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Free Forever</div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-6xl font-black text-white">$0</span>
                  <span className="text-gray-600 mb-2">/month</span>
                </div>
                <p className="text-gray-500 text-sm">Perfect for community events.</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Up to 3 tournaments",
                  "64 squads per tournament",
                  "PMGC & PMPL scoring",
                  "Live leaderboard",
                  "OBS overlay",
                  "Public tournament page",
                  "PNG/PDF export",
                  "Broadcast Studio",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="block w-full glass-card border border-white/10 hover:border-white/25 text-white font-semibold text-center py-3 rounded-xl transition-all">
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative glass-card rounded-3xl p-8 border border-blue-500/30 overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-wider">
                Popular
              </div>

              <div className="relative">
                <div className="mb-6">
                  <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Pro</div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-300">$19</span>
                    <span className="text-gray-400 mb-2">/month</span>
                  </div>
                  <p className="text-gray-400 text-sm">For serious organizers.</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    { text: "Everything in Free, plus:", highlight: true },
                    "Unlimited tournaments",
                    "400 squads per tournament",
                    "OpsAI assistant",
                    "Discord bot integration",
                    "Custom branding",
                    "Priority support",
                    "Advanced analytics",
                    "CSV bulk import",
                  ].map((item, i) => {
                    const isObj = typeof item === "object";
                    const text = isObj ? item.text : item;
                    const highlight = isObj && item.highlight;
                    return (
                      <li key={text} className={`flex items-center gap-3 text-sm ${highlight ? "text-blue-400 font-bold" : "text-gray-300"}`}>
                        {!highlight && (
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-blue-400" />
                          </div>
                        )}
                        {text}
                      </li>
                    );
                  })}
                </ul>

                <Link href="/register" className="relative group/btn block w-full text-white font-bold text-center py-3 rounded-xl overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover/btn:scale-105 transition-transform" />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-40 group-hover/btn:opacity-60 transition-opacity" />
                  <span className="relative flex items-center justify-center gap-2">
                    Start Pro Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>

                <p className="text-center text-gray-500 text-xs mt-3">Cancel anytime. No contracts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative glass-card rounded-[2rem] p-12 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Your next tournament<br/>deserves better.
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Stop losing hours to Excel. Start looking professional. Free forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="relative group overflow-hidden rounded-2xl px-8 py-4">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-105 transition-transform" />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
                  <span className="relative flex items-center gap-2 text-white font-bold text-base">
                    Create Free Account<ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
                <Link href="/contact" className="glass-card px-8 py-4 rounded-2xl border border-white/10 hover:border-white/25 text-white font-semibold transition-all">
                  Talk to Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-blue-500/30 bg-gradient-to-br from-blue-500 to-purple-600">
                <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <span className="font-bold text-white">TournaOps</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              PUBG Mobile & BGMI tournament platform.
            </p>
            <p className="text-gray-700 text-xs">© 2025 TournaOps</p>
          </div>

          <div>
            <p className="text-white font-bold text-sm mb-4">Platform</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <p className="text-white font-bold text-sm mb-4">Features</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Live Leaderboards</li>
              <li>OBS Overlay</li>
              <li>Broadcast Studio</li>
              <li>Discord Bot</li>
            </ul>
          </div>

          <div>
            <p className="text-white font-bold text-sm mb-4">Company</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}