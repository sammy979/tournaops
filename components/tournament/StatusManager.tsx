"use client";

import { useState } from "react";
import { X, Play, CheckCircle, Pause, AlertTriangle, Clock, Zap, Radio } from "lucide-react";
import { Tournament, TournamentStatus } from "@/types/tournament";
import { saveTournament } from "@/lib/storage/tournaments";

interface StatusManagerProps {
  tournament: Tournament;
  onClose: () => void;
  onSave: (updated: Tournament) => void;
}

const STATUSES: { value: TournamentStatus; label: string; icon: any; color: string; desc: string }[] = [
  { value: "draft", label: "Draft", icon: Clock, color: "blue", desc: "Tournament is being set up. Not visible to spectators as live." },
  { value: "live", label: "Live", icon: Radio, color: "green", desc: "Tournament is actively running. Public page shows live badge." },
  { value: "completed", label: "Completed", icon: CheckCircle, color: "gray", desc: "Tournament has finished. Results are final." },
  { value: "cancelled", label: "Cancelled", icon: AlertTriangle, color: "red", desc: "Tournament was cancelled." },
];

export default function StatusManager({ tournament, onClose, onSave }: StatusManagerProps) {
  const [status, setStatus] = useState<TournamentStatus>(tournament.status);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const current = STATUSES.find(s => s.value === tournament.status)!;
  const selected = STATUSES.find(s => s.value === status)!;
  const changed = status !== tournament.status;

  const handleSave = () => {
    if (!changed) { onClose(); return; }
    if ((status === "completed" || status === "cancelled") && !confirm) {
      setConfirm(true);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const updated = { ...tournament, status };
      saveTournament(updated);
      onSave(updated);
    }, 500);
  };

  const colorMap: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    green: "border-green-500/30 bg-green-500/10 text-green-400",
    gray: "border-gray-500/30 bg-gray-500/10 text-gray-400",
    red: "border-red-500/30 bg-red-500/10 text-red-400",
  };

  const activeMap: Record<string, string> = {
    blue: "border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/10",
    green: "border-green-500 bg-green-500/20 text-green-300 shadow-lg shadow-green-500/10",
    gray: "border-gray-400 bg-gray-500/20 text-gray-300",
    red: "border-red-500 bg-red-500/20 text-red-300 shadow-lg shadow-red-500/10",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-lg mx-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Tournament Status
            </h2>
            <p className="text-gray-500 text-sm mt-1">{tournament.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {STATUSES.map(s => {
            const Icon = s.icon;
            const isSelected = status === s.value;
            const isCurrent = tournament.status === s.value;
            return (
              <button
                key={s.value}
                onClick={() => { setStatus(s.value); setConfirm(false); }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected ? activeMap[s.color] : `border-white/8 hover:${colorMap[s.color]}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{s.label}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">Current</span>
                      )}
                    </div>
                    <p className="text-xs opacity-60 mt-0.5">{s.desc}</p>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {confirm && (
          <div className="mx-6 mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-2.5 text-yellow-400 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Are you sure?</p>
                <p className="text-yellow-400/70 text-xs mt-1">
                  Changing to &quot;{selected.label}&quot; affects how the tournament appears publicly. Click save again to confirm.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center p-6 border-t border-white/10">
          <div className="text-sm text-gray-600">
            {changed ? (
              <span>{current.label} → <span className="text-white font-medium">{selected.label}</span></span>
            ) : (
              <span>No changes</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary px-5 py-2">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || !changed}
              className="btn-primary px-6 py-2"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              ) : confirm ? (
                <><AlertTriangle className="w-4 h-4" />Confirm & Save</>
              ) : (
                <><Zap className="w-4 h-4" />Update Status</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}