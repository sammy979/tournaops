"use client";

import { useState, useEffect } from "react";
import {
  X, Save, Plus, Minus, Trophy, Crown, Star, Crosshair,
  Zap, Sparkles, GripVertical, Check, AlertTriangle,
  Trash2, Copy, Info, RefreshCw, Award
} from "lucide-react";

interface ScoringBuilderProps {
  initialPreset?: any;
  onSave?: (preset: any) => void;
  onClose: () => void;
  onApplyToStage?: (preset: any) => void;
}

const TIEBREAKER_OPTIONS = [
  { key: "points", label: "Total Points", icon: Trophy, color: "text-yellow-400", description: "Highest points wins" },
  { key: "wwcd", label: "WWCD Count", icon: Crown, color: "text-orange-400", description: "Most #1 finishes" },
  { key: "kills", label: "Total Eliminations", icon: Crosshair, color: "text-red-400", description: "Most kills across matches" },
  { key: "damage", label: "Total Damage", icon: Zap, color: "text-purple-400", description: "Highest damage dealt" },
  { key: "best_match", label: "Best Single Match", icon: Star, color: "text-blue-400", description: "Highest single-match score" },
  { key: "best_placement", label: "Best Placement", icon: Award, color: "text-green-400", description: "Highest finishing position" },
];

export default function ScoringBuilder({ initialPreset, onSave, onClose, onApplyToStage }: ScoringBuilderProps) {
  const [name, setName] = useState(initialPreset?.name || "");
  const [description, setDescription] = useState(initialPreset?.description || "");
  const [placementPoints, setPlacementPoints] = useState<number[]>(
    initialPreset?.placementPoints || [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0]
  );
  const [killPoints, setKillPoints] = useState(initialPreset?.killPoints ?? 1);
  const [wwcdBonus, setWwcdBonus] = useState(initialPreset?.wwcdBonus ?? 0);
  const [top3Bonus, setTop3Bonus] = useState(initialPreset?.top3Bonus ?? 0);
  const [perfectMatchBonus, setPerfectMatchBonus] = useState(initialPreset?.perfectMatchBonus ?? 0);
  const [tiebreakers, setTiebreakers] = useState<string[]>(
    initialPreset?.tiebreakerOrder || ["points", "wwcd", "kills", "damage"]
  );
  const [isPublic, setIsPublic] = useState(initialPreset?.isPublic || false);
  const [saving, setSaving] = useState(false);

  const [draggedTB, setDraggedTB] = useState<number | null>(null);

  // Update a single placement point
  const updatePlacement = (idx: number, value: number) => {
    setPlacementPoints(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const addPlacement = () => setPlacementPoints(prev => [...prev, 0]);
  const removePlacement = () => setPlacementPoints(prev => prev.length > 1 ? prev.slice(0, -1) : prev);

  // Tiebreaker drag & drop
  const handleTBDragStart = (idx: number) => setDraggedTB(idx);
  const handleTBDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleTBDrop = (targetIdx: number) => {
    if (draggedTB === null || draggedTB === targetIdx) return;
    setTiebreakers(prev => {
      const next = [...prev];
      const [moved] = next.splice(draggedTB, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDraggedTB(null);
  };

  const toggleTiebreaker = (key: string) => {
    setTiebreakers(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      description,
      placementPoints,
      killPoints,
      wwcdBonus,
      top3Bonus,
      perfectMatchBonus,
      tiebreakerOrder: tiebreakers,
      isPublic,
    };

    const url = initialPreset?.id && !initialPreset.isBuiltIn
      ? `/api/scoring-presets/${initialPreset.id}`
      : `/api/scoring-presets`;
    const method = initialPreset?.id && !initialPreset.isBuiltIn ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (onSave) onSave(data.preset);
      onClose();
    } else {
      alert("Failed to save");
    }
    setSaving(false);
  };

  // Live preview calculation
  const previewCalc = (placement: number, kills: number) => {
    const placePts = placementPoints[placement - 1] || 0;
    const killPts = kills * killPoints;
    const wwcd = placement === 1 ? wwcdBonus : 0;
    const top3 = placement <= 3 ? top3Bonus : 0;
    return placePts + killPts + wwcd + top3;
  };

  const activeTiebreakers = TIEBREAKER_OPTIONS.filter(t => tiebreakers.includes(t.key))
    .sort((a, b) => tiebreakers.indexOf(a.key) - tiebreakers.indexOf(b.key));
  const inactiveTiebreakers = TIEBREAKER_OPTIONS.filter(t => !tiebreakers.includes(t.key));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-sm overflow-y-auto py-4">
      <div className="glass-card w-full max-w-5xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#0a0a0f]/95 backdrop-blur-xl z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {initialPreset?.id ? "Edit Scoring System" : "Create Scoring System"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Configure custom points, bonuses, and tiebreakers</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2 text-sm">
              {saving ? "Saving..." : <><Save className="w-4 h-4" />Save Preset</>}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: Config */}
          <div className="space-y-5">

            {/* Name & Description */}
            <div className="glass-card rounded-xl p-4 border border-white/10 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. My Custom Weekend Scrim"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe when to use this system..."
                  className="input-field resize-none text-sm"
                  rows={2}
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="accent-blue-500"
                />
                Share this preset publicly (visible to other organizers)
              </label>
            </div>

            {/* Placement Points */}
            <div className="glass-card rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Placement Points
                </h3>
                <div className="flex gap-1">
                  <button onClick={removePlacement} className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400" title="Remove last">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={addPlacement} className="p-1 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-400" title="Add more">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                {placementPoints.map((pts, idx) => (
                  <div key={idx} className={`flex flex-col items-center p-2 rounded-lg border ${
                    idx === 0 ? "border-yellow-500/40 bg-yellow-500/5" :
                    idx === 1 ? "border-gray-400/30 bg-gray-400/5" :
                    idx === 2 ? "border-amber-700/30 bg-amber-700/5" :
                    "border-white/8 bg-white/2"
                  }`}>
                    <span className={`text-[10px] font-bold ${
                      idx === 0 ? "text-yellow-400" :
                      idx === 1 ? "text-gray-300" :
                      idx === 2 ? "text-amber-600" : "text-gray-500"
                    }`}>
                      {idx === 0 ? "" : idx === 1 ? "" : idx === 2 ? "" : `#${idx + 1}`}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={pts}
                      onChange={e => updatePlacement(idx, parseInt(e.target.value) || 0)}
                      className="w-full mt-1 bg-transparent text-white font-mono font-bold text-lg text-center outline-none border-b border-white/10 focus:border-blue-500"
                    />
                    <span className="text-[9px] text-gray-600 mt-0.5">pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kill Points + Bonuses */}
            <div className="glass-card rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-red-400" />
                Points & Bonuses
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                  <div>
                    <div className="text-white text-sm font-semibold">Kill Points</div>
                    <div className="text-gray-600 text-[10px]">Points per elimination</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={killPoints}
                    onChange={e => setKillPoints(parseFloat(e.target.value) || 0)}
                    className="w-20 input-field text-center font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="text-white text-sm font-semibold">WWCD Bonus</div>
                      <div className="text-gray-600 text-[10px]">Extra points for 1st place</div>
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={wwcdBonus}
                    onChange={e => setWwcdBonus(parseInt(e.target.value) || 0)}
                    className="w-20 input-field text-center font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-white text-sm font-semibold">Top 3 Bonus</div>
                      <div className="text-gray-600 text-[10px]">Extra points for #1, #2, #3</div>
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={top3Bonus}
                    onChange={e => setTop3Bonus(parseInt(e.target.value) || 0)}
                    className="w-20 input-field text-center font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-white text-sm font-semibold">Perfect Match Bonus</div>
                      <div className="text-gray-600 text-[10px]">WWCD + 8+ kills</div>
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={perfectMatchBonus}
                    onChange={e => setPerfectMatchBonus(parseInt(e.target.value) || 0)}
                    className="w-20 input-field text-center font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Tiebreakers + Preview */}
          <div className="space-y-5">

            {/* Tiebreaker Priority */}
            <div className="glass-card rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                Tiebreaker Priority
              </h3>
              <p className="text-gray-500 text-xs mb-3">Drag to reorder  Applied top to bottom</p>

              <div className="space-y-2 mb-3">
                {activeTiebreakers.map((tb, idx) => {
                  const Icon = tb.icon;
                  return (
                    <div
                      key={tb.key}
                      draggable
                      onDragStart={() => handleTBDragStart(idx)}
                      onDragOver={handleTBDragOver}
                      onDrop={() => handleTBDrop(idx)}
                      className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-move hover:bg-white/10 hover:border-blue-500/30 transition-all ${
                        draggedTB === idx ? "opacity-40" : ""
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-600" />
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <Icon className={`w-4 h-4 ${tb.color}`} />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{tb.label}</div>
                        <div className="text-gray-500 text-[10px]">{tb.description}</div>
                      </div>
                      <button onClick={() => toggleTiebreaker(tb.key)} className="p-1 rounded text-gray-500 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {inactiveTiebreakers.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Available</div>
                  <div className="flex flex-wrap gap-1.5">
                    {inactiveTiebreakers.map(tb => {
                      const Icon = tb.icon;
                      return (
                        <button
                          key={tb.key}
                          onClick={() => toggleTiebreaker(tb.key)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/3 border border-white/10 hover:border-blue-500/30 text-gray-400 hover:text-white text-xs"
                        >
                          <Icon className={`w-3 h-3 ${tb.color}`} />
                          <Plus className="w-3 h-3" />{tb.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div className="glass-card rounded-xl p-4 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Live Preview
              </h3>
              <div className="space-y-2">
                {[
                  { place: 1, kills: 8, label: "Team #1 with 8 kills" },
                  { place: 3, kills: 5, label: "Team #3 with 5 kills" },
                  { place: 8, kills: 2, label: "Team #8 with 2 kills" },
                  { place: 16, kills: 0, label: "Team #16 no kills" },
                ].map((ex, i) => {
                  const total = previewCalc(ex.place, ex.kills);
                  const placePts = placementPoints[ex.place - 1] || 0;
                  const killPts = ex.kills * killPoints;
                  const bonus = (ex.place === 1 ? wwcdBonus : 0) + (ex.place <= 3 ? top3Bonus : 0);
                  return (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/3 text-xs">
                      <span className="text-gray-300">{ex.label}</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-blue-300">{placePts}</span>
                        <span className="text-gray-600">+</span>
                        <span className="text-orange-400">{killPts}</span>
                        {bonus > 0 && (
                          <>
                            <span className="text-gray-600">+</span>
                            <span className="text-yellow-400">{bonus}</span>
                          </>
                        )}
                        <span className="text-gray-600">=</span>
                        <span className="text-white font-bold text-sm">{total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 text-xs font-semibold mb-1">Verify Against Official Rules</p>
                  <p className="text-yellow-300/70 text-[10px]">
                    Built-in presets (PMGC/PMPL) are approximations. Always verify with the latest official tournament rules before using.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}