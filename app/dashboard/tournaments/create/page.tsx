"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Trophy, Users, Sparkles, Rocket, Check, Map, Target, Award } from "lucide-react";
import { createTournament } from "@/lib/storage/tournaments";
import { TOURNAMENT_PRESETS, SCORING_SYSTEMS } from "@/types/tournament";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [presetId, setPresetId] = useState("small_32");
  const [scoringId, setScoringId] = useState("pmgc");
  const [prizePool, setPrizePool] = useState("");
  const [region, setRegion] = useState("South Asia");

  const selectedPreset = TOURNAMENT_PRESETS.find(p => p.id === presetId);
  const selectedScoring = SCORING_SYSTEMS.find(s => s.id === scoringId);

  const handleCreate = () => {
    if (!name.trim()) return alert("Enter tournament name");
    setLoading(true);
    setTimeout(() => {
      try {
        const t = createTournament({ name, description, presetId, scoringId, prizePool, region });
        router.push("/dashboard/tournaments/" + t.id);
      } catch { alert("Failed"); setLoading(false); }
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard/tournaments" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      <div className="glass-heavy neon-border rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>

        {/* Header */}
        <div className="relative flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl md:text-3xl">Create PUBG Mobile Tournament</h1>
            <p className="text-sm text-white/50">Step {step} of 3 · 4 players per squad · 16 squads per lobby</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-white/10"}`} />
          ))}
        </div>

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5 fade-in-up">
            <div>
              <label className="label">Tournament Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nepal PUBG Mobile Championship 2026" className="input text-lg" autoFocus />
            </div>
            <div>
              <label className="label">Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Official PUBG Mobile tournament for Nepal region" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prize Pool</label>
                <input type="text" value={prizePool} onChange={e => setPrizePool(e.target.value)} placeholder="NPR 50,000" className="input" />
              </div>
              <div>
                <label className="label">Region</label>
                <select value={region} onChange={e => setRegion(e.target.value)} className="input">
                  <option>South Asia</option>
                  <option>Southeast Asia</option>
                  <option>Middle East</option>
                  <option>Europe</option>
                  <option>North America</option>
                  <option>Global</option>
                </select>
              </div>
            </div>
            <button onClick={() => name.trim() ? setStep(2) : alert("Enter name")} className="btn-primary w-full" style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>
              Continue <ChevronRight className="w-4 h-4 ml-2 inline" />
            </button>
          </div>
        )}

        {/* STEP 2: Format */}
        {step === 2 && (
          <div className="space-y-5 fade-in-up">
            <div>
              <label className="label flex items-center gap-2">
                <Users className="w-4 h-4" /> Tournament Size
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TOURNAMENT_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPresetId(p.id)}
                    className={`p-4 rounded-xl text-left transition-all relative ${
                      presetId === p.id
                        ? "border-2 border-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/20"
                        : "border-2 border-white/10 glass hover:border-white/30"
                    }`}
                  >
                    {presetId === p.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" strokeWidth={3} />
                      </div>
                    )}
                    <div className="font-display font-bold text-base mb-1">{p.name}</div>
                    <div className="text-xs text-white/60 mb-2">{p.description}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.rounds.map((r, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                          {r.name} ({r.matchCount}M)
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-yellow-400 font-bold">
                      {p.totalSlots} Squads · {p.totalSlots * 4} Players · {Math.ceil(p.totalSlots / 16)} Lobbies
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Target className="w-4 h-4" /> Scoring System
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {SCORING_SYSTEMS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setScoringId(s.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      scoringId === s.id
                        ? "border-2 border-yellow-400 bg-yellow-500/10"
                        : "border-2 border-white/10 glass hover:border-white/30"
                    }`}
                  >
                    <div className="font-bold text-sm mb-0.5">{s.name}</div>
                    <div className="text-[10px] text-white/60">{s.killPoints}pt/kill</div>
                    <div className="text-[10px] text-yellow-400">1st = {s.placements[1]}pts</div>
                  </button>
                ))}
              </div>
              {selectedScoring && (
                <div className="mt-3 glass rounded-xl p-4 border border-white/10 text-xs">
                  <div className="font-bold text-yellow-400 mb-2">{selectedScoring.name} Placement Points:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedScoring.placements).map(([pos, pts]) => (
                      <span key={pos} className={`px-2 py-0.5 rounded ${Number(pts) > 0 ? "bg-white/10" : "bg-white/5 text-white/30"}`}>
                        #{pos} = {pts}pts
                      </span>
                    ))}
                  </div>
                  <div className="mt-2">Kill Points: {selectedScoring.killPoints}pt/kill{selectedScoring.winnerBonus > 0 ? ` | WWCD Bonus: +${selectedScoring.winnerBonus}pts` : ""}</div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">
                <ChevronLeft className="w-4 h-4 mr-1 inline" /> Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary flex-[2]" style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>
                Continue <ChevronRight className="w-4 h-4 ml-1 inline" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-5 fade-in-up">
            <div className="glass rounded-xl p-5 border border-yellow-500/30">
              <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2 text-yellow-400">
                <Award className="w-5 h-5" /> Tournament Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-white/50 text-xs">Name</div><div className="font-bold">{name}</div></div>
                <div><div className="text-white/50 text-xs">Game</div><div className="font-bold">PUBG Mobile</div></div>
                <div><div className="text-white/50 text-xs">Total Squads</div><div className="font-bold text-yellow-400">{selectedPreset?.totalSlots}</div></div>
                <div><div className="text-white/50 text-xs">Total Players</div><div className="font-bold">{(selectedPreset?.totalSlots || 0) * 4}</div></div>
                <div><div className="text-white/50 text-xs">Lobbies</div><div className="font-bold">{Math.ceil((selectedPreset?.totalSlots || 16) / 16)}</div></div>
                <div><div className="text-white/50 text-xs">Scoring</div><div className="font-bold">{selectedScoring?.name}</div></div>
                <div><div className="text-white/50 text-xs">Prize Pool</div><div className="font-bold">{prizePool || "None"}</div></div>
                <div><div className="text-white/50 text-xs">Region</div><div className="font-bold">{region}</div></div>
              </div>
              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="text-xs text-white/50 mb-2">Tournament Rounds:</div>
                {selectedPreset?.rounds.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm mb-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span className="font-bold">{r.name}</span>
                    <span className="text-white/50">{r.matchCount} matches</span>
                    {r.advanceTop > 0 && <span className="text-cyan-400 text-xs">Top {r.advanceTop} advance</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-ghost flex-1" disabled={loading}>
                <ChevronLeft className="w-4 h-4 mr-1 inline" /> Back
              </button>
              <button onClick={handleCreate} disabled={loading} className="btn-primary flex-[2] disabled:opacity-50" style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <><Rocket className="w-4 h-4 mr-1 inline" /> Launch Tournament</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}