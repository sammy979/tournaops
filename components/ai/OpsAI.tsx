"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bot, User, Sparkles, Zap, Trophy, Crosshair, RefreshCw, BookOpen, TrendingUp } from "lucide-react";
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

function generateResponse(input: string, tournament: Tournament, history: Message[]): string {
  const q = input.toLowerCase().trim();
  const leaderboard = getLeaderboard(tournament);
  const { topKillers, topDamage } = getTopPlayers(tournament);
  const stats = getTournamentStats(tournament);

  // Context from recent conversation
  const recentTopics = history.slice(-6).map(m => m.content.toLowerCase()).join(" ");

  if (q.match(/^(hi|hello|hey|sup|yo|hola)/)) {
    return `Hey! I'm OpsAI for **${tournament.name}**. I remember our conversation context. Ask me anything about standings, stats, format, or how to use any TournaOps feature. What do you need?`;
  }

  if (q.match(/who.*(lead|win|first|top|#1)|lead|winner|winning/)) {
    if (leaderboard.length === 0) return "No results yet. Enter some match data first!";
    const top3 = leaderboard.slice(0, 3);
    const gap = (top3[0]?.totalPoints || 0) - (top3[1]?.totalPoints || 0);
    return `**Current Top 3 in ${tournament.name}:**\n\n **${top3[0]?.teamName}**  ${top3[0]?.totalPoints}pts (${top3[0]?.totalKills}K)\n **${top3[1]?.teamName || ""}**  ${top3[1]?.totalPoints || 0}pts\n **${top3[2]?.teamName || ""}**  ${top3[2]?.totalPoints || 0}pts\n\nThe gap between 1st and 2nd is **${gap} points**.${gap <= 5 ? "  Very close race!" : gap >= 20 ? " Strong lead." : ""}`;
  }

  if (q.match(/kill|frag|mvp|best player|top player|fragger/)) {
    if (topKillers.length === 0) return "No kill data yet. Enter match results with player stats to track kills.";
    const mvp = topKillers[0];
    const avg = (mvp.kills / Math.max(stats.completedMatches, 1)).toFixed(1);
    return ` **MVP: ${mvp.playerName}** (${mvp.teamName})\n\n**${mvp.kills} total kills**  avg ${avg}K per match\n\nTop 5 Fraggers:\n${topKillers.slice(0, 5).map((p, i) => `${i+1}. ${p.playerName} (${p.teamName})  ${p.kills}K`).join("\n")}`;
  }

  if (q.match(/damage|dmg/)) {
    if (topDamage.length === 0) return "No damage data yet. Enter match results with player stats.";
    const king = topDamage[0];
    return ` **Damage King: ${king.playerName}** (${king.teamName})\n\n**${king.damage?.toLocaleString()} total damage**\n\nTop 5 by damage:\n${topDamage.slice(0, 5).map((p, i) => `${i+1}. ${p.playerName}  ${p.damage?.toLocaleString()}`).join("\n")}`;
  }

  if (q.match(/progress|how many|match.*done|complet/)) {
    return ` **${tournament.name} Progress: ${stats.progress}%**\n\n ${stats.completedMatches} matches completed\n ${stats.totalMatches - stats.completedMatches} remaining\n ${stats.teamsCount} squads\n ${stats.totalKills} total kills\n\n${stats.progress === 100 ? " Tournament complete!" : stats.progress === 0 ? " Not started yet." : ` ${100 - stats.progress}% to go.`}`;
  }

  if (q.match(/standing|leaderboard|rank|table|top 10/)) {
    if (leaderboard.length === 0) return "No standings yet. Enter match results first.";
    const top10 = leaderboard.slice(0, 10);
    return ` **Top 10 Standings  ${tournament.name}:**\n\n${top10.map(e => `${e.rank <= 3 ? ["","",""][e.rank-1] : `#${e.rank}`} ${e.teamName}  **${e.totalPoints}pts** (${e.totalKills}K)`).join("\n")}`;
  }

  if (q.match(/team|squad|roster|how many team/)) {
    return ` **${tournament.teams.length} squads** in ${tournament.name}\n\nTotal players: **${tournament.teams.reduce((a, t) => a + t.players.length, 0)}**\nMax squads: **${tournament.maxTeams}**\n\n${tournament.maxTeams - tournament.teams.length > 0 ? `${tournament.maxTeams - tournament.teams.length} spots remaining.` : "Tournament is full!"}`;
  }

  if (q.match(/format|round|lobby|structure|bracket/)) {
    const roundInfo = tournament.rounds.map((r, i) => `${i+1}. ${r.name}  ${r.lobbies.length} lobbies  ${r.matchesPerLobby} matches`).join("\n");
    return ` **Format:**\n\n${roundInfo}\n\nTotal matches: **${tournament.matches.length}**\nScoring: **${tournament.scoringRule.name}**\nMaps: ${tournament.mapRotation.join(", ")}`;
  }

  if (q.match(/scor|point|kill point|placement|pmgc|pmpl/)) {
    const s = tournament.scoringRule;
    return ` **Scoring: ${s.name}**\n\n1st = ${s.placementPoints[0]}pts | 2nd = ${s.placementPoints[1]}pts | 3rd = ${s.placementPoints[2]}pts\n4th = ${s.placementPoints[3]}pts | 5th = ${s.placementPoints[4]}pts\n\n Kill = **${s.killPoints}pt**${s.wwcdBonus ? `\n WWCD bonus = **+${s.wwcdBonus}pts**` : ""}`;
  }

  if (q.match(/map|erangel|miramar|sanhok|vikendi|livik/)) {
    return ` **Map Rotation:**\n\n${tournament.mapRotation.map((m, i) => `${i+1}. ${m}`).join("\n")}`;
  }

  if (q.match(/prize|reward|money|cash/)) {
    return tournament.prizePool
      ? ` **Prize Pool: ${tournament.prizePool}**\n\nUse the Prize Tracker in your dashboard to manage payouts.`
      : "No prize pool set. Add it in tournament settings.";
  }

  if (q.match(/share|social|twitter|discord|export|download/)) {
    return ` **Sharing options:**\n\n **Twitter**  Use the Share button for pre-written tweet templates\n **Discord**  Use Discord Webhook to auto-post results\n **Export**  Download PNG or PDF leaderboard\n **Studio**  Generate social media cards\n **Public link**  tournaops.com/tournaments/${tournament.slug}`;
  }

  if (q.match(/obs|overlay|stream|broadcast/)) {
    return ` **Streaming Setup:**\n\n1. Go to **OBS Overlay** in your dashboard\n2. Copy the browser source URL\n3. In OBS: Sources  +  Browser  paste URL\n4. Set width: 420, height: 600\n\nThe overlay updates every 10 seconds automatically!\n\nAlso try the **Match Timer** for between-match countdowns.`;
  }

  if (q.match(/how|help|what can|guide|tutorial|feature/)) {
    return ` **OpsAI can help with:**\n\n Standings  "Who is winning?"\n Kills  "Top fragger?"\n Damage  "Most damage?"\n Progress  "How many matches done?"\n Format  "How many rounds?"\n Scoring  "How are points calculated?"\n Maps  "What maps are playing?"\n Teams  "How many squads?"\n Sharing  "How to share?"\n Streaming  "How to set up OBS?"\n\nJust ask naturally!`;
  }

  if (q.match(/status|live|draft|complet/)) {
    const statusMsg: Record<string, string> = {
      draft: " Draft  Click the status badge to set it Live when you start.",
      live: " LIVE  Tournament is running. Good luck!",
      completed: " Completed  Final results are locked.",
      cancelled: " Cancelled.",
    };
    return ` **Status: ${tournament.status.toUpperCase()}**\n\n${statusMsg[tournament.status] || "Unknown status."}`;
  }

  // Context-aware follow-ups
  if (recentTopics.includes("kill") && q.match(/who|name|player/)) {
    if (topKillers[0]) return `The top fragger is **${topKillers[0].playerName}** from **${topKillers[0].teamName}** with **${topKillers[0].kills} kills**.`;
  }

  if (recentTopics.includes("standing") && q.match(/second|2nd|third|3rd/)) {
    if (leaderboard.length >= 3) {
      if (q.includes("second") || q.includes("2nd")) return ` **${leaderboard[1].teamName}** is in 2nd place with **${leaderboard[1].totalPoints} points**.`;
      if (q.includes("third") || q.includes("3rd")) return ` **${leaderboard[2].teamName}** is in 3rd with **${leaderboard[2].totalPoints} points**.`;
    }
  }

  const fallbacks = [
    `I didn't quite get that. Try: **"who is winning?"**, **"top fragger?"**, or **"how many matches done?"**`,
    `Not sure about that one. Ask me about **standings**, **kills**, **format**, or **scoring**!`,
    `Hmm! Try asking: **"show standings"**, **"scoring system"**, or **"how to share?"**`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

const QUICK_PROMPTS = [
  { label: "Who's winning?", icon: Trophy },
  { label: "Top fragger?", icon: Crosshair },
  { label: "Progress?", icon: TrendingUp },
  { label: "Scoring?", icon: Sparkles },
];

export default function OpsAI({ tournament, onClose }: OpsAIProps) {
  const storageKey = `opsai_history_${tournament.id}`;

  const loadHistory = (): Message[] => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, time: new Date(m.time) }));
      }
    } catch {}
    return [{
      id: "1",
      role: "ai",
      content: `Hey! I'm **OpsAI** for **${tournament.name}**. I remember our previous conversations. Ask me anything! `,
      time: new Date(),
    }];
  };

  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveHistory = useCallback((msgs: Message[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(msgs.slice(-50)));
    } catch {}
  }, [storageKey]);

  const clearHistory = () => {
    const fresh: Message[] = [{
      id: Date.now().toString(),
      role: "ai",
      content: `Chat cleared! I'm still here for **${tournament.name}**. What do you need?`,
      time: new Date(),
    }];
    setMessages(fresh);
    saveHistory(fresh);
  };

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, time: new Date() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setThinking(true);

    setTimeout(() => {
      const response = generateResponse(msg, tournament, updated);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: response, time: new Date() };
      const final = [...updated, aiMsg];
      setMessages(final);
      saveHistory(final);
      setThinking(false);
    }, 500 + Math.random() * 400);
  };

  const formatContent = (content: string) =>
    content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/50 backdrop-blur-sm p-4">
      <div className="glass-card w-full sm:w-96 rounded-2xl border border-white/10 shadow-2xl flex flex-col" style={{ height: 580, maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/8 to-purple-500/8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">OpsAI</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-gray-500 text-xs">Memory enabled  {messages.length - 1} messages</p>
            </div>
          </div>
          <button onClick={clearHistory} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-600 hover:text-gray-300 transition-colors" title="Clear chat">
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
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "ai" ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-white/10 border border-white/15"}`}>
                {msg.role === "ai" ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "ai" ? "bg-white/6 text-gray-200 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
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
              <div className="bg-white/6 rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1.5">
                {[0, 150, 300].map(delay => (
                  <div key={delay} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 3 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map(p => {
              const Icon = p.icon;
              return (
                <button key={p.label} onClick={() => sendMessage(p.label)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-xs transition-all">
                  <Icon className="w-3 h-3" />{p.label}
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
              placeholder="Ask anything..."
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