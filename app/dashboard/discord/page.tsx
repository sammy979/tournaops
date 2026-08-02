"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare, Zap, Check, Copy, ExternalLink,
  Send, Bell, Info, ArrowRight, Clock, Upload
} from "lucide-react";
import { getMyTournaments } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function DiscordPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [savedWebhook, setSavedWebhook] = useState(false);
  const [importHistory, setImportHistory] = useState<any[]>([]);

  useEffect(() => {
    const t = getMyTournaments();
    setTournaments(t);
    if (t.length > 0) {
      setSelected(t[0].id);
      loadForTournament(t[0].id);
    }
  }, []);

  const loadForTournament = (id: string) => {
    try {
      setWebhookUrl(localStorage.getItem(`webhook_${id}`) || "");
      const hist = JSON.parse(localStorage.getItem(`discord_imports_${id}`) || "[]");
      setImportHistory(hist.reverse());
    } catch {}
  };

  const saveWebhook = () => {
    if (!selected) return;
    localStorage.setItem(`webhook_${selected}`, webhookUrl);
    setSavedWebhook(true);
    setTimeout(() => setSavedWebhook(false), 2000);
  };

  const tournament = tournaments.find(t => t.id === selected);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          Discord Integration
        </h1>
        <p className="text-gray-400 mt-2">Import teams and post updates via Discord</p>
      </div>

      {/* Tournament Select */}
      <div className="glass-card rounded-xl p-4 border border-white/10">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          Working Tournament
        </label>
        <select
          value={selected}
          onChange={e => { setSelected(e.target.value); loadForTournament(e.target.value); }}
          className="input-field text-sm w-auto"
        >
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* SLOT LIST IMPORT — Primary feature */}
        <div className="glass-card rounded-xl p-6 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/8 to-purple-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Upload className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">Slot List Import</h3>
              <p className="text-gray-500 text-xs">Paste Discord message → auto-import teams</p>
            </div>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-400 mb-4">
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" />8+ format support</li>
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" />Duplicate detection</li>
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" />Preview before import</li>
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" />Edit teams inline</li>
          </ul>
          {tournament && (
            <Link
              href={`/dashboard/tournaments/${tournament.id}`}
              className="btn-primary w-full py-2.5 justify-center text-sm"
            >
              Open Tournament <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <p className="text-gray-600 text-[10px] mt-2 text-center">
            Then click <span className="text-indigo-400">Discord Import</span> on the tournament page
          </p>
        </div>

        {/* DISCORD WEBHOOK */}
        <div className="glass-card rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Send className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">Post to Discord</h3>
              <p className="text-gray-500 text-xs">Send standings, WWCD, and MVP updates</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <input
              type="url"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="input-field text-xs font-mono"
            />
            <button
              onClick={saveWebhook}
              className={`w-full py-2 rounded-xl text-xs font-medium border transition-all ${
                savedWebhook ? "bg-green-500/20 text-green-400 border-green-500/30" : "btn-secondary"
              }`}
            >
              {savedWebhook ? <><Check className="w-3 h-3 inline mr-1" />Saved!</> : "Save Webhook"}
            </button>
          </div>
          <p className="text-gray-600 text-[10px]">
            Use in tournament page → Discord button
          </p>
        </div>
      </div>

      {/* SETUP GUIDE */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />How to Import Slot Lists
        </h3>
        <ol className="space-y-3">
          {[
            {
              title: "Copy your Discord slot list message",
              desc: "Right-click the message in Discord → Copy Text",
            },
            {
              title: "Open your tournament in TournaOps",
              desc: "Go to My Tournaments → click the one you want",
            },
            {
              title: 'Click "Discord Import" button',
              desc: "Purple button in the tournament header",
            },
            {
              title: "Paste the message and hit Parse",
              desc: "TournaOps detects the format automatically",
            },
            {
              title: "Review & confirm",
              desc: "Edit any team names before importing. Handles duplicates smartly.",
            },
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

      {/* SUPPORTED FORMATS */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Supported Slot List Formats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "SLOT format", example: "SLOT 1 - Team Alpha\nSLOT 2 - Team Bravo" },
            { name: "Numbered", example: "1. Team Alpha\n2. Team Bravo" },
            { name: "Dash separator", example: "1 - Team Alpha\n2 - Team Bravo" },
            { name: "S1 format", example: "S1 Team Alpha\nS2 Team Bravo" },
            { name: "Colon format", example: "Slot 1: Team Alpha\nSlot 2: Team Bravo" },
            { name: "Hash format", example: "#1 Team Alpha\n#2 Team Bravo" },
          ].map(f => (
            <div key={f.name} className="p-3 rounded-xl bg-white/3 border border-white/6">
              <p className="text-indigo-400 text-xs font-semibold mb-1.5">{f.name}</p>
              <pre className="text-gray-500 text-[11px] font-mono leading-relaxed whitespace-pre-wrap">{f.example}</pre>
            </div>
          ))}
        </div>
      </div>

      {/* IMPORT HISTORY */}
      {importHistory.length > 0 && (
        <div className="glass-card rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />Recent Imports
          </h3>
          <div className="space-y-2">
            {importHistory.slice(0, 8).map(imp => (
              <div key={imp.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    {imp.slotsImported} team{imp.slotsImported !== 1 ? "s" : ""} imported
                  </p>
                  <p className="text-gray-600 text-xs">
                    {imp.format} · {Math.round((imp.confidence || 0) * 100)}% confidence
                  </p>
                </div>
                <span className="text-gray-600 text-xs flex-shrink-0">
                  {new Date(imp.importedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FUTURE: REAL BOT */}
      <div className="glass-card rounded-xl p-6 border border-white/10 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Coming Soon: Real Discord Bot</p>
            <p className="text-gray-500 text-sm mt-1">
              Auto-detect slot lists in real time. No manual paste needed. Requires backend upgrade.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-gray-400">In Development</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">Pro Feature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}