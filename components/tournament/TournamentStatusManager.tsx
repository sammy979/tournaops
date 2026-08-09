"use client";
import { useState } from "react";
import { Play, Pause, Square, RefreshCw, Trash2, Check, X, AlertTriangle } from "lucide-react";
import { useDialog } from "@/lib/use-confirm";

interface StatusManagerProps {
  tournamentId: string;
  currentStatus: string;
  tournamentName: string;
  onUpdate?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  draft:        { label: "Draft",        color: "gray",   icon: Pause,       description: "Setting up — not visible to public" },
  registration: { label: "Registration", color: "blue",   icon: RefreshCw,   description: "Teams can register" },
  live:         { label: "Live",         color: "green",  icon: Play,        description: "Tournament in progress" },
  completed:    { label: "Completed",    color: "purple", icon: Check,       description: "Tournament finished" },
  cancelled:    { label: "Cancelled",    color: "red",    icon: X,           description: "Tournament cancelled" },
};

export default async function StatusManager({ tournamentId, currentStatus, tournamentName, onUpdate }: StatusManagerProps) {
  const dialog = useDialog();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const changeStatus = async (newStatus: string) => {
    if (newStatus === status) return;

    // Confirm dangerous transitions
    if (newStatus === "completed" || newStatus === "cancelled") {
      const ok = await dialog.confirm({
      title: `Change tournament status to ${newStatus}?`,
      description: "This will update the tournament status and may trigger Discord announcements if configured.",
      confirmLabel: `Set to ${newStatus}`,
      variant: "warning",
    });
    if (!ok) return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tournaments/" + tournamentId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(newStatus);
        onUpdate?.();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments/" + tournamentId, { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/dashboard/tournaments";
      } else {
        alert("Failed to delete tournament");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <CurrentIcon className="w-5 h-5 text-purple-400" />
        Tournament Status
      </h3>

      {/* Current Status Badge */}
      <div className={
        "flex items-center gap-3 p-4 rounded-xl mb-4 border " +
        (status === "live" ? "bg-green-500/10 border-green-500/30" :
         status === "completed" ? "bg-purple-500/10 border-purple-500/30" :
         status === "registration" ? "bg-blue-500/10 border-blue-500/30" :
         status === "cancelled" ? "bg-red-500/10 border-red-500/30" :
         "bg-gray-500/10 border-gray-500/30")
      }>
        <CurrentIcon className={
          "w-6 h-6 " +
          (status === "live" ? "text-green-400" :
           status === "completed" ? "text-purple-400" :
           status === "registration" ? "text-blue-400" :
           status === "cancelled" ? "text-red-400" :
           "text-gray-400")
        } />
        <div>
          <p className="text-white font-bold text-lg">{currentConfig.label}</p>
          <p className="text-gray-400 text-sm">{currentConfig.description}</p>
        </div>
      </div>

      {/* Status Actions */}
      <div className="space-y-2 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Change Status</p>

        {status === "draft" && (
          <>
            <button onClick={() => changeStatus("registration")} disabled={loading}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 transition-all disabled:opacity-50">
              <RefreshCw className="w-4 h-4" />
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">Open Registration</p>
                <p className="text-xs text-blue-400/70">Allow teams to sign up</p>
              </div>
            </button>
            <button onClick={() => changeStatus("live")} disabled={loading}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 transition-all disabled:opacity-50">
              <Play className="w-4 h-4" />
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">Start Tournament</p>
                <p className="text-xs text-green-400/70">Mark as live — public visible</p>
              </div>
            </button>
          </>
        )}

        {status === "registration" && (
          <>
            <button onClick={() => changeStatus("live")} disabled={loading}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 transition-all disabled:opacity-50">
              <Play className="w-4 h-4" />
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">Close Registration + Start</p>
                <p className="text-xs text-green-400/70">Begin matches</p>
              </div>
            </button>
            <button onClick={() => changeStatus("draft")} disabled={loading}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 text-gray-300 transition-all disabled:opacity-50">
              <Pause className="w-4 h-4" />
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">Back to Draft</p>
              </div>
            </button>
          </>
        )}

        {status === "live" && (
          <>
            <button onClick={() => changeStatus("completed")} disabled={loading}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 transition-all disabled:opacity-50">
              <Check className="w-4 h-4" />
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">End Tournament</p>
                <p className="text-xs text-purple-400/70">Mark all matches complete + finalize</p>
              </div>
            </button>
            <button onClick={() => changeStatus("draft")} disabled={loading}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 text-gray-300 transition-all disabled:opacity-50">
              <Pause className="w-4 h-4" />
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">Pause (back to draft)</p>
              </div>
            </button>
          </>
        )}

        {status === "completed" && (
          <button onClick={() => changeStatus("live")} disabled={loading}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 transition-all disabled:opacity-50">
            <Play className="w-4 h-4" />
            <div className="text-left flex-1">
              <p className="font-semibold text-sm">Reopen (back to live)</p>
            </div>
          </button>
        )}

        {status === "cancelled" && (
          <button onClick={() => changeStatus("draft")} disabled={loading}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 text-gray-300 transition-all disabled:opacity-50">
            <Pause className="w-4 h-4" />
            <div className="text-left flex-1">
              <p className="font-semibold text-sm">Restore to Draft</p>
            </div>
          </button>
        )}

        {status !== "cancelled" && status !== "completed" && (
          <button onClick={() => changeStatus("cancelled")} disabled={loading}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition-all disabled:opacity-50">
            <X className="w-4 h-4" />
            <div className="text-left flex-1">
              <p className="font-semibold text-sm">Cancel Tournament</p>
              <p className="text-xs text-red-400/70">Mark as cancelled</p>
            </div>
          </button>
        )}
      </div>

      {/* Danger zone */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Danger Zone
        </p>
        <button onClick={deleteTournament} disabled={loading}
          className={
            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all disabled:opacity-50 " +
            (confirmDelete
              ? "bg-red-600 border-red-500 text-white hover:bg-red-500"
              : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20")
          }>
          <Trash2 className="w-4 h-4" />
          <span className="font-semibold text-sm">
            {confirmDelete ? "Click again to CONFIRM delete" : "Delete Tournament"}
          </span>
        </button>
      </div>
    </div>
  );
}