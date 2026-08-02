"use client";
import Link from "next/link";
import { Trophy, Zap, Users, Download, Share2, Settings, ChevronRight, Sparkles, Cpu } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen grid-bg">
      <div className="relative z-20 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30 py-2 px-4 text-center text-sm">
        <span className="text-purple-200">
          Also try our AI website audit:{" "}
          <a href="https://trywebpulseai.com" target="_blank" className="text-cyan-400 font-bold hover:text-cyan-300 underline">
            TryWebPulse AI
          </a>
        </span>
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-purple-500/20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center relative overflow-hidden shadow-lg shadow-purple-500/50">
            <Cpu className="w-6 h-6 text-white relative z-10" />
          </div>
          <div>
            <div className="font-black text-2xl leading-none">
              <span className="text-purple-400">Tourna</span><span className="text-cyan-400">ops</span>
            </div>
            <div className="text-xs text-purple-300 mt-0.5 tracking-widest uppercase">Tournament Ops</div>
          </div>
        </Link>
        <Link href="/create" className="btn-primary text-sm">Create Tournament</Link>
      </nav>

      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Enterprise-grade tournament ops</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="neon-text-purple">TOURNAMENT</span><br/>
            <span className="text-white">OPERATIONS</span><br/>
            <span className="neon-text-cyan">SIMPLIFIED</span>
          </h1>

          <p className="text-xl text-purple-200/80 max-w-2xl mx-auto mb-10">
            Professional tournament management for esports, gaming events, leagues, and competitions. From bracket to champion in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
              <Zap className="w-5 h-5" /> Create Tournament <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="btn-ghost text-lg px-8 py-4">See Features</Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { num: "4-64", label: "Teams" },
              { num: "4", label: "Formats" },
              { num: "0", label: "Sign-ups" },
              { num: "PDF+PNG", label: "Exports" }
            ].map((stat, i) => (
              <div key={i} className="glass neon-border rounded-2xl p-6">
                <div className="text-3xl font-black neon-text-cyan mb-1">{stat.num}</div>
                <div className="text-sm text-purple-300 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            Everything for <span className="neon-text-purple">tournament ops</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Trophy, title: "4 Formats", desc: "Single/Double Elim, Round Robin, Swiss" },
              { icon: Users, title: "4 to 64 Teams", desc: "Small squads or massive events" },
              { icon: Zap, title: "Auto-Advance", desc: "Click winner, teams advance automatically" },
              { icon: Settings, title: "Admin Panel", desc: "Edit scores, swap teams, reset anytime" },
              { icon: Download, title: "PNG/PDF Export", desc: "Beautiful branded exports" },
              { icon: Share2, title: "Shareable Links", desc: "Public spectator view" }
            ].map((feature, i) => (
              <div key={i} className="glass neon-border rounded-2xl p-6 hover:border-purple-400 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:animate-pulse">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-purple-200/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16">Choose your <span className="neon-text-cyan">format</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Single Elim", desc: "Classic knockout", color: "from-purple-500 to-pink-500" },
              { name: "Double Elim", desc: "Losers bracket = second chance", color: "from-blue-500 to-purple-500" },
              { name: "Round Robin", desc: "Everyone plays everyone", color: "from-cyan-500 to-blue-500" },
              { name: "Swiss System", desc: "Best for large tournaments", color: "from-green-500 to-cyan-500" }
            ].map((format, i) => (
              <div key={i} className="glass rounded-2xl p-6 border border-purple-500/20 hover:border-cyan-400 transition-all">
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${format.color} mb-4`} />
                <h3 className="text-xl font-bold mb-2">{format.name}</h3>
                <p className="text-purple-200/70 text-sm">{format.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass neon-border rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to run your <span className="neon-text-purple">tournament?</span>
            </h2>
            <p className="text-xl text-purple-200/80 mb-8">No signup. No credit card. Just tournament ops.</p>
            <Link href="/create" className="btn-primary text-xl px-10 py-5 inline-flex items-center gap-2">
              <Zap className="w-6 h-6" /> Create Free Tournament
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-purple-500/20 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm text-purple-300/60">
              <span className="text-purple-400 font-bold">Tourna</span><span className="text-cyan-400 font-bold">ops</span> - Tournament Operations Platform
            </div>
          </div>
          <div className="flex gap-6 text-sm text-purple-300/60">
            <a href="https://trywebpulseai.com" target="_blank" className="hover:text-white">TryWebPulse AI</a>
            <a href="https://trywebpulseai.com/privacy" target="_blank" className="hover:text-white">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}