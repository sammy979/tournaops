"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Zap, Check, Users, X, ArrowRight } from "lucide-react";
import { getMyTournaments } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

interface PendingImport {
  id: string;
  discordGuildName: string;
  discordChannelName: string;
  discordUsername: string;
  parseResult: {
    slots: Array<{ slotNumber: number; teamName: string }>;
    totalDetected: number;
    confidence: number;
    format: string;
  };
  receivedAt: string;
}

export default function DiscordPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [pendingImports, setPendingImports] = useState<PendingImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImport, setSelectedImport] = useState<PendingImport | null>(null);
  const [importTarget, setImportTarget] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/discord/pending", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPendingImports(data.pendingImports || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const t = await getMyTournaments();
      setTournaments(t || []);
      fetchPending();
    })();
    const interval = setInterval(fetchPending, 8000);
    return () => clearInterval(interval);
  }, [fetchPending]);

  const handleImport = async () => {
    if (!selectedImport || !importTarget) return;
    const tournament = tournaments.find(t => t.id === importTarget);
    if (!tournament) return;

    setImporting(true);

    try {
      const teamsPayload = selectedImport.parseResult.slots.map((slot, idx) => ({
        name: slot.teamName,
        tag: slot.teamName.substring(0, 4).toUpperCase(),
        seed: slot.slotNumber,
        players: Array.from({ length: 4 }, (_, i) => ({
          name: `Player ${i + 1}`,
          ign: "",
          role: (["IGL", "Fragger", "Support", "Entry"])[i],
        })),
      }));

      await fetch(`/api/tournaments/${importTarget}/teams/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: teamsPayload }),
      });

      await fetch(`/api/discord/pending?id=${selectedImport.id}`, { method: "DELETE" });
      alert(`Imported ${teamsPayload.length} teams!`);
    } catch {
      alert("Import failed");
    } finally {
      setImporting(false);
      setSelectedImport(null);
      fetchPending();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          Discord Integration
        </h1>
      </div>

      <div className="glass-card rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/8 to-purple-500/5 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />Live Bot Detections
          </h2>
          <span className={`text-2xl font-bold ${pendingImports.length > 0 ? "text-indigo-400" : "text-gray-600"}`}>
            {pendingImports.length}
          </span>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : pendingImports.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-700" />
              <p className="text-sm">No pending detections. Post a slot list in Discord!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingImports.map(imp => (
                <div key={imp.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{imp.parseResult.totalDetected} teams from #{imp.discordChannelName}</p>
                    <p className="text-gray-500 text-xs">by {imp.discordUsername} in {imp.discordGuildName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImport(imp);
                      if (tournaments.length) setImportTarget(tournaments[0].id);
                    }}
                    className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1"
                  >
                    Import<ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">Import {selectedImport.parseResult.totalDetected} teams</h3>
              <button onClick={() => setSelectedImport(null)} className="p-2 rounded-xl hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Import into</label>
              <select
                value={importTarget}
                onChange={e => setImportTarget(e.target.value)}
                className="input-field w-full"
              >
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="max-h-40 overflow-y-auto bg-black/30 rounded-xl p-3 space-y-1">
              {selectedImport.parseResult.slots.map(s => (
                <div key={s.slotNumber} className="text-sm text-gray-300">#{s.slotNumber} {s.teamName}</div>
              ))}
            </div>
            <button
              onClick={handleImport}
              disabled={importing || !importTarget}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {importing ? "Importing..." : <><Check className="w-4 h-4" />Import Teams</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}