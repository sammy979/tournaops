"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Lock, Play, Award } from "lucide-react";

interface StageItem {
  id: string;
  name: string;
  type: string;
  order: number;
  status: string;
  isLocked?: boolean;
}

interface StageProgressionTimelineProps {
  tournamentId: string;
  compact?: boolean;
}

const STATUS_ICON: Record<string, any> = {
  DRAFT: Circle,
  REGISTRATION_OPEN: Circle,
  REGISTRATION_CLOSED: Lock,
  READY: Circle,
  LIVE: Play,
  RESULTS_PENDING: Play,
  COMPLETED: CheckCircle2,
  ARCHIVED: CheckCircle2,
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#6b7280",
  REGISTRATION_OPEN: "#3b82f6",
  REGISTRATION_CLOSED: "#06b6d4",
  READY: "#8b5cf6",
  LIVE: "#22c55e",
  RESULTS_PENDING: "#f59e0b",
  COMPLETED: "#10b981",
  ARCHIVED: "#4b5563",
};

export default function StageProgressionTimeline({ tournamentId, compact = false }: StageProgressionTimelineProps) {
  const [stages, setStages] = useState<StageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) return;
    fetch(`/api/tournaments/${tournamentId}/stages`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStages(d.stages || []))
      .catch(() => setStages([]))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  if (loading || stages.length === 0) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "1rem",
      padding: compact ? "1rem" : "1.5rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <Award style={{ width: "1rem", height: "1rem", color: "#a855f7" }} />
        <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>
          Tournament Progression
        </h3>
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        overflowX: "auto",
        paddingBottom: "0.5rem",
      }}>
        {stages.map((stage, idx) => {
          const Icon = STATUS_ICON[stage.status] || Circle;
          const color = STATUS_COLOR[stage.status] || "#6b7280";
          return (
            <div key={stage.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.375rem",
                minWidth: "80px",
              }}>
                <div style={{
                  width: "2rem", height: "2rem",
                  borderRadius: "50%",
                  background: `${color}20`,
                  border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: "1rem", height: "1rem", color: color }} />
                </div>
                <div style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "#fff",
                  textAlign: "center",
                  maxWidth: "80px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {stage.name}
                </div>
                <div style={{
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  color: color,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {stage.status.replace(/_/g, " ")}
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div style={{
                  width: "1.5rem",
                  height: "2px",
                  background: "rgba(255,255,255,0.1)",
                  margin: "0 0.25rem",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
