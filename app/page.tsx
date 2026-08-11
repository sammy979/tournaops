"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Trophy,
  Zap,
  Users,
  BarChart2,
  Globe,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
  Play,
  ChevronDown,
  MessageSquare,
  Layers,
  Radio,
  Bot,
  Sparkles,
  Clock,
  TrendingUp,
  Medal,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Trophy,
    title: "Tournament Management",
    description: "Create and manage tournaments with double-elimination, round-robin, or Swiss formats. Full bracket engine included.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Zap,
    title: "Live Match Scoring",
    description: "Real-time match results with screenshot verification, dispute handling, and instant standings updates.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: Radio,
    title: "Broadcast Control",
    description: "Built-in OBS scene switcher, overlay management, and live stream integration for professional broadcasts.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: MessageSquare,
    title: "Discord Integration",
    description: "Automated match announcements, check-in notifications, and standings updates posted directly to your server.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: Bot,
    title: "AI-Powered Tools",
    description: "AI bracket generation, automated match scheduling, and intelligent insights powered by advanced language models.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: BarChart2,
    title: "Deep Analytics",
    description: "Win rates, map statistics, player performance metrics, and tournament progression tracking in real time.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Users,
    title: "Team Registration",
    description: "Public registration pages, invite codes, roster management, and automated check-in systems.",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
  {
    icon: Globe,
    title: "Public Bracket Pages",
    description: "Shareable public tournament pages with live brackets, standings, and results accessible to all spectators.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Layers,
    title: "Multi-Stage Support",
    description: "Run complex tournaments with group stages, playoffs, and grand finals all managed from a single dashboard.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for small communities and one-off events.",
    color: "border-white/[0.08]",
    headerBg: "bg-white/[0.02]",
    cta: "Get Started Free",
    ctaStyle: "bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.12] text-white",
    features: [
      "Up to 3 tournaments",
      "Up to 8 teams per tournament",
      "Basic bracket formats",
      "Public tournament page",
      "Discord notifications",
      "Community support",
    ],
    missing: ["AI tools", "Broadcast control", "Advanced analytics", "Priority support"],
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "per month",
    description: "For serious organizers running regular competitions.",
    color: "border-violet-500/40",
    headerBg: "bg-gradient-to-br from-violet-600/20 to-indigo-600/20",
    cta: "Start Pro Trial",
    ctaStyle: "bg-violet-600 hover:bg-violet-500 text-white",
    badge: "Most Popular",
    features: [
      "Unlimited tournaments",
      "Up to 64 teams per tournament",
      "All bracket formats",
      "Custom branding & overlays",
      "Discord bot integration",
      "AI bracket generation",
      "Live broadcast control",
      "Advanced analytics",
      "Priority support",
    ],
    missing: [],
  },
  {
    name: "Pro+",
    price: "$49.99",
    period: "per month",
    description: "For leagues, organizations, and large-scale events.",
    color: "border-amber-500/40",
    headerBg: "bg-gradient-to-br from-amber-600/20 to-orange-600/20",
    cta: "Contact Sales",
    ctaStyle: "bg-amber-500 hover:bg-amber-400 text-black font-bold",
    features: [
      "Everything in Pro",
      "Unlimited team size",
      "White-label solution",
      "Custom domain support",
      "API access",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
      "Admin panel access",
    ],
    missing: [],
  },
];

const TESTIMONIALS = [
  {
    name: "Marcus T.",
    role: "Tournament Organizer",
    org: "NA Valorant Circuit",
    text: "TournaOps cut our admin time in half. The Discord automation alone saves us hours every event. The broadcast tools are genuinely professional-grade.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    role: "League Commissioner",
    org: "EU Esports League",
    text: "We ran a 128-team tournament with zero issues. The bracket engine handled everything perfectly and the analytics helped us improve future events.",
    rating: 5,
  },
  {
    name: "Jordan R.",
    role: "Community Manager",
    org: "Weekly Fight Night",
    text: "Started on Free, upgraded to Pro within a week. The AI scheduling saved me so much time. My players love the public bracket page.",
    rating: 5,
  },
];

const STATS = [
  { value: "50,000+", label: "Matches Played"    },
  { value: "12,000+", label: "Teams Registered"  },
  { value: "3,200+",  label: "Tournaments Run"   },
  { value: "99.9%",   label: "Platform Uptime"   },
];

const GAMES = ["Valorant", "CS2", "League of Legends", "Rocket League", "Apex Legends", "Fortnite", "Overwatch 2", "PUBG"];

// ─── Sub-components ───────────────────────────────────────────────────────────
function NavBar() {
  const router  = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#060810]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-white font-black text-xl tracking-tight">
            Tourna<span className="text-violet-400">Ops</span>
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
            <Link href="/tournaments" className="hover:text-white transition-colors">Tournaments</Link>
            <Link href="/rankings"    className="hover:text-white transition-colors">Rankings</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/login")}
            className="text-white/50 hover:text-white text-sm transition-colors hidden sm:block">
            Sign In
          </button>
          <button onClick={() => router.push("/register")}
            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-[#060810] to-indigo-950/30" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Now with AI-powered bracket generation
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight">
          Run{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Flawless
          </span>
          <br />
          Esports Tournaments
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one tournament platform for esports organizers. Brackets, scoring,
          Discord bots, live broadcast tools, and AI-powered automation — all in one place.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button onClick={() => router.push("/register")}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/30">
            Start Free <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={() => router.push("/tournaments")}
            className="flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.12] text-white px-8 py-4 rounded-2xl text-base font-semibold transition-colors">
            <Play className="w-5 h-5" /> View Live Tournaments
          </button>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-white/30">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free forever plan
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Setup in 5 minutes
          </span>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 text-white/20" />
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-white/40 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GamesSection() {
  return (
    <div className="py-8 overflow-hidden border-b border-white/[0.04]">
      <p className="text-center text-white/25 text-xs font-semibold uppercase tracking-widest mb-6">
        Supports all major titles
      </p>
      <div className="flex gap-6 overflow-x-auto scrollbar-hide px-6 justify-center flex-wrap">
        {GAMES.map((game) => (
          <div key={game} className="flex-shrink-0 bg-white/[0.03] border border-white/[0.06] text-white/40 text-sm font-medium px-4 py-2 rounded-xl hover:border-white/[0.12] hover:text-white/60 transition-all cursor-default">
            {game}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white/50 px-4 py-1.5 rounded-full text-sm mb-4">
            <Layers className="w-3.5 h-3.5" /> Everything you need
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Serious Organizers
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Every tool you need to run professional esports events — from registration to the championship ceremony.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#0a0c12] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] hover:bg-[#0d0f16] transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${feature.bg} group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-violet-950/60 via-[#0a0c12] to-indigo-950/40 border border-violet-500/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="relative text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/25 text-violet-300 px-3 py-1 rounded-full text-xs font-semibold mb-6 uppercase tracking-wide">
              <Zap className="w-3 h-3" /> Live Platform Preview
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              See TournaOps in Action
            </h2>
            <p className="text-white/50 mb-8">
              Watch a live tournament unfold with real-time bracket updates, Discord notifications, and broadcast overlays working together seamlessly.
            </p>

            {/* Mock dashboard widgets */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Live Matches",  value: "4",     color: "text-amber-400",    bg: "bg-amber-500/10 border-amber-500/20"   },
                { label: "Teams Online",  value: "28",    color: "text-emerald-400",  bg: "bg-emerald-500/10 border-emerald-500/20"},
                { label: "Viewers",       value: "1.2k",  color: "text-violet-400",   bg: "bg-violet-500/10 border-violet-500/20" },
              ].map(w => (
                <div key={w.label} className={`border rounded-xl p-4 ${w.bg}`}>
                  <p className={`text-2xl font-black ${w.color}`}>{w.value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{w.label}</p>
                </div>
              ))}
            </div>

            <Link href="/tournaments"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Browse Live Tournaments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-white/40 text-lg mb-6">Start free. Scale when you're ready.</p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1">
            <button onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${!annual ? "bg-white/[0.08] text-white" : "text-white/40"}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${annual ? "bg-violet-600 text-white" : "text-white/40"}`}>
              Annual
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-1.5 py-0.5 rounded-full font-bold">-25%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`border-2 rounded-2xl overflow-hidden relative transition-all hover:scale-[1.02] ${plan.color}`}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <div className={`p-6 ${plan.headerBg}`}>
                <h3 className="text-white font-black text-xl mb-1">{plan.name}</h3>
                <p className="text-white/40 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">
                    {annual && plan.price !== "$0"
                      ? `$${(parseFloat(plan.price.replace("$", "")) * 0.75).toFixed(2)}`
                      : plan.price
                    }
                  </span>
                  <span className="text-white/30 text-sm">/{plan.period}</span>
                </div>
              </div>

              <div className="p-6 bg-[#0a0c12]">
                <button
                  onClick={() => router.push(plan.name === "Pro+" ? "/contact" : "/register")}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors mb-6 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-white/70 text-sm">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 opacity-30">
                      <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                      <span className="text-white/40 text-sm line-through">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-sm mt-8">
          All plans include a 14-day free trial · No credit card required to start
        </p>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-3">Trusted by Organizers</h2>
          <p className="text-white/40">Join thousands of tournament organizers worldwide</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-[#0a0c12] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3 border-t border-white/[0.04] pt-4">
                <div className="w-9 h-9 rounded-full bg-violet-500/20 border border-violet-500/20 flex items-center justify-center text-violet-300 font-bold flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.role} · {t.org}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const router = useRouter();
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-violet-950/80 via-[#0a0c12] to-indigo-950/60 border border-violet-500/20 rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="relative">
            <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ready to Run Your
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent">
                Best Tournament Yet?
              </span>
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Join 12,000+ teams and thousands of organizers who trust TournaOps to run their events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => router.push("/register")}
                className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/30">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => router.push("/create")}
                className="flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.12] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors">
                Create Tournament
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <p className="text-white font-black text-xl mb-2">Tourna<span className="text-violet-400">Ops</span></p>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              The professional tournament management platform for esports organizers worldwide.
            </p>
            <div className="flex gap-3 mt-4">
              {["Discord", "Twitter", "YouTube"].map(s => (
                <div key={s} className="w-8 h-8 bg-white/[0.04] border border-white/[0.06] rounded-lg flex items-center justify-center text-white/30 text-xs hover:text-white/60 hover:border-white/[0.12] transition-all cursor-pointer">
                  {s[0]}
                </div>
              ))}
            </div>
          </div>
          {[
            { title: "Platform", links: ["Tournaments", "Rankings", "Bracket Viewer", "Public API"] },
            { title: "Organizers", links: ["Dashboard", "Create Tournament", "Pricing", "Documentation"] },
            { title: "Company", links: ["About", "Contact", "Privacy Policy", "Terms of Service"] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">{col.title}</p>
              <div className="space-y-2">
                {col.links.map(link => (
                  <p key={link} className="text-white/30 text-sm hover:text-white/60 transition-colors cursor-pointer">{link}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-sm">© 2025 TournaOps. All rights reserved.</p>
          <div className="flex items-center gap-2 text-white/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <NavBar />
      <HeroSection />
      <StatsSection />
      <GamesSection />
      <FeaturesSection />
      <DashboardPreview />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}