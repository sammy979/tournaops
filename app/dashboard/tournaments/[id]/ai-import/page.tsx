"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  Bot,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  Zap,
  Users,
  Trophy,
  ArrowRight,
  RefreshCw,
  Copy,
  Wand2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AIMode = "text" | "screenshot" | "generate";
type ParseStatus = "idle" | "parsing" | "done" | "error";

interface ParsedResult {
  teams:   { name: string; tag: string; members: number }[];
  matches: { team1: string; team2: string; stage: string; time: string }[];
  stages:  string[];
  confidence: number;
}

// ─── Mock AI Result ───────────────────────────────────────────────────────────
const MOCK_RESULT: ParsedResult = {
  confidence: 94,
  stages: ["Group Stage", "Quarterfinals", "Semifinals", "Grand Finals"],
  teams: [
    { name: "Team Alpha",   tag: "ALPH", members: 5 },
    { name: "Team Nexus",   tag: "NEX",  members: 5 },
    { name: "Team Phantom", tag: "PHN",  members: 5 },
    { name: "Team Storm",   tag: "STM",  members: 5 },
    { name: "Team Void",    tag: "VOD",  members: 5 },
    { name: "Team Nova",    tag: "NOV",  members: 5 },
    { name: "Team Blaze",   tag: "BLZ",  members: 5 },
    { name: "Team Titan",   tag: "TTN",  members: 5 },
  ],
  matches: [
    { team1: "Team Alpha",   team2: "Team Titan",   stage: "Group Stage",   time: "Jul 1 14:00" },
    { team1: "Team Nexus",   team2: "Team Blaze",   stage: "Group Stage",   time: "Jul 1 16:00" },
    { team1: "Team Phantom", team2: "Team Void",    stage: "Group Stage",   time: "Jul 2 14:00" },
    { team1: "Team Storm",   team2: "Team Nova",    stage: "Group Stage",   time: "Jul 2 16:00" },
  ],
};

const EXAMPLE_PROMPTS = [
  "8 teams, double elimination, Bo3 matches, starts July 15th, $2,000 prize pool",
  "16 team Valorant tournament, group stage then playoffs, weekly matches every Saturday",
  "Round robin group stage with 4 groups of 4, top 2 advance to single elimination bracket",
];

const GENERATE_TEMPLATES = [
  { label: "Quick 8-Team",     desc: "Single elimination, Bo3, 1 day event",          icon: "⚡" },
  { label: "Classic 16-Team",  desc: "Double elimination, Bo3/5, weekend event",       icon: "🏆" },
  { label: "League Format",    desc: "Round robin groups + playoffs, multi-week",      icon: "🔄" },
  { label: "Grand Prix",       desc: "Swiss system + top-cut, Bo5 finals",            icon: "🎯" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIImportPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [mode,      setMode]      = useState<AIMode>("text");
  const [text,      setText]      = useState("");
  const [status,    setStatus]    = useState<ParseStatus>("idle");
  const [result,    setResult]    = useState<ParsedResult | null>(null);
  const [applying,  setApplying]  = useState(false);
  const [applied,   setApplied]   = useState(false);
  const [dragOver,  setDragOver]  = useState(false);

  const runAI = () => {
    setStatus("parsing");
    setResult(null);
    setTimeout(() => {
      setStatus("done");
      setResult(MOCK_RESULT);
    }, 2200);
  };

  const applyResult = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
    }, 1800);
  };

  const navTabs = [
    { label: "Overview",      href: `/dashboard/tournaments/${id}/overview`      },
    { label: "Teams",         href: `/dashboard/tournaments/${id}/teams`         },
    { label: "Stages",        href: `/dashboard/tournaments/${id}/stages`        },
    { label: "Matches",       href: `/dashboard/tournaments/${id}/matches`       },
    { label: "Match Results", href: `/dashboard/tournaments/${id}/match-results` },
    { label: "Standings",     href: `/dashboard/tournaments/${id}/standings`     },
    { label: "Broadcast",     href: `/dashboard/tournaments/${id}/broadcast`     },
    { label: "Discord",       href: `/dashboard/tournaments/${id}/discord`       },
    { label: "Insights",      href: `/dashboard/tournaments/${id}/insights`      },
    { label: "Export",        href: `/dashboard/tournaments/${id}/export`        },
    { label: "Settings",      href: `/dashboard/tournaments/${id}/settings`      },
  ];

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#080a0e] text-white">

        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)} className="hover:text-slate-300 transition-colors">Champions Circuit S4</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">AI Import</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Import</h1>
                <p className="text-slate-500 text-sm">Parse tournament data using AI — text, screenshots, or auto-generate</p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className="flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-300 transition-colors">
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left: Input panel */}
            <div className="lg:col-span-3 space-y-4">

              {/* Mode tabs */}
              <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
                {([
                  { v: "text",       l: "Paste Text",    i: FileText  },
                  { v: "screenshot", l: "Screenshot",    i: Upload    },
                  { v: "generate",   l: "Auto-Generate", i: Sparkles  },
                ] as { v: AIMode; l: string; i: React.ElementType }[]).map((m) => (
                  <button key={m.v} onClick={() => { setMode(m.v); setStatus("idle"); setResult(null); setApplied(false); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m.v ? "bg-yellow-500 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                    <m.i className="w-4 h-4" />
                    {m.l}
                  </button>
                ))}
              </div>

              {/* Text mode */}
              {mode === "text" && (
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                  <h2 className="text-white font-semibold mb-1">Paste Tournament Info</h2>
                  <p className="text-slate-500 text-xs mb-4">Paste any unstructured text — bracket announcements, Discord posts, spreadsheet data, or match schedules.</p>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="e.g. Champions Circuit S5 — 16 teams, double elimination, starts August 1st. Teams: Team Alpha, Team Nexus, Team Phantom, Team Storm…"
                    rows={8}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 resize-none font-mono leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-slate-600 text-xs">Try:</span>
                      {EXAMPLE_PROMPTS.slice(0, 2).map(p => (
                        <button key={p} onClick={() => setText(p)}
                          className="text-yellow-500 hover:text-yellow-500 text-xs transition-colors underline-offset-2 hover:underline truncate max-w-[180px]">
                          "{p.slice(0, 35)}…"
                        </button>
                      ))}
                    </div>
                    <span className="text-slate-700 text-xs">{text.length} chars</span>
                  </div>
                </div>
              )}

              {/* Screenshot mode */}
              {mode === "screenshot" && (
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                  <h2 className="text-white font-semibold mb-1">Upload Screenshot</h2>
                  <p className="text-slate-500 text-xs mb-4">Upload a bracket screenshot, standings image, or any tournament graphic. AI will extract all relevant data.</p>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); runAI(); }}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${dragOver ? "border-yellow-500/60 bg-yellow-500/10" : "border-white/[0.08] hover:border-yellow-500/30"}`}
                  >
                    <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? "text-yellow-500" : "text-slate-700"}`} />
                    <p className="text-white/60 font-medium">Drop image here</p>
                    <p className="text-slate-600 text-sm mt-1">or click to browse</p>
                    <p className="text-slate-700 text-xs mt-3">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-500/[0.06] border border-blue-500/20 rounded-lg">
                    <p className="text-blue-300/70 text-xs flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      AI can read bracket trees, team name lists, match schedules, and standings tables from screenshots.
                    </p>
                  </div>
                </div>
              )}

              {/* Generate mode */}
              {mode === "generate" && (
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                  <h2 className="text-white font-semibold mb-1">Auto-Generate Tournament</h2>
                  <p className="text-slate-500 text-xs mb-4">Describe your tournament in plain English and AI will build the full structure for you.</p>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="e.g. 16 team Valorant tournament, double elimination, Bo3 all matches except Bo5 semifinals and Bo7 grand finals, starts next Saturday, $5,000 prize pool, teams from North America only"
                    rows={5}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 resize-none mb-4"
                  />
                  <div className="mb-4">
                    <p className="text-slate-500 text-xs font-medium mb-2">Or start from a template:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {GENERATE_TEMPLATES.map(t => (
                        <button key={t.label} onClick={() => setText(`Generate a ${t.label} tournament: ${t.desc}`)}
                          className="flex items-start gap-2.5 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-yellow-500/30 transition-colors text-left">
                          <span className="text-xl flex-shrink-0">{t.icon}</span>
                          <div>
                            <p className="text-white text-xs font-semibold">{t.label}</p>
                            <p className="text-slate-600 text-xs leading-tight mt-0.5">{t.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action button */}
              {status === "idle" && (
                <button
                  onClick={runAI}
                  disabled={mode === "text" && text.trim().length < 10}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  {mode === "generate" ? "Generate with AI" : mode === "screenshot" ? "Analyze Screenshot" : "Parse with AI"}
                </button>
              )}

              {/* Parsing state */}
              {status === "parsing" && (
                <div className="bg-[#0f1117] border border-yellow-500/20 rounded-xl p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-7 h-7 text-yellow-500 animate-pulse" />
                  </div>
                  <p className="text-white font-semibold mb-1">AI is analyzing…</p>
                  <p className="text-slate-500 text-sm">Extracting teams, matches, stages, and schedule data</p>
                  <div className="flex justify-center gap-1 mt-4">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Result panel */}
            <div className="lg:col-span-2 space-y-4">
              {!result && status !== "parsing" && (
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-8 text-center">
                  <Bot className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">AI Results</p>
                  <p className="text-slate-700 text-sm mt-1">Parsed data will appear here</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Confidence */}
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${result.confidence >= 80 ? "bg-emerald-500/[0.07] border-emerald-500/20" : "bg-amber-500/[0.07] border-amber-500/20"}`}>
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${result.confidence >= 80 ? "text-emerald-400" : "text-amber-400"}`} />
                    <div>
                      <p className={`font-semibold text-sm ${result.confidence >= 80 ? "text-emerald-300" : "text-amber-300"}`}>
                        {result.confidence}% Confidence
                      </p>
                      <p className="text-white/40 text-xs">AI successfully parsed your tournament data</p>
                    </div>
                  </div>

                  {/* Stages */}
                  <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Detected Stages</p>
                    <div className="flex flex-wrap gap-2">
                      {result.stages.map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <span className="bg-yellow-500/15 border border-yellow-500/20 text-yellow-500 text-xs px-2.5 py-1 rounded-full">{s}</span>
                          {i < result.stages.length - 1 && <ArrowRight className="w-3 h-3 text-slate-700" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Teams Detected</p>
                      <span className="text-emerald-400 text-xs font-bold">{result.teams.length} found</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                      {result.teams.map(t => (
                        <div key={t.name} className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] rounded-lg px-2.5 py-1.5">
                          <div className="w-5 h-5 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-xs font-bold flex-shrink-0">{t.tag[0]}</div>
                          <div className="min-w-0">
                            <p className="text-white text-xs font-medium truncate">{t.name}</p>
                            <p className="text-slate-600 text-xs">[{t.tag}]</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matches */}
                  <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Matches Detected</p>
                      <span className="text-blue-400 text-xs font-bold">{result.matches.length} found</span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {result.matches.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs bg-white/[0.02] border border-white/[0.04] rounded-lg px-2.5 py-1.5">
                          <span className="text-white/60 flex-1 truncate">{m.team1}</span>
                          <span className="text-slate-700 font-bold">vs</span>
                          <span className="text-white/60 flex-1 truncate text-right">{m.team2}</span>
                          <span className="text-slate-600 text-xs flex-shrink-0 pl-1">{m.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Apply button */}
                  {!applied ? (
                    <button onClick={applyResult} disabled={applying}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors">
                      {applying
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying…</>
                        : <><CheckCircle2 className="w-4 h-4" /> Apply to Tournament</>
                      }
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Applied Successfully!
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => router.push(`/dashboard/tournaments/${id}/teams`)}
                          className="flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 py-2 rounded-xl text-sm transition-colors">
                          <Users className="w-3.5 h-3.5" /> View Teams
                        </button>
                        <button onClick={() => { setStatus("idle"); setResult(null); setApplied(false); setText(""); }}
                          className="flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 py-2 rounded-xl text-sm transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" /> Import More
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Re-parse */}
                  {!applied && (
                    <button onClick={() => { setStatus("idle"); setResult(null); }}
                      className="w-full text-slate-600 hover:text-slate-400 text-xs transition-colors py-1">
                      ← Try again with different input
                    </button>
                  )}
                </div>
              )}

              {/* Tips */}
              {!result && (
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                  <p className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" /> Tips for best results
                  </p>
                  <div className="space-y-2">
                    {[
                      "Include team names with tags e.g. Team Alpha [ALPH]",
                      "Mention the format: single/double elimination, round robin",
                      "Include dates and times for automatic scheduling",
                      "Paste match results for automatic score recording",
                      "Screenshots of brackets work best at 1080p or higher",
                    ].map(tip => (
                      <p key={tip} className="text-slate-500 text-xs flex items-start gap-2">
                        <span className="text-yellow-500 flex-shrink-0">→</span>
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}