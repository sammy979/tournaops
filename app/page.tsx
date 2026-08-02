"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Trophy, Zap, Users, Download, Share2, Settings, ChevronRight, Sparkles, Cpu, Target, Shield, Rocket, BarChart3 } from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Promo Banner */}
      <div className="relative z-30 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-cyan-600/30 border-b border-purple-500/30 py-2.5 px-4 text-center text-sm backdrop-blur-md">
        <span className="text-purple-200 inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Also try our AI website audit:
          <a href="https://trywebpulseai.com" target="_blank" className="text-cyan-400 font-bold hover:text-cyan-300 transition underline underline-offset-4">
            TryWebPulse AI
          </a>
        </span>
      </div>

      {/* Nav */}
      <nav className={`sticky top-0 z-20 transition-all duration-500 ${scrolled ? "glass-heavy py-3" : "py-5"} px-6 border-b border-purple-500/20`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition"></div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="font-display font-black text-2xl leading-none tracking-wide">
                <span className="text-purple-400">TOURNA</span><span className="text-cyan-400">OPS</span>
              </div>
              <div className="text-xs text-purple-300 mt-1 tracking-[0.3em] uppercase font-semibold">Tournament Operations</div>
            </div>
          </Link>
          <Link href="/create" className="btn-primary text-sm hidden md:flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Launch Tournament
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10 stagger">
          
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-purple-500/40 mb-8 glow-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-sm text-purple-200 font-semibold tracking-wider">ENTERPRISE TOURNAMENT PLATFORM</span>
          </div>

          {/* Hero Title */}
          <h1 className="font-display text-7xl md:text-9xl font-black mb-8 leading-none">
            <span className="block gradient-text">TOURNAMENT</span>
            <span className="block neon-text-cyan mt-2">OPERATIONS</span>
            <span className="block text-white mt-2">SIMPLIFIED</span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-200/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            Professional tournament management platform for esports, gaming events, and competitive leagues. 
            <span className="text-cyan-400 font-semibold"> From bracket to champion in minutes.</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/create" className="btn-primary text-lg px-10 py-5 inline-flex items-center gap-3 justify-center">
              <Zap className="w-5 h-5" />
              CREATE TOURNAMENT
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="btn-neon inline-flex items-center gap-2 justify-center">
              <Target className="w-4 h-4" />
              SEE FEATURES
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto stagger">
            {[
              { num: "4-64", label: "Teams", icon: Users },
              { num: "4", label: "Formats", icon: Trophy },
              { num: "0$", label: "Cost", icon: Rocket },
              { num: "∞", label: "Exports", icon: Download }
            ].map((stat, i) => (
              <div key={i} className="glass neon-border rounded-2xl p-6 card-3d relative group">
                <stat.icon className="w-6 h-6 text-cyan-400 mb-3 mx-auto glow-pulse" />
                <div className="text-4xl font-display font-black gradient-text mb-1">{stat.num}</div>
                <div className="text-xs text-purple-300 uppercase tracking-widest font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative floating shapes */}
        <div className="absolute top-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl rotate-slow"></div>
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl rotate-slow"></div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 stagger">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/40 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-300 font-bold tracking-widest uppercase">Premium Features</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-black mb-4">
              <span className="gradient-text">EVERYTHING</span>
              <span className="text-white"> YOU NEED</span>
            </h2>
            <p className="text-xl text-purple-200/70 max-w-2xl mx-auto">
              Built for the modern esports era with enterprise-grade features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {[
              { icon: Trophy, title: "4 Tournament Formats", desc: "Single Elimination, Double Elimination, Round Robin, and Swiss System — all professionally implemented.", color: "purple", gradient: "from-purple-500 to-pink-500" },
              { icon: Users, title: "4 to 64 Teams", desc: "Support for small local scrims or massive esports championships with hundreds of players.", color: "cyan", gradient: "from-cyan-500 to-blue-500" },
              { icon: Zap, title: "Instant Auto-Advance", desc: "Click a winner and watch them advance automatically through the bracket in real-time.", color: "pink", gradient: "from-pink-500 to-orange-500" },
              { icon: Settings, title: "Full Admin Control", desc: "Edit scores, swap teams, reset matches, and manage everything from a beautiful admin panel.", color: "blue", gradient: "from-blue-500 to-purple-500" },
              { icon: Download, title: "PNG & PDF Export", desc: "Export beautiful tournament brackets for social media, print, or client presentations.", color: "green", gradient: "from-green-500 to-cyan-500" },
              { icon: Share2, title: "Public Spectator Links", desc: "Share a public URL so fans can follow along without needing an account.", color: "orange", gradient: "from-orange-500 to-red-500" }
            ].map((feature, i) => (
              <div key={i} className="glass neon-border rounded-3xl p-8 card-3d group relative overflow-hidden">
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`}></div>
                
                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                
                <h3 className="font-display text-2xl font-bold mb-3 group-hover:text-cyan-400 transition">{feature.title}</h3>
                <p className="text-purple-200/70 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/30 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 stagger">
            <h2 className="font-display text-5xl md:text-7xl font-black mb-4">
              <span className="text-white">CHOOSE YOUR</span><br/>
              <span className="neon-text-cyan">FORMAT</span>
            </h2>
            <p className="text-xl text-purple-200/70">Every competitive style, professionally implemented</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
            {[
              { name: "SINGLE ELIM", subtitle: "Classic Knockout", desc: "Lose once, you're out. Fast paced.", color: "from-purple-500 to-pink-500", icon: Zap },
              { name: "DOUBLE ELIM", subtitle: "Second Chance", desc: "Losers bracket for a comeback.", color: "from-blue-500 to-purple-500", icon: Shield },
              { name: "ROUND ROBIN", subtitle: "Everyone Plays", desc: "Most fair format for all teams.", color: "from-cyan-500 to-blue-500", icon: Users },
              { name: "SWISS SYSTEM", subtitle: "Optimal Pairing", desc: "Best for large tournaments.", color: "from-green-500 to-cyan-500", icon: BarChart3 }
            ].map((format, i) => (
              <div key={i} className="glass rounded-3xl p-6 border-2 border-purple-500/20 hover:border-cyan-400 transition-all card-3d group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${format.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <format.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className={`w-full h-1 rounded-full bg-gradient-to-r ${format.color} mb-4 opacity-70`}></div>
                <h3 className="font-display text-xl font-black mb-1">{format.name}</h3>
                <p className="text-cyan-400 text-xs font-bold tracking-wider mb-2">{format.subtitle}</p>
                <p className="text-purple-200/70 text-sm">{format.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <div className="glass-heavy neon-border rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl rotate-slow"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl rotate-slow"></div>
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/40 mb-6">
                <Rocket className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300 text-sm font-bold tracking-wider">READY TO LAUNCH</span>
              </div>
              
              <h2 className="font-display text-5xl md:text-7xl font-black mb-6">
                <span className="gradient-text">CREATE YOUR</span><br/>
                <span className="text-white">TOURNAMENT NOW</span>
              </h2>
              
              <p className="text-xl text-purple-200/80 mb-10 max-w-2xl mx-auto">
                No signup. No credit card. No BS. Just professional tournament operations, ready in 30 seconds.
              </p>
              
              <Link href="/create" className="btn-primary text-xl px-12 py-6 inline-flex items-center gap-3">
                <Zap className="w-6 h-6" />
                LAUNCH TOURNAMENT
                <ChevronRight className="w-6 h-6" />
              </Link>
              
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-purple-300/70">
                <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400"/> No signup</span>
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/> Instant setup</span>
                <span className="flex items-center gap-2"><Rocket className="w-4 h-4 text-cyan-400"/> Free forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-12 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-display font-black text-lg">
                  <span className="text-purple-400">TOURNA</span><span className="text-cyan-400">OPS</span>
                </div>
                <div className="text-xs text-purple-300/60 mt-0.5">Tournament Operations © 2026</div>
              </div>
            </div>
            <div className="flex gap-8 text-sm text-purple-300/60">
              <a href="https://trywebpulseai.com" target="_blank" className="hover:text-cyan-400 transition">TryWebPulse AI</a>
              <a href="https://trywebpulseai.com/privacy" target="_blank" className="hover:text-cyan-400 transition">Privacy</a>
              <a href="https://trywebpulseai.com/contact" target="_blank" className="hover:text-cyan-400 transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}