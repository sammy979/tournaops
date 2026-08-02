"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Trophy, Users,
  Map, Target, Zap, Sparkles, Info, Plus, Minus,
  Award, MessageSquare, DollarSign, FileText, Settings
} from "lucide-react";
import { createTournament } from "@/lib/storage/tournaments";
import { SCORING_PRESETS } from "@/types/tournament";

const MAPS = [
  { name: "Erangel", type: "8x8 Classic", flag: "🏝️" },
  { name: "Miramar", type: "8x8 Desert", flag: "🏜️" },
  { name: "Sanhok", type: "4x4 Jungle", flag: "🌴" },
  { name: "Vikendi", type: "6x6 Snow", flag: "❄️" },
  { name: "Livik", type: "2x2 Fast", flag: "⚡" },
  { name: "Karakin", type: "2x2 Small", flag: "🏔️" },
  { name: "Nusa", type: "1x1 Mini", flag: "🌺" },
];

const PRESETS = [
  { key: "scrim_16", label: "Scrim", squads: 16, lobbies: 1, matches: 3, rounds: 1, desc: "Quick practice event" },
  { key: "small_32", label: "Small League", squads: 32, lobbies: 2, matches: 4, rounds: 2, desc: "Weekly community event" },
  { key: "medium_64", label: "Medium Tournament", squads: 64, lobbies: 4, matches: 4, rounds: 2, desc: "Regional qualifier" },
  { key: "large_128", label: "Large Championship", squads: 128, lobbies: 8, matches: 4, rounds: 3, desc: "Major esports event" },
  { key: "mega_256", label: "Mega Circuit", squads: 256, lobbies: 16, matches: 4, rounds: 4, desc: "Multi-region qualifier" },
  { key: "massive_400", label: "Massive Grand Prix", squads: 400, lobbies: 25, matches: 4, rounds: 5, desc: "PMGC-scale tournament" },
];

const STEPS = [
  { id: 1, label: "Basics", icon: Trophy, desc: "Name & prize" },
  { id: 2, label: "Structure", icon: Users, desc: "Squads & format" },
  { id: 3, label: "Rounds", icon: Award, desc: "Qualifiers & finals" },
  { id: 4, label: "Maps", icon: Map, desc: "Map rotation" },
  { id: 5, label: "Scoring", icon: Target, desc: "Point system" },
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"preset" | "custom">("preset");

  const [form, setForm] = useState({
    name: "",
    description: "",
    prizePool: "",
    discord: "",
    rules: "",
    scoringKey: "pmgc",
    maps: ["Erangel", "Miramar", "Sanhok"],

    // Custom structure (fully editable)
    totalSquads: 32,
    squadsPerLobby: 16,
    matchesPerLobby: 4,
    totalRounds: 2,
    roundNames: ["Qualifiers", "Grand Finals"],
    advanceCount: [16], // How many teams advance per round
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const toggleMap = (mapName: string) => {
    set("maps", form.maps.includes(mapName)
      ? form.maps.filter(m => m !== mapName)
      : [...form.maps, mapName]
    );
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const roundNames = ["Qualifiers", "Round of 32", "Semi Finals", "Grand Finals", "Super Finals"];
    setForm(f => ({
      ...f,
      totalSquads: preset.squads,
      squadsPerLobby: preset.squads >= 16 ? 16 : preset.squads,
      matchesPerLobby: preset.matches,
      totalRounds: preset.rounds,
      roundNames: roundNames.slice(0, preset.rounds),
      advanceCount: Array.from({ length: preset.rounds - 1 }, (_, i) =>
        Math.max(8, Math.floor(preset.squads / Math.pow(2, i + 1)))
      ),
    }));
  };

  const updateRoundName = (idx: number, name: string) => {
    const newNames = [...form.roundNames];
    newNames[idx] = name;
    set("roundNames", newNames);
  };

  const updateAdvance = (idx: number, count: number) => {
    const newAdvance = [...form.advanceCount];
    newAdvance[idx] = count;
    set("advanceCount", newAdvance);
  };

  const adjustRounds = (delta: number) => {
    const newTotal = Math.max(1, Math.min(6, form.totalRounds + delta));
    const defaultNames = ["Qualifiers", "Round of 32", "Semi Finals", "Grand Finals", "Super Finals", "Ultra Finals"];
    const newNames = defaultNames.slice(0, newTotal);
    // Preserve existing custom names
    for (let i = 0; i < Math.min(form.roundNames.length, newTotal); i++) {
      newNames[i] = form.roundNames[i];
    }
    const newAdvance = Array.from({ length: newTotal - 1 }, (_, i) =>
      form.advanceCount[i] || Math.max(8, Math.floor(form.totalSquads / Math.pow(2, i + 1)))
    );
    setForm(f => ({ ...f, totalRounds: newTotal, roundNames: newNames, advanceCount: newAdvance }));
  };

  const numLobbies = Math.max(1, Math.ceil(form.totalSquads / form.squadsPerLobby));
  const totalMatches = numLobbies * form.matchesPerLobby * form.totalRounds;
  const scoring = SCORING_PRESETS[form.scoringKey as keyof typeof SCORING_PRESETS];

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const t = await createTournament({
        name: form.name.trim(),
        description: form.description,
        prizePool: form.prizePool,
        discord: form.discord,
        rules: form.rules,
        maxTeams: form.totalSquads,
        scoringRule: scoring,
        mapRotation: form.maps.length > 0 ? form.maps : ["Erangel"],
        matchesPerLobby: form.matchesPerLobby,
        rounds: form.totalRounds,
      });
      if (t) router.push(`/dashboard/tournaments/${t.id}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 1) return form.name.trim().length >= 3;
    if (step === 2) return form.totalSquads >= 4 && form.squadsPerLobby >= 4;
    if (step === 3) return form.totalRounds >= 1;
    if (step === 4) return form.maps.length > 0;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tournaments" className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Tournament</h1>
          <p className="text-gray-500 text-sm">PUBG Mobile · Fully customizable</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="glass-card rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => step > s.id && setStep(s.id)}
                  disabled={step < s.id}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all ${
                    active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" :
                    done ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 cursor-pointer" :
                    "bg-white/5 text-gray-600 border border-white/10"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    done ? "bg-green-500" : active ? "bg-white/20" : "bg-white/10"
                  }`}>
                    {done ? <Check className="w-3.5 h-3.5 text-white" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold">{s.label}</div>
                    <div className="text-[10px] opacity-70">{s.desc}</div>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`w-4 h-px ${done ? "bg-green-500" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="glass-card rounded-2xl border border-white/10 p-8">

        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />Tournament Details
              </h2>
              <p className="text-gray-500 text-sm">Give your tournament identity</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400 block mb-1.5">
                  Tournament Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="e.g. BGMI Champions Cup Season 2"
                  className="input-field text-lg"
                  autoFocus
                />
                {form.name.length > 0 && form.name.length < 3 && (
                  <p className="text-red-400 text-xs mt-1">At least 3 characters</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Tournament format, rules, timeline..."
                  className="input-field resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 block mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-yellow-400" />Prize Pool
                  </label>
                  <input
                    type="text"
                    value={form.prizePool}
                    onChange={e => set("prizePool", e.target.value)}
                    placeholder="e.g. ₹50,000 or $500"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 block mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />Discord Invite
                  </label>
                  <input
                    type="text"
                    value={form.discord}
                    onChange={e => set("discord", e.target.value)}
                    placeholder="discord.gg/yourserver"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 block mb-1.5">Rules (Optional)</label>
                <textarea
                  value={form.rules}
                  onChange={e => set("rules", e.target.value)}
                  placeholder="Team rules, code of conduct, tournament regulations..."
                  className="input-field resize-none text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: STRUCTURE */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />Tournament Structure
              </h2>
              <p className="text-gray-500 text-sm">Choose a preset or fully customize</p>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
              <button
                onClick={() => setMode("preset")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "preset" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                Quick Presets
              </button>
              <button
                onClick={() => setMode("custom")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "custom" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                <Settings className="w-3.5 h-3.5 inline mr-1.5" />
                Full Custom
              </button>
            </div>

            {mode === "preset" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.map(p => {
                  const isSelected = form.totalSquads === p.squads;
                  return (
                    <button
                      key={p.key}
                      onClick={() => applyPreset(p)}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                          : "border-white/10 hover:border-white/25 hover:bg-white/3"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-bold text-white text-lg">{p.label}</div>
                          <div className="text-gray-500 text-xs">{p.desc}</div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-blue-400 font-mono font-bold">
                          <Users className="w-3 h-3" />{p.squads}
                        </span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-500">{p.lobbies} lobbies</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-500">{p.rounds} rounds</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-500">{p.matches} matches</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {mode === "custom" && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                  <div className="flex items-start gap-2.5 text-blue-300 text-xs">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Full Custom Mode</p>
                      <p className="text-blue-300/70">Set exact numbers for your tournament. Great for unique formats like Erangel-only 24-squad or 3-round leagues.</p>
                    </div>
                  </div>
                </div>

                {/* Total Squads */}
                <div>
                  <label className="text-sm font-medium text-gray-400 block mb-2 flex items-center justify-between">
                    <span>Total Squads</span>
                    <span className="text-white font-bold text-lg font-mono">{form.totalSquads}</span>
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={400}
                    step={4}
                    value={form.totalSquads}
                    onChange={e => set("totalSquads", parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>4</span><span>100</span><span>200</span><span>300</span><span>400</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[16, 20, 24, 32, 48, 64, 100, 128, 200].map(n => (
                      <button
                        key={n}
                        onClick={() => set("totalSquads", n)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${form.totalSquads === n ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-500 hover:border-white/20"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Squads per lobby */}
                <div>
                  <label className="text-sm font-medium text-gray-400 block mb-2 flex items-center justify-between">
                    <span>Squads per Lobby</span>
                    <span className="text-white font-bold text-lg font-mono">{form.squadsPerLobby}</span>
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={25}
                    value={form.squadsPerLobby}
                    onChange={e => set("squadsPerLobby", parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    {[4, 8, 12, 16, 20, 25].map(n => (
                      <button
                        key={n}
                        onClick={() => set("squadsPerLobby", n)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${form.squadsPerLobby === n ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-500 hover:border-white/20"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-600 text-xs mt-2">
                    PUBG Mobile lobbies typically hold 16 squads. Choose based on your format.
                  </p>
                </div>

                {/* Matches per lobby */}
                <div>
                  <label className="text-sm font-medium text-gray-400 block mb-2 flex items-center justify-between">
                    <span>Matches per Lobby</span>
                    <span className="text-white font-bold text-lg font-mono">{form.matchesPerLobby}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form.matchesPerLobby}
                    onChange={e => set("matchesPerLobby", parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => set("matchesPerLobby", n)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${form.matchesPerLobby === n ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-500 hover:border-white/20"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Live Preview */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-white/4 to-white/2 border border-white/10">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Live Preview</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Squads", value: form.totalSquads, color: "text-blue-400" },
                  { label: "Lobbies", value: numLobbies, color: "text-purple-400" },
                  { label: "Matches per Round", value: numLobbies * form.matchesPerLobby, color: "text-green-400" },
                  { label: "Total Matches", value: totalMatches, color: "text-yellow-400" },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-lg bg-white/3">
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-gray-600 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ROUNDS (NEW!) */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />Rounds & Qualifiers
              </h2>
              <p className="text-gray-500 text-sm">Configure how teams progress through the tournament</p>
            </div>

            {/* Number of rounds */}
            <div className="p-5 rounded-xl bg-white/3 border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-white font-bold text-lg">Number of Rounds</div>
                  <div className="text-gray-500 text-xs">1 = Single stage · 2 = Qualifiers + Finals · 3+ = Multi-stage</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => adjustRounds(-1)} disabled={form.totalRounds <= 1} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white flex items-center justify-center border border-white/10">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-4xl font-black text-white font-mono w-16 text-center">{form.totalRounds}</span>
                  <button onClick={() => adjustRounds(1)} disabled={form.totalRounds >= 6} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white flex items-center justify-center border border-white/10">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => adjustRounds(n - form.totalRounds)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${form.totalRounds === n ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-white/10 text-gray-500 hover:border-white/20"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Round names & advancement */}
            <div className="space-y-3">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Round Configuration</div>
              {Array.from({ length: form.totalRounds }).map((_, idx) => {
                const isLast = idx === form.totalRounds - 1;
                return (
                  <div key={idx} className={`p-4 rounded-xl border transition-all ${
                    isLast ? "bg-yellow-500/5 border-yellow-500/20" : "bg-white/3 border-white/8"
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                        isLast ? "bg-yellow-500/20 text-yellow-400" : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                            Round Name {isLast && "🏆"}
                          </label>
                          <input
                            type="text"
                            value={form.roundNames[idx] || ""}
                            onChange={e => updateRoundName(idx, e.target.value)}
                            className="input-field text-sm"
                            placeholder={`Round ${idx + 1}`}
                          />
                        </div>
                        {!isLast && (
                          <div>
                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                              Teams Advancing to Next
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={2}
                                max={form.totalSquads}
                                value={form.advanceCount[idx] || 16}
                                onChange={e => updateAdvance(idx, parseInt(e.target.value) || 16)}
                                className="input-field text-sm w-24"
                              />
                              <div className="flex flex-wrap gap-1">
                                {[8, 16, 24, 32].map(n => (
                                  <button
                                    key={n}
                                    onClick={() => updateAdvance(idx, n)}
                                    className={`px-2 py-1 rounded text-[10px] font-medium border ${form.advanceCount[idx] === n ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-white/10 text-gray-500 hover:border-white/20"}`}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: MAPS */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Map className="w-5 h-5 text-green-400" />Map Rotation
              </h2>
              <p className="text-gray-500 text-sm">Select maps that will be played (rotates each match)</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MAPS.map(map => {
                const isSelected = form.maps.includes(map.name);
                return (
                  <button
                    key={map.name}
                    onClick={() => toggleMap(map.name)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                        : "border-white/10 hover:border-white/25 hover:bg-white/3"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{map.flag}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-white text-sm">{map.name}</div>
                    <div className="text-gray-500 text-xs">{map.type}</div>
                  </button>
                );
              })}
            </div>

            {form.maps.length === 0 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                Select at least 1 map
              </div>
            )}

            {form.maps.length > 0 && (
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                <div className="text-xs text-gray-400 mb-2">Map Rotation Order:</div>
                <div className="flex flex-wrap gap-2">
                  {form.maps.map((m, i) => (
                    <span key={m} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                      <span className="text-xs text-gray-500 font-mono">M{i + 1}</span>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: SCORING */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />Scoring System
              </h2>
              <p className="text-gray-500 text-sm">Choose how points are awarded per match</p>
            </div>

            <div className="space-y-3">
              {Object.entries(SCORING_PRESETS).map(([key, s]) => {
                const isSelected = form.scoringKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => set("scoringKey", key)}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10"
                        : "border-white/10 hover:border-white/25 hover:bg-white/3"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-bold text-white text-lg">{s.name}</div>
                        <div className="text-gray-500 text-xs">
                          1st = {s.placementPoints[0]}pts · Kill = {s.killPoints}pt{s.killPoints > 1 ? "s" : ""}
                          {s.wwcdBonus ? ` · WWCD bonus +${s.wwcdBonus}` : ""}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="text-xs text-gray-500 mb-2">Placement Points Breakdown</div>
                        <div className="flex flex-wrap gap-1.5">
                          {s.placementPoints.slice(0, 10).map((pts, i) => (
                            <div key={i} className="flex items-center gap-1 bg-white/5 rounded px-2 py-1">
                              <span className="text-gray-500 text-xs">#{i + 1}</span>
                              <span className="text-orange-400 text-xs font-bold">{pts}pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Final Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-blue-400" />Tournament Summary
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Name", value: form.name || "—" },
                  { label: "Prize Pool", value: form.prizePool || "Not set" },
                  { label: "Total Squads", value: `${form.totalSquads} squads` },
                  { label: "Structure", value: `${numLobbies} lobbies × ${form.squadsPerLobby} squads` },
                  { label: "Rounds", value: form.roundNames.join(" → ") },
                  { label: "Matches", value: `${totalMatches} total (${form.matchesPerLobby}/lobby)` },
                  { label: "Maps", value: form.maps.join(", ") },
                  { label: "Scoring", value: scoring.name },
                ].map(row => (
                  <div key={row.label} className="flex flex-col gap-0.5">
                    <span className="text-gray-500 text-xs">{row.label}</span>
                    <span className="text-white text-sm font-medium truncate">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary px-5 py-2.5">
              <ArrowLeft className="w-4 h-4" />Back
            </button>
          ) : (
            <Link href="/dashboard/tournaments" className="btn-secondary px-5 py-2.5">
              <ArrowLeft className="w-4 h-4" />Cancel
            </Link>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            Step {step} of {STEPS.length}
          </div>

          {step < STEPS.length ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary px-6 py-2.5">
              Next<ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleCreate} disabled={loading || !form.name.trim()} className="btn-primary px-8 py-2.5">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />Create Tournament
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}