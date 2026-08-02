"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trophy, Users, Lock, Unlock, Play, Check, X,
  ChevronRight, Award, AlertTriangle, Zap, Calendar,
  Settings, ArrowRight, Trash2, Edit
} from "lucide-react";
import { Tournament } from "@/types/tournament";

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
  lockedAt?: string;
  qualificationRule: any;
  groups: any[];
  mapRotation: string[];
  description?: string;
}

interface StageManagerProps {
  tournament: Tournament;
  onStageChange?: () => void;
}

const STAGE_TYPES = [
  { value: "OPEN_QUALIFIER", label: "Open Qualifier", color: "text-blue-400" },
  { value: "CLOSED_QUALIFIER", label: "Closed Qualifier", color: "text-cyan-400" },
  { value: "GROUP_STAGE", label: "Group Stage", color: "text-purple-400" },
  { value: "ROUND_OF_16", label: "Round of 16", color: "text-pink-400" },
  { value: "QUARTER_FINAL", label: "Quarter Final", color: "text-orange-400" },
  { value: "SEMI_FINAL", label: "Semi Final", color: "text-red-400" },
  { value: "GRAND_FINAL", label: "Grand Final", color: "text-yellow-400" },
  { value: "PLACEMENT_MATCH", label: "Placement Match", color: "text-green-400" },
  { value: "CUSTOM", label: "Custom Stage", color: "text-gray-400" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Draft" },
  REGISTRATION_OPEN: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Reg Open" },
  REGISTRATION_CLOSED: { bg: "bg-cyan-500/20", text: "text-cyan-400", label: "Reg Closed" },
  READY: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Ready" },
  LIVE: { bg: "bg-green-500/20", text: "text-green-400", label: "● Live" },
  RESULTS_PENDING: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Results Pending" },
  COMPLETED: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Completed" },
  ARCHIVED: { bg: "bg-gray-600/20", text: "text-gray-500", label: "Archived" },
};

export default function StageManager({ tournament, onStageChange }: StageManagerProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [showAdvance, setShowAdvance] = useState<Stage | null>(null);

  const loadStages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/stages`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStages(data.stages || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { loadStages(); }, [tournament.id]);

  const toggleLock = async (stage: Stage) => {
    const method = stage.isLocked ? "DELETE" : "POST";
    const res = await fetch(`/api/stages/${stage.id}/lock`, { method });
    if (res.ok) loadStages();
    else alert("Failed to toggle lock");
  };

  const deleteStage = async (stage: Stage) => {
    if (!confirm(`Delete "${stage.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/stages/${stage.id}`, { method: "DELETE" });
    if (res.ok) loadStages();
    else alert("Failed to delete stage");
  };

  const updateStatus = async (stage: Stage, newStatus: string) => {
    const res = await fetch(`/api/stages/${stage.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) loadStages();
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
            <Award className="w-6 h-6 text-purple-400" />
            Tournament Stages
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {stages.length} stage{stages.length !== 1 ? "s" : ""} · Manage qualifiers, group stages, finals
          </p>
        </div>
        <button
          onClick={() => { setEditingStage(null); setShowBuilder(true); }}
          className="btn-primary flex items-center gap-2 px-5 py-2.5"
        >
          <Plus className="w-4 h-4" />Add Stage
        </button>
      </div>

      {/* Empty State */}
      {stages.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <Award className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Stages Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first stage — Qualifiers, Group Stage, Semi-Finals, Grand Final.
            Advance teams automatically between stages.
          </p>
          <button onClick={() => setShowBuilder(true)} className="btn-primary px-6 py-2.5">
            <Plus className="w-4 h-4" />Create First Stage
          </button>
        </div>
      )}

      {/* Stages List */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const stageType = STAGE_TYPES.find(t => t.value === stage.type) || STAGE_TYPES[8];
          const statusStyle = STATUS_STYLES[stage.status] || STATUS_STYLES.DRAFT;
          const nextStage = stages[idx + 1];
          const canAdvance = stage.status === "COMPLETED" || stage.status === "RESULTS_PENDING";
          const rule = stage.qualificationRule || {};

          return (
            <div
              key={stage.id}
              className={`glass-card rounded-2xl border transition-all ${
                stage.isLocked ? "border-yellow-500/20 bg-yellow-500/3" : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Stage Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 flex-shrink-0`}>
                      <span className={`text-2xl font-black ${stageType.color}`}>{idx + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-white font-bold text-lg truncate">{stage.name}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${stageType.color} border-current bg-white/5`}>
                          {stageType.label}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusStyle.label}
                        </span>
                        {stage.isLocked && (
                          <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                            <Lock className="w-2.5 h-2.5" />Locked
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />{stage.totalTeams} teams
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />{stage.numGroups} {stage.numGroups === 1 ? "group" : "groups"} × {stage.teamsPerGroup}
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />{stage.matchesPerGroup} matches/group
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!stage.isLocked && (
                      <>
                        <button
                          onClick={() => { setEditingStage(stage); setShowBuilder(true); }}
                          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStage(stage)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => toggleLock(stage)}
                      className={`p-2 rounded-lg transition-colors ${
                        stage.isLocked
                          ? "text-yellow-400 hover:bg-yellow-500/10"
                          : "text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                      }`}
                      title={stage.isLocked ? "Unlock" : "Lock"}
                    >
                      {stage.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Groups */}
                {stage.groups && stage.groups.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Groups</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {stage.groups.map((g: any) => (
                        <div key={g.id} className="p-2 rounded-lg bg-white/4 border border-white/8 text-center">
                          <div className="text-white text-xs font-semibold">{g.name}</div>
                          <div className="text-gray-500 text-[10px] mt-0.5">{g.teamIds?.length || 0} teams</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qualification Info */}
                <div className="p-3 rounded-xl bg-white/4 border border-white/8 mb-4">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Qualification Rule</div>
                  <div className="text-sm text-white flex items-center gap-2 flex-wrap">
                    {rule.type === "TOP_N_PER_GROUP" && (
                      <>
                        <span className="text-blue-400 font-bold">Top {rule.count}</span>
                        <span className="text-gray-500">from each group advance</span>
                      </>
                    )}
                    {rule.type === "TOP_N_OVERALL" && (
                      <>
                        <span className="text-blue-400 font-bold">Top {rule.count}</span>
                        <span className="text-gray-500">overall advance</span>
                      </>
                    )}
                    {rule.type === "TOP_PERCENT" && (
                      <>
                        <span className="text-blue-400 font-bold">Top {rule.percent}%</span>
                        <span className="text-gray-500">advance</span>
                      </>
                    )}
                    {rule.type === "CUSTOM" && (
                      <span className="text-gray-500">Custom qualification</span>
                    )}
                    {rule.wildcardCount && rule.wildcardCount > 0 && (
                      <>
                        <span className="text-gray-600">·</span>
                        <span className="text-purple-400 font-bold">+{rule.wildcardCount} wildcards</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {stage.status === "DRAFT" && (
                    <button onClick={() => updateStatus(stage, "READY")} className="btn-secondary text-xs px-3 py-1.5">
                      <Check className="w-3 h-3" />Mark Ready
                    </button>
                  )}
                  {stage.status === "READY" && (
                    <button onClick={() => updateStatus(stage, "LIVE")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 text-xs font-medium">
                      <Play className="w-3 h-3" />Start Stage
                    </button>
                  )}
                  {stage.status === "LIVE" && (
                    <button onClick={() => updateStatus(stage, "RESULTS_PENDING")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/30 text-xs font-medium">
                      <Check className="w-3 h-3" />Mark Complete
                    </button>
                  )}
                  {canAdvance && !stage.isLocked && (
                    <button
                      onClick={() => setShowAdvance(stage)}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:opacity-90"
                    >
                      <Zap className="w-3 h-3" />Advance Teams
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {stage.teamsAdvancing > 0 && (
                    <div className="ml-auto flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-green-400">
                        <Check className="w-3 h-3" />{stage.teamsAdvancing} advanced
                      </span>
                      <span className="flex items-center gap-1 text-red-400">
                        <X className="w-3 h-3" />{stage.teamsEliminated} eliminated
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection line to next stage */}
              {nextStage && (
                <div className="border-t border-white/8 px-5 py-2 flex items-center gap-2 text-xs text-gray-600">
                  <ChevronRight className="w-3 h-3" />
                  Next: <span className="text-gray-400 font-medium">{nextStage.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Builder Modal */}
      {showBuilder && (
        <StageBuilder
          tournament={tournament}
          stage={editingStage}
          onClose={() => { setShowBuilder(false); setEditingStage(null); }}
          onSave={() => { loadStages(); setShowBuilder(false); setEditingStage(null); }}
        />
      )}

      {/* Advance Modal */}
      {showAdvance && (
        <AdvanceTeamsModal
          stage={showAdvance}
          nextStage={stages.find(s => s.order === showAdvance.order + 1)}
          onClose={() => setShowAdvance(null)}
          onAdvanced={() => { loadStages(); setShowAdvance(null); }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STAGE BUILDER (Inline component)
// ═══════════════════════════════════════════════════════════

function StageBuilder({ tournament, stage, onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: stage?.name || "",
    type: stage?.type || "GROUP_STAGE",
    numGroups: stage?.numGroups || 1,
    teamsPerGroup: stage?.teamsPerGroup || 16,
    matchesPerGroup: stage?.matchesPerGroup || 4,
    totalTeams: stage?.totalTeams || 16,
    ruleType: stage?.qualificationRule?.type || "TOP_N_PER_GROUP",
    ruleCount: stage?.qualificationRule?.count || 8,
    wildcardCount: stage?.qualificationRule?.wildcardCount || 0,
    description: stage?.description || "",
    mapRotation: stage?.mapRotation || ["Erangel", "Miramar", "Sanhok"],
  });
  const [saving, setSaving] = useState(false);

  const totalTeamsCalc = form.numGroups * form.teamsPerGroup;

  const handleSave = async () => {
    setSaving(true);
    const body = {
      name: form.name || `Stage ${(stage?.order ?? 0) + 1}`,
      type: form.type,
      numGroups: form.numGroups,
      teamsPerGroup: form.teamsPerGroup,
      matchesPerGroup: form.matchesPerGroup,
      totalTeams: totalTeamsCalc,
      description: form.description,
      mapRotation: form.mapRotation,
      scoringRule: tournament.scoringRule,
      qualificationRule: {
        type: form.ruleType,
        count: form.ruleCount,
        wildcardCount: form.wildcardCount,
      },
    };

    const url = stage
      ? `/api/stages/${stage.id}`
      : `/api/tournaments/${tournament.id}/stages`;
    const method = stage ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) onSave();
    else alert("Failed to save stage");
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-2xl mx-4 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {stage ? "Edit Stage" : "Create New Stage"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Configure stage structure and qualification</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Stage Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. Qualifier Round 1"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Stage Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="input-field"
            >
              {STAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Groups</label>
              <input
                type="number"
                min={1}
                max={25}
                value={form.numGroups}
                onChange={e => setForm(f => ({ ...f, numGroups: parseInt(e.target.value) || 1 }))}
                className="input-field text-center"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Teams/Group</label>
              <input
                type="number"
                min={2}
                max={25}
                value={form.teamsPerGroup}
                onChange={e => setForm(f => ({ ...f, teamsPerGroup: parseInt(e.target.value) || 16 }))}
                className="input-field text-center"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Matches/Group</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.matchesPerGroup}
                onChange={e => setForm(f => ({ ...f, matchesPerGroup: parseInt(e.target.value) || 4 }))}
                className="input-field text-center"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-center">
            <div className="text-2xl font-black text-blue-400">{totalTeamsCalc}</div>
            <div className="text-xs text-gray-500">Total Teams in this Stage</div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="text-sm font-medium text-gray-400 block mb-3">Qualification Rule</label>
            <div className="space-y-3">
              <select
                value={form.ruleType}
                onChange={e => setForm(f => ({ ...f, ruleType: e.target.value }))}
                className="input-field"
              >
                <option value="TOP_N_PER_GROUP">Top N per group advance</option>
                <option value="TOP_N_OVERALL">Top N overall advance</option>
                <option value="TOP_PERCENT">Top X% advance</option>
                <option value="CUSTOM">Custom / manual only</option>
              </select>

              {form.ruleType !== "CUSTOM" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      {form.ruleType === "TOP_PERCENT" ? "Percentage %" : "Number"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.ruleCount}
                      onChange={e => setForm(f => ({ ...f, ruleCount: parseInt(e.target.value) || 1 }))}
                      className="input-field text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Wildcards</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={form.wildcardCount}
                      onChange={e => setForm(f => ({ ...f, wildcardCount: parseInt(e.target.value) || 0 }))}
                      className="input-field text-center"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Description (Optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field resize-none text-sm"
              rows={2}
              placeholder="Notes about this stage..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-between items-center">
          <button onClick={onClose} className="btn-secondary px-5 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5">
            {saving ? "Saving..." : stage ? "Update Stage" : "Create Stage"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADVANCE TEAMS MODAL
// ═══════════════════════════════════════════════════════════

function AdvanceTeamsModal({ stage, nextStage, onClose, onAdvanced }: any) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [manualEliminate, setManualEliminate] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/stages/${stage.id}/advance`);
      if (res.ok) {
        const data = await res.json();
        setPreview(data.preview);
      }
      setLoading(false);
    })();
  }, [stage.id]);

  const handleAdvance = async () => {
    setAdvancing(true);
    const res = await fetch(`/api/stages/${stage.id}/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nextStageId: nextStage?.id,
        overrides: { manualEliminate: Array.from(manualEliminate) },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      alert(data.message);
      onAdvanced();
    } else {
      alert("Failed to advance");
    }
    setAdvancing(false);
  };

  const toggleEliminate = (teamId: string) => {
    const next = new Set(manualEliminate);
    if (next.has(teamId)) next.delete(teamId);
    else next.add(teamId);
    setManualEliminate(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-3xl mx-4 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Advance Teams
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              From <strong className="text-white">{stage.name}</strong>
              {nextStage && <> to <strong className="text-blue-400">{nextStage.name}</strong></>}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !preview ? (
          <div className="p-12 text-center text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
            Could not calculate qualification. Enter match results first.
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="text-3xl font-black text-green-400">{preview.summary.totalQualified}</div>
                  <div className="text-xs text-gray-500 mt-1">Advancing</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="text-3xl font-black text-red-400">{preview.summary.totalEliminated}</div>
                  <div className="text-xs text-gray-500 mt-1">Eliminated</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-3xl font-black text-purple-400">{preview.summary.totalWildcards}</div>
                  <div className="text-xs text-gray-500 mt-1">Wildcards</div>
                </div>
              </div>

              {/* Qualified teams */}
              <div>
                <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                  ✓ Qualified ({preview.qualified.length + preview.wildcards.length})
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {[...preview.qualified, ...preview.wildcards].map((t: any) => (
                    <div key={t.teamId} className="flex items-center justify-between p-2 rounded-lg bg-green-500/5 border border-green-500/15">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-mono text-sm w-8">#{t.rank}</span>
                        <span className="text-white font-medium">{t.teamName}</span>
                        <span className="text-xs text-gray-600">{t.groupName}</span>
                        {t.reason === "WILDCARD" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">WILDCARD</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-blue-400 font-mono">{t.points}pts</span>
                        <button
                          onClick={() => toggleEliminate(t.teamId)}
                          className="p-1 rounded text-gray-600 hover:text-red-400"
                          title="Manually eliminate this team"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eliminated teams */}
              <div>
                <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                  ✗ Eliminated ({preview.eliminated.length})
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {preview.eliminated.slice(0, 10).map((t: any) => (
                    <div key={t.teamId} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/15">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-mono text-sm w-8">#{t.rank}</span>
                        <span className="text-gray-400 font-medium">{t.teamName}</span>
                        <span className="text-xs text-gray-600">{t.groupName}</span>
                      </div>
                      <span className="text-gray-500 font-mono text-xs">{t.points}pts</span>
                    </div>
                  ))}
                  {preview.eliminated.length > 10 && (
                    <div className="text-center text-xs text-gray-600 py-2">+{preview.eliminated.length - 10} more</div>
                  )}
                </div>
              </div>

              {manualEliminate.size > 0 && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                  ⚠️ {manualEliminate.size} team{manualEliminate.size !== 1 ? "s" : ""} will be manually eliminated
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-between items-center">
              <button onClick={onClose} className="btn-secondary px-5 py-2">Cancel</button>
              <button
                onClick={handleAdvance}
                disabled={advancing}
                className="btn-primary px-6 py-2.5"
              >
                {advancing ? "Advancing..." : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm & Advance {preview.summary.totalQualified - manualEliminate.size} Teams
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}