"use client";

import { useState, useEffect } from "react";
import { X, Check, AlertTriangle, Clock, User, FileText, Undo2 } from "lucide-react";

interface OverrideModalProps {
  stageId: string;
  teamId: string;
  teamName: string;
  onClose: () => void;
  onSave: () => void;
}

export function OverrideModal({ stageId, teamId, teamName, onClose, onSave }: OverrideModalProps) {
  const [action, setAction] = useState<"FORCE_QUALIFY" | "FORCE_ELIMINATE" | "REVERT">("FORCE_QUALIFY");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (reason.trim().length < 5) {
      alert("Reason must be at least 5 characters");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/stages/${stageId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, action, reason }),
    });
    if (res.ok) {
      onSave();
      onClose();
    } else {
      const err = await res.json();
      alert("Failed: " + err.error);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-lg mx-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Manual Qualification Override
            </h2>
            <p className="text-gray-500 text-xs mt-1">Team: <strong className="text-white">{teamName}</strong></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAction("FORCE_QUALIFY")}
                className={`p-3 rounded-xl border text-center text-xs font-medium ${
                  action === "FORCE_QUALIFY" ? "border-green-500 bg-green-500/20 text-green-400" : "border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                <Check className="w-4 h-4 mx-auto mb-1" />
                Force Qualify
              </button>
              <button
                onClick={() => setAction("FORCE_ELIMINATE")}
                className={`p-3 rounded-xl border text-center text-xs font-medium ${
                  action === "FORCE_ELIMINATE" ? "border-red-500 bg-red-500/20 text-red-400" : "border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                <X className="w-4 h-4 mx-auto mb-1" />
                Force Eliminate
              </button>
              <button
                onClick={() => setAction("REVERT")}
                className={`p-3 rounded-xl border text-center text-xs font-medium ${
                  action === "REVERT" ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                <Undo2 className="w-4 h-4 mx-auto mb-1" />
                Revert
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Reason (Required, min 5 chars) <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              className="input-field text-sm resize-none"
              placeholder="e.g. Team qualified due to approved match replay after server crash..."
              autoFocus
            />
            <div className="text-xs text-gray-600 mt-1">{reason.length} characters  will be logged in audit trail</div>
          </div>

          <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">This action will be permanently logged</p>
                <p className="text-yellow-300/70">All manual overrides are tracked in the audit log with your user ID, timestamp, and reason.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-white/10 flex justify-between items-center">
          <button onClick={onClose} className="btn-secondary px-5 py-2">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || reason.trim().length < 5} className="btn-primary px-6 py-2">
            {saving ? "Applying..." : "Apply Override"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 
// AUDIT LOG VIEWER
// 

export function AuditLog({ stageId, onClose }: { stageId: string; onClose: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/stages/${stageId}/audit-log`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setLogs(d.logs);
      }
      setLoading(false);
    })();
  }, [stageId]);

  const actionLabels: Record<string, { label: string; color: string; icon: string }> = {
    MANUAL_ADVANCE: { label: "Force Qualify", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: "" },
    FORCE_QUALIFY: { label: "Force Qualify", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: "" },
    MANUAL_ELIMINATE: { label: "Force Eliminate", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: "" },
    FORCE_ELIMINATE: { label: "Force Eliminate", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: "" },
    REVERT: { label: "Revert Override", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: "" },
    ADD_COMPENSATION: { label: "Compensation Added", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", icon: "" },
    ADD_PENALTY: { label: "Penalty Added", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: "" },
    GROUP_ASSIGNMENT: { label: "Groups Assigned", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: "" },
    LOCK_STAGE: { label: "Stage Locked", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: "" },
    UNLOCK_STAGE: { label: "Stage Unlocked", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: "" },
    EDIT_RESULT: { label: "Result Edited", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: "" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-4">
      <div className="glass-card w-full max-w-3xl mx-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Audit Log
            </h2>
            <p className="text-gray-500 text-xs mt-1">{logs.length} actions recorded</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No audit entries yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map(log => {
                const info = actionLabels[log.action] || { label: log.action, color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: "" };
                return (
                  <div key={log.id} className={`p-3 rounded-xl border ${info.color}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{info.icon}</span>
                        <span className="font-bold text-sm">{info.label}</span>
                        {log.teamName && <span className="text-xs opacity-70"> {log.teamName}</span>}
                      </div>
                      <span className="text-xs opacity-60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.performedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 mb-2">"{log.reason}"</p>
                    <div className="flex items-center gap-2 text-[10px] opacity-60">
                      <User className="w-3 h-3" />
                      By {log.performedByUser?.displayName || log.performedByUser?.username || log.performedBy}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}