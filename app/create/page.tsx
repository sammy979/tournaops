"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, ChevronLeft, Zap, Users, Settings, Shuffle, Sparkles, Cpu, Shield, BarChart3, Target, Rocket, ChevronRight, Check } from "lucide-react";
import { createTournament } from "@/lib/bracket-engine";
import { saveTournament } from "@/lib/storage";
import type { TournamentFormat, BestOf, SeedingType } from "@/types/tournament";

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [teamCount, setTeamCount] = useState<number>(8);
  const [format, setFormat] = useState<TournamentFormat>("single_elim");
  const [bestOf, setBestOf] = useState<BestOf>(1);
  const [seedingType, setSeedingType] = useState<SeedingType>("random");
  const [loading, setLoading] = useState(false);

  const games = [
    { name: "Valorant", emoji: "🎯" },
    { name: "League of Legends", emoji: "⚔️" },
    { name: "CS2", emoji: "🔫" },
    { name: "Dota 2", emoji: "🏹" },
    { name: "Rocket League", emoji: "🚗" },
    { name: "Fortnite", emoji: "🎮" },
    { name: "Apex Legends", emoji: "🎪" },
    { name: "Overwatch 2", emoji: "🦸" },
    { name: "PUBG", emoji: "🎯" },
    { name: "Custom Game", emoji: "✨" }
  ];

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Please enter a tournament name");
      return;
    }
    setLoading(true);
    const t = createTournament(name, game || "Custom Game", teamCount, format, bestOf, seedingType);
    saveTournament(t);
    setTimeout(() => router.push(`/admin/${t.id}`), 800);
  };

  return (
    <main className="min-h-screen py-8 px-4 relative">
      <div className="max-w-4xl mx-auto">
        {/* Back nav */}
        <Link href="/" className="inline-flex items-center gap-2 text-purple-300 hover:text-cyan-400 mb-8 transition group">
          <div className="w-10 h-10 rounded-xl glass border border-purple-500/30 flex items-center justify-center group-hover:border-cyan-400 transition">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="font-semibold tracking-wide">BACK TO HOME</span>
        </Link>

        {/* Main card */}
        <div className="glass neon-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl rotate-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl rotate-slow"></div>

          {/* Header */}
          <div className="relative flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-md opacity-70"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-black gradient-text">CREATE TOURNAMENT</h1>
              <p className="text-purple-300 text-sm mt-1 tracking-widest uppercase font-semibold">Step {step} of 3</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative flex gap-3 mb-10">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex-1 relative">
                <div className={`h-2 rounded-full transition-all duration-500 ${
                  s <= step 
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 shadow-lg shadow-purple-500/50" 
                    : "bg-purple-900/50"
                }`}></div>
                {s <= step && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 blur-md opacity-70"></div>
                )}
              </div>
            ))}
          </div>

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-8 fade-in-up">
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-cyan-400 mb-3 uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  Tournament Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Summer Championship 2026"
                  className="input text-2xl py-4 px-6 font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-black text-cyan-400 mb-3 uppercase tracking-widest">
                  <Cpu className="w-4 h-4" />
                  Select Game
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {games.map(g => (
                    <button
                      key={g.name}
                      onClick={() => setGame(g.name)}
                      className={`relative p-4 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                        game === g.name
                          ? "bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 text-white shadow-2xl shadow-purple-500/50 scale-105"
                          : "glass border border-purple-500/20 text-purple-200 hover:border-cyan-400 hover:scale-105"
                      }`}
                    >
                      <div className="text-2xl mb-1">{g.emoji}</div>
                      <div className="text-xs">{g.name}</div>
                      {game === g.name && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="btn-primary w-full text-lg py-5 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3"
              >
                <span>CONTINUE TO FORMAT</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: Format & Teams */}
          {step === 2 && (
            <div className="space-y-8 fade-in-up">
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-cyan-400 mb-3 uppercase tracking-widest">
                  <Users className="w-4 h-4" />
                  Number of Teams
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[4, 8, 16, 32, 64].map(n => (
                    <button
                      key={n}
                      onClick={() => setTeamCount(n)}
                      className={`relative p-6 rounded-2xl font-display font-black text-3xl transition-all duration-300 ${
                        teamCount === n
                          ? "bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-cyan-500/50 scale-110"
                          : "glass border border-purple-500/20 text-purple-200 hover:border-cyan-400 hover:scale-105"
                      }`}
                    >
                      {n}
                      {teamCount === n && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-black text-cyan-400 mb-3 uppercase tracking-widest">
                  <Trophy className="w-4 h-4" />
                  Tournament Format
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "single_elim", name: "SINGLE ELIMINATION", desc: "Lose once, you're out. Fast & intense.", color: "from-purple-500 to-pink-500", icon: Zap },
                    { id: "double_elim", name: "DOUBLE ELIMINATION", desc: "Losers bracket = second chances.", color: "from-blue-500 to-purple-500", icon: Shield },
                    { id: "round_robin", name: "ROUND ROBIN", desc: "Everyone plays everyone. Most fair.", color: "from-cyan-500 to-blue-500", icon: Users },
                    { id: "swiss", name: "SWISS SYSTEM", desc: "Best for large tournaments.", color: "from-green-500 to-cyan-500", icon: BarChart3 }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id as TournamentFormat)}
                      className={`relative p-6 rounded-2xl text-left transition-all duration-300 group overflow-hidden ${
                        format === f.id
                          ? "border-2 border-cyan-400 bg-cyan-500/10 shadow-2xl shadow-cyan-500/30 scale-105"
                          : "border-2 border-purple-500/30 glass hover:border-purple-400 hover:scale-102"
                      }`}
                    >
                      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${f.color} rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition`}></div>
                      
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                          <f.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div className={`w-full h-1 rounded-full bg-gradient-to-r ${f.color} mb-4 opacity-70`}></div>
                        <div className="font-display font-black text-lg mb-1">{f.name}</div>
                        <div className="text-sm text-purple-200/70">{f.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 inline-flex items-center justify-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> BACK
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-[2] text-lg py-4 inline-flex items-center justify-center gap-3">
                  CONTINUE
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Final Settings */}
          {step === 3 && (
            <div className="space-y-8 fade-in-up">
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-cyan-400 mb-3 uppercase tracking-widest">
                  <Target className="w-4 h-4" />
                  Match Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 3, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setBestOf(n as BestOf)}
                      className={`relative p-6 rounded-2xl font-bold transition-all duration-300 ${
                        bestOf === n
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50 scale-105"
                          : "glass border border-purple-500/20 text-purple-200 hover:border-cyan-400 hover:scale-105"
                      }`}
                    >
                      <div className="font-display text-3xl font-black mb-1">BO{n}</div>
                      <div className="text-xs text-purple-200/70">Best of {n}</div>
                    </button>
                  ))}
                </div>
              </div>

              {format !== "round_robin" && format !== "swiss" && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-black text-cyan-400 mb-3 uppercase tracking-widest">
                    <Shuffle className="w-4 h-4" />
                    Seeding Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "random", name: "Random", desc: "Shuffle teams", icon: Shuffle },
                      { id: "manual", name: "Manual", desc: "You choose order", icon: Settings },
                      { id: "ranked", name: "Ranked", desc: "By seed number", icon: BarChart3 }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSeedingType(s.id as SeedingType)}
                        className={`p-5 rounded-2xl font-bold transition-all duration-300 ${
                          seedingType === s.id
                            ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-2xl shadow-cyan-500/50 scale-105"
                            : "glass border border-purple-500/20 text-purple-200 hover:border-cyan-400 hover:scale-105"
                        }`}
                      >
                        <s.icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-display text-lg font-black">{s.name}</div>
                        <div className="text-xs text-purple-200/70">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="glass-heavy rounded-3xl p-8 border-2 border-purple-500/30 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl rotate-slow"></div>
                
                <h3 className="font-display text-xl font-black mb-5 flex items-center gap-2 neon-text-cyan">
                  <Rocket className="w-5 h-5" />
                  TOURNAMENT SUMMARY
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Name", value: name, icon: Sparkles },
                    { label: "Game", value: game || "Custom", icon: Cpu },
                    { label: "Teams", value: `${teamCount} teams`, icon: Users },
                    { label: "Format", value: format.replace("_", " ").toUpperCase(), icon: Trophy },
                    { label: "Best of", value: `BO${bestOf}`, icon: Target },
                    { label: "Seeding", value: seedingType.toUpperCase(), icon: Shuffle }
                  ].map((item, i) => (
                    <div key={i} className="glass rounded-xl p-4 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] text-purple-300 uppercase tracking-widest font-bold">{item.label}</span>
                      </div>
                      <div className="font-display text-base font-black truncate">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1 inline-flex items-center justify-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> BACK
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="btn-primary flex-[2] text-lg py-5 inline-flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      LAUNCHING...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      CREATE TOURNAMENT
                      <Rocket className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}