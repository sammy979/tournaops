"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Zap, Trophy, Users, BarChart3, Radio, Bot, ChevronRight, 
  Command, Cpu, Sparkles, ArrowRight, CheckCircle2, Play,
  Layers, Shield, Rocket, Globe, MessageSquare, TrendingUp
} from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-heavy py-3 border-b border-white/5" : "py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition"></div>
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center border border-white/10">
                <Command className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="font-display font-black text-xl tracking-tight">
                <span className="text-white">TOURNA</span><span className="text-cyan-400">OPS</span>
              </div>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/features" className="text-white/70 hover:text-white transition">Features</Link>
            <Link href="/pricing" className="text-white/70 hover:text-white transition">Pricing</Link>
            <Link href="/discover" className="text-white/70 hover:text-white transition">Discover</Link>
            <Link href="/login" className="text-white/70 hover:text-white transition">Sign In</Link>
          </div>
          
          <Link href="/register" className="btn-primary text-sm px-6 py-2.5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-indigo-500/30 mb-8 fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-sm text-white/80 font-medium">Live now  ·  Powering tournaments worldwide</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl leading-[0.95] mb-8 tracking-tight fade-in-up" style={{animationDelay:"0.1s"}}>
            <span className="block text-white">RUN EVERY</span>
            <span className="block gradient-text">TOURNAMENT</span>
            <span className="block text-white">FROM ONE</span>
            <span className="block gradient-text">COMMAND CENTER</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed fade-in-up" style={{animationDelay:"0.2s"}}>
            Create tournaments, manage teams, calculate scores, publish live leaderboards, 
            power OBS overlays, and automate operations with AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 fade-in-up" style={{animationDelay:"0.3s"}}>
            <Link href="/register" className="btn-primary text-base px-8 py-4 inline-flex items-center justify-center gap-2">
              Create Your Tournament
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="btn-ghost text-base px-8 py-4 inline-flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/50 fade-in-up" style={{animationDelay:"0.4s"}}>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Free forever plan</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> No credit card</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Setup in 2 minutes</span>
          </div>
        </div>

        {/* Decorative gradients */}
        <div className="absolute top-32 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-64 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </section>

      {/* One Result Everywhere Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/30 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 tracking-widest uppercase">Our Core Innovation</span>
            </div>
            <h2 className="font-display font-black text-5xl md:text-7xl mb-4">
              <span className="text-white">ONE RESULT.</span><br/>
              <span className="gradient-text">EVERYWHERE.</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Enter data once. Watch it flow through your entire tournament in real-time.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="glass-heavy neon-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl rotate-slow"></div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "01", title: "MATCH RESULT", desc: "Staff submits", icon: Trophy, color: "from-indigo-500 to-purple-500" },
                { step: "02", title: "SCORING ENGINE", desc: "Auto-calculates", icon: Cpu, color: "from-purple-500 to-pink-500" },
                { step: "03", title: "LIVE UPDATES", desc: "Instantly everywhere", icon: Zap, color: "from-pink-500 to-orange-500" },
                { step: "04", title: "BROADCAST READY", desc: "OBS + Discord + Web", icon: Radio, color: "from-orange-500 to-cyan-500" }
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition group card-3d">
                    <div className="text-xs font-mono text-white/40 mb-2">{item.step}</div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                      <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="font-display font-black text-lg mb-1">{item.title}</div>
                    <div className="text-sm text-white/60">{item.desc}</div>
                  </div>
                  {i < 3 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 w-6 h-6 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-cyan-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { name: "Leaderboard", icon: BarChart3 },
                { name: "OBS Overlay", icon: Radio },
                { name: "Public Page", icon: Globe },
                { name: "Discord Bot", icon: MessageSquare },
                { name: "Analytics", icon: TrendingUp }
              ].map((item, i) => (
                <div key={i} className="glass rounded-xl p-4 text-center border border-white/5 hover:border-cyan-400/30 transition">
                  <item.icon className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
                  <div className="text-xs font-bold text-white/70">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-5xl md:text-7xl mb-4">
              <span className="text-white">EVERYTHING YOU NEED.</span><br/>
              <span className="gradient-text">NOTHING YOU DON'T.</span>
            </h2>
            <p className="text-xl text-white/60">Built for tournament organizers, by esports professionals.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {[
              { icon: Trophy, title: "Universal Scoring Engine", desc: "Custom scoring for any game. Placement, kills, bonuses, penalties—all configurable.", color: "from-indigo-500 to-purple-500" },
              { icon: BarChart3, title: "Live Leaderboards", desc: "Real-time rank updates with animations. Export CSV, PDF, or share instantly.", color: "from-purple-500 to-pink-500" },
              { icon: Radio, title: "OBS Overlay Studio", desc: "No-code overlay builder. 10+ overlay types. Copy browser source URL to OBS.", color: "from-pink-500 to-orange-500" },
              { icon: Bot, title: "OpsAI Assistant", desc: "AI generates tournaments, rules, announcements, and match summaries.", color: "from-orange-500 to-yellow-500" },
              { icon: Users, title: "Team & Player Management", desc: "Full rosters, substitutes, coaches. Public profiles with stats and history.", color: "from-cyan-500 to-blue-500" },
              { icon: MessageSquare, title: "Discord Integration", desc: "Auto-announce matches, results, and leaderboard updates to your Discord.", color: "from-blue-500 to-indigo-500" },
              { icon: Layers, title: "Multiple Formats", desc: "Battle Royale, Single/Double Elim, Round Robin, Swiss, Groups—all built-in.", color: "from-green-500 to-cyan-500" },
              { icon: Shield, title: "Result Verification", desc: "Staff submits → Referee reviews → Organizer approves. Full audit trail.", color: "from-red-500 to-pink-500" },
              { icon: Rocket, title: "Public Tournament Pages", desc: "Beautiful, SEO-optimized pages. Custom branding. Perfect for social sharing.", color: "from-yellow-500 to-orange-500" }
            ].map((feature, i) => (
              <div key={i} className="glass rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all card-3d group relative overflow-hidden">
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.color} rounded-full opacity-10 blur-3xl group-hover:opacity-30 transition`}></div>
                
                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                
                <h3 className="font-display text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-heavy neon-border rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { num: "2min", label: "Setup Time" },
                { num: "10+", label: "Overlay Types" },
                { num: "∞", label: "Tournaments" },
                { num: "24/7", label: "Real-time" }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="font-display font-black text-5xl md:text-6xl gradient-text mb-2">{stat.num}</div>
                  <div className="text-sm text-white/60 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-black text-5xl md:text-7xl mb-6">
            <span className="text-white">READY TO</span><br/>
            <span className="gradient-text">ELEVATE?</span>
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Join tournament organizers building the future of esports. Start free, forever.
          </p>
          <Link href="/register" className="btn-primary text-lg px-10 py-5 inline-flex items-center gap-3">
            <Rocket className="w-5 h-5" />
            Start Your First Tournament
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                <Command className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-display font-black">
                  <span className="text-white">TOURNA</span><span className="text-cyan-400">OPS</span>
                </div>
                <div className="text-xs text-white/40">Organize. Compete. Elevate.</div>
              </div>
            </div>
            <div className="flex gap-8 text-sm text-white/50">
              <Link href="/features" className="hover:text-white transition">Features</Link>
              <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
              <Link href="/discover" className="hover:text-white transition">Discover</Link>
              <a href="https://trywebpulseai.com" target="_blank" className="hover:text-cyan-400 transition">TryWebPulse AI</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}