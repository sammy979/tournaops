"use client";

import { useState } from "react";
import Link from "next/link";
import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";
import {
  Trophy, Zap, Users, BarChart2, Globe, Shield,
  ArrowRight, CheckCircle2, Star, Play, ChevronDown,
  Layers, Radio, Bot, Sparkles, Clock, MessageSquare,
  Map, TrendingUp,
} from "lucide-react";

// ─── Design tokens (inline for landing page specifics) ────────────────────────
const BG       = "#07090f";
const SURFACE  = "#0d0f18";
const ELEVATED = "#111320";
const BORDER   = "border-white/[0.07]";

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Trophy,       title: "Tournament Management",  desc: "Full bracket engine — single/double elimination, round robin, Swiss. Handle 4 to 128 teams.", color: "text-amber-400",  bg: "bg-amber-500/10  border-amber-500/20"  },
  { icon: Zap,          title: "Live Match Scoring",      desc: "Real-time results with screenshot verification, dispute handling, and instant standings.", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: Radio,        title: "Broadcast Control",       desc: "OBS scene switcher, overlay manager, stream key vault, and live viewer analytics.",         color: "text-rose-400",   bg: "bg-rose-500/10   border-rose-500/20"   },
  { icon: MessageSquare,title: "Discord Integration",     desc: "Auto-post match results, check-in pings, standings, and custom announcements to any channel.",color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { icon: Bot,          title: "AI Tools",                desc: "AI bracket generation, text/screenshot parsing, schedule optimization, and result prediction.",color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20"},
  { icon: BarChart2,    title: "Deep Analytics",          desc: "Win rates, map stats, player performance metrics, and round-by-round progression tracking.",  color: "text-blue-400",   bg: "bg-blue-500/10   border-blue-500/20"   },
  { icon: Users,        title: "Team Management",         desc: "Public registration, invite codes, roster builder, automated check-in, and bulk CSV import.", color: "text-pink-400",   bg: "bg-pink-500/10   border-pink-500/20"   },
  { icon: Globe,        title: "Public Pages",            desc: "Shareable tournament pages with live brackets, standings, results, and spectator views.",     color: "text-cyan-400",   bg: "bg-cyan-500/10   border-cyan-500/20"   },
  { icon: Layers,       title: "Multi-Stage Events",      desc: "Group stages, quarterfinals, semifinals, and grand finals all managed from one dashboard.",   color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
];

const PLANS = [
  {
    name: "Free", monthly: 0, annual: 0,
    desc: "Perfect for small communities.",
    badge: null, badgeCls: "",
    cta: "Get Started Free", ctaCls: "bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-white",
    border: "border-white/[0.08]", header: "bg-white/[0.02]",
    features: ["Up to 3 tournaments","8 teams per tournament","Basic brackets","Public tournament page","Discord notifications","Community support"],
    locked:   ["AI tools","Broadcast control","Advanced analytics","Custom branding","Unlimited tournaments"],
  },
  {
    name: "Pro", monthly: 19.99, annual: 14.99,
    desc: "For serious organizers.",
    badge: "Most Popular", badgeCls: "bg-violet-600 text-white",
    cta: "Start 14-Day Trial", ctaCls: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40",
    border: "border-violet-500/40", header: "bg-gradient-to-br from-violet-600/20 to-indigo-600/20",
    features: ["Unlimited tournaments","Up to 64 teams","All bracket formats","Custom branding & overlays","Discord bot","AI bracket generation","Broadcast + OBS control","Advanced analytics","Priority support"],
    locked: [],
  },
  {
    name: "Pro+", monthly: 49.99, annual: 37.99,
    desc: "For leagues and organizations.",
    badge: "Enterprise", badgeCls: "bg-amber-500 text-black",
    cta: "Contact Sales", ctaCls: "bg-amber-500 hover:bg-amber-400 text-black font-bold",
    border: "border-amber-500/40", header: "bg-gradient-to-br from-amber-600/20 to-orange-600/20",
    features: ["Everything in Pro","Unlimited team size","White-label solution","Custom domain","Full API access","Dedicated account manager","SLA guarantee","Invoice billing","24/7 priority support"],
    locked: [],
  },
];

const TESTIMONIALS = [
  { name: "Marcus T.", role: "NA Valorant Circuit", text: "TournaOps cut our admin time in half. The Discord automation alone saves hours every event.", stars: 5 },
  { name: "Sarah K.",  role: "EU Esports League",   text: "We ran a 128-team tournament with zero issues. The analytics helped us improve future events.", stars: 5 },
  { name: "Jordan R.", role: "Weekly Fight Night",   text: "Started free, upgraded to Pro in a week. The AI scheduling saved me so much time.", stars: 5 },
];

const STATS = [
  { v: "50,000+", l: "Matches Played"   },
  { v: "12,000+", l: "Teams Registered" },
  { v: "3,200+",  l: "Tournaments Run"  },
  { v: "99.9%",   l: "Platform Uptime"  },
];

const GAMES = ["Valorant","CS2","League of Legends","Rocket League","Apex Legends","Fortnite","Overwatch 2","PUBG","Rainbow Six","Dota 2"];

// ─── Section components ───────────────────────────────────────────────────────
function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white/50 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
      <Icon className="w-3.5 h-3.5" />
      {text}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, color: "#fff" }}>
      <PublicNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center overflow-hidden pt-0 pb-24 min-h-[88vh]">
        {/* Radial glow bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(79,70,229,0.10) 0%, transparent 70%)" }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm font-medium mb-8"
            style={{ background: "rgba(124,58,237,0.12)", borderColor: "rgba(124,58,237,0.25)", color: "#a78bfa" }}>
            <Sparkles className="w-3.5 h-3.5" />
            Now with AI-powered bracket generation
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight">
            Run{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Flawless
            </span>
            <br />
            Esports Tournaments
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform for esports organizers — brackets, live scoring,
            Discord bots, OBS overlays, and AI automation all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-105"
              style={{ background: "#7C3AED", boxShadow: "0 8px 32px rgba(124,58,237,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#6D28D9")}
              onMouseLeave={e => (e.currentTarget.style.background = "#7C3AED")}>
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/tournaments"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white border transition-colors hover:bg-white/[0.06]"
              style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
              <Play className="w-4 h-4" /> View Live Tournaments
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
            {["No credit card required","Free forever plan","Setup in 5 minutes"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(s => (
              <div key={s.l}>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{s.v}</p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Games ticker ─────────────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "28px 0" }}>
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.2)" }}>
          Supports all major titles
        </p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-6 justify-center flex-wrap">
          {GAMES.map(game => (
            <div key={game}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium cursor-default transition-all hover:text-white/70"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
              {game}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel icon={Layers} text="Everything you need" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Built for{" "}
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Serious Organizers
              </span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
              Every tool you need to run professional esports events from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title}
                className="group p-6 rounded-2xl border transition-all hover:scale-[1.02] cursor-default"
                style={{ background: SURFACE, borderColor: "rgba(255,255,255,0.07)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${f.bg} group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel icon={Trophy} text="Pricing" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Simple,{" "}
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Transparent
              </span>{" "}
              Pricing
            </h2>
            <p className="text-lg mb-7" style={{ color: "rgba(255,255,255,0.4)" }}>Start free. Scale when you're ready.</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => setAnnual(false)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: !annual ? "rgba(255,255,255,0.08)" : "transparent", color: !annual ? "#fff" : "rgba(255,255,255,0.4)" }}>
                Monthly
              </button>
              <button onClick={() => setAnnual(true)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                style={{ background: annual ? "#7C3AED" : "transparent", color: annual ? "#fff" : "rgba(255,255,255,0.4)" }}>
                Annual
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>-25%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map(plan => (
              <div key={plan.name}
                className={`border-2 rounded-2xl overflow-hidden relative transition-all hover:scale-[1.02] ${plan.border}`}
                style={{ background: SURFACE }}>
                {plan.badge && (
                  <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${plan.badgeCls}`}>
                    {plan.badge}
                  </div>
                )}
                <div className={`p-6 ${plan.header}`}>
                  <h3 className="text-white font-black text-xl mb-1">{plan.name}</h3>
                  <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>{plan.desc}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">
                      {plan.monthly === 0 ? "Free" : `$${(annual ? plan.annual : plan.monthly).toFixed(2)}`}
                    </span>
                    {plan.monthly > 0 && <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>/month</span>}
                  </div>
                  {annual && plan.monthly > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">Save ${((plan.monthly - plan.annual) * 12).toFixed(0)}/year</p>
                  )}
                </div>
                <div className="p-5" style={{ background: ELEVATED }}>
                  <Link href={plan.name === "Pro+" ? "/contact" : "/register"}
                    className={`block w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all mb-5 ${plan.ctaCls}`}>
                    {plan.cta}
                  </Link>
                  <div className="space-y-2.5">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{f}</span>
                      </div>
                    ))}
                    {plan.locked.map(f => (
                      <div key={f} className="flex items-center gap-2.5 opacity-30">
                        <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" />
                        <span className="text-sm line-through" style={{ color: "rgba(255,255,255,0.4)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
            All plans include 14-day free trial · No credit card required to start
          </p>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-3">Trusted by Organizers</h2>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Join thousands of tournament organizers worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 rounded-2xl border transition-all"
                style={{ background: SURFACE, borderColor: "rgba(255,255,255,0.07)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-violet-300 flex-shrink-0"
                    style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.25)" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden text-center p-14"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(17,19,32,1) 60%, rgba(79,70,229,0.20) 100%)", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
              style={{ background: "rgba(124,58,237,0.15)" }} />
            <div className="relative">
              <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Ready to Run Your<br />
                <span style={{ background: "linear-gradient(135deg, #a78bfa, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Best Tournament Yet?
                </span>
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
                Join 12,000+ teams and thousands of organizers who trust TournaOps.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg text-white transition-all hover:scale-105"
                  style={{ background: "#7C3AED", boxShadow: "0 8px 32px rgba(124,58,237,0.35)" }}>
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/dashboard/tournaments/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-lg text-white border transition-colors hover:bg-white/[0.06]"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
                  Create Tournament
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}