"use client";

import { useState } from "react";
import { X, Send, Check, AlertCircle, MessageSquare, Zap, Bell, Trophy, Crosshair, Copy, ExternalLink } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { getLeaderboard, getTopPlayers } from "@/lib/storage/tournaments";

interface DiscordWebhookProps {
  tournament: Tournament;
  onClose: () => void;
}

type MessageType = "standings" | "wwcd" | "mvp" | "announcement" | "custom";

export default function DiscordWebhook({ tournament, onClose }: DiscordWebhookProps) {
  const [webhookUrl, setWebhookUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`webhook_${tournament.id}`) || "";
    }
    return "";
  });
  const [msgType, setMsgType] = useState<MessageType>("standings");
  const [customMsg, setCustomMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const leaderboard = getLeaderboard(tournament);
  const { topKillers } = getTopPlayers(tournament);
  const completedMatches = tournament.matches.filter(m => m.status === "completed").length;

  const saveWebhook = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`webhook_${tournament.id}`, webhookUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const buildEmbed = (): any => {
    const colors = { standings: 3447003, wwcd: 16766720, mvp: 15158332, announcement: 3066993, custom: 10181046 };

    if (msgType === "standings") {
      const top10 = leaderboard.slice(0, 10);
      const medals = ["", "", ""];
      const rows = top10.map(e =>
        `${e.rank <= 3 ? medals[e.rank - 1] : `\`#${e.rank}\``} **${e.teamName}**  ${e.totalPoints}pts *(${e.totalKills}K)*`
      ).join("\n");

      return {
        embeds: [{
          title: ` ${tournament.name}  Live Standings`,
          description: rows || "No results yet",
          color: colors.standings,
          fields: [
            { name: "Matches Played", value: `${completedMatches}/${tournament.matches.length}`, inline: true },
            { name: "Total Squads", value: `${tournament.teams.length}`, inline: true },
            { name: "Leader", value: leaderboard[0]?.teamName || "TBD", inline: true },
          ],
          footer: { text: "Powered by TournaOps  tournaops.com" },
          timestamp: new Date().toISOString(),
        }]
      };
    }

    if (msgType === "wwcd") {
      const lastMatch = tournament.matches.filter(m => m.status === "completed").slice(-1)[0];
      const winner = lastMatch?.results?.[0];
      return {
        embeds: [{
          title: " WINNER WINNER CHICKEN DINNER!",
          description: winner
            ? `**${winner.teamName}** wins ${lastMatch.name} on **${lastMatch.map}**!`
            : "Match winner TBD",
          color: colors.wwcd,
          fields: winner ? [
            { name: "Kills", value: `${winner.kills}`, inline: true },
            { name: "Points", value: `${winner.totalPoints}`, inline: true },
            { name: "Damage", value: `${winner.damage?.toLocaleString() || ""}`, inline: true },
          ] : [],
          footer: { text: "Powered by TournaOps  tournaops.com" },
          timestamp: new Date().toISOString(),
        }]
      };
    }

    if (msgType === "mvp") {
      const mvp = topKillers[0];
      return {
        embeds: [{
          title: " Tournament Top Fragger",
          description: mvp
            ? `**${mvp.playerName}** from **${mvp.teamName}** leads with **${mvp.kills} kills**!`
            : "No player data yet",
          color: colors.mvp,
          fields: mvp ? [
            { name: "Total Kills", value: `${mvp.kills}`, inline: true },
            { name: "Total Damage", value: `${mvp.damage?.toLocaleString() || ""}`, inline: true },
          ] : [],
          footer: { text: "Powered by TournaOps  tournaops.com" },
          timestamp: new Date().toISOString(),
        }]
      };
    }

    if (msgType === "announcement") {
      return {
        embeds: [{
          title: ` ${tournament.name}`,
          description: `Tournament is now **${tournament.status.toUpperCase()}**!\n\nJoin us for the action!`,
          color: colors.announcement,
          fields: [
            { name: "Format", value: `${tournament.teams.length} squads`, inline: true },
            { name: "Status", value: tournament.status, inline: true },
            { name: "Prize Pool", value: tournament.prizePool || "TBD", inline: true },
          ],
          footer: { text: "Powered by TournaOps  tournaops.com" },
          timestamp: new Date().toISOString(),
        }]
      };
    }

    return {
      content: customMsg || "Update from TournaOps",
      embeds: [{
        description: customMsg,
        color: colors.custom,
        footer: { text: `${tournament.name}  tournaops.com` },
        timestamp: new Date().toISOString(),
      }]
    };
  };

  const handleSend = async () => {
    if (!webhookUrl.trim()) { setError("Enter a Discord webhook URL first"); return; }
    if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
      setError("Invalid webhook URL. Must start with https://discord.com/api/webhooks/");
      return;
    }
    setError("");
    setSending(true);
    try {
      const payload = buildEmbed();
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok || res.status === 204) {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
        saveWebhook();
      } else {
        const text = await res.text();
        setError(`Discord error: ${res.status}  ${text.substring(0, 100)}`);
      }
    } catch (e: any) {
      setError(`Failed: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  const MSG_TYPES: { id: MessageType; label: string; icon: any; desc: string }[] = [
    { id: "standings", label: "Standings", icon: Trophy, desc: "Top 10 leaderboard" },
    { id: "wwcd", label: "WWCD", icon: Zap, desc: "Last match winner" },
    { id: "mvp", label: "MVP", icon: Crosshair, desc: "Top fragger" },
    { id: "announcement", label: "Announcement", icon: Bell, desc: "Tournament update" },
    { id: "custom", label: "Custom", icon: MessageSquare, desc: "Your own message" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-2xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Discord Integration
            </h2>
            <p className="text-gray-500 text-sm mt-1">Post tournament updates to your Discord server</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Webhook URL */}
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">
              Discord Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="input-field flex-1 text-sm font-mono"
              />
              <button
                onClick={saveWebhook}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  saved
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "btn-secondary"
                }`}
              >
                {saved ? <Check className="w-4 h-4" /> : "Save"}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-gray-600 text-xs">
                Discord Server Settings  Integrations  Webhooks  New Webhook  Copy URL
              </p>
              <a
                href="https://support.discord.com/hc/en-us/articles/228383668"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1"
              >
                Guide <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Message Type */}
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">Message Type</label>
            <div className="grid grid-cols-5 gap-2">
              {MSG_TYPES.map(m => {
                const Icon = m.icon;
                const active = msgType === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMsgType(m.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      active
                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                        : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-[10px] font-medium">{m.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom message */}
          {msgType === "custom" && (
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1.5">Your Message</label>
              <textarea
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                placeholder="Type your announcement..."
                className="input-field resize-none text-sm"
                rows={4}
                autoFocus
              />
            </div>
          )}

          {/* Preview */}
          <div className="bg-[#36393f] rounded-xl p-4 border border-white/5">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Discord Preview</p>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-semibold">TournaOps</span>
                  <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-medium">BOT</span>
                </div>
                <div className="bg-[#2f3136] rounded-lg p-3 border-l-4 border-indigo-500">
                  {msgType === "standings" && (
                    <div>
                      <p className="text-white font-semibold text-sm mb-2"> {tournament.name}  Live Standings</p>
                      {leaderboard.slice(0, 5).map((e, i) => (
                        <p key={e.teamId} className="text-gray-300 text-xs mb-0.5">
                          {["","",""][i] || `#${i+1}`} {e.teamName}  {e.totalPoints}pts ({e.totalKills}K)
                        </p>
                      ))}
                      {leaderboard.length === 0 && <p className="text-gray-500 text-xs">No results yet</p>}
                    </div>
                  )}
                  {msgType === "wwcd" && (
                    <div>
                      <p className="text-white font-semibold text-sm"> WINNER WINNER CHICKEN DINNER!</p>
                      <p className="text-gray-300 text-xs mt-1">
                        {tournament.matches.filter(m => m.status === "completed").slice(-1)[0]?.results?.[0]?.teamName || "TBD"} wins the last match!
                      </p>
                    </div>
                  )}
                  {msgType === "mvp" && (
                    <div>
                      <p className="text-white font-semibold text-sm"> Tournament Top Fragger</p>
                      <p className="text-gray-300 text-xs mt-1">
                        {topKillers[0] ? `${topKillers[0].playerName}  ${topKillers[0].kills} kills` : "No data yet"}
                      </p>
                    </div>
                  )}
                  {msgType === "announcement" && (
                    <div>
                      <p className="text-white font-semibold text-sm"> {tournament.name}</p>
                      <p className="text-gray-300 text-xs mt-1">Tournament is now {tournament.status.toUpperCase()}!</p>
                    </div>
                  )}
                  {msgType === "custom" && (
                    <p className="text-gray-300 text-xs">{customMsg || "Your message here..."}</p>
                  )}
                  <p className="text-gray-600 text-[10px] mt-2">Powered by TournaOps  tournaops.com</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button onClick={onClose} className="btn-secondary px-5 py-2.5">Cancel</button>
          <button
            onClick={handleSend}
            disabled={sending || !webhookUrl.trim()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              sent
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "btn-primary"
            }`}
          >
            {sent ? (
              <><Check className="w-4 h-4" />Sent to Discord!</>
            ) : sending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
            ) : (
              <><Send className="w-4 h-4" />Send to Discord</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}