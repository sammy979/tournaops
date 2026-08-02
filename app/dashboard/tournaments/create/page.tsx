"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Trophy, Users,
  Map, Target, Zap, ChevronRight
} from "lucide-react";
import { createTournament } from "@/lib/storage/tournaments";
import { TOURNAMENT_PRESETS, SCORING_PRESETS } from "@/types/tournament";

const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik", "Karakin"];

const STEPS = [
  { id: 1, label: "Basics", icon: Trophy },
  { id: 2, label: "Format", icon: Users },
  { id: 3, label: "Scoring", icon: Target },
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    prizePool: "",
    discord: "",
    preset: "small_32",
    scoringKey: "pmgc",
    maps: ["Erangel", "Miramar", "Sanhok"],
    matchesPerLobby: 4,
    rounds: 2,
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleMap = (map: string) => {
    set("maps", form.maps.includes(map)
      ? form.maps.filter(m => m !== map)
      : [...form.maps, map]
    );
  };

  const preset = TOURNAMENT_PRESETS[form.preset as keyof typeof TOURNAMENT_PRESETS];
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
        maxTeams: preset.maxTeams,
        scoringRule: scoring,
        mapRotation: form.maps.length > 0 ? form.maps : ["Erangel"],
        matchesPerLobby: form.matchesPerLobby,
        rounds: form.rounds,
      });
      router.push(`/dashboard/tournaments/${t.id}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 1) return form.name.trim().length >= 3;
    if (step === 2) return form.maps.length > 0;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tournaments" className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Tournament</h1>
          <p className="text-gray-500 text-sm">PUBG Mobile Â· Fill in the details below</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  done ? "bg-blue-600 border-blue-600" :
                  active ? "border-blue-500 bg-blue-500/10" :
                  "border-white/15 bg-white/5"
                }`}>
                  {done ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "text-gray-600"}`} />
                  )}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${active ? "text-white" : done ? "text-gray-400" : "text-gray-600"}`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 transition-colors ${done ? "bg-blue-600" : "bg-white/10"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="glass-card rounded-2xl border border-white/10 p-8">

        {/* STEP 1 â€” BASICS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Tournament Details</h2>
              <p className="text-gray-500 text-sm">Give your tournament a name and basic info</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400 block mb-1.5">
                  Tournament Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="e.g. PMGC 2025 Grand Finals"
                  className="input-field"
                  autoFocus
                />
                {form.name.length > 0 && form.name.length < 3 && (
                  <p className="text-red-400 text-xs mt-1">At least 3 characters</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Tournament rules, format, info..."
                  className="input-field resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 block mb-1.5">
                    <Trophy className="w-3.5 h-3.5 inline mr-1 text-yellow-400" />
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    value={form.prizePool}
                    onChange={e => set("prizePool", e.target.value)}
                    placeholder="e.g. $500 or â‚¹10,000"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 block mb-1.5">Discord Server</label>
                  <input
                    type="text"
                    value={form.discord}
                    onChange={e => set("discord", e.target.value)}
                    placeholder="discord.gg/yourserver"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 â€” FORMAT */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Tournament Format</h2>
              <p className="text-gray-500 text-sm">Choose size, maps, and match count</p>
            </div>

            {/* Preset */}
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-3">
                <Users className="w-3.5 h-3.5 inline mr-1" />
                Tournament Size
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(TOURNAMENT_PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => {
                      set("preset", key);
                      set("rounds", p.rounds);
                      set("matchesPerLobby", p.matchesPerLobby);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      form.preset === key
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">
                      {p.rounds} round{p.rounds > 1 ? "s" : ""} Â· {p.matchesPerLobby} matches/lobby
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Maps */}
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-3">
                <Map className="w-3.5 h-3.5 inline mr-1" />
                Map Rotation <span className="text-gray-600 text-xs">(select all that apply)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {MAPS.map(map => (
                  <button
                    key={map}
                    onClick={() => toggleMap(map)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      form.maps.includes(map)
                        ? "border-blue-500 bg-blue-500/10 text-blue-300"
                        : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                    }`}
                  >
                    {map}
                    {form.maps.includes(map) && (
                      <Check className="w-3 h-3 inline ml-1.5" />
                    )}
                  </button>
                ))}
              </div>
              {form.maps.length === 0 && (
                <p className="text-red-400 text-xs mt-2">Select at least one map</p>
              )}
            </div>

            {/* Matches Per Lobby */}
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1.5">
                Matches Per Lobby: <span className="text-white">{form.matchesPerLobby}</span>
              </label>
              <input
                type="range"
                min={1}
                max={8}
                value={form.matchesPerLobby}
                onChange={e => set("matchesPerLobby", parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1</span><span>4</span><span>8</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 â€” SCORING */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Scoring System</h2>
              <p className="text-gray-500 text-sm">Choose how points are awarded</p>
            </div>

            <div className="space-y-3">
              {Object.entries(SCORING_PRESETS).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => set("scoringKey", key)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    form.scoringKey === key
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-sm">{s.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        1st={s.placementPoints[0]}pts Â· Kill={s.killPoints}pt{s.killPoints > 1 ? "s" : ""}
                        {s.wwcdBonus ? ` Â· WWCD bonus +${s.wwcdBonus}` : ""}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      form.scoringKey === key ? "border-blue-500 bg-blue-500" : "border-white/20"
                    }`}>
                      {form.scoringKey === key && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  {form.scoringKey === key && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-xs text-gray-500 mb-2">Placement points</div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.placementPoints.slice(0, 8).map((pts, i) => (
                          <div key={i} className="flex items-center gap-1 bg-white/5 rounded px-2 py-0.5">
                            <span className="text-gray-500 text-xs">#{i+1}</span>
                            <span className="text-blue-400 text-xs font-bold">{pts}pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white/4 rounded-xl p-5 border border-white/10">
              <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Tournament Summary
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Name", value: form.name || "â€”" },
                  { label: "Size", value: preset.label },
                  { label: "Maps", value: form.maps.join(", ") || "â€”" },
                  { label: "Scoring", value: scoring.name },
                  { label: "Matches/Lobby", value: `${form.matchesPerLobby} matches` },
                  { label: "Total Matches", value: `${preset.maxTeams / 16 * form.matchesPerLobby} matches` },
                  { label: "Rounds", value: `${form.rounds} round${form.rounds > 1 ? "s" : ""}` },
                  { label: "Prize Pool", value: form.prizePool || "Not set" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between gap-2">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="text-gray-200 text-right truncate">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary px-5 py-2.5">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <Link href="/dashboard/tournaments" className="btn-secondary px-5 py-2.5">
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Link>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="btn-primary px-6 py-2.5"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading || !form.name.trim()}
              className="btn-primary px-8 py-2.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Create Tournament
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}