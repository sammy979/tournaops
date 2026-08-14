"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Download,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Image,
  Code,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Package,
  BarChart2,
  Users,
  Trophy,
  Zap,
  Calendar,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ExportStatus = "idle" | "generating" | "ready" | "error";
type ExportFormat = "csv" | "json" | "pdf" | "xlsx" | "png";

interface ExportJob {
  id: string;
  name: string;
  format: ExportFormat;
  status: ExportStatus;
  size?: string;
  generatedAt?: string;
  description: string;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  formats: ExportFormat[];
  includes: string[];
  color: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "t1", name: "Full Tournament Report", description: "Complete data export including all matches, results, and standings",
    icon: Package, formats: ["pdf", "xlsx"], color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
    includes: ["All matches", "Results", "Standings", "Team roster", "Stage breakdown"],
  },
  {
    id: "t2", name: "Standings Export", description: "Current standings table with all statistics",
    icon: Trophy, formats: ["csv", "xlsx", "pdf"], color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    includes: ["Rank", "Team", "W/L/D", "Points", "Map record", "Round differential"],
  },
  {
    id: "t3", name: "Match Schedule", description: "All matches with dates, times, and team assignments",
    icon: Calendar, formats: ["csv", "xlsx", "pdf"], color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    includes: ["Match number", "Stage/Round", "Teams", "Date/Time", "Status"],
  },
  {
    id: "t4", name: "Team Roster Data", description: "All registered teams and their members",
    icon: Users, formats: ["csv", "json", "xlsx"], color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    includes: ["Team name/tag", "Captain", "Members", "IGNs", "Check-in status"],
  },
  {
    id: "t5", name: "Match Results", description: "All completed match results with map breakdown",
    icon: Zap, formats: ["csv", "json", "xlsx"], color: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    includes: ["Match results", "Map scores", "Winner", "Duration", "Stage"],
  },
  {
    id: "t6", name: "Analytics Data", description: "Raw statistics for external analysis",
    icon: BarChart2, formats: ["json", "csv"], color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
    includes: ["Win rates", "Map statistics", "Performance metrics", "Round data"],
  },
];

const RECENT_EXPORTS: ExportJob[] = [
  { id: "e1", name: "Standings Export",      format: "xlsx", status: "ready",     size: "24 KB",  generatedAt: "Today, 14:32",    description: "Current standings with full stats" },
  { id: "e2", name: "Match Schedule",        format: "pdf",  status: "ready",     size: "156 KB", generatedAt: "Today, 11:05",    description: "All matches through QF Round 2" },
  { id: "e3", name: "Full Tournament Report",format: "pdf",  status: "generating",                                                description: "Complete tournament package" },
  { id: "e4", name: "Team Roster Data",      format: "csv",  status: "ready",     size: "8 KB",   generatedAt: "Yesterday, 18:20",description: "All 14 registered teams" },
  { id: "e5", name: "Analytics Data",        format: "json", status: "error",                                                     description: "Failed — insufficient data" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FORMAT_ICONS: Record<ExportFormat, React.ElementType> = {
  csv:  FileSpreadsheet,
  xlsx: FileSpreadsheet,
  json: Code,
  pdf:  FileText,
  png:  Image,
};

const FORMAT_COLORS: Record<ExportFormat, string> = {
  csv:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  xlsx: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  json: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  pdf:  "bg-rose-500/15 text-rose-400 border-rose-500/20",
  png:  "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
};

function ExportStatusIcon({ status }: { status: ExportStatus }) {
  if (status === "ready")      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === "generating") return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
  if (status === "error")      return <AlertCircle className="w-4 h-4 text-rose-400" />;
  return <Clock className="w-4 h-4 text-slate-500" />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [selectedFormat, setSelectedFormat] = useState<Record<string, ExportFormat>>({});
  const [jobs, setJobs] = useState(RECENT_EXPORTS);

  const getFormat = (templateId: string, formats: ExportFormat[]) =>
    selectedFormat[templateId] ?? formats[0];

  const handleExport = (template: ExportTemplate) => {
    const fmt = getFormat(template.id, template.formats);
    const newJob: ExportJob = {
      id:          `e${Date.now()}`,
      name:        template.name,
      format:      fmt,
      status:      "generating",
      description: template.description,
    };
    setJobs(prev => [newJob, ...prev]);
    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: "ready", size: "48 KB", generatedAt: "Just now" } : j));
    }, 2500);
  };

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
    <>
      <div className="min-h-screen bg-[#080a0e] text-white">

        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)} className="hover:text-slate-300 transition-colors">Champions Circuit S4</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">Export</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Export Data</h1>
            <p className="text-slate-500 text-sm mt-0.5">Generate reports and download tournament data</p>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab.label === "Export" ? "border-yellow-500 text-yellow-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Export Templates */}
            <div className="lg:col-span-2">
              <h2 className="text-white font-semibold mb-4">Export Templates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXPORT_TEMPLATES.map((template) => {
                  const fmt     = getFormat(template.id, template.formats);
                  const FmtIcon = FORMAT_ICONS[fmt];
                  return (
                    <div key={template.id} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${template.color}`}>
                          <template.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold">{template.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{template.description}</p>
                        </div>
                      </div>

                      {/* Includes */}
                      <div className="mb-3">
                        <p className="text-slate-600 text-xs mb-1.5">Includes:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.includes.map((inc) => (
                            <span key={inc} className="bg-white/[0.04] border border-white/[0.06] text-slate-400 text-xs px-1.5 py-0.5 rounded">
                              {inc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Format selector + Export button */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
                        <div className="flex gap-1">
                          {template.formats.map((f) => {
                            const FI = FORMAT_ICONS[f];
                            return (
                              <button key={f} onClick={() => setSelectedFormat(prev => ({ ...prev, [template.id]: f }))}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${fmt === f ? FORMAT_COLORS[f] : "border-white/[0.06] text-slate-600 hover:text-slate-400"}`}>
                                <FI className="w-3 h-3" />
                                {f.toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                        <button onClick={() => handleExport(template)}
                          className="ml-auto flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                          <Download className="w-3.5 h-3.5" /> Export
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Exports */}
            <div>
              <h2 className="text-white font-semibold mb-4">Recent Exports</h2>
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
                {jobs.map((job, i) => {
                  const FmtIcon = FORMAT_ICONS[job.format];
                  return (
                    <div key={job.id} className={`flex items-start gap-3 p-4 ${i < jobs.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${FORMAT_COLORS[job.format]}`}>
                        <FmtIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{job.name}</p>
                        <p className="text-slate-600 text-xs mt-0.5">{job.description}</p>
                        {job.generatedAt && <p className="text-slate-700 text-xs mt-0.5">{job.generatedAt}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {job.size && <span className="text-slate-600 text-xs">{job.size}</span>}
                        <ExportStatusIcon status={job.status} />
                        {job.status === "ready" && (
                          <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}