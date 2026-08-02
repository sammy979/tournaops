"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare, Zap, Check, Copy, ExternalLink,
  Send, Bell, Info, ArrowRight, Clock, Upload,
  RefreshCw, Users, Trophy, X, Sparkles
} from "lucide-react";
import { getMyTournaments, saveTournament } from "@/lib/storage/tournaments";
import { Tournament, Team, Player } from "@/types/tournament";

interface PendingImport {
  id: string;
  discordGuildName: string;
  discordChannelName: string;
  discordUsername: string;
  discordUserAvatar?: string;
  messageContent: string;
  parseResult: {
    slots: Array<{ slotNumber: number; teamName: string }>;
    totalDetected: number;
    confidence: number;
    format: string;
    warnings: string[];
  };
  receivedAt: string;
}

export default function DiscordPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [pendingImports, setPendingImports] = useState<PendingImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [selectedImport, setSelectedImport] = useState<PendingImport | null>(null);
  const [importTargetTournament, setImportTargetTournament] = useState("");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/discord/pending", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPendingImports(data.pendingImports || []);
        setLastFetch(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch pending:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTournaments(getMyTournaments());
    fetchPending();
    const interval = setInterval(fetchPending, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, [fetchPending]);

  useEffect(() => {
    if (selectedImport && tournaments.length > 0 && !importTargetTournament) {
      setImportTargetTournament(tournaments[0].id);
    }
  }, [selectedImport, tournaments, importTargetTournament]);

  const handleImport = async () => {
    if (!selectedImport || !importTargetTournament) return;

    const tournament = tournaments.find(t => t.id === importTargetTournament);
    if (!tournament) return;

    setImporting(true);

    // Create teams from slots
    const newTeams: Team[] = selectedImport.parseResult.slots.map(slot => ({
      id: Math.random().toString(36).substring(2, 10),
      name: slot.teamName,
      tag: slot.teamName.substring(0, 4).toUpperCase(),
      seed: slot.slotNumber,
      players: Array.from({ length: 4 }, (_, i) => ({
        id: Math.random().toString(36).substring(2, 10),
        name: `Player ${i + 1}`,
        ign: "",
        role: (["IGL", "Fragger", "Support", "Entry"] as const)[i],
      })),
    }));

    // Merge — replace teams with same seed OR add new
    let mergedTeams = [...tournament.teams];
    for (const newTeam of newTeams) {
      const existing = mergedTeams.findIndex(t => t.seed === newTeam.seed);
      if (existing >= 0) {
        mergedTeams[existing] = { ...mergedTeams[existing], name: newTeam.name, tag: newTeam.tag };
      } else {
        mergedTeams.push(newTeam);
      }
    }

    mergedTeams.sort((a, b) => (a.seed || 999) - (b.seed || 999));

    saveTournament({ ...tournament, teams: mergedTeams });

    // Remove from pending
    await fetch(`/api/discord/pending?id=${selectedImport.id}`, { method: "DELETE" });

    setTimeout(() => {
      setImporting(false);
      setImported(true);
      setTimeout(() => {
        setImported(false);
        setSelectedImport(null);
        setImportTargetTournament("");
        fetchPending();
      }, 2000);
    }, 800);
  };

  const dismissPending = async (id: string) => {
    await fetch(`/api/discord/pending?id=${id}`, { method: "DELETE" });
    fetchPending();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          Discord Integration
        </h1>
        <p className="text-gray-400 mt-2">Bot detects slot lists in real time · Import with one click</p>
      </div>

      {/* LIVE PENDING IMPORTS */}
      <div className="glass-card rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/8 to-purple-500/5 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Live Bot Detections</h2>
              <p className="text-gray-500 text-xs">
                Auto-refreshes every 8s · {lastFetch ? `Last: ${lastFetch.toLocaleTimeString()}` : "Never"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${pendingImports.length > 0 ? "text-indigo-400" : "text-gray-600"}`}>
              {pendingImports.length}
            </span>
            <button
              onClick={fetchPending}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : pendingImports.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-700" />
              <p className="text-sm font-medium">No pending detections</p>
              <p className="text-xs mt-1">Post a slot list in your Discord server and it will appear here in seconds</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingImports.map(imp => {
                const conf = Math.round(imp.parseResult.confidence * 100);
                const timeAgo = Math.floor((Date.now() - new Date(imp.receivedAt).getTime()) / 1000);
                const timeStr =
                  timeAgo < 60 ? `${timeAgo}s ago` :
                  timeAgo < 3600 ? `${Math.floor(timeAgo/60)}m ago` :
                  `${Math.floor(timeAgo/3600)}h ago`;

                return (
                  <div
                    key={imp.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {imp.discordUserAvatar ? (
                        <img src={imp.discordUserAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-semibold text-sm truncate">
                          {imp.parseResult.totalDetected} teams
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          conf >= 80 ? "bg-green-500/20 text-green-400" :
                          conf >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {conf}%
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs truncate">
                        <span className="text-indigo-400">{imp.discordGuildName}</span> · #{imp.discordChannelName} · by {imp.discordUsername} · {timeStr}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedImport(imp)}
                      className="btn-primary text-xs px-4 py-1.5"
                    >
                      Import<ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => dismissPending(imp.id)}
                      className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BOT STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Bot Status</p>
              <p className="text-green-400 text-xs">Online</p>
            </div>
          </div>
          <p className="text-gray-600 text-xs">Bot running on Railway, listening 24/7</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Auto-Detect</p>
              <p className="text-blue-400 text-xs">8+ formats</p>
            </div>
          </div>
          <p className="text-gray-600 text-xs">SLOT · #1 · S1 · numbered · etc.</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Slash Commands</p>
              <p className="text-purple-400 text-xs">/tournaops</p>
            </div>
          </div>
          <p className="text-gray-600 text-xs">ping · status · help · parse</p>
        </div>
      </div>

      {/* SETUP GUIDE */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />How the Bot Works
        </h3>
        <ol className="space-y-3">
          {[
            { title: "Post slot list in Discord", desc: "Any channel where the bot has access" },
            { title: "Bot detects automatically", desc: "Reacts with ✅ and replies with embed" },
            { title: "Appears here in seconds", desc: "This dashboard polls every 8 seconds" },
            { title: "Click Import", desc: "Choose a tournament and confirm — done in 2 clicks" },
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                {i + 1}
              </span>
              <div>
                <p className="text-white text-sm font-medium">{s.title}</p>
                <p className="text-gray-500 text-xs">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* SLASH COMMANDS INFO */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Bot Commands in Discord</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { cmd: "/tournaops ping", desc: "Check bot latency" },
            { cmd: "/tournaops status", desc: "Bot statistics + uptime" },
            { cmd: "/tournaops help", desc: "Show all commands" },
            { cmd: "/tournaops parse", desc: "Manually test parser" },
          ].map(c => (
            <div key={c.cmd} className="p-3 rounded-xl bg-white/3 border border-white/6">
              <code className="text-indigo-400 text-sm font-mono">{c.cmd}</code>
              <p className="text-gray-600 text-xs mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* IMPORT MODAL */}
      {selectedImport && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
          <div className="glass-card w-full max-w-2xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Import Discord Slot List</h2>
                <p className="text-gray-500 text-sm mt-1">
                  From <span className="text-indigo-400">{selectedImport.discordGuildName}</span> · by {selectedImport.discordUsername}
                </p>
              </div>
              <button onClick={() => setSelectedImport(null)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {imported ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Imported!</h3>
                <p className="text-gray-400">
                  <strong className="text-green-400">{selectedImport.parseResult.totalDetected}</strong> teams added to tournament
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Tournament Select */}
                <div>
                  <label className="text-sm font-medium text-gray-400 block mb-1.5">Import into Tournament</label>
                  <select
                    value={importTargetTournament}
                    onChange={e => setImportTargetTournament(e.target.value)}
                    className="input-field"
                  >
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Preview ({selectedImport.parseResult.totalDetected} teams)
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-1 bg-black/40 rounded-xl border border-white/6 p-3">
                    {selectedImport.parseResult.slots.map(s => (
                      <div key={s.slotNumber} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600 font-mono w-8 text-right">#{s.slotNumber}</span>
                        <span className="text-white">{s.teamName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {selectedImport.parseResult.warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 text-xs">
                    ⚠️ {selectedImport.parseResult.warnings.length} warning(s): {selectedImport.parseResult.warnings[0]}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-white/8">
                  <span className="text-gray-500 text-sm">
                    Format: <span className="text-white font-mono">{selectedImport.parseResult.format}</span>
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedImport(null)} className="btn-secondary px-5 py-2">
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={importing || !importTargetTournament}
                      className="btn-primary px-6 py-2"
                    >
                      {importing ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing...</>
                      ) : (
                        <><Check className="w-4 h-4" />Import {selectedImport.parseResult.totalDetected} Teams</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}