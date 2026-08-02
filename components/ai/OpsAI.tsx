"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles, Zap, Trophy, Crosshair, RefreshCw } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { getLeaderboard, getTopPlayers, getTournamentStats } from "@/lib/storage/tournaments";

interface OpsAIProps {
  tournament: Tournament;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  time: Date;
}

function generateResponse(input: string, tournament: Tournament): string {
  const q = input.toLowerCase().trim();
  const leaderboard = getLeaderboard(tournament);
  const { topKillers, topDamage } = getTopPlayers(tournament);
  const stats = getTournamentStats(tournament);

  // Greetings
  if (q.match(/^(hi|hello|hey|sup|yo)/)) {
    return `Hey! I'm OpsAI, your tournament assistant for **${tournament.name}**. Ask me anything about standings, stats, match info, or how to use TournaOps. What do you need?`;
  }

  // Leader / who is winning
  if (q.match(/who.*(lead|win|first|top|#1)|lead|winner/)) {
    if (leaderboard.length === 0) return "No match results yet. Enter some match results first, then I can tell you who's leading!";
    const top3 = leaderboard.slice(0, 3);
    return `**Current Top 3:**\n\n🥇 **${top3[0]?.teamName}** — ${top3[0]?.totalPoints} pts (${top3[0]?.totalKills} kills)\n🥈 **${top3[1]?.teamName || "—"}** — ${top3[1]?.totalPoints || 0} pts\n🥉 **${top3[2]?.teamName || "—"}** — ${top3[2]?.totalPoints || 0} pts\n\nThe gap between 1st and 2nd is **${(top3[0]?.totalPoints || 0) - (top3[1]?.totalPoints || 0)} points**.`;
  }

  // Top killer / MVP
  if (q.match(/kill|frag|mvp|best player|top player/)) {
    if (topKillers.length === 0) return "No kill data yet. Enter match results with player stats to track kills.";
    const mvp = topKillers[0];
    return `🎯 **Top Fragger: ${mvp.playerName}** (${mvp.teamName})\n\n**${mvp.kills} total kills** across all matches.\n\nTop 3 fraggers:\n1. ${topKillers[0]?.playerName} — ${topKillers[0]?.kills}K\n2. ${topKillers[1]?.playerName || "—"} — ${topKillers[1]?.kills || 0}K\n3. ${topKillers[2]?.playerName || "—"} — ${topKillers[2]?.kills || 0}K`;
  }

  // Damage
  if (q.match(/damage|dmg/)) {
    if (topDamage.length === 0) return "No damage data yet. Enter match results with player damage stats.";
    const king = topDamage[0];
    return `🔥 **Damage King: ${king.playerName}** (${king.teamName})\n\n**${king.damage?.toLocaleString()} total damage** dealt!\n\nTop damage dealers:\n1. ${topDamage[0]?.playerName} — ${topDamage[0]?.damage?.toLocaleString()}\n2. ${topDamage[1]?.playerName || "—"} — ${topDamage[1]?.damage?.toLocaleString() || 0}\n3. ${topDamage[2]?.playerName || "—"} — ${topDamage[2]?.damage?.toLocaleString() || 0}`;
  }

  // Progress
  if (q.match(/progress|how many|match.*done|complete/)) {
    return `📊 **Tournament Progress: ${stats.progress}%**\n\n✅ ${stats.completedMatches} matches completed\n⏳ ${stats.totalMatches - stats.completedMatches} matches remaining\n👥 ${stats.teamsCount} squads competing\n💥 ${stats.totalKills} total kills so far`;
  }

  // Standings
  if (q.match(/standing|leaderboard|rank|table/)) {
    if (leaderboard.length === 0) return "No standings yet. Enter match results to generate the leaderboard.";
    const top5 = leaderboard.slice(0, 5);
    return `📊 **Top 5 Standings:**\n\n${top5.map(e => `${e.rank <= 3 ? ["🥇","🥈","🥉"][e.rank-1] : `#${e.rank}`} ${e.teamName} — **${e.totalPoints}pts** (${e.totalKills}K)`).join("\n")}\n\n${leaderboard.length > 5 ? `+${leaderboard.length - 5} more teams` : ""}`;
  }

  // Teams
  if (q.match(/team|squad|roster|how many team/)) {
    return `👥 **${tournament.teams.length} squads** are registered in **${tournament.name}**.\n\nTotal players: **${tournament.teams.reduce((a, t) => a + t.players.length, 0)}**\n\nTo edit squads, use the **Edit Squads** button or **Import CSV** for bulk import.`;
  }

  // Format
  if (q.match(/format|round|lobby|structure/)) {
    const roundInfo = tournament.rounds.map((r, i) =>
      `${i + 1}. ${r.name} — ${r.lobbies.length} lobbies × ${r.matchesPerLobby} matches`
    ).join("\n");
    return `🏆 **Tournament Format:**\n\n${roundInfo}\n\nTotal matches: **${tournament.matches.length}**\nScoring: **${tournament.scoringRule.name}**`;
  }

  // Scoring
  if (q.match(/scor|point|kill point|placement/)) {
    const s = tournament.scoringRule;
    return `🎯 **Scoring System: ${s.name}**\n\n📍 Placement points:\n1st = ${s.placementPoints[0]}pts\n2nd = ${s.placementPoints[1]}pts\n3rd = ${s.placementPoints[2]}pts\n4th = ${s.placementPoints[3]}pts\n5th = ${s.placementPoints[4]}pts\n\n💥 Kill points: **${s.killPoints}pt per kill**${s.wwcdBonus ? `\n🍗 WWCD bonus: **+${s.wwcdBonus}pts**` : ""}`;
  }

  // Maps
  if (q.match(/map|erangel|miramar|sanhok|vikendi|livik/)) {
    return `🗺️ **Map Rotation for ${tournament.name}:**\n\n${tournament.mapRotation.map((m, i) => `${i + 1}. ${m}`).join("\n")}\n\nMaps cycle through this order for each match.`;
  }

  // Prize
  if (q.match(/prize|reward|money|cash/)) {
    return tournament.prizePool
      ? `💰 **Prize Pool: ${tournament.prizePool}**\n\nGood luck to all teams!`
      : "No prize pool has been set for this tournament yet. You can add one in tournament settings.";
  }

  // How to use
  if (q.match(/how|help|what can|guide|tutorial/)) {
    return `🤖 **Here's what I can help with:**\n\n• **Standings** — "Who is winning?"\n• **Kills** — "Who has most kills?"\n• **Damage** — "Top damage dealers"\n• **Progress** — "How many matches done?"\n• **Format** — "How many rounds?"\n• **Scoring** — "How are points calculated?"\n• **Maps** — "What maps are being played?"\n• **Teams** — "How many squads?"\n\nJust ask naturally!`;
  }

  // Status
  if (q.match(/status|live|draft|complet/)) {
    return `📡 **Tournament Status: ${tournament.status.toUpperCase()}**\n\n${
      tournament.status === "draft" ? "Tournament is in setup mode. Change status to Live when matches start." :
      tournament.status === "live" ? "🔴 Tournament is LIVE! Click the status badge to update it." :
      tournament.status === "completed" ? "Tournament has finished. Final results are locked in." :
      "Tournament has been cancelled."
    }`;
  }

  // Export / share
  if (q.match(/export|download|share|discord|social|png|pdf/)) {
    return `📤 **Sharing & Export options:**\n\n🎨 **Broadcast Studio** — Generate social media cards (Instagram, Twitter, Stories)\n📊 **Export button** — Download leaderboard as PNG or PDF\n📡 **Discord** — Post results directly to your server\n🌐 **Public link** — Share \`tournaops.com/tournaments/${tournament.slug}\`\n📺 **OBS Overlay** — Add live leaderboard to your stream`;
  }

  // Default
  const randomTips = [
    `I didn't quite understand that. Try asking about **standings**, **kills**, **damage**, **format**, or **scoring**!`,
    `Hmm, not sure about that one. Ask me "who is winning?" or "how many matches are done?" for quick stats!`,
    `I can help with tournament stats and info! Try "show top killers" or "what's the scoring system?"`,
  ];
  return randomTips[Math.floor(Math.random() * randomTips.length)];
}

const QUICK_PROMPTS = [
  { label: "Who is winning?", icon: Trophy },
  { label: "Top fragger?", icon: Crosshair },
  { label: "Progress?", icon: Zap },
  { label: "Scoring system?", icon: Sparkles },
];

export default function OpsAI({ tournament, onClose }: OpsAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: `Hey! I'm **OpsAI** — your tournament assistant for **${tournament.name}**. Ask me about standings, stats, format, or how to use any feature. What do you need?`,
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      time: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    setTimeout(() => {
      const response = generateResponse(msg, tournament);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response,
        time: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setThinking(false);
    }, 600 + Math.random() * 400);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full sm:w-96 rounded-2xl border border-white/10 shadow-2xl flex flex-col" style={{ height: "600px", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">OpsAI</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-gray-500 text-xs">Always online</p>
            </div>
          </div>
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
            title="Clear chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "ai"
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-white/10 border border-white/15"
              }`}>
                {msg.role === "ai"
                  ? <Bot className="w-3.5 h-3.5 text-white" />
                  : <User className="w-3.5 h-3.5 text-gray-400" />
                }
              </div>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "ai"
                  ? "bg-white/6 text-gray-200 rounded-tl-sm"
                  : "bg-blue-600 text-white rounded-tr-sm"
              }`}>
                <span dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                <div className={`text-[10px] mt-1.5 ${msg.role === "ai" ? "text-gray-600" : "text-blue-200/60"}`}>
                  {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white/6 rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map(p => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  onClick={() => sendMessage(p.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-xs transition-all"
                >
                  <Icon className="w-3 h-3" />
                  {p.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask anything about the tournament..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || thinking}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}