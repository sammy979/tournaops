"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  Upload,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Users,
  Zap,
  ArrowRight,
  RefreshCw,
  Eye,
  Trash2,
} from "lucide-react";

type ImportStatus = "idle" | "parsing" | "preview" | "importing" | "done" | "error";

interface ParsedTeam {
  name:    string;
  tag:     string;
  captain: string;
  email:   string;
  members: number;
  valid:   boolean;
  errors:  string[];
}

const MOCK_PARSED: ParsedTeam[] = [
  { name: "Team Alpha",   tag: "ALPH", captain: "ShadowX",    email: "alpha@email.com",   members: 5, valid: true,  errors: [] },
  { name: "Team Nexus",   tag: "NEX",  captain: "ProStrike",   email: "nexus@email.com",   members: 5, valid: true,  errors: [] },
  { name: "Team Phantom", tag: "PHN",  captain: "GhostRider",  email: "phantom@email.com", members: 5, valid: true,  errors: [] },
  { name: "Team Storm",   tag: "STM",  captain: "ThunderBolt", email: "storm@email.com",   members: 4, valid: false, errors: ["Minimum 5 members required"] },
  { name: "Team Void",    tag: "",     captain: "DarkMatter",  email: "void@email.com",    members: 5, valid: false, errors: ["Team tag is required"] },
  { name: "Team Nova",    tag: "NOV",  captain: "StarBlast",   email: "invalid-email",     members: 5, valid: false, errors: ["Invalid email format"] },
];

const CSV_TEMPLATE = `Team Name,Team Tag,Captain Name,Email,Player1 IGN,Player2 IGN,Player3 IGN,Player4 IGN,Player5 IGN
Team Alpha,ALPH,ShadowX,alpha@email.com,ShadowX#NA1,NightOwl#NA2,Flux#NA3,Venom#NA4,Cipher#NA5`;

export default function BulkImportPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [status,   setStatus]   = useState<ImportStatus>("idle");
  const [teams,    setTeams]    = useState<ParsedTeam[]>([]);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setStatus("parsing");
    setTimeout(() => {
      setTeams(MOCK_PARSED);
      setStatus("preview");
    }, 1500);
  };

  const handleImport = () => {
    const valid = teams.filter(t => t.valid);
    setStatus("importing");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setStatus("done");
      }
      setProgress(Math.min(p, 100));
    }, 300);
  };

  const validCount   = teams.filter(t => t.valid).length;
  const invalidCount = teams.filter(t => !t.valid).length;

  const navTabs = [
    { label: "Overview",      href: `/dashboard/tournaments/${id}/overview` },
    { label: "Teams",         href: `/dashboard/tournaments/${id}/teams` },
    { label: "Stages",        href: `/dashboard/tournaments/${id}/stages` },
    { label: "Matches",       href: `/dashboard/tournaments/${id}/matches` },
    { label: "Match Results", href: `/dashboard/tournaments/${id}/match-results` },
    { label: "Standings",     href: `/dashboard/tournaments/${id}/standings` },
    { label: "Broadcast",     href: `/dashboard/tournaments/${id}/broadcast` },
    { label: "Discord",       href: `/dashboard/tournaments/${id}/discord` },
    { label: "Insights",      href: `/dashboard/tournaments/${id}/insights` },
    { label: "Export",        href: `/dashboard/tournaments/${id}/export` },
    { label: "Settings",      href: `/dashboard/tournaments/${id}/settings` },
  ];

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#080a0e] text-white">
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)} className="hover:text-slate-300 transition-colors">Champions Circuit S4</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">Bulk Import</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Bulk Import Teams</h1>
            <p className="text-slate-500 text-sm mt-0.5">Import multiple teams from a CSV or spreadsheet file</p>
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

        <div className="max-w-5xl mx-auto px-6 py-6">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[
              { label: "Upload",  done: status !== "idle" },
              { label: "Preview", done: status === "importing" || status === "done" },
              { label: "Import",  done: status === "done" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${step.done ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/[0.04] text-slate-500 border border-white/[0.08]"}`}>
                  {step.done && <CheckCircle2 className="w-3 h-3" />}
                  {step.label}
                </div>
                {i < 2 && <ArrowRight className="w-3.5 h-3.5 text-slate-700" />}
              </div>
            ))}
          </div>

          {/* Idle: Upload zone */}
          {status === "idle" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/[0.10] hover:border-yellow-500/40 rounded-2xl p-12 text-center cursor-pointer transition-all group"
                >
                  <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileSelect} />
                  <Upload className="w-12 h-12 text-slate-700 group-hover:text-violet-400 mx-auto mb-4 transition-colors" />
                  <p className="text-white font-semibold mb-1">Drop your file here</p>
                  <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                  <div className="flex gap-2 justify-center">
                    {[".CSV", ".XLSX", ".XLS"].map(ext => (
                      <span key={ext} className="bg-white/[0.04] border border-white/[0.08] text-slate-400 text-xs px-2 py-1 rounded-lg">{ext}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-3">Download Template</h3>
                  <p className="text-slate-500 text-xs mb-4">Use our template to ensure your data imports correctly.</p>
                  <button
                    onClick={() => {
                      const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
                      const url  = URL.createObjectURL(blob);
                      const a    = document.createElement("a");
                      a.href = url; a.download = "teams-template.csv"; a.click();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download CSV Template
                  </button>
                </div>
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-3">Required Columns</h3>
                  <div className="space-y-1.5">
                    {["Team Name", "Team Tag (3-5 chars)", "Captain Name", "Email", "Player 1-5 IGNs"].map(col => (
                      <div key={col} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-400">{col}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parsing */}
          {status === "parsing" && (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-12 text-center">
              <RefreshCw className="w-10 h-10 text-violet-400 mx-auto mb-4 animate-spin" />
              <p className="text-white font-semibold">Parsing {fileName}…</p>
              <p className="text-slate-500 text-sm mt-1">Validating team data and checking for errors</p>
            </div>
          )}

          {/* Preview */}
          {status === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full">{validCount} Valid</span>
                  {invalidCount > 0 && <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-semibold px-3 py-1 rounded-full">{invalidCount} Errors</span>}
                </div>
                <span className="text-slate-500 text-xs">From: {fileName}</span>
                <button onClick={() => { setStatus("idle"); setTeams([]); setFileName(""); }}
                  className="ml-auto text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>

              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {["Team", "Tag", "Captain", "Email", "Members", "Status"].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, i) => (
                      <tr key={i} className={`border-b border-white/[0.04] last:border-0 ${!team.valid ? "bg-rose-500/[0.03]" : ""}`}>
                        <td className="py-3 px-4 text-white text-sm font-medium">{team.name}</td>
                        <td className="py-3 px-4 text-slate-400 text-sm font-mono">{team.tag || <span className="text-rose-400/60">—</span>}</td>
                        <td className="py-3 px-4 text-slate-400 text-sm">{team.captain}</td>
                        <td className="py-3 px-4 text-slate-400 text-sm font-mono text-xs">{team.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-bold ${team.members >= 5 ? "text-emerald-400" : "text-rose-400"}`}>{team.members}</span>
                        </td>
                        <td className="py-3 px-4">
                          {team.valid ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Valid</span>
                          ) : (
                            <div>
                              <span className="flex items-center gap-1 text-rose-400 text-xs mb-0.5"><XCircle className="w-3.5 h-3.5" /> Error</span>
                              {team.errors.map(e => <p key={e} className="text-rose-400/60 text-xs">{e}</p>)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {invalidCount > 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-300/80 text-sm">{invalidCount} teams have errors and will be skipped. Only the {validCount} valid teams will be imported.</p>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={handleImport}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
                  <Upload className="w-4 h-4" /> Import {validCount} Teams
                </button>
              </div>
            </div>
          )}

          {/* Importing */}
          {status === "importing" && (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-12 text-center">
              <Zap className="w-10 h-10 text-violet-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-4">Importing {validCount} teams…</p>
              <div className="w-full max-w-xs mx-auto bg-white/[0.06] rounded-full h-2 mb-2">
                <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-slate-500 text-sm">{Math.round(progress)}% complete</p>
            </div>
          )}

          {/* Done */}
          {status === "done" && (
            <div className="bg-[#0f1117] border border-emerald-500/20 rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
              <p className="text-white font-bold text-xl mb-1">Import Complete!</p>
              <p className="text-slate-400 mb-6">{validCount} teams successfully added to Champions Circuit S4</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => router.push(`/dashboard/tournaments/${id}/teams`)}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
                  <Users className="w-4 h-4" /> View Teams
                </button>
                <button onClick={() => { setStatus("idle"); setTeams([]); setFileName(""); setProgress(0); }}
                  className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 px-5 py-2.5 rounded-xl transition-colors">
                  <RefreshCw className="w-4 h-4" /> Import More
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}