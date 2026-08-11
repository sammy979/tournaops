"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  Medal,
  Users,
  Globe,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";

type RankType = "teams" | "players";

const MOCK_TEAMS = [
  { rank: 1,  prev: 1,  name: "Team Alpha",   tag: "ALPH", region: "NA", game: "Valorant",  wins: 28, losses: 4,  points: 2840, winRate: 88, trend: "same" },
  { rank: 2,  prev: 3,  name: "Team Nexus",   tag: "NEX",  region: "NA", game: "Valorant",  wins: 25, losses: 6,  points: 2510, winRate: 81, trend: "up"   },
  { rank: 3,  prev: 2,  name: "Team Apex",    tag: "APX",  region: "EU", game: "Valorant",  wins: 24, losses: 7,  points: 2390, winRate: 77, trend: "down" },
  { rank: 4,  prev: 4,  name: "Team Void",    tag: "VOD",  region: "NA", game: "Valorant",  wins: 22, losses: 8,  points: 2200, winRate: 73, trend: "same" },
  { rank: 5,  prev: 7,  name: "Team Storm",   tag: "STM",  region: "EU", game: "CS2",       wins: 21, losses: 9,  points: 2100, winRate: 70, trend: "up"   },
  { rank: 6,  prev: 5,  name: "Team Phantom", tag: "PHN",  region: "NA", game: "Valorant",  wins: 19, losses: 9,  points: 1940, winRate: 68, trend: "down" },
  { rank: 7,  prev: 6,  name: "Team Blaze",   tag: "BLZ",  region: "APAC",game: "CS2",      wins: 18, losses: 10, points: 1820, winRate: 64, trend: "down" },
  { rank: 8,  prev: 9,  name: "Team Nova",    tag: "NOV",  region: "EU", game: "Valorant",  wins: 17, losses: 11, points: 1730, winRate: 61, trend: "up"   },
  { rank: 9,  prev: 8,  name: "Team Surge",   tag: "SRG",  region: "NA", game: "Valorant",  wins: 16, losses: 12, points: 1620, winRate: 57, trend: "down" },
  { rank: 10, prev: 11, name: "Team Titan",   tag: "TTN",  region: "APAC",game: "RL",       wins: 15, losses: 13, points: 1510, winRate: 54, trend: "up"   },
  { rank: 11, prev: 10, name: "Team Echo",    tag: "ECH",  region: "LATAM",game:"Valorant", wins: 14, losses: 14, points: 1400, winRate: 50, trend: "down" },
  { rank: 12, prev: 12, name: "Team Frost",   tag: "FRS",  region: "EU", game: "CS2",       wins: 13, losses: 15, points: 1300, winRate: 46, trend: "same" },
];

const MOCK_PLAYERS = [
  { rank: 1,  prev: 1,  name: "ShadowX",     ign: "ShadowX#NA1",   team: "ALPH", region: "NA", role: "IGL",      pts: 3420, winRate: 88, avgACS: 264, kd: 1.58, trend: "same" },
  { rank: 2,  prev: 2,  name: "ProStrike",   ign: "ProS#NA1",      team: "NEX",  region: "NA", role: "Duelist",  pts: 3180, winRate: 81, avgACS: 251, kd: 1.44, trend: "same" },
  { rank: 3,  prev: 4,  name: "GhostRider",  ign: "Ghost#NA1",     team: "PHN",  region: "NA", role: "Entry",    pts: 2940, winRate: 77, avgACS: 248, kd: 1.39, trend: "up"   },
  { rank: 4,  prev: 3,  name: "DarkMatter",  ign: "Dark#NA1",      team: "VOD",  region: "NA", role: "IGL",      pts: 2860, winRate: 73, avgACS: 242, kd: 1.31, trend: "down" },
  { rank: 5,  prev: 6,  name: "ThunderBolt", ign: "Thunder#NA1",   team: "STM",  region: "EU", role: "Duelist",  pts: 2710, winRate: 70, avgACS: 238, kd: 1.28, trend: "up"   },
  { rank: 6,  prev: 5,  name: "StarBlast",   ign: "Star#NA1",      team: "NOV",  region: "EU", role: "Sentinel", pts: 2590, winRate: 68, avgACS: 231, kd: 1.21, trend: "down" },
  { rank: 7,  prev: 7,  name: "Inferno",     ign: "Inf#NA1",       team: "BLZ",  region: "APAC",role:"Entry",    pts: 2440, winRate: 64, avgACS: 228, kd: 1.18, trend: "same" },
  { rank: 8,  prev: 9,  name: "Colossus",    ign: "Colos#NA1",     team: "TTN",  region: "APAC",role:"Support",  pts: 2310, winRate: 61, avgACS: 219, kd: 1.09, trend: "up"   },
  { rank: 9,  prev: 8,  name: "NightOwl",    ign: "Night#NA2",     team: "ALPH", region: "NA", role: "Entry",    pts: 2280, winRate: 88, avgACS: 244, kd: 1.34, trend: "down" },
  { rank: 10, prev: 10, name: "Venom",       ign: "Venom#NA4",     team: "ALPH", region: "NA", role: "Duelist",  pts: 2190, winRate: 88, avgACS: 238, kd: 1.29, trend: "same" },
];

const REGIONS = ["All Regions","NA","EU","APAC","LATAM"];
const GAMES   = ["All Games","Valorant","CS2","Rocket League","League of Legends"];

function TrendBadge({ trend }: { trend: string }) {
  if (trend === "up")   return <TrendingUp   className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === "down") return <TrendingDown  className="w-3.5 h-3.5 text-rose-400"    />;
  return <Minus className="w-3.5 h-3.5 text-slate-700" />;
}

function RankMedal({ rank }: { rank: number }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0";
  if (rank === 1) return <div className={`${base} bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30`}><Trophy className="w-4 h-4" /></div>;
  if (rank === 2) return <div className={`${base} bg-gradient-to-br from-slate-300 to-slate-500 text-white`}><Medal className="w-4 h-4" /></div>;
  if (rank === 3) return <div className={`${base} bg-gradient-to-br from-orange-400 to-orange-600 text-white`}><Medal className="w-4 h-4" /></div>;
  return <div className={`${base} bg-white/[0.06] border border-white/[0.08] text-slate-500`}>{rank}</div>;
}

export default function RankingsPage() {
  const router  = useRouter();
  const [type,    setType]    = useState<RankType>("teams");
  const [search,  setSearch]  = useState("");
  const [region,  setRegion]  = useState("All Regions");
  const [game,    setGame]    = useState("All Games");

  const filteredTeams = MOCK_TEAMS.filter(t => {
    const q = search.toLowerCase();
    const mq = t.name.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q);
    const mr = region === "All Regions" || t.region === region;
    const mg = game   === "All Games"   || t.game.includes(game.split(" ")[0]);
    return mq && mr && mg;
  });

  const filteredPlayers = MOCK_PLAYERS.filter(p => {
    const q = search.toLowerCase();
    const mq = p.name.toLowerCase().includes(q) || p.ign.toLowerCase().includes(q);
    const mr = region === "All Regions" || p.region === region;
    return mq && mr;
  });

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-white font-black text-lg">
            Tourna<span className="text-violet-400">Ops</span>
          </button>
          <div className="flex items-center gap-3">
            <Link href="/tournaments" className="text-white/40 hover:text-white text-sm transition-colors">Tournaments</Link>
            <button onClick={() => router.push("/login")} className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Sign In</button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-white/[0.06] bg-gradient-to-br from-violet-950/30 to-[#060810]">
        <div className="max-w-6xl mx-auto px-6 py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Trophy className="w-3.5 h-3.5" /> Global Rankings
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Leaderboards</h1>
          <p className="text-white/40">Top teams and players across all TournaOps tournaments</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Type toggle */}
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 gap-1">
            <button onClick={() => setType("teams")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${type === "teams" ? "bg-violet-600 text-white" : "text-white/40 hover:text-white"}`}>
              <Users className="w-4 h-4" /> Teams
            </button>
            <button onClick={() => setType("players")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${type === "players" ? "bg-violet-600 text-white" : "text-white/40 hover:text-white"}`}>
              <Star className="w-4 h-4" /> Players
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={type === "teams" ? "Search teams…" : "Search players…"}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40" />
          </div>

          <div className="flex gap-2 ml-auto flex-wrap">
            {REGIONS.map(r => (
              <button key={r} onClick={() => setRegion(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${region === r ? "bg-violet-600 text-white" : "bg-white/[0.04] text-white/30 border border-white/[0.08] hover:text-white/60"}`}>
                {r === "All Regions" ? <Globe className="w-3.5 h-3.5" /> : r}
              </button>
            ))}
          </div>
        </div>

        {/* Team Rankings */}
        {type === "teams" && (
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto_auto] gap-3 px-5 py-3 border-b border-white/[0.06] items-center">
              {["", "Trend", "Team", "Region", "W/L", "Win%", "Pts", "Game"].map(h => (
                <span key={h} className="text-white/25 text-xs font-medium uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {filteredTeams.map((team, i) => (
              <div key={team.name}
                className={`grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto_auto] gap-3 px-5 py-4 items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer ${team.rank <= 3 ? "bg-amber-500/[0.02]" : ""}`}
                onClick={() => router.push(`/tournaments`)}>
                <RankMedal rank={team.rank} />
                <TrendBadge trend={team.trend} />
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{team.name}</p>
                  <p className="text-white/30 text-xs font-mono">[{team.tag}]</p>
                </div>
                <span className="text-white/40 text-xs px-2 py-0.5 bg-white/[0.04] rounded-full">{team.region}</span>
                <div className="text-center">
                  <span className="text-emerald-400 font-bold text-sm">{team.wins}</span>
                  <span className="text-white/20 mx-1">-</span>
                  <span className="text-rose-400 font-bold text-sm">{team.losses}</span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold ${team.winRate >= 70 ? "text-emerald-400" : team.winRate >= 55 ? "text-white" : "text-rose-400"}`}>{team.winRate}%</span>
                </div>
                <span className="text-violet-400 font-black text-sm">{team.points.toLocaleString()}</span>
                <span className="text-white/30 text-xs">{team.game}</span>
              </div>
            ))}
          </div>
        )}

        {/* Player Rankings */}
        {type === "players" && (
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto_auto] gap-3 px-5 py-3 border-b border-white/[0.06] items-center">
              {["","Trend","Player","Team","Role","Win%","ACS","Pts"].map(h => (
                <span key={h} className="text-white/25 text-xs font-medium uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {filteredPlayers.map((player) => (
              <div key={player.name}
                className={`grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto_auto] gap-3 px-5 py-4 items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer ${player.rank <= 3 ? "bg-amber-500/[0.02]" : ""}`}
                onClick={() => router.push(`/players/${player.name.toLowerCase()}`)}>
                <RankMedal rank={player.rank} />
                <TrendBadge trend={player.trend} />
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{player.name}</p>
                  <p className="text-white/30 text-xs font-mono">{player.ign}</p>
                </div>
                <span className="text-violet-400 text-xs font-bold">[{player.team}]</span>
                <span className="text-white/40 text-xs">{player.role}</span>
                <span className={`text-sm font-bold ${player.winRate >= 70 ? "text-emerald-400" : "text-white"}`}>{player.winRate}%</span>
                <span className="text-amber-400 font-bold text-sm">{player.avgACS}</span>
                <span className="text-violet-400 font-black text-sm">{player.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-white/[0.06] py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-white font-black">Tourna<span className="text-violet-400">Ops</span></span>
          <p className="text-white/20 text-sm">Rankings update after every completed tournament</p>
        </div>
      </footer>
    </div>
  );
}