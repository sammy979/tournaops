"use client";

import { useState, useEffect } from "react";
import {
  X, Trophy, Crown, Lock, Users, Award, Zap,
  AlertTriangle, Check, ChevronRight, Map, Target
} from "lucide-react";

interface GrandFinalPreviewProps {
  stageId: string;
  currentStageName: string;
  onClose: () => void;
  onCreated: (newStageId: string) => void;
}

export default function GrandFinalPreview({ stageId, currentStageName, onClose, onCreated }: GrandFinalPreviewProps) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Grand Final config
  const [config, setConfig] = useState({
    name: "Grand Final",
    type: "GRAND_FINAL",
    numGroups: 1,
    matchesPerGroup: 6,
    mapRotation: ["Erangel", "Miramar", "Sanhok", "Rondo", "Erangel", "Miramar"],
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/stages/${stageId}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setPreview(data.stage);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [stageId]);

  const handleCreate = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/create-next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStageName: config.name,
          nextStageType: config.type,
          matchesPerGroup: config.matchesPerGroup,
          numGroups: config.numGroups,
          mapRotation: config.mapRotation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onCreated(data.nextStage.id);
      } else {
        const err = await res.json();
        alert("Failed: " + err.error);
        setCreating(false);
      }
    } catch (e) {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const qualified = preview?.progressions?.filter((p: any) =>
    ["QUALIFIED", "WILDCARD", "MANUAL_ADVANCE"].includes(p.status)
  ).sort((a: any, b: any) => (a.finalPosition || 999) - (b.finalPosition || 999)) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-sm overflow-y-auto py-4">
      <div className="glass-card w-full max-w-4xl mx-4 rounded-2xl border border-yellow-500/30 shadow-2xl shadow-yellow-500/10">

        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/40">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Grand Final Preview</h2>
                <p className="text-yellow-300/70 text-sm">
                  Review qualified teams before creating the {config.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="text-3xl font-black text-yellow-400">{qualified.length}</div>
              <div className="text-xs text-yellow-300 mt-1 uppercase tracking-widest font-bold">Qualified</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <div className="text-3xl font-black text-blue-400">{config.numGroups}</div>
              <div className="text-xs text-blue-300 mt-1 uppercase tracking-widest font-bold">Lobby</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <div className="text-3xl font-black text-purple-400">{config.matchesPerGroup}</div>
              <div className="text-xs text-purple-300 mt-1 uppercase tracking-widest font-bold">Matches</div>
            </div>
          </div>

          {/* Config */}
          <div className="glass-card rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Grand Final Configuration
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Stage Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Matches</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={config.matchesPerGroup}
                  onChange={e => setConfig(c => ({ ...c, matchesPerGroup: parseInt(e.target.value) || 6 }))}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>

          {/* Qualified Teams List */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Qualified Teams ({qualified.length})
            </h3>
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 sticky top-0">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2.5 px-3 text-gray-500 text-[10px] uppercase font-bold">Seed</th>
                      <th className="text-left py-2.5 px-3 text-gray-500 text-[10px] uppercase font-bold">Team</th>
                      <th className="text-center py-2.5 px-3 text-gray-500 text-[10px] uppercase font-bold">Position</th>
                      <th className="text-center py-2.5 px-3 text-orange-400 text-[10px] uppercase font-bold">Kills</th>
                      <th className="text-center py-2.5 px-3 text-white text-[10px] uppercase font-bold">Points</th>
                      <th className="text-center py-2.5 px-3 text-gray-500 text-[10px] uppercase font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualified.map((q: any, idx: number) => (
                      <tr key={q.teamId} className={`border-b border-white/5 ${idx < 3 ? "bg-yellow-500/5" : ""}`}>
                        <td className="py-2 px-3">
                          <span className={`font-mono font-black ${
                            idx === 0 ? "text-yellow-400 text-lg" :
                            idx === 1 ? "text-gray-300" :
                            idx === 2 ? "text-amber-600" : "text-gray-500"
                          }`}>
                            {idx <= 2 ? ["","",""][idx] : `#${idx + 1}`}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-white font-semibold">{q.teamName}</td>
                        <td className="py-2 px-3 text-center text-gray-400 text-xs">#{q.finalPosition}</td>
                        <td className="py-2 px-3 text-center text-orange-400 font-mono">{q.kills}</td>
                        <td className="py-2 px-3 text-center text-blue-400 font-mono font-bold">{q.points}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            q.status === "WILDCARD" ? "bg-purple-500/15 text-purple-400" :
                            q.status === "MANUAL_ADVANCE" ? "bg-blue-500/15 text-blue-400" :
                            "bg-green-500/15 text-green-400"
                          }`}>
                            {q.status === "WILDCARD" ? "WILDCARD" :
                             q.status === "MANUAL_ADVANCE" ? "MANUAL" :
                             "QUALIFIED"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Warning */}
          {!confirmed && (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-bold text-sm mb-1">This action will:</p>
                  <ul className="text-yellow-300/80 text-xs space-y-1 list-disc list-inside">
                    <li>Lock <strong>{currentStageName}</strong> permanently</li>
                    <li>Auto-create <strong>{config.name}</strong> with {qualified.length} teams</li>
                    <li>Distribute teams using snake seeding</li>
                    <li>Record advancement in team history</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {confirmed && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-bold text-sm mb-1">Final Confirmation</p>
                  <p className="text-red-300/80 text-xs">
                    Click "LOCK & CREATE" again to proceed. This CANNOT be easily undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex justify-between items-center">
          <button onClick={onClose} className="btn-secondary px-5 py-2" disabled={creating}>
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || qualified.length === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              confirmed
                ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 text-white shadow-lg shadow-yellow-500/30"
            }`}
          >
            {creating ? "Creating..." : confirmed ? (
              <><Lock className="w-4 h-4" />LOCK & CREATE {config.name}</>
            ) : (
              <><Crown className="w-4 h-4" />Lock Qualified Teams<ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}