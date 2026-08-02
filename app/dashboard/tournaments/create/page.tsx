"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Trophy, Users, Map,
  Target, Zap, Sparkles, Info, Plus, Minus, Award,
  MessageSquare, DollarSign, FileText, Settings, Upload,
  Calendar, Globe, Lock, Eye, EyeOff, Crown, Star,
  Flame, Shield, Copy, ChevronRight, Radio, Image,
  User, Mail, Clock, Layers, Grid3X3
} from "lucide-react";
import { createTournament } from "@/lib/storage/tournaments";
import { SCORING_PRESETS } from "@/types/tournament";
import { parseSlotList } from "@/lib/discord/slotParser";

const MAPS = [
  { name: "Erangel", type: "8x8 Classic", flag: "🏝️" },
  { name: "Miramar", type: "8x8 Desert", flag: "🏜️" },
  { name: "Sanhok", type: "4x4 Jungle", flag: "🌴" },
  { name: "Vikendi", type: "6x6 Snow", flag: "❄️" },
  { name: "Livik", type: "2x2 Fast", flag: "⚡" },
  { name: "Karakin", type: "2x2 Small", flag: "🏔️" },
  { name: "Nusa", type: "1x1 Mini", flag: "🌺" },
];

const STRUCTURE_TEMPLATES = [
  {
    key: "simple",
    label: "Simple Tournament",
    desc: "Single stage, all teams in one bracket",
    icon: "🏆",
    stages: [{ name: "Main Event", type: "GROUP_STAGE", groups: 1, teamsPerGroup: 16, matches: 6 }],
  },
  {
    key: "standard",
    label: "Qualifier → Final",
    desc: "Two stages with qualification",
    icon: "🎯",
    stages: [
      { name: "Qualifier", type: "OPEN_QUALIFIER", groups: 4, teamsPerGroup: 16, matches: 4 },
      { name: "Grand Final", type: "GRAND_FINAL", groups: 1, teamsPerGroup: 16, matches: 6 },
    ],
  },
  {
    key: "pro",
    label: "Qualifier → Semi → Final",
    desc: "Three-stage professional format",
    icon: "🔥",
    stages: [
      { name: "Qualifier", type: "OPEN_QUALIFIER", groups: 8, teamsPerGroup: 16, matches: 4 },
      { name: "Semi-Final", type: "SEMI_FINAL", groups: 2, teamsPerGroup: 16, matches: 6 },
      { name: "Grand Final", type: "GRAND_FINAL", groups: 1, teamsPerGroup: 16, matches: 6 },
    ],
  },
  {
    key: "custom",
    label: "Custom (Advanced)",
    desc: "Build your own stage structure",
    icon: "⚙️",
    stages: [],
  },
];

const STEPS = [
  { id: 1, label: "Details", icon: Trophy, desc: "Tournament info" },
  { id: 2, label: "Registration", icon: Users, desc: "Team settings" },
  { id: 3, label: "Structure", icon: Layers, desc: "Stages & format" },
  { id: 4, label: "Scoring", icon: Target, desc: "Point system" },
  { id: 5, label: "Maps", icon: Map, desc: "Map rotation" },
  { id: 6, label: "Teams", icon: Shield, desc: "Import teams" },
  { id: 7, label: "Groups", icon: Grid3X3, desc: "Group assignment" },
  { id: 8, label: "Publishing", icon: Globe, desc: "Visibility" },
  { id: 9, label: "Review", icon: Check, desc: "Final check" },
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ─── STEP 1: DETAILS ───
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [discord, setDiscord] = useState("");
  const [rules, setRules] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ─── STEP 2: REGISTRATION ───
  const [regType, setRegType] = useState<"open" | "closed" | "invite">("open");
  const [maxTeams, setMaxTeams] = useState(64);
  const [rosterSize, setRosterSize] = useState(4);
  const [substitutes, setSubstitutes] = useState(1);

  // ─── STEP 3: STRUCTURE ───
  const [structureTemplate, setStructureTemplate] = useState("standard");
  const [customStages, setCustomStages] = useState<any[]>([]);

  // ─── STEP 4: SCORING ───
  const [scoringKey, setScoringKey] = useState("pmgc");
  const [customScoring, setCustomScoring] = useState(false);
  const [placementPoints, setPlacementPoints] = useState([15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0]);
  const [killPoints, setKillPoints] = useState(1);
  const [wwcdBonus, setWwcdBonus] = useState(0);
  const [tiebreakerOrder, setTiebreakerOrder] = useState(["points", "wwcd", "kills", "damage"]);

  // ─── STEP 5: MAPS ───
  const [selectedMaps, setSelectedMaps] = useState(["Erangel", "Miramar", "Sanhok"]);
  const [matchesPerLobby, setMatchesPerLobby] = useState(4);

  // ─── STEP 6: TEAMS ───
  const [importMode, setImportMode] = useState<"none" | "paste" | "csv" | "manual">("none");
  const [pasteText, setPasteText] = useState("");
  const [parsedTeams, setParsedTeams] = useState<any[]>([]);
  const [manualTeams, setManualTeams] = useState<string[]>([]);

  // ─── STEP 7: GROUPS ───
  const [groupAssignment, setGroupAssignment] = useState<"auto" | "seeded" | "manual">("auto");

  // ─── STEP 8: PUBLISHING ───
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");

  // Get selected structure
  const template = STRUCTURE_TEMPLATES.find(t => t.key === structureTemplate);
  const activeStages = structureTemplate === "custom" ? customStages : (template?.stages || []);

  // Calculate total teams from structure
  const totalTeamsFromStructure = activeStages.length > 0
    ? activeStages[0].groups * activeStages[0].teamsPerGroup
    : maxTeams;

  const effectiveMaxTeams = Math.max(maxTeams, totalTeamsFromStructure);

  // Total rounds
  const totalRounds = activeStages.length || 1;
  const totalMatches = activeStages.reduce((sum, s) => sum + (s.groups * (s.matches || 4)), 0) || matchesPerLobby;

  const toggleMap = (mapName: string) => {
    setSelectedMaps(prev =>
      prev.includes(mapName) ? prev.filter(m => m !== mapName) : [...prev, mapName]
    );
  };

  const handleParse = () => {
    if (!pasteText.trim()) return;
    const result = parseSlotList(pasteText);
    setParsedTeams(result.slots);
  };

  const addCustomStage = () => {
    setCustomStages(prev => [...prev, {
      name: `Stage ${prev.length + 1}`,
      type: "GROUP_STAGE",
      groups: 1,
      teamsPerGroup: 16,
      matches: 4,
    }]);
  };

  const updateCustomStage = (idx: number, field: string, value: any) => {
    setCustomStages(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeCustomStage = (idx: number) => {
    setCustomStages(prev => prev.filter((_, i) => i !== idx));
  };

  const canNext = () => {
    if (step === 1) return name.trim().length >= 3;
    if (step === 5) return selectedMaps.length > 0;
    return true;
  };

  // ─── CREATE ───
  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const scoring = customScoring
        ? { name: "Custom", placementPoints, killPoints, wwcdBonus }
        : SCORING_PRESETS[scoringKey as keyof typeof SCORING_PRESETS];

      const t = await createTournament({
        name: name.trim(),
        description,
        prizePool,
        discord,
        rules,
        maxTeams: effectiveMaxTeams,
        scoringRule: scoring,
        mapRotation: selectedMaps.length > 0 ? selectedMaps : ["Erangel"],
        matchesPerLobby,
        rounds: totalRounds,
      });

      if (t) {
        // Create stages if template selected
        if (activeStages.length > 0) {
          for (const stage of activeStages) {
            await fetch(`/api/tournaments/${t.id}/stages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: stage.name,
                type: stage.type,
                numGroups: stage.groups,
                teamsPerGroup: stage.teamsPerGroup,
                matchesPerGroup: stage.matches,
                totalTeams: stage.groups * stage.teamsPerGroup,
                mapRotation: selectedMaps,
                scoringRule: scoring,
                qualificationRule: {
                  type: "TOP_N_PER_GROUP",
                  count: Math.floor(stage.teamsPerGroup / 2),
                },
              }),
            });
          }
        }

        router.push(`/dashboard/tournaments/${t.id}`);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tournaments" className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Tournament</h1>
          <p className="text-gray-500 text-sm">PUBG Mobile · Step {step} of {STEPS.length}</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="glass-card rounded-2xl p-3 border border-white/10 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-1">
                <button
                  onClick={() => done && setStep(s.id)}
                  disabled={!done && !active}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                    active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" :
                    done ? "bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 cursor-pointer" :
                    "bg-white/3 text-gray-600 border border-white/5"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    done ? "bg-green-500 text-white" : active ? "bg-white/20" : "bg-white/5"
                  }`}>
                    {done ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`w-3 h-px ${done ? "bg-green-500/50" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="glass-card rounded-2xl border border-white/10 p-8">

        {/* ═══ STEP 1: DETAILS ═══ */}
        {step === 1 && (
          <div className="space-y-6">
            <StepHeader icon={Trophy} color="yellow" title="Tournament Details" desc="Basic information about your tournament" />

            <div className="space-y-4">
              <div>
                <label className="label-text">Tournament Name <span className="text-red-400">*</span></label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BGMI Champions Cup Season 2" className="input-field text-lg" autoFocus />
                {name.length > 0 && name.length < 3 && <p className="text-red-400 text-xs mt-1">At least 3 characters</p>}
              </div>

              <div>
                <label className="label-text"><FileText className="w-3.5 h-3.5 inline mr-1" />Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tournament format, rules, timeline..." className="input-field resize-none" rows={3} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text"><DollarSign className="w-3.5 h-3.5 inline mr-1 text-yellow-400" />Prize Pool</label>
                  <input type="text" value={prizePool} onChange={e => setPrizePool(e.target.value)} placeholder="e.g. $500 or ₹50,000" className="input-field" />
                </div>
                <div>
                  <label className="label-text"><MessageSquare className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />Discord Server</label>
                  <input type="text" value={discord} onChange={e => setDiscord(e.target.value)} placeholder="discord.gg/yourserver" className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text"><Calendar className="w-3.5 h-3.5 inline mr-1" />Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-text"><Calendar className="w-3.5 h-3.5 inline mr-1" />End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
                </div>
              </div>

              <div>
                <label className="label-text">Rules (Optional)</label>
                <textarea value={rules} onChange={e => setRules(e.target.value)} placeholder="Tournament rules, code of conduct..." className="input-field resize-none text-sm" rows={3} />
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: REGISTRATION ═══ */}
        {step === 2 && (
          <div className="space-y-6">
            <StepHeader icon={Users} color="blue" title="Registration Settings" desc="How teams join your tournament" />

            <div>
              <label className="label-text">Registration Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "open", label: "Open", desc: "Anyone can register", icon: Globe },
                  { key: "closed", label: "Closed", desc: "Invite only", icon: Lock },
                  { key: "invite", label: "Invite Code", desc: "Code required", icon: Shield },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button key={opt.key} onClick={() => setRegType(opt.key as any)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${regType === opt.key ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/25"}`}>
                      <Icon className={`w-5 h-5 mb-2 ${regType === opt.key ? "text-blue-400" : "text-gray-500"}`} />
                      <div className="text-white font-bold text-sm">{opt.label}</div>
                      <div className="text-gray-500 text-xs">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-text">Max Teams</label>
                <input type="number" min={4} max={400} value={maxTeams} onChange={e => setMaxTeams(parseInt(e.target.value) || 16)} className="input-field text-center text-lg font-bold" />
                <div className="flex gap-1 mt-2">
                  {[16, 32, 64, 128, 256].map(n => (
                    <button key={n} onClick={() => setMaxTeams(n)} className={`flex-1 py-1 rounded text-xs font-medium border ${maxTeams === n ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-500"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-text">Roster Size</label>
                <input type="number" min={1} max={6} value={rosterSize} onChange={e => setRosterSize(parseInt(e.target.value) || 4)} className="input-field text-center text-lg font-bold" />
                <p className="text-gray-600 text-xs mt-1 text-center">Players per team</p>
              </div>
              <div>
                <label className="label-text">Substitutes</label>
                <input type="number" min={0} max={4} value={substitutes} onChange={e => setSubstitutes(parseInt(e.target.value) || 0)} className="input-field text-center text-lg font-bold" />
                <p className="text-gray-600 text-xs mt-1 text-center">Extra players allowed</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: STRUCTURE ═══ */}
        {step === 3 && (
          <div className="space-y-6">
            <StepHeader icon={Layers} color="purple" title="Tournament Structure" desc="Choose how your tournament is organized" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STRUCTURE_TEMPLATES.map(tmpl => (
                <button key={tmpl.key} onClick={() => { setStructureTemplate(tmpl.key); if (tmpl.key === "custom" && customStages.length === 0) addCustomStage(); }}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${structureTemplate === tmpl.key ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20" : "border-white/10 hover:border-white/25"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{tmpl.icon}</span>
                    <div>
                      <div className="text-white font-bold">{tmpl.label}</div>
                      <div className="text-gray-500 text-xs">{tmpl.desc}</div>
                    </div>
                    {structureTemplate === tmpl.key && <Check className="w-5 h-5 text-purple-400 ml-auto" />}
                  </div>
                  {tmpl.stages.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {tmpl.stages.map((s, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">{s.name}</span>
                          {i < tmpl.stages.length - 1 && <ChevronRight className="w-3 h-3 text-gray-600" />}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom stage builder */}
            {structureTemplate === "custom" && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">Custom Stages</h3>
                  <button onClick={addCustomStage} className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs">
                    <Plus className="w-3 h-3" />Add Stage
                  </button>
                </div>
                {customStages.map((stage, idx) => (
                  <div key={idx} className="glass-card rounded-xl p-4 border border-white/10">
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500">Stage Name</label>
                        <input type="text" value={stage.name} onChange={e => updateCustomStage(idx, "name", e.target.value)} className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Groups</label>
                        <input type="number" min={1} value={stage.groups} onChange={e => updateCustomStage(idx, "groups", parseInt(e.target.value) || 1)} className="input-field text-sm text-center" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Teams/G</label>
                        <input type="number" min={2} value={stage.teamsPerGroup} onChange={e => updateCustomStage(idx, "teamsPerGroup", parseInt(e.target.value) || 16)} className="input-field text-sm text-center" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Matches</label>
                        <input type="number" min={1} value={stage.matches} onChange={e => updateCustomStage(idx, "matches", parseInt(e.target.value) || 4)} className="input-field text-sm text-center" />
                      </div>
                    </div>
                    <button onClick={() => removeCustomStage(idx)} className="text-red-400 text-xs mt-2 hover:text-red-300">Remove</button>
                  </div>
                ))}
              </div>
            )}

            {/* Structure Preview */}
            {activeStages.length > 0 && (
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Structure Preview</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {activeStages.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-center">
                        <div className="text-white text-xs font-bold">{s.name}</div>
                        <div className="text-gray-500 text-[10px]">{s.groups * s.teamsPerGroup} teams · {s.groups}G · {s.matches}M</div>
                      </div>
                      {i < activeStages.length - 1 && <ArrowRight className="w-4 h-4 text-gray-600" />}
                    </div>
                  ))}
                  <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                    <div className="text-yellow-400 text-xs font-bold">🏆 Champion</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 4: SCORING ═══ */}
        {step === 4 && (
          <div className="space-y-6">
            <StepHeader icon={Target} color="orange" title="Scoring System" desc="How points are awarded per match" />

            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
              <button onClick={() => setCustomScoring(false)} className={`px-4 py-2 rounded-lg text-sm font-medium ${!customScoring ? "bg-blue-600 text-white" : "text-gray-400"}`}>
                <Trophy className="w-3.5 h-3.5 inline mr-1.5" />Presets
              </button>
              <button onClick={() => setCustomScoring(true)} className={`px-4 py-2 rounded-lg text-sm font-medium ${customScoring ? "bg-blue-600 text-white" : "text-gray-400"}`}>
                <Settings className="w-3.5 h-3.5 inline mr-1.5" />Custom
              </button>
            </div>

            {!customScoring ? (
              <div className="space-y-2">
                {Object.entries(SCORING_PRESETS).map(([key, s]) => (
                  <button key={key} onClick={() => setScoringKey(key)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${scoringKey === key ? "border-orange-500 bg-orange-500/5" : "border-white/10 hover:border-white/25"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold">{s.name}</div>
                        <div className="text-gray-500 text-xs">1st={s.placementPoints[0]}pts · Kill={s.killPoints}pt{s.killPoints > 1 ? "s" : ""}{s.wwcdBonus ? ` · WWCD+${s.wwcdBonus}` : ""}</div>
                      </div>
                      {scoringKey === key && <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="label-text">Placement Points (position #1 to #16)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {placementPoints.map((pts, idx) => (
                      <div key={idx} className={`flex flex-col items-center p-2 rounded-lg border ${idx < 3 ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/8"}`}>
                        <span className={`text-[10px] font-bold ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-amber-600" : "text-gray-500"}`}>
                          #{idx + 1}
                        </span>
                        <input type="number" min={0} value={pts}
                          onChange={e => setPlacementPoints(prev => { const n = [...prev]; n[idx] = parseInt(e.target.value) || 0; return n; })}
                          className="w-full mt-1 bg-transparent text-white font-mono font-bold text-center outline-none border-b border-white/10 focus:border-blue-500" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Kill Points</label>
                    <input type="number" min={0} value={killPoints} onChange={e => setKillPoints(parseInt(e.target.value) || 0)} className="input-field text-center font-mono font-bold" />
                  </div>
                  <div>
                    <label className="label-text">WWCD Bonus</label>
                    <input type="number" min={0} value={wwcdBonus} onChange={e => setWwcdBonus(parseInt(e.target.value) || 0)} className="input-field text-center font-mono font-bold" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 5: MAPS ═══ */}
        {step === 5 && (
          <div className="space-y-6">
            <StepHeader icon={Map} color="green" title="Map Rotation" desc="Select maps and match count" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MAPS.map(map => {
                const isSelected = selectedMaps.includes(map.name);
                return (
                  <button key={map.name} onClick={() => toggleMap(map.name)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? "border-green-500 bg-green-500/10" : "border-white/10 hover:border-white/25"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{map.flag}</span>
                      {isSelected && <Check className="w-4 h-4 text-green-400" />}
                    </div>
                    <div className="text-white font-bold text-sm">{map.name}</div>
                    <div className="text-gray-500 text-xs">{map.type}</div>
                  </button>
                );
              })}
            </div>

            {selectedMaps.length === 0 && (
              <p className="text-red-400 text-sm text-center">Select at least 1 map</p>
            )}

            <div>
              <label className="label-text">Matches Per Lobby: <span className="text-white font-bold">{matchesPerLobby}</span></label>
              <input type="range" min={1} max={10} value={matchesPerLobby} onChange={e => setMatchesPerLobby(parseInt(e.target.value))} className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-gray-600"><span>1</span><span>5</span><span>10</span></div>
            </div>
          </div>
        )}

        {/* ═══ STEP 6: TEAMS ═══ */}
        {step === 6 && (
          <div className="space-y-6">
            <StepHeader icon={Shield} color="cyan" title="Import Teams" desc="Add teams now or later" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "none", label: "Skip", desc: "Add teams later", icon: Clock },
                { key: "paste", label: "Discord Paste", desc: "Paste slot list", icon: MessageSquare },
                { key: "csv", label: "CSV Upload", desc: "Upload spreadsheet", icon: Upload },
                { key: "manual", label: "Manual", desc: "Type team names", icon: User },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.key} onClick={() => setImportMode(opt.key as any)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${importMode === opt.key ? "border-cyan-500 bg-cyan-500/10" : "border-white/10 hover:border-white/25"}`}>
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${importMode === opt.key ? "text-cyan-400" : "text-gray-500"}`} />
                    <div className="text-white font-bold text-sm">{opt.label}</div>
                    <div className="text-gray-500 text-xs">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            {importMode === "paste" && (
              <div className="space-y-3">
                <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder="Paste your Discord slot list here..." className="input-field font-mono text-sm resize-none" rows={8} />
                <button onClick={handleParse} disabled={!pasteText.trim()} className="btn-primary px-4 py-2 text-sm">
                  <Zap className="w-4 h-4" />Parse Teams
                </button>
                {parsedTeams.length > 0 && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 font-bold text-sm">{parsedTeams.length} teams detected!</p>
                    <div className="max-h-32 overflow-y-auto mt-2 space-y-0.5">
                      {parsedTeams.map(t => (
                        <div key={t.slotNumber} className="text-xs text-gray-300">#{t.slotNumber} {t.teamName}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {importMode === "manual" && (
              <div className="space-y-2">
                <p className="text-gray-500 text-xs">Enter one team name per line</p>
                <textarea
                  value={manualTeams.join("\n")}
                  onChange={e => setManualTeams(e.target.value.split("\n").filter(t => t.trim()))}
                  placeholder="Team Alpha\nTeam Bravo\nTeam Charlie"
                  className="input-field font-mono text-sm resize-none"
                  rows={8}
                />
                {manualTeams.length > 0 && <p className="text-blue-400 text-xs">{manualTeams.length} teams entered</p>}
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 7: GROUPS ═══ */}
        {step === 7 && (
          <div className="space-y-6">
            <StepHeader icon={Grid3X3} color="indigo" title="Group Assignment" desc="How teams are distributed into groups" />

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "auto", label: "Automatic", desc: "Random balanced distribution", icon: Sparkles },
                { key: "seeded", label: "Snake Seeding", desc: "Top teams spread evenly", icon: TrendingUp },
                { key: "manual", label: "Manual", desc: "Assign after creation", icon: User },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.key} onClick={() => setGroupAssignment(opt.key as any)}
                    className={`p-5 rounded-xl border-2 text-center transition-all ${groupAssignment === opt.key ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/25"}`}>
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${groupAssignment === opt.key ? "text-indigo-400" : "text-gray-500"}`} />
                    <div className="text-white font-bold text-sm">{opt.label}</div>
                    <div className="text-gray-500 text-xs">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
              <p className="text-indigo-300 text-xs">
                <Info className="w-3 h-3 inline mr-1" />
                Group assignment can always be changed later from the tournament's Stages tab. The Groups visual builder lets you drag-and-drop teams between groups.
              </p>
            </div>
          </div>
        )}

        {/* ═══ STEP 8: PUBLISHING ═══ */}
        {step === 8 && (
          <div className="space-y-6">
            <StepHeader icon={Globe} color="emerald" title="Publishing" desc="Who can see your tournament" />

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "public", label: "Public", desc: "Visible to everyone, listed on TournaOps", icon: Globe, color: "green" },
                { key: "unlisted", label: "Unlisted", desc: "Accessible by link only", icon: Eye, color: "blue" },
                { key: "private", label: "Private", desc: "Only you can see it", icon: Lock, color: "red" },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.key} onClick={() => setVisibility(opt.key as any)}
                    className={`p-5 rounded-xl border-2 text-center transition-all ${visibility === opt.key ? `border-${opt.color}-500 bg-${opt.color}-500/10` : "border-white/10 hover:border-white/25"}`}>
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${visibility === opt.key ? `text-${opt.color}-400` : "text-gray-500"}`} />
                    <div className="text-white font-bold text-sm">{opt.label}</div>
                    <div className="text-gray-500 text-xs">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ STEP 9: REVIEW ═══ */}
        {step === 9 && (
          <div className="space-y-6">
            <StepHeader icon={Check} color="blue" title="Review & Create" desc="Verify everything before creating" />

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Name", value: name },
                  { label: "Prize Pool", value: prizePool || "Not set" },
                  { label: "Max Teams", value: `${effectiveMaxTeams} squads` },
                  { label: "Structure", value: template?.label || "Custom" },
                  { label: "Stages", value: activeStages.map(s => s.name).join(" → ") || "Single stage" },
                  { label: "Scoring", value: customScoring ? "Custom" : SCORING_PRESETS[scoringKey as keyof typeof SCORING_PRESETS]?.name },
                  { label: "Maps", value: selectedMaps.join(", ") },
                  { label: "Matches/Lobby", value: `${matchesPerLobby} matches` },
                  { label: "Total Matches", value: `~${totalMatches} matches` },
                  { label: "Registration", value: regType.charAt(0).toUpperCase() + regType.slice(1) },
                  { label: "Visibility", value: visibility.charAt(0).toUpperCase() + visibility.slice(1) },
                  { label: "Teams Imported", value: parsedTeams.length > 0 ? `${parsedTeams.length} from Discord` : manualTeams.length > 0 ? `${manualTeams.length} manual` : "None yet" },
                ].map(row => (
                  <div key={row.label} className="flex flex-col gap-0.5">
                    <span className="text-gray-500 text-xs">{row.label}</span>
                    <span className="text-white font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual pipeline */}
            {activeStages.length > 0 && (
              <div className="p-4 rounded-xl bg-white/3 border border-white/10">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tournament Pipeline</div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                    <div className="text-blue-400 text-xs font-bold">{effectiveMaxTeams} Teams</div>
                    <div className="text-gray-600 text-[10px]">Registration</div>
                  </div>
                  {activeStages.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-gray-600" />
                      <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                        <div className="text-purple-400 text-xs font-bold">{s.name}</div>
                        <div className="text-gray-600 text-[10px]">{s.groups * s.teamsPerGroup}T · {s.groups}G · {s.matches}M</div>
                      </div>
                    </div>
                  ))}
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                  <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                    <Crown className="w-4 h-4 text-yellow-400 mx-auto" />
                    <div className="text-yellow-400 text-[10px] font-bold">Champion</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ NAVIGATION ═══ */}
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

          <div className="text-xs text-gray-500">Step {step} of {STEPS.length}</div>

          {step < STEPS.length ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary px-6 py-2.5">
              Next<ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleCreate} disabled={loading || !name.trim()} className="btn-primary px-8 py-2.5">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
              ) : (
                <><Zap className="w-4 h-4" />Create Tournament</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══ HELPER COMPONENTS ═══

function StepHeader({ icon: Icon, color, title, desc }: { icon: any; color: string; title: string; desc: string }) {
  const colorMap: Record<string, string> = {
    yellow: "from-yellow-500 to-orange-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-500 to-red-500",
    green: "from-green-500 to-emerald-500",
    cyan: "from-cyan-500 to-blue-500",
    indigo: "from-indigo-500 to-purple-500",
    emerald: "from-emerald-500 to-green-500",
    red: "from-red-500 to-pink-500",
  };
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-500 text-sm">{desc}</p>
      </div>
    </div>
  );
}