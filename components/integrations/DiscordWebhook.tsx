"use client";

import { useState } from "react";
import { X, Send, Check, AlertCircle, MessageSquare, Zap, Bell, Trophy, Crosshair, ExternalLink } from "lucide-react";

interface StandingEntry {
  rank: number;
  teamName: string;
  totalPoints: number;
  totalKills: number;
}

interface TopFragger {
  playerName: string;
  teamName: string;
  kills: number;
}

interface DiscordWebhookProps {
  tournamentId: string;
  tournamentName: string;
  standings?: StandingEntry[];
  lastMatchWinner?: string;
  topFragger?: TopFragger | null;
  status?: string;
  prizePool?: string;
  teamsCount?: number;
  completedMatches?: number;
  totalMatches?: number;
  onClose: () => void;
}

type MessageType = "standings" | "wwcd" | "mvp" | "announcement" | "custom";

const MEDALS = ["1st", "2nd", "3rd"];

export default function DiscordWebhook({
  tournamentId,
  tournamentName,
  standings = [],
  lastMatchWinner,
  topFragger,
  status = "active",
  prizePool,
  teamsCount = 0,
  completedMatches = 0,
  totalMatches = 0,
  onClose,
}: DiscordWebhookProps) {
  const [msgType, setMsgType] = useState<MessageType>("standings");
  const [customMsg, setCustomMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const buildPayload = () => {
    const colors: Record<MessageType, number> = {
      standings: 3447003,
      wwcd: 16766720,
      mvp: 15158332,
      announcement: 3066993,
      custom: 10181046,
    };

    if (msgType === "standings") {
      const top10 = standings.slice(0, 10);
      const rows = top10
        .map((e) => {
          const prefix = e.rank <= 3 ? MEDALS[e.rank - 1] : "#" + e.rank;
          return prefix + " " + e.teamName + " - " + e.totalPoints + "pts (" + e.totalKills + "K)";
        })
        .join("\n");

      return {
        embeds: [
          {
            title: tournamentName + " | Live Standings",
            description: rows || "No results yet",
            color: colors.standings,
            fields: [
              { name: "Matches Played", value: completedMatches + "/" + totalMatches, inline: true },
              { name: "Total Squads", value: String(teamsCount), inline: true },
              { name: "Leader", value: standings[0]?.teamName || "TBD", inline: true },
            ],
            footer: { text: "Powered by TournaOps - tournaops.com" },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    if (msgType === "wwcd") {
      return {
        embeds: [
          {
            title: "WINNER WINNER CHICKEN DINNER!",
            description: lastMatchWinner
              ? "**" + lastMatchWinner + "** wins the latest match!"
              : "Match winner TBD",
            color: colors.wwcd,
            footer: { text: "Powered by TournaOps - tournaops.com" },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    if (msgType === "mvp") {
      return {
        embeds: [
          {
            title: "Tournament Top Fragger",
            description: topFragger
              ? "**" + topFragger.playerName + "** from **" + topFragger.teamName + "** leads with **" + topFragger.kills + " kills**!"
              : "No player data yet",
            color: colors.mvp,
            footer: { text: "Powered by TournaOps - tournaops.com" },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    if (msgType === "announcement") {
      return {
        embeds: [
          {
            title: tournamentName,
            description: "Tournament is now **" + status.toUpperCase() + "**!",
            color: colors.announcement,
            fields: [
              { name: "Format", value: teamsCount + " squads", inline: true },
              { name: "Status", value: status, inline: true },
              { name: "Prize Pool", value: prizePool || "TBD", inline: true },
            ],
            footer: { text: "Powered by TournaOps - tournaops.com" },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    return {
      content: customMsg || "Update from TournaOps",
      embeds: [
        {
          description: customMsg,
          color: colors.custom,
          footer: { text: tournamentName + " - tournaops.com" },
          timestamp: new Date().toISOString(),
        },
      ],
    };
  };

  const handleSend = async () => {
    if (msgType === "custom" && !customMsg.trim()) {
      setError("Enter a custom message first");
      return;
    }
    setError("");
    setSending(true);

    try {
      const res = await fetch("/api/discord/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          payload: buildPayload(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      } else {
        setError(data.error || "Failed to send. Check tournament Discord webhook settings.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const MSG_TYPES: { id: MessageType; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "standings", label: "Standings", icon: Trophy, desc: "Top 10 leaderboard" },
    { id: "wwcd", label: "WWCD", icon: Zap, desc: "Last match winner" },
    { id: "mvp", label: "MVP", icon: Crosshair, desc: "Top fragger" },
    { id: "announcement", label: "Announce", icon: Bell, desc: "Tournament update" },
    { id: "custom", label: "Custom", icon: MessageSquare, desc: "Your own message" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-gray-900 w-full max-w-2xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Discord Integration
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Post tournament updates to your Discord server
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Info box */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
            <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Webhook URL is configured in tournament settings and sent securely from the server.{" "}
              <a
                href="https://support.discord.com/hc/en-us/articles/228383668"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1 hover:text-blue-200"
              >
                Setup guide <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </div>

          {/* Message Type */}
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">
              Message Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MSG_TYPES.map((m) => {
                const Icon = m.icon;
                const active = msgType === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMsgType(m.id)}
                    title={m.desc}
                    className={
                      "p-3 rounded-xl border text-center transition-all " +
                      (active
                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                        : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300")
                    }
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
              <label className="text-sm font-medium text-gray-400 block mb-1.5">
                Your Message
              </label>
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type your announcement..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                rows={4}
                autoFocus
              />
            </div>
          )}

          {/* Discord Preview */}
          <div className="bg-[#36393f] rounded-xl p-4 border border-white/5">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
              Discord Preview
            </p>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-semibold">TournaOps</span>
                  <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-medium">
                    BOT
                  </span>
                </div>
                <div className="bg-[#2f3136] rounded-lg p-3 border-l-4 border-indigo-500">

                  {msgType === "standings" && (
                    <div>
                      <p className="text-white font-semibold text-sm mb-2">
                        {tournamentName} | Live Standings
                      </p>
                      {standings.slice(0, 5).map((e, i) => (
                        <p key={e.teamName + i} className="text-gray-300 text-xs mb-0.5">
                          {i < 3 ? MEDALS[i] : "#" + (i + 1)} {e.teamName} - {e.totalPoints}pts ({e.totalKills}K)
                        </p>
                      ))}
                      {standings.length === 0 && (
                        <p className="text-gray-500 text-xs">No results yet</p>
                      )}
                    </div>
                  )}

                  {msgType === "wwcd" && (
                    <div>
                      <p className="text-white font-semibold text-sm">
                        WINNER WINNER CHICKEN DINNER!
                      </p>
                      <p className="text-gray-300 text-xs mt-1">
                        {lastMatchWinner || "TBD"} wins the latest match!
                      </p>
                    </div>
                  )}

                  {msgType === "mvp" && (
                    <div>
                      <p className="text-white font-semibold text-sm">
                        Tournament Top Fragger
                      </p>
                      <p className="text-gray-300 text-xs mt-1">
                        {topFragger
                          ? topFragger.playerName + " - " + topFragger.kills + " kills"
                          : "No data yet"}
                      </p>
                    </div>
                  )}

                  {msgType === "announcement" && (
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {tournamentName}
                      </p>
                      <p className="text-gray-300 text-xs mt-1">
                        Tournament is now {status.toUpperCase()}!
                      </p>
                    </div>
                  )}

                  {msgType === "custom" && (
                    <p className="text-gray-300 text-xs">
                      {customMsg || "Your message here..."}
                    </p>
                  )}

                  <p className="text-gray-600 text-[10px] mt-2">
                    Powered by TournaOps - tournaops.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className={
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all " +
              (sent
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : sending
                ? "opacity-60 cursor-not-allowed bg-indigo-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white")
            }
          >
            {sent ? (
              <>
                <Check className="w-4 h-4" />
                Sent!
              </>
            ) : sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to Discord
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
