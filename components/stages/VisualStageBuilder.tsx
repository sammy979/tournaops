"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trophy, Users, Award, Crown, Zap, Target,
  Edit, Copy, Trash2, Check, ArrowDown, ArrowRight,
  Lock, Play, Clock, Sparkles, ChevronRight, Radio,
  X, AlertTriangle, Shield, Star, Flame
} from "lucide-react";
import { Tournament } from "@/types/tournament";
import dynamic from "next/dynamic";

const GrandFinalDashboard = dynamic(() => import("@/components/grandfinal/GrandFinalDashboard"), { ssr: false });
const GrandFinalPreview = dynamic(() => import("./GrandFinalPreview"), { ssr: false });

interface Stage {
  id: string;
  name: string;
  type: string;
  order: number;
  status: string;
  numGroups: number;
  teamsPerGroup: number;
  matchesPerGroup: number;
  totalTeams: number;
  teamsAdvancing: number;
  teamsEliminated: number;
  isLocked: boolean;
  qualificationRule: any;
  mapRotation: string[];
  groups: any[];
}

interface VisualStageBuilderProps {
  tournament: Tournament;
}

// Stage type presets (icon, color, defaults)
const STAGE_PRESETS = [
  {
    type: "OPEN_QUALIFIER",
    label: "Qualifier",
    shortLabel: "Qualifier",
    icon: Target,
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    description: "Open registration, mass elimination",
    defaults: { numGroups: 8, teamsPerGroup: 16, matchesPerGroup: 6, ruleType: "TOP_N_PER_GROUP", ruleCount: 8 },
  },
  {
    type: "GROUP_STAGE",
    label: "Group Stage",
    shortLabel: "Groups",
    icon: Users,
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    description: "Multiple groups, top teams advance",
    defaults: { numGroups: 4, teamsPerGroup: 16, matchesPerGroup: 4, ruleType: "TOP_N_PER_GROUP", ruleCount: 8 },
  },
  {
    type: "ROUND_OF_16",
    label: "Round of 16",
    shortLabel: "R16",
    icon: Award,
    color: "indigo",
    gradient: "from-indigo-500 to-purple-500",
    description: "16 teams, single bracket",
    defaults: { numGroups: 1, teamsPerGroup: 16, matchesPerGroup: 4, ruleType: "TOP_N_OVERALL", ruleCount: 8 },
  },
  {
    type: "QUARTER_FINAL",
    label: "Quarter Final",
    shortLabel: "QF",
    icon: Flame,
    color: "orange",
    gradient: "from-orange-500 to-red-500",
    description: "8 teams, elimination",
    defaults: { numGroups: 1, teamsPerGroup: 8, matchesPerGroup: 4, ruleType: "TOP_N_OVERALL", ruleCount: 4 },
  },
  {
    type: "SEMI_FINAL",
    label: "Semi Final",
    shortLabel: "SF",
    icon: Star,
    color: "red",
    gradient: "from-red-500 to-pink-500",
    description: "Top teams battle for finals",
    defaults: { numGroups: 2, teamsPerGroup: 16, matchesPerGroup: 6, ruleType: "TOP_N_PER_GROUP", ruleCount: 8 },
  },
  {
    type: "GRAND_FINAL",
    label: "Grand Final",
    shortLabel: "GF",
    icon: Crown,
    color: "yellow",
    gradient: "from-yellow-500 to-orange-500",
    description: "Ultimate showdown, one champion",
    defaults: { numGroups: 1, teamsPerGroup: 16, matchesPerGroup: 6, ruleType: "TOP_N_OVERALL", ruleCount: 1 },
  },
  {
    type: "CUSTOM",
    label: "Custom Stage",
    shortLabel: "Custom",
    icon: Sparkles,
    color: "gray",
    gradient: "from-gray-500 to-slate-500",
    description: "Any custom format",
    defaults: { numGroups: 1, teamsPerGroup: 16, matchesPerGroup: 4, ruleType: "TOP_N_OVERALL", ruleCount: 8 },
  },
];

export default function VisualStageBuilder({ tournament }: VisualStageBuilderProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAt, setShowAddAt] = useState<number | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [showDashboard, setShowDashboard] = useState<Stage | null>(null);
  const [showAdvance, setShowAdvance] = useState<Stage | null>(null);
  const [showGrandFinalPreview, setShowGrandFinalPreview] = useState<Stage | null>(null);

  const loadStages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/stages`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setStages(d.stages || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadStages(); }, [tournament.id]);

  const getStagePreset = (type: string) => STAGE_PRESETS.find(p => p.type === type) || STAGE_PRESETS[6];

  const createStage = async (preset: typeof STAGE_PRESETS[0], insertAtOrder?: number) => {
    const body = {
      name: preset.label,
      type: preset.type,
      numGroups: preset.defaults.numGroups,
      teamsPerGroup: preset.defaults.teamsPerGroup,
      matchesPerGroup: preset.defaults.matchesPerGroup,
      totalTeams: preset.defaults.numGroups * preset.defaults.teamsPerGroup,
      mapRotation: tournament.mapRotation || ["Erangel"],
      scoringRule: tournament.scoringRule,
      qualificationRule: {
        type: preset.defaults.ruleType,
        count: preset.defaults.ruleCount,
      },
    };

    const res = await fetch(`/api/tournaments/${tournament.id}/stages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowAddAt(null);
      loadStages();
    }
  };

  const deleteStage = async (stage: Stage) => {
    if (!confirm(`Delete "${stage.name}"? All settings will be lost.`)) return;
    const res = await fetch(`/api/stages/${stage.id}`, { method: "DELETE" });
    if (res.ok) loadStages();
    else alert("Failed to delete");
  };

  const duplicateStage = async (stage: Stage) => {
    const preset = getStagePreset(stage.type);
    const body = {
      name: `${stage.name} (Copy)`,
      type: stage.type,
      numGroups: stage.numGroups,
      teamsPerGroup: stage.teamsPerGroup,
      matchesPerGroup: stage.matchesPerGroup,
      totalTeams: stage.totalTeams,
      mapRotation: stage.mapRotation,
      scoringRule: tournament.scoringRule,
      qualificationRule: stage.qualificationRule,
    };
    const res = await fetch(`/api/tournaments/${tournament.id}/stages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) loadStages();
  };

  const getStatusInfo = (stage: Stage) => {
    if (stage.isLocked) return { label: "Locked", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: Lock };
    if (stage.status === "COMPLETED") return { label: "Complete", color: "text-green-400 bg-green-500/10 border-green-500/30", icon: Check };
    if (stage.status === "LIVE") return { label: "Live", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: Radio };
    if (stage.status === "READY") return { label: "Ready", color: "text-purple-400 bg-purple-500/10 border-purple-500/30", icon: Zap };
    if (stage.status === "REGISTRATION_OPEN") return { label: "Reg Open", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: Users };
    return { label: "Draft", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: Clock };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Tournament Pipeline
          </h2>
          <p className="text-gray-500 text-sm mt-1">Visual stage builder  Drag stages to reorder</p>
        </div>
        {stages.length === 0 && (
          <div className="text-xs text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Start by adding your first stage below
          </div>
        )}
      </div>

      {/* Registration Card (always at top) */}
      <div className="max-w-md mx-auto">
        <div className="glass-card rounded-2xl p-4 border border-white/10 bg-gradient-to-br from-white/3 to-transparent text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Registration</span>
          </div>
          <div className="text-2xl font-black text-white">{tournament.teams?.length || 0}</div>
          <div className="text-xs text-gray-500">Registered Teams</div>
        </div>
      </div>

      {/* Arrow down */}
      {stages.length > 0 && (
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-gray-700 animate-pulse" />
        </div>
      )}

      {/* Stages Pipeline */}
      <div className="max-w-2xl mx-auto space-y-4">
        {stages.map((stage, idx) => {
          const preset = getStagePreset(stage.type);
          const Icon = preset.icon;
          const status = getStatusInfo(stage);
          const StatusIcon = status.icon;
          const isLast = idx === stages.length - 1;
          const canAdvance = ["COMPLETED", "RESULTS_PENDING"].includes(stage.status) && !stage.isLocked;

          return (
            <div key={stage.id}>
              {/* + Insert button (above card, between stages) */}
              {idx === 0 && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => setShowAddAt(0)}
                    className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-gray-500 hover:text-blue-400 text-xs transition-all"
                  >
                    <Plus className="w-3 h-3" />Insert stage before
                  </button>
                </div>
              )}

              {/* STAGE CARD */}
              <div className={`relative group glass-card rounded-2xl border overflow-hidden transition-all hover:scale-[1.01] ${
                stage.isLocked ? "border-yellow-500/30 shadow-lg shadow-yellow-500/10" :
                stage.status === "LIVE" ? "border-red-500/40 shadow-lg shadow-red-500/20 animate-pulse-glow" :
                stage.status === "COMPLETED" ? "border-green-500/30" :
                stage.status === "READY" ? "border-purple-500/30" :
                "border-white/10 hover:border-white/25"
              }`}>

                {/* Gradient background */}
                <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${preset.gradient}`} />

                <div className="relative p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${preset.gradient} shadow-lg flex-shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Stage {idx + 1}
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.color}`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {status.label}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white truncate">{stage.name}</h3>

                        {/* Stats row */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <strong className="text-white">{stage.totalTeams}</strong> teams
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            <strong className="text-white">{stage.numGroups}</strong> {stage.numGroups === 1 ? "group" : "groups"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            <strong className="text-white">{stage.matchesPerGroup}</strong> matches
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions dropdown (visible on hover) */}
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {stage.type === "GRAND_FINAL" && (
                        <button
                          onClick={() => setShowDashboard(stage)}
                          className="p-2 rounded-lg text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                          title="Live Dashboard"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingStage(stage)}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit"
                        disabled={stage.isLocked}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateStage(stage)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteStage(stage)}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                        disabled={stage.isLocked}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Completion status bar */}
                  {stage.status === "COMPLETED" && stage.teamsAdvancing > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-bold text-sm">Stage Completed</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-green-400 font-bold">{stage.teamsAdvancing} advanced</span>
                          <span className="text-gray-600"></span>
                          <span className="text-red-400">{stage.teamsEliminated} eliminated</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!stage.isLocked && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {stage.status === "DRAFT" && (
                        <button
                          onClick={async () => {
                            await fetch(`/api/stages/${stage.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "READY" }),
                            });
                            loadStages();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-medium"
                        >
                          <Check className="w-3 h-3" />Mark Ready
                        </button>
                      )}
                      {stage.status === "READY" && (
                        <button
                          onClick={async () => {
                            await fetch(`/api/stages/${stage.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "LIVE" }),
                            });
                            loadStages();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium"
                        >
                          <Radio className="w-3 h-3 animate-pulse" />Go Live
                        </button>
                      )}
                      {stage.status === "LIVE" && (
                        <button
                          onClick={async () => {
                            await fetch(`/api/stages/${stage.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "COMPLETED" }),
                            });
                            loadStages();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-xs font-medium"
                        >
                          <Check className="w-3 h-3" />Mark Complete
                        </button>
                      )}
                      {canAdvance && !isLast && (
                        <button
                          onClick={() => setShowAdvance(stage)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-medium"
                        >
                          <Zap className="w-3 h-3" />Advance Teams<ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {canAdvance && isLast && stage.type !== "GRAND_FINAL" && (
                        <button
                          onClick={() => setShowGrandFinalPreview(stage)}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold shadow-lg shadow-yellow-500/20"
                        >
                          <Crown className="w-3 h-3" />Create Grand Final
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow between stages */}
              {!isLast && (
                <div className="flex flex-col items-center py-2">
                  {stage.teamsAdvancing > 0 && (
                    <div className="text-[10px] font-bold text-green-400 mb-1 uppercase tracking-widest">
                      {stage.teamsAdvancing} teams advance
                    </div>
                  )}
                  <ArrowDown className="w-5 h-5 text-gray-700" />
                </div>
              )}

              {/* + Insert button (between stages) */}
              {!isLast && (
                <div className="flex justify-center my-2">
                  <button
                    onClick={() => setShowAddAt(idx + 1)}
                    className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-gray-500 hover:text-blue-400 text-xs transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                  >
                    <Plus className="w-3 h-3" />Insert stage here
                  </button>
                </div>
              )}

              {/* Add Stage or Champion label at end */}
              {isLast && (
                <>
                  {stage.type === "GRAND_FINAL" && stage.status === "COMPLETED" ? (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                        <Crown className="w-6 h-6 text-yellow-400" />
                        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                          CHAMPION CROWNED
                        </span>
                        <Crown className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={() => setShowAddAt(stages.length)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-blue-500/20 border-2 border-dashed border-white/10 hover:border-blue-500/40 text-gray-400 hover:text-blue-400 text-sm font-semibold transition-all"
                      >
                        <Plus className="w-4 h-4" />Add Next Stage
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {stages.length === 0 && (
          <div className="text-center py-8">
            <button
              onClick={() => setShowAddAt(0)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-2xl shadow-blue-500/40 hover:opacity-90"
            >
              <Plus className="w-5 h-5" />Add Your First Stage
            </button>
          </div>
        )}
      </div>

      {/*  MODALS  */}

      {/* Add Stage Picker */}
      {showAddAt !== null && (
        <AddStagePicker
          currentStages={stages}
          insertAt={showAddAt}
          onSelect={(preset: Record<string, unknown>) => createStage(preset, showAddAt)}
          onClose={() => setShowAddAt(null)}
        />
      )}

      {/* Edit Stage Modal */}
      {editingStage && (
        <EditStageModal
          stage={editingStage}
          onClose={() => setEditingStage(null)}
          onSave={() => { loadStages(); setEditingStage(null); }}
        />
      )}

      {/* Grand Final Dashboard */}
      {showDashboard && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto py-6">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />Grand Final Dashboard
              </h2>
              <button onClick={() => setShowDashboard(null)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <GrandFinalDashboard
              stageId={showDashboard.id}
              onLock={async () => {
                const res = await fetch(`/api/stages/${showDashboard.id}/lock`, { method: "POST" });
                if (res.ok) { loadStages(); setShowDashboard(null); }
              }}
              onPublish={() => window.open(`/tournaments/${tournament.slug}/grand-final`, "_blank")}
            />
          </div>
        </div>
      )}

      {/* Grand Final Preview (Create next stage) */}
      {showGrandFinalPreview && (
        <GrandFinalPreview
          stageId={showGrandFinalPreview.id}
          currentStageName={showGrandFinalPreview.name}
          onClose={() => setShowGrandFinalPreview(null)}
          onCreated={() => { loadStages(); setShowGrandFinalPreview(null); }}
        />
      )}

      {/* Advance Confirmation */}
      {showAdvance && (
        <AdvanceConfirmation
          stage={showAdvance}
          nextStage={stages.find(s => s.order === showAdvance.order + 1)}
          onClose={() => setShowAdvance(null)}
          onAdvanced={() => { loadStages(); setShowAdvance(null); }}
        />
      )}
    </div>
  );
}

// 
// ADD STAGE PICKER
// 

function AddStagePicker({ currentStages, insertAt, onSelect, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-3xl mx-4 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />Add Tournament Stage
            </h2>
            <p className="text-gray-500 text-sm mt-1">Choose the type of stage to add</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STAGE_PRESETS.map(preset => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.type}
                onClick={() => onSelect(preset)}
                className="text-left p-4 rounded-2xl border border-white/10 hover:border-white/30 bg-white/2 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${preset.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{preset.label}</div>
                    <div className="text-xs text-gray-500">{preset.description}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-1.5 rounded bg-white/5">
                    <div className="text-white font-bold">{preset.defaults.numGroups}</div>
                    <div className="text-gray-600 text-[9px]">Groups</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-white/5">
                    <div className="text-white font-bold">{preset.defaults.teamsPerGroup}</div>
                    <div className="text-gray-600 text-[9px]">Teams/G</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-white/5">
                    <div className="text-white font-bold">{preset.defaults.matchesPerGroup}</div>
                    <div className="text-gray-600 text-[9px]">Matches</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 
// EDIT STAGE MODAL
// 

function EditStageModal({ stage, onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: stage.name,
    numGroups: stage.numGroups,
    teamsPerGroup: stage.teamsPerGroup,
    matchesPerGroup: stage.matchesPerGroup,
    ruleType: stage.qualificationRule?.type || "TOP_N_PER_GROUP",
    ruleCount: stage.qualificationRule?.count || 8,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/stages/${stage.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        numGroups: form.numGroups,
        teamsPerGroup: form.teamsPerGroup,
        matchesPerGroup: form.matchesPerGroup,
        totalTeams: form.numGroups * form.teamsPerGroup,
        qualificationRule: { type: form.ruleType, count: form.ruleCount },
      }),
    });
    if (res.ok) onSave();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-lg mx-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Edit className="w-4 h-4 text-blue-400" />Edit Stage
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Stage Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Groups</label>
              <input type="number" min={1} value={form.numGroups} onChange={e => setForm({ ...form, numGroups: parseInt(e.target.value) || 1 })} className="input-field text-center" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Teams/G</label>
              <input type="number" min={2} value={form.teamsPerGroup} onChange={e => setForm({ ...form, teamsPerGroup: parseInt(e.target.value) || 16 })} className="input-field text-center" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Matches</label>
              <input type="number" min={1} value={form.matchesPerGroup} onChange={e => setForm({ ...form, matchesPerGroup: parseInt(e.target.value) || 4 })} className="input-field text-center" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Qualification Rule</label>
            <select value={form.ruleType} onChange={e => setForm({ ...form, ruleType: e.target.value })} className="input-field mb-2">
              <option value="TOP_N_PER_GROUP">Top N per group</option>
              <option value="TOP_N_OVERALL">Top N overall</option>
              <option value="TOP_PERCENT">Top X percent</option>
            </select>
            <input type="number" min={1} value={form.ruleCount} onChange={e => setForm({ ...form, ruleCount: parseInt(e.target.value) || 1 })} className="input-field" placeholder="Count" />
          </div>
        </div>
        <div className="p-5 border-t border-white/10 flex justify-between">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2 text-sm">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 
// ADVANCE CONFIRMATION
// 

function AdvanceConfirmation({ stage, nextStage, onClose, onAdvanced }: any) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/stages/${stage.id}/advance`);
      if (res.ok) {
        const d = await res.json();
        setPreview(d.preview);
      }
      setLoading(false);
    })();
  }, [stage.id]);

  const handleAdvance = async () => {
    setAdvancing(true);
    const res = await fetch(`/api/stages/${stage.id}/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextStageId: nextStage?.id }),
    });
    if (res.ok) onAdvanced();
    setAdvancing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-2xl mx-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />Advance Teams
            </h2>
            <p className="text-gray-500 text-sm">
              From <strong className="text-white">{stage.name}</strong>
              {nextStage && <> to <strong className="text-blue-400">{nextStage.name}</strong></>}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="text-center py-8"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : preview ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-black text-green-400">{preview.summary.totalQualified}</div>
                  <div className="text-xs text-gray-500">Advancing</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="text-2xl font-black text-red-400">{preview.summary.totalEliminated}</div>
                  <div className="text-xs text-gray-500">Eliminated</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-2xl font-black text-purple-400">{preview.summary.totalWildcards}</div>
                  <div className="text-xs text-gray-500">Wildcards</div>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {[...preview.qualified, ...preview.wildcards].slice(0, 20).map((t: any) => (
                  <div key={t.teamId} className="flex items-center justify-between p-2 rounded-lg bg-green-500/5 border border-green-500/15">
                    <span className="text-white text-sm">#{t.rank} {t.teamName}</span>
                    <span className="text-blue-400 font-mono text-xs">{t.points} pts</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-400" />
              Enter match results first
            </div>
          )}
        </div>
        <div className="p-5 border-t border-white/10 flex justify-between">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
          <button onClick={handleAdvance} disabled={advancing || !preview} className="btn-primary px-6 py-2 text-sm">
            {advancing ? "Advancing..." : "Confirm Advance"}
          </button>
        </div>
      </div>
    </div>
  );
}
