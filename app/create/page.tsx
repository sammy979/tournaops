"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, ChevronLeft, Zap, Users, Settings, Shuffle } from "lucide-react";
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
    "Valorant", "League of Legends", "CS2", "Dota 2", "Rocket League",
    "Fortnite", "Apex Legends", "Overwatch 2", "PUBG", "Custom Game"
  ];

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Please enter a tournament name");
      return;
    }
    setLoading(true);
    const t = createTournament(name, game || "Custom Game", teamCount, format, bestOf, seedingType);
    saveTournament(t);
    setTimeout(() => router.push(`/admin/${t.id}`), 500);
  };

  return (
    <main className="min-h-screen grid-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="glass neon-border rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Create Tournament</h1>
              <p className="text-purple-300 text-sm">Step {step} of 3</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-purple-900/50"
              }`} />
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wider">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Summer Championship 2026"
                  className="input text-xl"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wider">
                  Game
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {games.map(g => (
                    <button
                      key={g}
                      onClick={() => setGame(g)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        game === g
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                          : "bg-purple-900/30 hover:bg-purple-900/50 text-purple-200"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="btn-primary w-full text-lg py-4 disabled:opacity-50"
              >
                Continue → Format Selection
              </button>
            </div>
          )}

          {/* Step 2: Format & Teams */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                  <Users className="w-4 h-4 inline mr-1" /> Number of Teams
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[4, 8, 16, 32, 64].map(n => (
                    <button
                      key={n}
                      onClick={() => setTeamCount(n)}
                      className={`p-4 rounded-xl font-black text-2xl transition-all ${
                        teamCount === n
                          ? "bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                          : "bg-purple-900/30 hover:bg-purple-900/50 text-purple-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                  <Trophy className="w-4 h-4 inline mr-1" /> Tournament Format
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: "single_elim", name: "Single Elimination", desc: "Lose once, you're out. Fast & simple.", color: "from-purple-500 to-pink-500" },
                    { id: "double_elim", name: "Double Elimination", desc: "Losers bracket gives second chances.", color: "from-blue-500 to-purple-500" },
                    { id: "round_robin", name: "Round Robin", desc: "Everyone plays everyone. Most fair.", color: "from-cyan-500 to-blue-500" },
                    { id: "swiss", name: "Swiss System", desc: "Best for large groups with limited time.", color: "from-green-500 to-cyan-500" }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id as TournamentFormat)}
                      className={`p-5 rounded-xl text-left transition-all border-2 ${
                        format === f.id
                          ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/30"
                          : "border-purple-500/30 bg-purple-900/20 hover:border-purple-400"
                      }`}
                    >
                      <div className={`w-full h-1 rounded-full bg-gradient-to-r ${f.color} mb-3`} />
                      <div className="font-bold text-lg">{f.name}</div>
                      <div className="text-sm text-purple-200/70 mt-1">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">
                  ← Back
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 text-lg py-4">
                  Continue → Settings
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                  Match Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setBestOf(n as BestOf)}
                      className={`p-4 rounded-xl font-bold transition-all ${
                        bestOf === n
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                          : "bg-purple-900/30 hover:bg-purple-900/50 text-purple-200"
                      }`}
                    >
                      <div className="text-2xl font-black">BO{n}</div>
                      <div className="text-xs text-purple-200/70 mt-1">Best of {n}</div>
                    </button>
                  ))}
                </div>
              </div>

              {format !== "round_robin" && format !== "swiss" && (
                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                    <Shuffle className="w-4 h-4 inline mr-1" /> Seeding
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "random", name: "Random", desc: "Shuffle all teams" },
                      { id: "manual", name: "Manual", desc: "Set order yourself" },
                      { id: "ranked", name: "Ranked", desc: "By team seed number" }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSeedingType(s.id as SeedingType)}
                        className={`p-4 rounded-xl font-bold transition-all ${
                          seedingType === s.id
                            ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                            : "bg-purple-900/30 hover:bg-purple-900/50 text-purple-200"
                        }`}
                      >
                        <div className="text-lg">{s.name}</div>
                        <div className="text-xs text-purple-200/70 mt-1">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass rounded-xl p-6 border border-purple-500/30">
                <h3 className="font-bold text-lg mb-3 neon-text-cyan">Tournament Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-purple-300">Name:</span> <span className="font-bold">{name}</span></div>
                  <div><span className="text-purple-300">Game:</span> <span className="font-bold">{game || "Custom"}</span></div>
                  <div><span className="text-purple-300">Teams:</span> <span className="font-bold">{teamCount}</span></div>
                  <div><span className="text-purple-300">Format:</span> <span className="font-bold">{format.replace("_", " ").toUpperCase()}</span></div>
                  <div><span className="text-purple-300">Best of:</span> <span className="font-bold">BO{bestOf}</span></div>
                  <div><span className="text-purple-300">Seeding:</span> <span className="font-bold">{seedingType}</span></div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1">
                  ← Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="btn-primary flex-1 text-lg py-4 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Create Tournament
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