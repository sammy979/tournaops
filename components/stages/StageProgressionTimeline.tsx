"use client";

import { useState, useEffect } from "react";
import {
  Award, Check, Lock, Play, Clock, ChevronRight,
  Trophy, Crown, Zap, AlertTriangle, Users
} from "lucide-react";

interface StageProgressionTimelineProps {
  tournamentId: string;
  compact?: boolean;
}

export default function StageProgressionTimeline({ tournamentId, compact = false }: StageProgressionTimelineProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/progression`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
      setLoading(false);
    })();
  }, [tournamentId]);

  if (loading) return null;
  if (!data?.stages || data.stages.length === 0) return null;

  const getStageIcon = (type: string) => {
    if (type.includes("QUALIFIER")) return "🎯";
    if (type === "GROUP_STAGE") return "👥";
    if (type === "ROUND_OF_16") return "🎮";
    if (type === "QUARTER_FINAL") return "⚡";
    if (type === "SEMI_FINAL") return "🔥";
    if (type === "GRAND_FINAL") return "👑";
    return "🏆";
  };

  const getStatusIcon = (status: string) => {
    if (status === "COMPLETED") return <Check className="w-3.5 h-3.5" />;
    if (status === "LIVE") return <Play className="w-3.5 h-3.5" />;
    if (status === "READY") return <Zap className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  const getStatusColor = (status: string, isLocked: boolean) => {
    if (isLocked) return "border-yellow-500/40 bg-yellow-500/10";
    if (status === "COMPLETED") return "border-green-500/40 bg-green-500/10";
    if (status === "LIVE") return "border-blue-500/40 bg-blue-500/10 animate-pulse";
    if (status === "READY") return "border-purple-500/40 bg-purple-500/10";
    return "border-white/10 bg-white/3";
  };

  const getStatusTextColor = (status: string) => {
    if (status === "COMPLETED") return "text-green-400";
    if (status === "LIVE") return "text-blue-400";
    if (status === "READY") return "text-purple-400";
    return "text-gray-500";
  };

  if (compact) {
    return (
      <div className="glass-card rounded-xl p-3 border border-white/10">
        <div className="flex items-center gap-1 overflow-x-auto">
          {data.stages.map((stage: any, idx: number) => (
            <div key={stage.id} className="flex items-center gap-1 flex-shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getStatusColor(stage.status, false)}`}>
                <span className="text-sm">{getStageIcon(stage.type)}</span>
                <span className={`text-xs font-semibold ${getStatusTextColor(stage.status)}`}>{stage.name}</span>
                {getStatusIcon(stage.status)}
              </div>
              {idx < data.stages.length - 1 && <ChevronRight className="w-3 h-3 text-gray-700" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-purple-400" />
        Tournament Progression
      </h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-yellow-500/50" />

        <div className="space-y-3">
          {data.stages.map((stage: any, idx: number) => {
            const isLast = idx === data.stages.length - 1;
            const isCompleted = stage.status === "COMPLETED";
            const isLive = stage.status === "LIVE";

            return (
              <div key={stage.id} className="relative pl-12">
                {/* Circle marker */}
                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${
                  isCompleted ? "bg-green-500 border-green-400" :
                  isLive ? "bg-blue-500 border-blue-400 animate-pulse" :
                  stage.status === "READY" ? "bg-purple-500 border-purple-400" :
                  "bg-[#0a0a0f] border-white/20"
                }`}>
                  <span className="text-sm">{getStageIcon(stage.type)}</span>
                </div>

                {/* Card */}
                <div className={`p-3 rounded-xl border ${getStatusColor(stage.status, false)}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">{stage.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusTextColor(stage.status)} bg-white/5`}>
                          {stage.status}
                        </span>
                        {isLast && stage.type === "GRAND_FINAL" && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" />{stage.totalTeams} teams
                        </span>
                        {stage.teamsAdvancing > 0 && (
                          <>
                            <span className="text-gray-700">·</span>
                            <span className="text-green-400 font-semibold">{stage.teamsAdvancing} advanced</span>
                          </>
                        )}
                        {stage.teamsEliminated > 0 && (
                          <>
                            <span className="text-gray-700">·</span>
                            <span className="text-red-400">{stage.teamsEliminated} eliminated</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}