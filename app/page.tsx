"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Trophy, Users, Zap, ArrowRight, Check,
  Monitor, Download, Globe, Shield,
  ChevronRight, Crosshair, BarChart3,
  MessageSquare, Sparkles, Play, Target,
  Clock, Award, X, Star
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
      setMousePos({ x: x * 20, y: y * 20 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0a0f]/90 backdrop-blur-2xl border-b border-white/10 shadow-xl" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/40 bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-110 transition-transform">
              <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight block leading-tight">TournaOps</span>
              <span className="text-[9px] text-blue-400 uppercase tracking-[0.2em]">Tournament OS</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 hidden sm:block">
              Sign In
            </Link>
            <Link href="/register" className="relative group text-sm px-5 py-2.5 rounded-xl font-semibold text-white overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
              <span className="relative flex items-center gap-1.5">Get Started<ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-6 z-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/6 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-40 left-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl animate-blob-delay" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 uppercase tracking-wider">
            Built for PUBG Mobile and BGMI organizers
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight"
            style={{ transform: `perspective(1000px) rotateX(${mousePos.y * 0.15}deg) rotateY(${mousePos.x * 0.15}deg)`, transition: "transform 0.1s ease-out" }}>
            Stop Wasting Hours
            <br />
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                on Spreadsheets.
              </span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            TournaOps handles scoring, leaderboards, OBS overlays, and team management so you can
            focus on running great PUBG Mobile tournaments.
          </p>

          <p className="text-sm text-gray-600 mb-10">
            Free to start. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="group relative overflow-hidden rounded-2xl px-8 py-4 w-full sm:w-auto">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-105 transition-transform" />
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2 text-white font-bold text-lg">
                Create Your First Tournament
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="/login" className="glass-card px-8 py-4 rounded-2xl w-full sm:w-auto border border-white/10 hover:border-white/25 transition-all">
              <span className="flex items-center justify-center gap-2 text-white font-semibold">
                Sign In
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {/* Product Screenshot Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-2xl" />
            <div className="relative glass-card rounded-2xl border border-white/15 overflow-hidden shadow-2xl"
              style={{ transform: `perspective(1500px) rotateX(${5 + mousePos.y * 0.1}deg) rotateY(${mousePos.x * 0.1}deg)`, boxShadow: "0 40px 80px -20px rgba(59,130,246,0.3)" }}>
              <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="mx-auto bg-white/8 rounded px-4 py-0.5 text-xs text-gray-500">tournaops.com/dashboard</div>
              </div>
              <div className="p-6 bg-[#0a0a0f] text-center">
                <p className="text-gray-500 text-sm">Your tournament dashboard — leaderboards, match results, team management, and more.</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/4 rounded-xl p-4 border border-white/8">
                    <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-white text-sm font-bold">Tournaments</div>
                    <div className="text-gray-600 text-xs">Create and manage</div>
                  </div>
                  <div className="bg-white/4 rounded-xl p-4 border border-white/8">
                    <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-white text-sm font-bold">Live Standings</div>
                    <div className="text-gray-600 text-xs">Auto-calculated</div>
                  </div>
                  <div className="bg-white/4 rounded-xl p-4 border border-white/8">
                    <Monitor className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-white text-sm font-bold">OBS Overlay</div>
                    <div className="text-gray-600 text-xs">One URL, ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST (Honest) ──────────────────────────────── */}
      <section className="py-10 px-6 border-y border-white/8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Built for PUBG Mobile and BGMI tournament organizers. Free to start — upgrade when you need more.
          </p>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ──────────────────────────── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Sound Familiar?</h2>
            <p className="text-gray-500 text-lg">Every tournament organizer faces these problems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-8 border border-red-500/15 bg-red-500/3">
              <h3 className="text-red-400 font-bold text-lg mb-5">Without TournaOps</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                {[
                  "Manually updating Excel after every match",
                  "Calculating placement + kill points by hand",
                  "No live leaderboard for stream viewers",
                  "Results shared via messy Discord messages",
                  "Hours spent making social media graphics",
                  "No OBS overlay for professional broadcasts",
                ].map(i => (
                  <li key={i} className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />{i}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-green-500/15 bg-green-500/3">
              <h3 className="text-green-400 font-bold text-lg mb-5">With TournaOps</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                {[
                  "Enter results once — standings update automatically",
                  "Points calculated instantly (PMGC, PMPL, or custom)",
                  "Live leaderboard auto-refreshes for viewers",
                  "Discord bot detects slot lists automatically",
                  "One-click social media cards and exports",
                  "OBS overlay ready — paste one URL",
                ].map(i => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />{i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-white/2 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">What You Get</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Everything a PUBG Mobile tournament organizer needs. Nothing you don't.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Trophy, color: "blue",
                title: "Tournament Management",
                desc: "Create tournaments for 16 to 400 squads. Automatic lobby splits, round progression, and team management.",
              },
              {
                icon: BarChart3, color: "purple",
                title: "Auto-Calculated Standings",
                desc: "Enter placements and kills. Points calculate instantly using PMGC, PMPL, or your own custom scoring system.",
              },
              {
                icon: Monitor, color: "green",
                title: "OBS Overlay",
                desc: "Copy one URL, paste into OBS. Live leaderboard on your stream. Auto-updates. No plugins needed.",
              },
              {
                icon: Sparkles, color: "pink",
                title: "Social Media Cards",
                desc: "Generate WWCD announcements, standings graphics, and MVP cards. Export as PNG for Instagram, Twitter, Discord.",
              },
              {
                icon: Users, color: "orange",
                title: "Team & Squad Management",
                desc: "Upload team logos, set player IGNs and roles. Import teams from Discord slot lists or CSV files.",
              },
              {
                icon: MessageSquare, color: "indigo",
                title: "Discord Bot",
                desc: "Post a slot list in Discord — the bot detects it automatically. Use slash commands to show live standings.",
              },
            ].map((f) => {
              const Icon = f.icon;
              const colorMap: Record<string, string> = {
                blue: "from-blue-500/15 to-transparent border-blue-500/20 text-blue-400",
                purple: "from-purple-500/15 to-transparent border-purple-500/20 text-purple-400",
                green: "from-green-500/15 to-transparent border-green-500/20 text-green-400",
                pink: "from-pink-500/15 to-transparent border-pink-500/20 text-pink-400",
                orange: "from-orange-500/15 to-transparent border-orange-500/20 text-orange-400",
                indigo: "from-indigo-500/15 to-transparent border-indigo-500/20 text-indigo-400",
              };
              return (
                <div key={f.title} className={`glass-card rounded-2xl p-6 border bg-gradient-to-br ${colorMap[f.color]} hover:scale-[1.01] transition-transform`}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[f.color]} flex items-center justify-center mb-4 border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">Three steps. Five minutes. No technical knowledge needed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01", icon: Zap, color: "blue",
                title: "Create Your Tournament",
                desc: "Pick your format (16-400 squads), choose a scoring system, set your map rotation. The wizard handles the rest.",
                time: "2 minutes",
              },
              {
                step: "02", icon: Target, color: "purple",
                title: "Enter Match Results",
                desc: "After each match, enter placements and kills. Points calculate automatically. Leaderboard updates instantly.",
                time: "30 seconds per match",
              },
              {
                step: "03", icon: Globe, color: "green",
                title: "Share and Stream",
                desc: "Copy your OBS overlay URL. Share the public tournament link. Export results as PNG or PDF.",
                time: "1 click each",
              },
            ].map(s => {
              const Icon = s.icon;
              const colors: Record<string, string> = {
                blue: "from-blue-500/15 to-blue-600/5 border-blue-500/20 text-blue-400",
                purple: "from-purple-500/15 to-purple-600/5 border-purple-500/20 text-purple-400",
                green: "from-green-500/15 to-green-600/5 border-green-500/20 text-green-400",
              };
              return (
                <div key={s.step} className={`glass-card rounded-2xl p-6 border bg-gradient-to-br ${colors[s.color]}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[s.color]} flex items-center justify-center border`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-4xl font-black text-white/5">{s.step}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{s.desc}</p>
                  <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                    <Clock className="w-3 h-3" />{s.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING (Honest) ────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-white/2 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when your tournaments grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="glass-card rounded-3xl p-8 border border-white/10">
              <div className="mb-6">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Free</div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-gray-600 mb-1">/month</span>
                </div>
                <p className="text-gray-500 text-sm">For community scrims and small events.</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Up to 3 tournaments",
                  "Up to 64 squads per tournament",
                  "PMGC and PMPL scoring presets",
                  "Live auto-updating leaderboard",
                  "OBS browser source overlay",
                  "Public tournament page",
                  "PNG and PDF leaderboard export",
                  "Social media card generator",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />{f}
                  </li>
                ))}
                {[
                  "Unlimited tournaments",
                  "Up to 400 squads",
                  "Discord bot integration",
                  "AI features",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600 line-through">
                    <X className="w-4 h-4 text-gray-700 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="block w-full glass-card border border-white/10 hover:border-white/25 text-white font-semibold text-center py-3 rounded-xl transition-all">
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative glass-card rounded-3xl p-8 border border-blue-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase">
                Recommended
              </div>

              <div className="relative">
                <div className="mb-6">
                  <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Pro</div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black text-white">$19</span>
                    <span className="text-gray-400 mb-1">/month</span>
                  </div>
                  <p className="text-gray-400 text-sm">For serious organizers running regular events.</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    { text: "Everything in Free, plus:", highlight: true },
                    "Unlimited tournaments",
                    "Up to 400 squads per tournament",
                    "Discord bot (slash commands + auto-detect)",
                    "AI-powered features (screenshot import, summaries)",
                    "Custom branding (white label)",
                    "Multi-stage tournaments (Qualifier to Grand Final)",
                    "Advanced analytics",
                    "Priority support",
                  ].map((item, i) => {
                    const isObj = typeof item === "object";
                    const text = isObj ? item.text : item;
                    const highlight = isObj && item.highlight;
                    return (
                      <li key={text} className={`flex items-center gap-3 text-sm ${highlight ? "text-blue-400 font-bold" : "text-gray-300"}`}>
                        {!highlight && <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                        {text}
                      </li>
                    );
                  })}
                </ul>

                <Link href="/register" className="relative block w-full text-white font-bold text-center py-3 rounded-xl overflow-hidden group">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-105 transition-transform" />
                  <span className="relative flex items-center justify-center gap-2">
                    Start Pro Free Trial<ArrowRight className="w-4 h-4" />
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
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/6 to-purple-500/6" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
                <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-4xl font-black text-white mb-4">
                Ready to run better tournaments?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Stop losing time to manual work. Create your first tournament in under 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="relative group overflow-hidden rounded-2xl px-8 py-4">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-105 transition-transform" />
                  <span className="relative flex items-center gap-2 text-white font-bold text-base">
                    Create Free Account<ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
                <Link href="/contact" className="glass-card px-8 py-4 rounded-2xl border border-white/10 hover:border-white/25 text-white font-semibold transition-all">
                  Contact Us
                </Link>
              </div>
              <p className="text-gray-600 text-sm mt-4">Free plan includes 3 tournaments, 64 squads. No credit card needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-white">TournaOps</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-3">
              Tournament management platform for PUBG Mobile and BGMI organizers.
            </p>
            <p className="text-gray-700 text-xs">© 2025 TournaOps. All rights reserved.</p>
          </div>

          <div>
            <p className="text-white font-bold text-sm mb-4">Platform</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
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
              <li>Discord Bot</li>
              <li>Social Media Cards</li>
            </ul>
          </div>

          <div>
            <p className="text-white font-bold text-sm mb-4">Company</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}