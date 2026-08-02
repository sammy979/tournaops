"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, Trophy, Users, Zap, Sparkles, 
  Check, Rocket, Target, Shield, BarChart3, Cpu 
} from "lucide-react";
import { createTournament } from "@/lib/storage/tournaments";

const GAMES = [
  { name: "Valorant", emoji: "🎯" },
  { name: "League of Legends", emoji: "⚔️" },
  { name: "CS2", emoji: "🔫" },
  { name: "Dota 2", emoji: "🏹" },
  { name: "Rocket League", emoji: "🚗" },
  { name: "Fortnite", emoji: "🎮" },
  { name: "Apex Legends", emoji: "🎪" },
  { name: "Overwatch 2", emoji: "🦸" },
  { name: "PUBG Mobile", emoji: "📱" },
  { name: "Free Fire", emoji: "🔥" },
  { name: "Chess", emoji: "♟️" },
  { name: "Custom", emoji: "✨" }
];

const FORMATS = [
  { id: "single_elim", name: "Single Elimination", desc: "Lose once, you're out. Fast & simple.", icon: Zap, color: "from-indigo-500 to-purple-500" },
  { id: "round_robin", name: "Round Robin", desc: "Everyone plays everyone. Most fair.", icon: Users, color: "from-cyan-500 to-blue-500" },
  { id: "swiss", name: "Swiss System", desc: "Best for large tournaments.", icon: BarChart3, color: "from-green-500 to-cyan-500" },
  { id: "double_elim", name: "Double Elimination", desc: "Losers bracket for second chances.", icon: Shield, color: "from-purple-500 to-pink-500" },
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [game, setGame] = useState("Valorant");
  const [format, setFormat] = useState<any>("single_elim");
  const [teamCount, setTeamCount] = useState(8);
  const [bestOf, setBestOf] = useState<any>(1);
  const [teamNames, setTeamNames] = useState<string[]>(Array(8).fill(""));

  const handleTeamCountChange = (n: number) => {
    setTeamCount(n);
    setTeamNames(Array(n).fill(""));
  };

  const handleTeamNameChange = (idx: number, value: string) => {
    const updated = [...teamNames];
    updated[idx] = value;
    setTeamNames(updated);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Please enter a tournament name");
      return;
    }
    setLoading(true);
    
    const teams = teamNames.map((n, i) => ({
      name: n.trim() || `Team ${i + 1}`,
    }));
    
    setTimeout(() => {
      try {
        const tournament = createTournament({
          name,
          description: description || `${game} tournament`,
          game,
          format,
          bestOf,
          maxTeams: teamCount,
          teams,
        });
        router.push(`/dashboard/tournaments/${tournament.id}`);
      } catch (err) {
        alert("Failed to create tournament");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back nav */}
      <Link href="/dashboard/tournaments" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition group">
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Back to tournaments</span>
      </Link>

      {/* Card */}
      <div className="glass-heavy neon-border rounded-2xl md:rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl">Create Tournament</h1>
              <p className="text-sm text-white/50">Step {step} of 4</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? "bg-gradient-to-r from-indigo-500 to-cyan-500" : "bg-white/10"
              }`} />
            ))}
          </div>

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5 fade-in-up">
              <div>
                <label className="label">Tournament Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Summer Championship 2026"
                  className="input text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="A friendly community tournament"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Select Game</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {GAMES.map(g => (
                    <button
                      key={g.name}
                      onClick={() => setGame(g.name)}
                      className={`p-3 rounded-xl text-xs font-semibold transition-all ${
                        game === g.name
                          ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/50"
                          : "glass border border-white/10 text-white/70 hover:border-white/30"
                      }`}
                    >
                      <div className="text-xl mb-1">{g.emoji}</div>
                      <div className="text-[10px]">{g.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {/* STEP 2: Format */}
          {step === 2 && (
            <div className="space-y-5 fade-in-up">
              <div>
                <label className="label">Number of Teams</label>
                <div className="grid grid-cols-5 gap-2">
                  {[4, 8, 16, 32, 64].map(n => (
                    <button
                      key={n}
                      onClick={() => handleTeamCountChange(n)}
                      className={`p-4 rounded-xl font-display font-black text-xl transition-all ${
                        teamCount === n
                          ? "bg-gradient-to-br from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                          : "glass border border-white/10 text-white/70 hover:border-white/30"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Tournament Format</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FORMATS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        format === f.id
                          ? "bg-white/5 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30"
                          : "glass border-2 border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                        <f.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="font-display font-bold text-base mb-1">{f.name}</div>
                      <div className="text-xs text-white/60">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Match Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setBestOf(n)}
                      className={`p-3 rounded-xl font-bold transition-all ${
                        bestOf === n
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                          : "glass border border-white/10 text-white/70"
                      }`}
                    >
                      <div className="font-display text-lg">BO{n}</div>
                      <div className="text-[10px] text-white/60">Best of {n}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-[2]">
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Teams */}
          {step === 3 && (
            <div className="space-y-5 fade-in-up">
              <div>
                <label className="label">Team Names (optional - defaults to Team 1, Team 2, etc.)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {teamNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-xs font-black">
                        {i + 1}
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={e => handleTeamNameChange(i, e.target.value)}
                        placeholder={`Team ${i + 1}`}
                        className="input text-sm py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <button onClick={() => setStep(4)} className="btn-primary flex-[2]">
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div className="space-y-5 fade-in-up">
              <div className="glass rounded-xl p-5 border border-cyan-500/30">
                <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2 text-cyan-400">
                  <Sparkles className="w-4 h-4" /> Ready to Launch
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-white/50 text-xs">Name</div>
                    <div className="font-bold">{name}</div>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs">Game</div>
                    <div className="font-bold">{game}</div>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs">Teams</div>
                    <div className="font-bold">{teamCount}</div>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs">Format</div>
                    <div className="font-bold">{FORMATS.find(f => f.id === format)?.name}</div>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs">Match Format</div>
                    <div className="font-bold">Best of {bestOf}</div>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs">Auto-generates</div>
                    <div className="font-bold">Bracket + Matches</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="btn-ghost flex-1" disabled={loading}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <button 
                  onClick={handleCreate} 
                  disabled={loading}
                  className="btn-primary flex-[2] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Create & Launch Tournament
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}