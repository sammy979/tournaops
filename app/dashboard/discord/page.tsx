"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Copy, Check, ExternalLink, Zap, Send, Trophy, Crosshair, Bell, ChevronRight } from "lucide-react";
import { getMyTournaments, getLeaderboard, getTopPlayers } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function DiscordPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = getMyTournaments();
    setTournaments(t);
    if (t.length > 0) {
      setSelected(t[0].id);
      const saved = localStorage.getItem(`webhook_${t[0].id}`);
      if (saved) setWebhookUrl(saved);
    }
  }, []);

  useEffect(() => {
    if (selected) {
      const saved = localStorage.getItem(`webhook_${selected}`);
      setWebhookUrl(saved || "");
    }
  }, [selected]);

  const saveWebhook = () => {
    if (selected) {
      localStorage.setItem(`webhook_${selected}`, webhookUrl);
      setCopied("saved");
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const tournament = tournaments.find(t => t.id === selected);
  const leaderboard = tournament ? getLeaderboard(tournament) : [];
  const { topKillers } = tournament ? getTopPlayers(tournament) : { topKillers: [] };

  const sendToDiscord = async (payload: any, key: string) => {
    if (!webhookUrl.trim()) { setError("Enter webhook URL first"); return; }
    if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) { setError("Invalid webhook URL"); return; }
    setError("");
    setSending(key);
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok || res.status === 204) {
        setSent(key);
        setTimeout(() => setSent(null), 3000);
      } else {
        setError(`Discord error: ${res.status}`);
      }
    } catch (e: any) {
      setError(`Failed: ${e.message}`);
    } finally {
      setSending(null);
    }
  };

  const messages = tournament ? [
    {
      key: "standings",
      label: "📊 Post Standings",
      desc: "Current top 10 leaderboard",
      color: 3447003,
      payload: {
        embeds: [{
          title: `🏆 ${tournament.name} — Live Standings`,
          description: leaderboard.slice(0, 10).map(e => `${e.rank <= 3 ? ["🥇","🥈","🥉"][e.rank-1] : `\`#${e.rank}\``} **${e.teamName}** — ${e.totalPoints}pts *(${e.totalKills}K)*`).join("\n") || "No results yet",
          color: 3447003,
          fields: [
            { name: "Matches", value: `${tournament.matches.filter(m=>m.status==="completed").length}/${tournament.matches.length}`, inline: true },
            { name: "Squads", value: `${tournament.teams.length}`, inline: true },
          ],
          footer: { text: "TournaOps • tournaops.com" },
          timestamp: new Date().toISOString(),
        }]
      }
    },
    {
      key: "wwcd",
      label: "🍗 Post WWCD",
      desc: "Last match winner announcement",
      color: 16766720,
      payload: (() => {
        const last = tournament.matches.filter(m=>m.status==="completed").slice(-1)[0];
        const winner = last?.results?.[0];
        return {
          embeds: [{
            title: "🍗 WINNER WINNER CHICKEN DINNER!",
            description: winner ? `**${winner.teamName}** wins **${last.name}** on **${last.map}**!` : "No completed matches yet",
            color: 16766720,
            fields: winner ? [
              { name: "Kills", value: `${winner.kills}`, inline: true },
              { name: "Points", value: `${winner.totalPoints}`, inline: true },
              { name: "Damage", value: `${winner.damage?.toLocaleString() || "—"}`, inline: true },
            ] : [],
            footer: { text: "TournaOps • tournaops.com" },
            timestamp: new Date().toISOString(),
          }]
        };
      })()
    },
    {
      key: "mvp",
      label: "🎯 Post Top Fragger",
      desc: "Current tournament MVP",
      color: 15158332,
      payload: {
        embeds: [{
          title: "🎯 Tournament Top Fragger",
          description: topKillers[0] ? `**${topKillers[0].playerName}** from **${topKillers[0].teamName}** leads with **${topKillers[0].kills} kills**!` : "No player data yet",
          color: 15158332,
          footer: { text: "TournaOps • tournaops.com" },
          timestamp: new Date().toISOString(),
        }]
      }
    },
    {
      key: "live",
      label: "📣 Tournament Live",
      desc: "Announce tournament is live",
      color: 3066993,
      payload: {
        content: "@everyone",
        embeds: [{
          title: `🔴 ${tournament.name} is NOW LIVE!`,
          description: `The tournament has started! Follow the action live.`,
          color: 3066993,
          fields: [
            { name: "Squads", value: `${tournament.teams.length}`, inline: true },
            { name: "Prize Pool", value: tournament.prizePool || "TBA", inline: true },
            { name: "Live Standings", value: `[Click here](${typeof window !== "undefined" ? window.location.origin : "https://tournaops.com"}/tournaments/${tournament.slug})`, inline: true },
          ],
          footer: { text: "TournaOps • tournaops.com" },
          timestamp: new Date().toISOString(),
        }]
      }
    },
  ] : [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Discord Integration</h1>
        <p className="text-gray-400 mt-1">Post tournament updates directly to your Discord server</p>
      </div>

      {/* Webhook Setup */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />Webhook Setup
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Tournament</label>
            <select value={selected} onChange={e => setSelected(e.target.value)} className="input-field text-sm w-auto">
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Webhook URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="input-field flex-1 text-sm font-mono"
              />
              <button onClick={saveWebhook} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${copied === "saved" ? "bg-green-500/20 text-green-400 border-green-500/30" : "btn-secondary"}`}>
                {copied === "saved" ? <Check className="w-4 h-4" /> : "Save"}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
            <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <p className="text-gray-400 text-xs">
              Discord Server → Settings → Integrations → Webhooks → New Webhook → Copy URL
            </p>
            <a href="https://support.discord.com/hc/en-us/articles/228383668" target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1 flex-shrink-0">
              Guide <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Quick Send Buttons */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Send className="w-4 h-4 text-blue-400" />Quick Send
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {messages.map(m => (
            <button
              key={m.key}
              onClick={() => sendToDiscord(m.payload, m.key)}
              disabled={sending === m.key || !webhookUrl.trim()}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                sent === m.key
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-white/10 hover:border-white/20 hover:bg-white/4"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl flex-shrink-0">{m.label.split(" ")[0]}</div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${sent === m.key ? "text-green-400" : "text-white"}`}>
                  {sent === m.key ? "Sent!" : m.label.split(" ").slice(1).join(" ")}
                </p>
                <p className="text-gray-600 text-xs truncate">{m.desc}</p>
              </div>
              {sending === m.key && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />}
              {sent === m.key && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Setup Guide */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Setup Guide</h3>
        <ol className="space-y-3">
          {[
            "Open your Discord server",
            'Go to Server Settings → Integrations → Webhooks',
            'Click "New Webhook" and give it a name like "TournaOps"',
            "Choose which channel to post updates in",
            'Click "Copy Webhook URL" and paste it above',
            "Click Save, then use Quick Send to post updates",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i+1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}