"use client";

import { useState } from "react";
import AdminShell from "@/components/ui/AdminShell";
import {
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  XCircle,
  Info,
  ChevronDown,
  Copy,
  Eye,
  Trash2,
} from "lucide-react";

type ErrorSeverity = "critical" | "error" | "warning" | "info";

interface ErrorLog {
  id:        string;
  code:      string;
  message:   string;
  service:   string;
  severity:  ErrorSeverity;
  count:     number;
  firstSeen: string;
  lastSeen:  string;
  stack?:    string;
  resolved:  boolean;
}

const MOCK_ERRORS: ErrorLog[] = [
  { id: "e1",  code: "AI_TIMEOUT",       message: "AI service request timeout after 30s", service: "AI Service",     severity: "error",    count: 47,  firstSeen: "2025-07-15 08:12", lastSeen: "23m ago",  stack: "Error: Request timeout\n  at AIClient.generate (ai-client.ts:142)\n  at async POST (route.ts:28)",   resolved: false },
  { id: "e2",  code: "PAYMENT_DECLINED", message: "Stripe payment declined: insufficient_funds", service: "Payments",  severity: "warning",  count: 3,   firstSeen: "2025-07-14 16:30", lastSeen: "12h ago",  resolved: false },
  { id: "e3",  code: "DB_CONN_POOL",     message: "Database connection pool exhausted (max: 20)", service: "Database",   severity: "critical", count: 2,   firstSeen: "2025-07-10 03:45", lastSeen: "5d ago",   stack: "Error: Pool exhausted\n  at Pool.connect (db.ts:89)\n  at async getUser (users.ts:34)",              resolved: true  },
  { id: "e4",  code: "DISCORD_RATE",     message: "Discord API rate limit exceeded", service: "Discord Bot",   severity: "warning",  count: 12,  firstSeen: "2025-07-15 10:00", lastSeen: "2h ago",   resolved: false },
  { id: "e5",  code: "AUTH_INVALID_JWT", message: "Invalid JWT signature detected", service: "API Gateway",    severity: "error",    count: 5,   firstSeen: "2025-07-13 22:18", lastSeen: "2d ago",   stack: "JsonWebTokenError: invalid signature\n  at verify (jsonwebtoken.ts:30)\n  at middleware.ts:45",        resolved: false },
  { id: "e6",  code: "CDN_UPLOAD_FAIL",  message: "Media upload failed: storage quota exceeded", service: "Media CDN",  severity: "warning",  count: 8,   firstSeen: "2025-07-14 11:44", lastSeen: "1d ago",   resolved: false },
  { id: "e7",  code: "UNHANDLED_REJECT", message: "Unhandled promise rejection in match scoring", service: "API Gateway", severity: "error",   count: 1,   firstSeen: "2025-07-12 14:22", lastSeen: "3d ago",   stack: "UnhandledPromiseRejection\n  at scoreMatch (scoring.ts:88)\n  at route.ts:112",                        resolved: true  },
];

const SEVERITY_CFG: Record<ErrorSeverity, { badge: string; icon: React.ElementType; row: string }> = {
  critical: { badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",       icon: XCircle,       row: "bg-rose-500/[0.03] border-l-rose-500"     },
  error:    { badge: "bg-orange-500/15 text-orange-400 border-orange-500/20", icon: AlertTriangle, row: "border-l-orange-500/50"                    },
  warning:  { badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",    icon: AlertTriangle, row: "border-l-amber-500/50"                     },
  info:     { badge: "bg-blue-500/15 text-blue-400 border-blue-500/20",       icon: Info,          row: "border-l-blue-500/50"                      },
};

export default function AdminErrorLogsPage() {
  const [search,       setSearch]       = useState("");
  const [sevFilter,    setSevFilter]    = useState<"all" | ErrorSeverity>("all");
  const [showResolved, setShowResolved] = useState(false);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);

  const filtered = MOCK_ERRORS.filter(e => {
    const q = search.toLowerCase();
    const matchQ = e.message.toLowerCase().includes(q) || e.code.toLowerCase().includes(q) || e.service.toLowerCase().includes(q);
    const matchS = sevFilter === "all" || e.severity === sevFilter;
    const matchR = showResolved ? true : !e.resolved;
    return matchQ && matchS && matchR;
  });

  const counts = {
    critical: MOCK_ERRORS.filter(e => e.severity === "critical" && !e.resolved).length,
    error:    MOCK_ERRORS.filter(e => e.severity === "error"    && !e.resolved).length,
    warning:  MOCK_ERRORS.filter(e => e.severity === "warning"  && !e.resolved).length,
  };

  return (
    <AdminShell>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Error Logs</h1>
            <p className="text-white/40 text-sm mt-0.5">{MOCK_ERRORS.filter(e => !e.resolved).length} active errors</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowResolved(!showResolved)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${showResolved ? "bg-white/[0.08] text-white border-white/[0.12]" : "bg-white/[0.04] text-white/40 border-white/[0.06]"}`}>
              {showResolved ? "Hide Resolved" : "Show Resolved"}
            </button>
            <button className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 px-3 py-2 rounded-lg text-sm transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Critical",  count: counts.critical, color: "text-rose-400",   bg: "bg-rose-500/[0.08] border-rose-500/20"    },
            { label: "Errors",    count: counts.error,    color: "text-orange-400", bg: "bg-orange-500/[0.06] border-orange-500/20" },
            { label: "Warnings",  count: counts.warning,  color: "text-amber-400",  bg: "bg-amber-500/[0.06] border-amber-500/20"  },
          ].map(s => (
            <div key={s.label} className={`border rounded-xl p-4 text-center ${s.bg}`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-white/40 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search errors by message, code, or service…"
              className="w-full bg-[#0f1117] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-rose-500/40" />
          </div>
          <div className="flex gap-2">
            {(["all", "critical", "error", "warning", "info"] as const).map(s => (
              <button key={s} onClick={() => setSevFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${sevFilter === s ? "bg-rose-600 text-white" : "bg-white/[0.04] text-white/30 border border-white/[0.08] hover:text-white/60"}`}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Error list */}
        <div className="space-y-2">
          {filtered.map(err => {
            const cfg = SEVERITY_CFG[err.severity];
            const Icon = cfg.icon;
            const expanded = expandedId === err.id;
            return (
              <div key={err.id} className={`bg-[#0f1117] border border-l-2 rounded-xl overflow-hidden transition-all ${cfg.row} ${err.resolved ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(prev => prev === err.id ? null : err.id)}>
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${SEVERITY_CFG[err.severity].badge.split(" ")[2]?.replace("border-","text-") || "text-white/40"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <code className="text-white/60 text-xs font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">{err.code}</code>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge} capitalize`}>{err.severity}</span>
                      <span className="text-white/25 text-xs">· {err.service}</span>
                      {err.resolved && <span className="text-emerald-400 text-xs font-medium">✓ Resolved</span>}
                    </div>
                    <p className="text-white text-sm font-medium">{err.message}</p>
                    <div className="flex gap-3 mt-1 text-white/25 text-xs">
                      <span>×{err.count} occurrences</span>
                      <span>First: {err.firstSeen}</span>
                      <span>Last: {err.lastSeen}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!err.resolved && (
                      <button className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-white/25 hover:text-emerald-400 transition-colors text-xs font-medium px-2">
                        Resolve
                      </button>
                    )}
                    <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/25 hover:text-white/60 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-white/25 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </div>
                </div>
                {expanded && err.stack && (
                  <div className="px-4 pb-4 pt-0 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between mb-2 pt-3">
                      <p className="text-white/40 text-xs font-semibold uppercase tracking-wide">Stack Trace</p>
                      <button onClick={() => navigator.clipboard.writeText(err.stack || "")} className="flex items-center gap-1 text-white/25 hover:text-white/60 text-xs transition-colors">
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <pre className="bg-black/40 border border-white/[0.04] rounded-lg p-3 text-xs text-white/50 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                      {err.stack}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl py-16 text-center">
              <AlertTriangle className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No errors match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}