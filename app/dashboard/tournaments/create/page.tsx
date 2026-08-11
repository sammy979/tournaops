"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  Trophy,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Users,
  Calendar,
  Globe,
  Lock,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  DollarSign,
  Clock,
  Map,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5;
type BracketFormat = "single-elim" | "double-elim" | "round-robin" | "swiss";
type Visibility = "public" | "private" | "unlisted";

interface PrizeEntry { place: string; amount: string }
interface StageEntry  { name: string; format: BracketFormat; teams: number }

interface TournamentForm {
  // Step 1 — Basic info
  name:        string;
  game:        string;
  region:      string;
  description: string;
  // Step 2 — Format
  format:      BracketFormat;
  maxTeams:    number;
  stages:      StageEntry[];
  bestOf:      number;
  // Step 3 — Schedule
  startDate:   string;
  endDate:     string;
  checkInMins: number;
  timezone:    string;
  // Step 4 — Prizes & visibility
  prizePool:   string;
  prizes:      PrizeEntry[];
  visibility:  Visibility;
  registrationOpen: boolean;
  requireRoster:    boolean;
  // Step 5 — Review
}

const GAMES = [
  "Valorant","CS2","League of Legends","Rocket League",
  "Apex Legends","Fortnite","Overwatch 2","PUBG",
  "Call of Duty","Dota 2","Rainbow Six Siege","Other",
];

const REGIONS = ["North America","Europe","Asia Pacific","Latin America","Middle East","Oceania","Global"];
const TIMEZONES = ["UTC-8 (PST)","UTC-5 (EST)","UTC+0 (GMT)","UTC+1 (CET)","UTC+8 (SGT)","UTC+9 (JST)","UTC+11 (AEDT)"];

const FORMAT_OPTIONS: { value: BracketFormat; label: string; desc: string; icon: string }[] = [
  { value: "single-elim",  label: "Single Elimination", desc: "One loss and you're out. Fast-paced and exciting.",           icon: "⚡" },
  { value: "double-elim",  label: "Double Elimination",  desc: "Teams get a second chance through the losers bracket.",       icon: "🔄" },
  { value: "round-robin",  label: "Round Robin",         desc: "Every team plays every other team. Fair and thorough.",       icon: "🔁" },
  { value: "swiss",        label: "Swiss System",         desc: "Teams with similar records play each other each round.",     icon: "🎯" },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: Step; total: number }) {
  const steps = [
    { n: 1 as Step, label: "Basics"   },
    { n: 2 as Step, label: "Format"   },
    { n: 3 as Step, label: "Schedule" },
    { n: 4 as Step, label: "Prizes"   },
    { n: 5 as Step, label: "Review"   },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              current > s.n  ? "bg-emerald-500 border-emerald-500 text-white" :
              current === s.n? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/30" :
              "bg-transparent border-white/[0.15] text-slate-600"
            }`}>
              {current > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
            </div>
            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${current >= s.n ? "text-slate-300" : "text-slate-700"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${current > s.n ? "bg-emerald-500/50" : "bg-white/[0.06]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Input helpers ────────────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-slate-400 text-xs font-medium block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-slate-600 text-xs mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-700 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all";
const selectCls = "w-full bg-[#0f1117] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateTournamentPage() {
  const router = useRouter();
  const [step,      setStep]      = useState<Step>(1);
  const [creating,  setCreating]  = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState<TournamentForm>({
    name: "", game: "Valorant", region: "North America", description: "",
    format: "double-elim", maxTeams: 16, bestOf: 3,
    stages: [
      { name: "Group Stage",   format: "round-robin",  teams: 16 },
      { name: "Playoffs",      format: "single-elim",  teams: 8  },
      { name: "Grand Finals",  format: "single-elim",  teams: 2  },
    ],
    startDate: "", endDate: "", checkInMins: 15, timezone: "UTC-5 (EST)",
    prizePool: "", prizes: [
      { place: "1st", amount: "" },
      { place: "2nd", amount: "" },
      { place: "3rd", amount: "" },
    ],
    visibility: "public", registrationOpen: true, requireRoster: true,
  });

  const upd = (key: keyof TournamentForm, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleAIFill = () => {
    setAiLoading(true);
    setTimeout(() => {
      setForm(prev => ({
        ...prev,
        name:        prev.name || "Champions Circuit Season 5",
        description: "A premier seasonal championship circuit featuring the best teams competing for glory and prizes across a double-elimination bracket.",
        prizePool:   "$5,000",
        prizes:      [{ place: "1st", amount: "$2,500" }, { place: "2nd", amount: "$1,500" }, { place: "3rd", amount: "$1,000" }],
      }));
      setAiLoading(false);
    }, 1800);
  };

  const handleCreate = async () => {
    setCreating(true);
    setTimeout(() => {
      router.push("/dashboard/tournaments/t-new/overview");
    }, 2000);
  };

  const canProceed = () => {
    if (step === 1) return form.name.trim().length > 0 && form.game.length > 0;
    if (step === 2) return form.maxTeams > 0;
    if (step === 3) return form.startDate.length > 0 && form.endDate.length > 0;
    return true;
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#080a0e] text-white">
        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-3xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">Create New</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Create Tournament</h1>
                <p className="text-slate-500 text-sm mt-0.5">Step {step} of 5</p>
              </div>
              <button onClick={handleAIFill} disabled={aiLoading}
                className="flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Autofill
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <StepIndicator current={step} total={5} />

          {/* ── Step 1: Basics ─────────────────────────────── */}
          {step === 1 && (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-violet-400" />
                <h2 className="text-white font-bold text-lg">Basic Information</h2>
              </div>

              <Field label="Tournament Name *">
                <input value={form.name} onChange={e => upd("name", e.target.value)}
                  placeholder="e.g. Champions Circuit Season 5"
                  className={inputCls} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Game *">
                  <select value={form.game} onChange={e => upd("game", e.target.value)} className={selectCls}>
                    {GAMES.map(g => <option key={g} value={g} className="bg-[#0f1117]">{g}</option>)}
                  </select>
                </Field>
                <Field label="Region *">
                  <select value={form.region} onChange={e => upd("region", e.target.value)} className={selectCls}>
                    {REGIONS.map(r => <option key={r} value={r} className="bg-[#0f1117]">{r}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Description" hint="Shown on the public tournament page">
                <textarea value={form.description} onChange={e => upd("description", e.target.value)}
                  placeholder="Describe your tournament, rules, and what makes it special…"
                  rows={4} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          )}

          {/* ── Step 2: Format ─────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Map className="w-5 h-5 text-violet-400" />
                  <h2 className="text-white font-bold text-lg">Bracket Format</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FORMAT_OPTIONS.map(f => (
                    <button key={f.value} onClick={() => upd("format", f.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${form.format === f.value ? "border-violet-500 bg-violet-500/10" : "border-white/[0.06] hover:border-white/[0.12]"}`}>
                      <div className="text-2xl mb-2">{f.icon}</div>
                      <p className={`font-semibold text-sm ${form.format === f.value ? "text-violet-300" : "text-white"}`}>{f.label}</p>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-5 h-5 text-violet-400" />
                  <h2 className="text-white font-bold text-lg">Team Settings</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Maximum Teams">
                    <select value={form.maxTeams} onChange={e => upd("maxTeams", Number(e.target.value))} className={selectCls}>
                      {[4,8,16,32,64,128].map(n => <option key={n} value={n} className="bg-[#0f1117]">{n} Teams</option>)}
                    </select>
                  </Field>
                  <Field label="Default Best Of">
                    <select value={form.bestOf} onChange={e => upd("bestOf", Number(e.target.value))} className={selectCls}>
                      {[1,3,5,7].map(n => <option key={n} value={n} className="bg-[#0f1117]">Bo{n}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-violet-400" />
                    <h2 className="text-white font-bold text-lg">Stages</h2>
                  </div>
                  <button onClick={() => upd("stages", [...form.stages, { name: "New Stage", format: "single-elim", teams: 8 }])}
                    className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Stage
                  </button>
                </div>
                <div className="space-y-3">
                  {form.stages.map((stage, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                      <span className="text-slate-600 text-sm font-bold w-5 text-center">{i + 1}</span>
                      <input value={stage.name} onChange={e => {
                        const s = [...form.stages]; s[i] = { ...s[i], name: e.target.value }; upd("stages", s);
                      }} className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/40 min-w-0" />
                      <select value={stage.format} onChange={e => {
                        const s = [...form.stages]; s[i] = { ...s[i], format: e.target.value as BracketFormat }; upd("stages", s);
                      }} className="bg-[#0f1117] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none min-w-0">
                        <option value="single-elim" className="bg-[#0f1117]">Single Elim</option>
                        <option value="double-elim" className="bg-[#0f1117]">Double Elim</option>
                        <option value="round-robin" className="bg-[#0f1117]">Round Robin</option>
                        <option value="swiss"       className="bg-[#0f1117]">Swiss</option>
                      </select>
                      <button onClick={() => { const s = form.stages.filter((_, idx) => idx !== i); upd("stages", s); }}
                        disabled={form.stages.length <= 1}
                        className="p-1.5 hover:bg-rose-500/10 disabled:opacity-20 text-slate-600 hover:text-rose-400 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Schedule ───────────────────────────── */}
          {step === 3 && (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                <h2 className="text-white font-bold text-lg">Schedule</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Start Date *">
                  <input type="date" value={form.startDate} onChange={e => upd("startDate", e.target.value)} className={inputCls} />
                </Field>
                <Field label="End Date *">
                  <input type="date" value={form.endDate} onChange={e => upd("endDate", e.target.value)} className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Check-In Window (minutes)">
                  <select value={form.checkInMins} onChange={e => upd("checkInMins", Number(e.target.value))} className={selectCls}>
                    {[5,10,15,20,30,45,60].map(n => <option key={n} value={n} className="bg-[#0f1117]">{n} minutes</option>)}
                  </select>
                </Field>
                <Field label="Timezone">
                  <select value={form.timezone} onChange={e => upd("timezone", e.target.value)} className={selectCls}>
                    {TIMEZONES.map(t => <option key={t} value={t} className="bg-[#0f1117]">{t}</option>)}
                  </select>
                </Field>
              </div>

              {form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate) && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  End date must be after start date
                </div>
              )}

              <div className="bg-violet-500/[0.06] border border-violet-500/20 rounded-xl p-4">
                <p className="text-violet-300 text-sm font-medium mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Check-In System
                </p>
                <p className="text-white/40 text-xs">Teams will be notified {form.checkInMins} minutes before their match and must check in to confirm attendance. Late or no check-ins result in a forfeit.</p>
              </div>
            </div>
          )}

          {/* ── Step 4: Prizes & Visibility ────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <h2 className="text-white font-bold text-lg">Prize Pool</h2>
                </div>
                <Field label="Total Prize Pool" hint="Optional — leave blank for no prize">
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5">
                    <span className="text-slate-500 text-sm">$</span>
                    <input type="text" value={form.prizePool} onChange={e => upd("prizePool", e.target.value)}
                      placeholder="0.00" className="flex-1 bg-transparent text-white text-sm focus:outline-none min-w-0" />
                  </div>
                </Field>
                <div className="mt-4 space-y-2">
                  <label className="text-slate-400 text-xs font-medium">Prize Distribution</label>
                  {form.prizes.map((prize, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-slate-500 text-sm w-12 flex-shrink-0">{prize.place}</span>
                      <div className="flex items-center gap-2 flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
                        <span className="text-slate-500 text-sm">$</span>
                        <input type="text" value={prize.amount} onChange={e => {
                          const p = [...form.prizes]; p[i] = { ...p[i], amount: e.target.value }; upd("prizes", p);
                        }} placeholder="0" className="flex-1 bg-transparent text-white text-sm focus:outline-none min-w-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Globe className="w-5 h-5 text-violet-400" />
                  <h2 className="text-white font-bold text-lg">Visibility & Registration</h2>
                </div>
                <div className="mb-4">
                  <label className="text-slate-400 text-xs font-medium block mb-2">Tournament Visibility</label>
                  <div className="flex gap-2">
                    {([
                      { v: "public",   l: "Public",   i: Globe, d: "Anyone can see" },
                      { v: "unlisted", l: "Unlisted",  i: Lock,  d: "Link only"      },
                      { v: "private",  l: "Private",   i: Lock,  d: "Invite only"    },
                    ] as const).map(opt => (
                      <button key={opt.v} onClick={() => upd("visibility", opt.v)}
                        className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${form.visibility === opt.v ? "border-violet-500 bg-violet-500/10" : "border-white/[0.06] hover:border-white/[0.12]"}`}>
                        <opt.i className={`w-4 h-4 ${form.visibility === opt.v ? "text-violet-400" : "text-slate-500"}`} />
                        <span className={`text-xs font-semibold ${form.visibility === opt.v ? "text-violet-300" : "text-slate-500"}`}>{opt.l}</span>
                        <span className="text-slate-700 text-xs">{opt.d}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 pt-3 border-t border-white/[0.04]">
                  {[
                    { key: "registrationOpen", label: "Open Registration",  desc: "Allow teams to register publicly" },
                    { key: "requireRoster",    label: "Require Full Roster", desc: "Teams must submit all members"    },
                  ].map(opt => (
                    <div key={opt.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{opt.label}</p>
                        <p className="text-slate-500 text-xs">{opt.desc}</p>
                      </div>
                      <button onClick={() => upd(opt.key as keyof TournamentForm, !form[opt.key as keyof TournamentForm])}
                        className={`relative w-10 h-5 rounded-full transition-colors ${form[opt.key as keyof TournamentForm] ? "bg-violet-600" : "bg-white/[0.10]"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[opt.key as keyof TournamentForm] ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Review ─────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-5">Review & Create</h2>

                {/* Summary grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {[
                    { label: "Tournament",  value: form.name         || "—" },
                    { label: "Game",        value: form.game                 },
                    { label: "Region",      value: form.region               },
                    { label: "Format",      value: form.format.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()) },
                    { label: "Teams",       value: `Up to ${form.maxTeams}`  },
                    { label: "Best Of",     value: `Bo${form.bestOf}`        },
                    { label: "Start Date",  value: form.startDate    || "—" },
                    { label: "End Date",    value: form.endDate      || "—" },
                    { label: "Prize Pool",  value: form.prizePool ? `$${form.prizePool}` : "No prize" },
                    { label: "Visibility",  value: form.visibility           },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-slate-500 text-sm">{row.label}</span>
                      <span className="text-white text-sm font-medium capitalize">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Stages preview */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Stages ({form.stages.length})</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {form.stages.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="bg-violet-500/15 border border-violet-500/20 text-violet-300 text-xs px-2.5 py-1 rounded-full font-medium">{s.name}</span>
                        {i < form.stages.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-700" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-violet-500/[0.06] border border-violet-500/20 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <p className="text-violet-300/80 text-sm">
                  After creation, you can add teams, configure stages, set up Discord notifications, and customize branding from the tournament dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => step > 1 ? setStep((step - 1) as Step) : router.push("/dashboard/tournaments")}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < 5 ? (
              <button onClick={() => setStep((step + 1) as Step)} disabled={!canProceed()}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleCreate} disabled={creating}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold transition-colors">
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Trophy className="w-4 h-4" /> Create Tournament</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}