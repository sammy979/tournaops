"use client";

import { useState } from "react";
import AdminShell from "@/components/ui/AdminShell";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Zap,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  ArrowUpRight,
} from "lucide-react";

type ServiceStatus = "healthy" | "degraded" | "down";

interface ServiceMetric {
  service:  string;
  status:   ServiceStatus;
  latency:  string;
  uptime:   string;
  requests: string;
  errors:   string;
  lastCheck:string;
  icon:     React.ElementType;
}

const SERVICES: ServiceMetric[] = [
  { service: "API Gateway",      status: "healthy",  latency: "12ms",  uptime: "99.98%", requests: "48.2k/min", errors: "0.02%", lastCheck: "30s ago", icon: Globe    },
  { service: "PostgreSQL DB",    status: "healthy",  latency: "3ms",   uptime: "99.99%", requests: "12.1k/min", errors: "0.00%", lastCheck: "30s ago", icon: Database },
  { service: "Redis Cache",      status: "healthy",  latency: "1ms",   uptime: "100%",   requests: "89.4k/min", errors: "0.00%", lastCheck: "30s ago", icon: Zap      },
  { service: "AI Service",       status: "degraded", latency: "890ms", uptime: "98.12%", requests: "342/min",   errors: "2.4%",  lastCheck: "30s ago", icon: Cpu      },
  { service: "Discord Bot",      status: "healthy",  latency: "45ms",  uptime: "99.95%", requests: "1.2k/min",  errors: "0.05%", lastCheck: "30s ago", icon: Activity },
  { service: "Payment Gateway",  status: "healthy",  latency: "220ms", uptime: "99.97%", requests: "89/min",    errors: "0.11%", lastCheck: "30s ago", icon: Server   },
  { service: "Media CDN",        status: "healthy",  latency: "28ms",  uptime: "100%",   requests: "5.6k/min",  errors: "0.00%", lastCheck: "30s ago", icon: HardDrive},
  { service: "Email Service",    status: "healthy",  latency: "340ms", uptime: "99.90%", requests: "45/min",    errors: "0.10%", lastCheck: "30s ago", icon: Globe    },
];

const SYSTEM_METRICS = [
  { label: "CPU Usage",    value: 34,  unit: "%",   color: "bg-violet-500" },
  { label: "Memory",       value: 61,  unit: "%",   color: "bg-blue-500"   },
  { label: "Disk I/O",     value: 18,  unit: "%",   color: "bg-emerald-500"},
  { label: "Network",      value: 42,  unit: "%",   color: "bg-amber-500"  },
];

const STATUS_CFG: Record<ServiceStatus, { icon: React.ElementType; badge: string; dot: string }> = {
  healthy:  { icon: CheckCircle2,  badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400"           },
  degraded: { icon: AlertTriangle, badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",       dot: "bg-amber-400 animate-pulse"},
  down:     { icon: XCircle,       badge: "bg-rose-500/15 text-rose-400 border-rose-500/20",          dot: "bg-rose-400 animate-pulse" },
};

export default function AdminSystemHealthPage() {
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const healthy  = SERVICES.filter(s => s.status === "healthy").length;
  const degraded = SERVICES.filter(s => s.status === "degraded").length;
  const down     = SERVICES.filter(s => s.status === "down").length;

  return (
    <AdminShell>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">System Health</h1>
            <p className="text-white/40 text-sm mt-0.5">Real-time service monitoring and metrics</p>
          </div>
          <button onClick={() => setLastRefresh("Just now")} className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 px-3 py-2 rounded-lg text-sm transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Overall status */}
        <div className={`flex items-center gap-4 p-5 rounded-2xl border mb-6 ${
          down > 0     ? "bg-rose-500/[0.08] border-rose-500/20"    :
          degraded > 0 ? "bg-amber-500/[0.08] border-amber-500/20"  :
          "bg-emerald-500/[0.06] border-emerald-500/20"
        }`}>
          {down > 0     ? <XCircle       className="w-8 h-8 text-rose-400 flex-shrink-0"    /> :
           degraded > 0 ? <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0"   /> :
           <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />}
          <div className="flex-1">
            <p className={`text-lg font-bold ${down > 0 ? "text-rose-300" : degraded > 0 ? "text-amber-300" : "text-emerald-300"}`}>
              {down > 0 ? `${down} Service${down > 1 ? "s" : ""} Down` : degraded > 0 ? `${degraded} Service${degraded > 1 ? "s" : ""} Degraded` : "All Systems Operational"}
            </p>
            <p className="text-white/40 text-sm">{healthy}/{SERVICES.length} services healthy · Last updated {lastRefresh}</p>
          </div>
          <div className="flex gap-4 text-center flex-shrink-0">
            <div><p className="text-2xl font-black text-emerald-400">{healthy}</p><p className="text-white/30 text-xs">Healthy</p></div>
            {degraded > 0 && <div><p className="text-2xl font-black text-amber-400">{degraded}</p><p className="text-white/30 text-xs">Degraded</p></div>}
            {down > 0     && <div><p className="text-2xl font-black text-rose-400">{down}</p><p className="text-white/30 text-xs">Down</p></div>}
          </div>
        </div>

        {/* System resource meters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {SYSTEM_METRICS.map(m => (
            <div key={m.label} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white/40 text-xs font-medium">{m.label}</p>
                <p className="text-white font-bold text-sm">{m.value}{m.unit}</p>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${m.color} ${m.value > 80 ? "animate-pulse" : ""}`} style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Service table */}
        <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-white font-semibold">Services</h2>
            <div className="flex items-center gap-1.5 text-white/30 text-xs">
              <Clock className="w-3.5 h-3.5" />
              Auto-refreshing every 30s
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Service", "Status", "Latency", "Uptime", "Req/min", "Error Rate", "Last Check", ""].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-white/25 text-xs font-medium uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((svc, i) => {
                  const cfg = STATUS_CFG[svc.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={svc.service} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                            <svc.icon className="w-3.5 h-3.5 text-white/40" />
                          </div>
                          <span className="text-white text-sm font-medium">{svc.service}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge} capitalize`}>{svc.status}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-sm font-mono ${Number(svc.latency.replace("ms","")) > 500 ? "text-amber-400" : "text-white/60"}`}>{svc.latency}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-sm font-mono ${svc.uptime === "100%" ? "text-emerald-400" : "text-white/60"}`}>{svc.uptime}</span>
                      </td>
                      <td className="py-3.5 px-4 text-white/50 text-sm font-mono">{svc.requests}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-sm font-mono ${parseFloat(svc.errors) > 1 ? "text-rose-400" : parseFloat(svc.errors) > 0 ? "text-amber-400" : "text-white/50"}`}>{svc.errors}</span>
                      </td>
                      <td className="py-3.5 px-4 text-white/30 text-sm">{svc.lastCheck}</td>
                      <td className="py-3.5 px-4">
                        <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/25 hover:text-white/60 transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}