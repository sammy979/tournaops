"use client";
import Link from "next/link";
import { Trophy, Radio, Sparkles, Download, Zap, Users, Shield, Award, ArrowRight, Check, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* NAV */}
      <nav className="border-b border-neutral-900 sticky top-0 bg-neutral-950/90 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black">TournaOps</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-neutral-400 hover:text-white">Login</Link>
            <Link href="/register" className="text-sm bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">AI-POWERED · PMGC-GRADE · FREE TO START</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
          Run <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Pro-Level</span><br />
          PUBG Mobile Tournaments
        </h1>
        
        <p className="text-lg sm:text-xl text-neutral-400 max-w-3xl mx-auto mb-8">
          The complete platform for PUBG Mobile esports organizers. 
          <br className="hidden sm:block" />
          Broadcast graphics, AI insights, live standings, and pro exports — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            href="/register" 
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-4 rounded-xl text-lg inline-flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/30"
          >
            Start Free Tournament <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/tournaments/fvs-h3k9" 
            className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-8 py-4 rounded-xl text-lg inline-flex items-center justify-center gap-2 border border-neutral-700"
          >
            View Demo
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-neutral-500">
          <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> No credit card</div>
          <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> 16-400 teams</div>
          <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> PMGC scoring</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-16">
          <div className="text-yellow-400 text-sm font-black tracking-widest mb-2">FEATURES</div>
          <h2 className="text-3xl sm:text-5xl font-black">Everything You Need</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Trophy, title: "PMGC-Grade Scoring", desc: "Official 15/12/10/8/6/4/2/0 placement points + kill points with proper tie-breakers.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { icon: Radio, title: "6 OBS Overlays", desc: "Broadcast-quality graphics: Live standings, Chicken Dinner, MVP, Podium, Match Timer, Kill Feed.", color: "text-purple-400", bg: "bg-purple-500/10" },
            { icon: Sparkles, title: "AI Insights", desc: "Match summaries, MVP predictions, social captions & caster notes — all AI-generated from real data.", color: "text-pink-400", bg: "bg-pink-500/10" },
            { icon: Download, title: "Multi-Format Export", desc: "Download standings as CSV, Excel, PDF or broadcast-ready PNG (16:9, 1:1, 9:16).", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: Users, title: "Team Management", desc: "Full team detail pages with match history, stats, roster, and best moments.", color: "text-green-400", bg: "bg-green-500/10" },
            { icon: Zap, title: "Live Updates", desc: "Real-time standings sync to public pages, overlays, and viewer dashboards.", color: "text-orange-400", bg: "bg-orange-500/10" },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-all">
                <div className={"w-12 h-12 rounded-lg flex items-center justify-center mb-4 " + f.bg}>
                  <Icon className={"w-6 h-6 " + f.color} />
                </div>
                <h3 className="text-xl font-black mb-2">{f.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatBox value="400" label="Max Teams" />
          <StatBox value="6" label="OBS Overlays" />
          <StatBox value="9" label="AI Features" />
          <StatBox value="24/7" label="Uptime" />
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <div className="text-yellow-400 text-sm font-black tracking-widest mb-2">PRICING</div>
          <h2 className="text-3xl sm:text-5xl font-black">Simple & Fair</h2>
          <p className="text-neutral-400 mt-3">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* FREE */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-black mb-2">Free</h3>
              <div className="text-4xl font-black">$0<span className="text-neutral-500 text-lg font-normal">/forever</span></div>
            </div>
            <ul className="space-y-3 mb-8">
              <PriceFeature>Unlimited tournaments</PriceFeature>
              <PriceFeature>Up to 16 teams per tournament</PriceFeature>
              <PriceFeature>All 6 OBS overlays</PriceFeature>
              <PriceFeature>CSV/Excel export</PriceFeature>
              <PriceFeature>Basic AI insights</PriceFeature>
              <PriceFeature>Community support</PriceFeature>
            </ul>
            <Link href="/register" className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl inline-flex items-center justify-center border border-neutral-700">
              Start Free
            </Link>
          </div>

          {/* PRO */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/50 rounded-2xl p-8 relative">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full">MOST POPULAR</div>
            <div className="mb-6">
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                Pro <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </h3>
              <div className="text-4xl font-black">$9.99<span className="text-neutral-400 text-lg font-normal">/month</span></div>
              <div className="text-sm text-yellow-400 mt-1">7-day free trial</div>
            </div>
            <ul className="space-y-3 mb-8">
              <PriceFeature>Everything in Free</PriceFeature>
              <PriceFeature><strong>Up to 400 teams</strong> per tournament</PriceFeature>
              <PriceFeature><strong>PDF export</strong> with pro design</PriceFeature>
              <PriceFeature><strong>Advanced AI Insights</strong> (MVP, trends, predictions)</PriceFeature>
              <PriceFeature><strong>Premium AI images</strong> (FLUX quality)</PriceFeature>
              <PriceFeature>Bulk team import</PriceFeature>
              <PriceFeature>Priority support</PriceFeature>
              <PriceFeature>Custom branding</PriceFeature>
            </ul>
            <Link href="/dashboard/upgrade" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl inline-flex items-center justify-center">
              Start 7-Day Trial
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl sm:text-5xl font-black mb-4">Ready to Level Up?</h2>
          <p className="text-lg text-neutral-400 mb-8">Join organizers running PMGC-grade tournaments with TournaOps.</p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-4 rounded-xl text-lg shadow-lg shadow-yellow-500/30"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold">TournaOps</span>
            <span className="text-neutral-500 text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <Link href="/login">Login</Link>
            <Link href="/register">Sign Up</Link>
            <a href="mailto:hello@tournaops.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl sm:text-5xl font-black text-white">{value}</div>
      <div className="text-sm text-neutral-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

function PriceFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-neutral-300">
      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}