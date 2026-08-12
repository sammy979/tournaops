"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/ui/AdminShell";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  HelpCircle,
} from "lucide-react";

type ServiceStatus = "healthy" | "degraded" | "down" | "unknown" | "partial";

interface Service {
  service: string;
  status: ServiceStatus;
  latency?: number;
  message?: string;
}

interface SystemStatusResponse {
  status: string;
  timestamp: string;
  responseTime: number;
  services: Service[];
}

const SERVICE_LABELS: Record<string, string> = {
  database:       "PostgreSQL Database",
  groq:           "Groq AI",
  gemini:         "Gemini AI",
  dodoPayments:   "Dodo Payments",
  blobStorage:    "Vercel Blob Storage",
  jwt:            "JWT Configuration",
  nepalPayments:  "Nepal Payments (eSewa/Khalti)",
};

function statusColor(status: ServiceStatus): {
  dot: string;
  text: string;
  bg: string;
  border: string;
} {
  switch (status) {
    case "healthy":
      return {
        dot: "var(--green)",
        text: "var(--green)",
        bg: "var(--green-dim)",
        border: "var(--green)",
      };
    case "degraded":
    case "partial":
      return {
        dot: "var(--amber)",
        text: "var(--amber)",
        bg: "var(--amber-dim)",
        border: "var(--amber)",
      };
    case "down":
      return {
        dot: "var(--red)",
        text: "var(--red)",
        bg: "var(--red-dim)",
        border: "var(--red)",
      };
    default:
      return {
        dot: "var(--white-40)",
        text: "var(--white-40)",
        bg: "var(--surface-2)",
        border: "var(--border)",
      };
  }
}

function StatusIcon({ status }: { status: ServiceStatus }) {
  const size = { width: "28px", height: "28px", flexShrink: 0 };
  switch (status) {
    case "healthy":
      return <CheckCircle2 style={{ ...size, color: "var(--green)" }} />;
    case "degraded":
    case "partial":
      return <AlertTriangle style={{ ...size, color: "var(--amber)" }} />;
    case "down":
      return <XCircle style={{ ...size, color: "var(--red)" }} />;
    default:
      return <HelpCircle style={{ ...size, color: "var(--white-40)" }} />;
  }
}

export default function AdminSystemHealthPage() {
  const [data, setData]           = useState<SystemStatusResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/system-status", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as SystemStatusResponse;
      setData(json);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to load system status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto refresh every 30 seconds
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const services = data?.services || [];
  const healthy  = services.filter((s) => s.status === "healthy").length;
  const degraded = services.filter((s) => s.status === "degraded" || s.status === "partial").length;
  const down     = services.filter((s) => s.status === "down").length;
  const unknown  = services.filter((s) => s.status === "unknown").length;

  const overall = data?.status || "unknown";
  const overallColor = statusColor(overall as ServiceStatus);

  return (
    <AdminShell>
      <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="section-label">System Health</div>
            <h1 className="text-display" style={{ marginBottom: "6px" }}>
              Live Service Status
            </h1>
            <p style={{ color: "var(--white-40)", fontSize: "0.85rem" }}>
              Real health checks against configured services. No cached data.
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="btn-secondary"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <RefreshCw style={{ width: "14px", height: "14px", animation: loading ? "spin 0.8s linear infinite" : "none" }} />
            {loading ? "Checking" : "Refresh"}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* OVERALL BANNER */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px 24px",
          background: overallColor.bg,
          border: `1px solid ${overallColor.border}`,
          borderLeft: `4px solid ${overallColor.border}`,
          marginBottom: "24px",
        }}>
          <StatusIcon status={overall as ServiceStatus} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: overallColor.text,
              marginBottom: "2px",
            }}>
              {loading && !data ? "Checking Services..." :
               error ? "Status Check Failed" :
               down > 0 ? `${down} Service${down > 1 ? "s" : ""} Down` :
               degraded > 0 ? `${degraded} Service${degraded > 1 ? "s" : ""} Degraded` :
               unknown === services.length ? "No Services Configured" :
               "All Systems Operational"}
            </p>
            <p style={{
              fontSize: "0.78rem",
              color: "var(--white-40)",
              fontFamily: "Barlow, sans-serif",
            }}>
              {error ? error :
               data ? `${healthy}/${services.length} healthy - Response ${data.responseTime}ms - Last checked ${lastRefresh ? lastRefresh.toLocaleTimeString() : "just now"}`
                    : "Awaiting first check"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
            <StatCounter label="Healthy"   value={healthy}  color="var(--green)"    />
            {degraded > 0 && <StatCounter label="Degraded"  value={degraded} color="var(--amber)" />}
            {down     > 0 && <StatCounter label="Down"      value={down}     color="var(--red)"   />}
            {unknown  > 0 && <StatCounter label="Unknown"   value={unknown}  color="var(--white-40)" />}
          </div>
        </div>

        {/* SERVICES TABLE */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface-2)",
          }}>
            <h2 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--white)",
              margin: 0,
            }}>Services</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--white-40)", fontSize: "0.72rem", fontFamily: "JetBrains Mono, monospace" }}>
              <Clock style={{ width: "12px", height: "12px" }} />
              Auto-refresh 30s
            </div>
          </div>

          {loading && !data && (
            <div style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "var(--white-40)",
              fontSize: "0.85rem",
            }}>Loading service status...</div>
          )}

          {!loading && services.length === 0 && (
            <div style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "var(--white-40)",
              fontSize: "0.85rem",
            }}>No services returned by API.</div>
          )}

          {services.length > 0 && (
            <div className="scroll-x">
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 100px 1fr",
                padding: "10px 20px",
                background: "var(--surface-2)",
                borderBottom: "1px solid var(--border)",
                minWidth: "600px",
              }}>
                {["Service", "Status", "Latency", "Message"].map((h) => (
                  <div key={h} style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    color: "var(--white-40)",
                    textTransform: "uppercase",
                  }}>{h}</div>
                ))}
              </div>

              {services.map((svc, i) => {
                const c = statusColor(svc.status);
                return (
                  <div key={svc.service + i} style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 100px 1fr",
                    padding: "14px 20px",
                    borderBottom: i < services.length - 1 ? "1px solid var(--border)" : "none",
                    alignItems: "center",
                    minWidth: "600px",
                  }}>
                    {/* SERVICE NAME */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: c.dot,
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: "var(--white)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}>
                        {SERVICE_LABELS[svc.service] || svc.service}
                      </span>
                    </div>

                    {/* STATUS */}
                    <div>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        border: `1px solid ${c.border}`,
                        background: c.bg,
                        color: c.text,
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}>
                        {svc.status}
                      </span>
                    </div>

                    {/* LATENCY */}
                    <div style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.82rem",
                      color: svc.latency !== undefined
                        ? svc.latency > 800 ? "var(--amber)" : "var(--white-70)"
                        : "var(--white-20)",
                    }}>
                      {svc.latency !== undefined ? `${svc.latency}ms` : "-"}
                    </div>

                    {/* MESSAGE */}
                    <div style={{
                      fontSize: "0.78rem",
                      color: "var(--white-40)",
                      fontFamily: "Barlow, sans-serif",
                    }}>
                      {svc.message || "-"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* HONESTY DISCLAIMER */}
        <div style={{
          marginTop: "24px",
          padding: "14px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: "3px solid var(--gold)",
        }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}>What This Shows</div>
          <p style={{
            fontSize: "0.78rem",
            color: "var(--white-40)",
            lineHeight: 1.6,
          }}>
            Live service status returned by <code style={{ color: "var(--white-70)", fontFamily: "JetBrains Mono, monospace" }}>/api/system-status</code>.
            No fake metrics. Services marked <em>unknown</em> are not configured in environment variables.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCounter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 900,
        fontSize: "1.6rem",
        color,
        lineHeight: 1,
        margin: 0,
      }}>{value}</p>
      <p style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 600,
        fontSize: "0.65rem",
        letterSpacing: "0.15em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginTop: "4px",
      }}>{label}</p>
    </div>
  );
}