"use client";
import { useDialog } from "@/lib/use-confirm";

import { useState } from "react";
import {
  X, Save, Zap, Trophy, Camera, AlertTriangle,
  Plus, Minus, Info, Check, Upload
} from "lucide-react";
import { Tournament, Match, Team } from "@/types/tournament";

interface QualifierMatchEntryProps {
  tournament: Tournament;
  match: Match;
  teams: Team[];
  existingResults?: any[];
  onClose: () => void;
  onSave: () => void;
}

interface TeamResult {
  teamId: string;
  teamName: string;
  placement: number;
  kills: number;
  damage: number;
  compensationPoints: number;
  compensationReason: string;
  penaltyPoints: number;
  penaltyReason: string;
}

export default function QualifierMatchEntry({
  tournament, match, teams, existingResults, onClose, onSave
}: QualifierMatchEntryProps) {
  const dialog = useDialog();
  const initResults = (): TeamResult[] => {
    if (existingResults && existingResults.length > 0) {
      return existingResults.map(r => ({
        teamId: r.teamId,
        teamName: r.teamName,
        placement: r.placement,
        kills: r.kills || 0,
        damage: r.damage || 0,
        compensationPoints: r.compensationPoints || 0,
        compensationReason: r.compensationReason || "",
        penaltyPoints: r.penaltyPoints || 0,
        penaltyReason: r.penaltyReason || "",
      }));
    }
    return teams.map((team, idx) => ({
      teamId: team.id,
      teamName: team.name,
      placement: idx + 1,
      kills: 0,
      damage: 0,
      compensationPoints: 0,
      compensationReason: "",
      penaltyPoints: 0,
      penaltyReason: "",
    }));
  };

  const [results, setResults] = useState<TeamResult[]>(initResults);
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCompFor, setShowCompFor] = useState<string | null>(null);
  const [showPenFor, setShowPenFor] = useState<string | null>(null);

  const scoring = tournament.scoringRule;

  const updateResult = (teamId: string, field: keyof TeamResult, value: any) => {
    setResults(prev => prev.map(r => r.teamId === teamId ? { ...r, [field]: value } : r));
  };

  const calculatePoints = (r: TeamResult) => {
    const placePts = scoring.placementPoints[r.placement - 1] || 0;
    const killPts = r.kills * scoring.killPoints;
    const wwcdBonus = r.placement === 1 && scoring.wwcdBonus ? scoring.wwcdBonus : 0;
    return {
      placePts,
      killPts,
      wwcdBonus,
      total: Math.max(0, placePts + killPts + wwcdBonus + r.compensationPoints - r.penaltyPoints),
    };
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1000000) {
      void dialog.alert({ title: "File Too Large", description: "Screenshot too large. Maximum 1MB allowed.", variant: "warning" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const compensation: any = {};
      const penalties: any = {};
      results.forEach(r => {
        if (r.compensationPoints > 0) {
          compensation[r.teamId] = { points: r.compensationPoints, reason: r.compensationReason };
        }
        if (r.penaltyPoints > 0) {
          penalties[r.teamId] = { points: r.penaltyPoints, reason: r.penaltyReason };
        }
      });

      const res = await fetch(`/api/matches/${match.id}/qualifier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: results.map(r => ({
            teamId: r.teamId,
            teamName: r.teamName,
            placement: r.placement,
            kills: r.kills,
            damage: r.damage,
          })),
          compensation,
          penalties,
          notes,
          screenshotUrl: screenshot,
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        const err = await res.json();
        void dialog.alert({ title: "Save Failed", description: err.error || "Failed to save match results.", variant: "danger" });
      }
    } finally {
      setSaving(false);
    }
  };

  const sortedResults = [...results].sort((a, b) => a.placement - b.placement);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-4">
      <div className="glass-card w-full max-w-6xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              {match.name}  Qualifier Results
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {teams.length} teams  Map: <span className="text-white">{match.map}</span>  {tournament.scoringRule.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="p-5 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Squad</div>
            <div className="col-span-1 text-center">Place</div>
            <div className="col-span-1 text-center">Kills</div>
            <div className="col-span-1 text-center">Damage</div>
            <div className="col-span-1 text-center text-green-400">+Comp</div>
            <div className="col-span-1 text-center text-red-400">-Pen</div>
            <div className="col-span-2 text-center">Points</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          <div className="space-y-1">
            {sortedResults.map((r, idx) => {
              const calc = calculatePoints(r);
              const isTop3 = r.placement <= 3;

              return (
                <div key={r.teamId}>
                  {/* Main row */}
                  <div className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg border ${
                    isTop3 ? "bg-yellow-500/5 border-yellow-500/20" : "bg-white/3 border-white/8"
                  }`}>
                    <div className="col-span-1">
                      <span className={`font-mono font-black text-lg ${
                        r.placement === 1 ? "text-yellow-400" :
                        r.placement === 2 ? "text-gray-300" :
                        r.placement === 3 ? "text-amber-600" : "text-gray-600"
                      }`}>
                        {r.placement <= 3 ? ["","",""][r.placement-1] : `#${r.placement}`}
                      </span>
                    </div>
                    <div className="col-span-3 text-white text-sm font-semibold truncate">{r.teamName}</div>
                    <div className="col-span-1">
                      <input
                        type="number" min={1} max={teams.length}
                        value={r.placement}
                        onChange={e => updateResult(r.teamId, "placement", parseInt(e.target.value) || 1)}
                        className="input-field text-xs py-1 px-1 text-center"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number" min={0} max={99}
                        value={r.kills}
                        onChange={e => updateResult(r.teamId, "kills", parseInt(e.target.value) || 0)}
                        className="input-field text-xs py-1 px-1 text-center"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number" min={0}
                        value={r.damage}
                        onChange={e => updateResult(r.teamId, "damage", parseInt(e.target.value) || 0)}
                        className="input-field text-xs py-1 px-1 text-center"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number" min={0} max={50}
                        value={r.compensationPoints}
                        onChange={e => updateResult(r.teamId, "compensationPoints", parseInt(e.target.value) || 0)}
                        className={`input-field text-xs py-1 px-1 text-center ${r.compensationPoints > 0 ? "border-green-500/40 text-green-400" : ""}`}
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number" min={0} max={50}
                        value={r.penaltyPoints}
                        onChange={e => updateResult(r.teamId, "penaltyPoints", parseInt(e.target.value) || 0)}
                        className={`input-field text-xs py-1 px-1 text-center ${r.penaltyPoints > 0 ? "border-red-500/40 text-red-400" : ""}`}
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="text-blue-400 font-mono font-black text-lg">{calc.total}</div>
                      <div className="text-[9px] text-gray-600 font-mono">
                        {calc.placePts}p+{calc.killPts}k
                        {r.compensationPoints > 0 && <span className="text-green-400"> +{r.compensationPoints}</span>}
                        {r.penaltyPoints > 0 && <span className="text-red-400"> -{r.penaltyPoints}</span>}
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <button
                        onClick={() => setShowCompFor(showCompFor === r.teamId ? null : r.teamId)}
                        className="p-1 rounded text-green-400 hover:bg-green-500/10"
                        title="Add compensation"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowPenFor(showPenFor === r.teamId ? null : r.teamId)}
                        className="p-1 rounded text-red-400 hover:bg-red-500/10"
                        title="Add penalty"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Compensation reason input */}
                  {showCompFor === r.teamId && (
                    <div className="mt-1 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <label className="text-xs text-green-400 font-semibold block mb-1">Compensation Reason</label>
                      <input
                        type="text"
                        value={r.compensationReason}
                        onChange={e => updateResult(r.teamId, "compensationReason", e.target.value)}
                        className="input-field text-xs py-1.5"
                        placeholder="e.g. Server crash during match, approved by admin..."
                      />
                    </div>
                  )}

                  {/* Penalty reason input */}
                  {showPenFor === r.teamId && (
                    <div className="mt-1 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                      <label className="text-xs text-red-400 font-semibold block mb-1">Penalty Reason</label>
                      <input
                        type="text"
                        value={r.penaltyReason}
                        onChange={e => updateResult(r.teamId, "penaltyReason", e.target.value)}
                        className="input-field text-xs py-1.5"
                        placeholder="e.g. Team kill, unsportsmanlike conduct..."
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Notes & Screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/10">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Match Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                className="input-field text-sm resize-none"
                placeholder="Any observations, incidents, or important notes..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" />
                Screenshot Proof (Optional)
              </label>
              {screenshot ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img src={screenshot} alt="Screenshot" className="w-full h-32 object-cover" />
                  <button
                    onClick={() => setScreenshot(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500/60"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 rounded-xl bg-white/3 border-2 border-dashed border-white/15 hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer transition-all">
                  <Upload className="w-6 h-6 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-500">Click to upload screenshot</span>
                  <span className="text-[10px] text-gray-600 mt-1">Max 1MB</span>
                  <input type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-white/10">
          <div className="text-sm text-gray-500 flex items-center gap-4">
            <span>Total kills: <span className="text-white font-bold font-mono">{results.reduce((a, r) => a + r.kills, 0)}</span></span>
            {results.some(r => r.compensationPoints > 0) && (
              <span className="text-green-400">Comps: <span className="font-bold">{results.reduce((a, r) => a + r.compensationPoints, 0)}</span></span>
            )}
            {results.some(r => r.penaltyPoints > 0) && (
              <span className="text-red-400">Penalties: <span className="font-bold">{results.reduce((a, r) => a + r.penaltyPoints, 0)}</span></span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary px-5 py-2">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5">
              {saving ? "Saving..." : <><Save className="w-4 h-4" />Save Results</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}