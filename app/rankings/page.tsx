"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Users,
  Globe,
  Star,
  Medal,
} from "lucide-react";

type RankType = "teams" | "players";

const BG      = "#07090f";
const SURFACE = "#0d0f18";
const REGIONS = ["All Regions", "NA", "EU", "APAC", "LATAM"];
const GAMES   = ["All Games", "Valorant", "CS2", "Rocket League", "League of Legends"];

const MOCK_TEAMS = [
  { rank:1,  prev:1,  name:"Team Alpha",   tag:"ALPH", region:"NA",   game:"Valorant",  wins:28, losses:4,  points:2840, winRate:88, trend:"same" },
  { rank:2,  prev:3,  name:"Team Nexus",   tag:"NEX",  region:"NA",   game:"Valorant",  wins:25, losses:6,  points:2510, winRate:81, trend:"up"   },
  { rank:3,  prev:2,  name:"Team Apex",    tag:"APX",  region:"EU",   game:"Valorant",  wins:24, losses:7,  points:2390, winRate:77, trend:"down" },
  { rank:4,  prev:4,  name:"Team Void",    tag:"VOD",  region:"NA",   game:"Valorant",  wins:22, losses:8,  points:2200, winRate:73, trend:"same" },
  { rank:5,  prev:7,  name:"Team Storm",   tag:"STM",  region:"EU",   game:"CS2",       wins:21, losses:9,  points:2100, winRate:70, trend:"up"   },
  { rank:6,  prev:5,  name:"Team Phantom", tag:"PHN",  region:"NA",   game:"Valorant",  wins:19, losses:9,  points:1940, winRate:68, trend:"down" },
  { rank:7,  prev:6,  name:"Team Blaze",   tag:"BLZ",  region:"APAC", game:"CS2",       wins:18, losses:10, points:1820, winRate:64, trend:"down" },
  { rank:8,  prev:9,  name:"Team Nova",    tag:"NOV",  region:"EU",   game:"Valorant",  wins:17, losses:11, points:1730, winRate:61, trend:"up"   },
  { rank:9,  prev:8,  name:"Team Surge",   tag:"SRG",  region:"NA",   game:"Valorant",  wins:16, losses:12, points:1620, winRate:57, trend:"down" },
  { rank:10, prev:11, name:"Team Titan",   tag:"TTN",  region:"APAC", game:"RL",        wins:15, losses:13, points:1510, winRate:54, trend:"up"   },
  { rank:11, prev:10, name:"Team Echo",    tag:"ECH",  region:"LATAM",game:"Valorant",  wins:14, losses:14, points:1400, winRate:50, trend:"down" },
  { rank:12, prev:12, name:"Team Frost",   tag:"FRS",  region:"EU",   game:"CS2",       wins:13, losses:15, points:1300, winRate:46, trend:"same" },
];

const MOCK_PLAYERS = [
  { rank:1,  prev:1,  name:"ShadowX",     ign:"ShadowX#NA1",   team:"ALPH", region:"NA",   role:"IGL",      pts:3420, winRate:88, avgACS:264, kd:1.58, trend:"same" },
  { rank:2,  prev:2,  name:"ProStrike",   ign:"ProS#NA1",      team:"NEX",  region:"NA",   role:"Duelist",  pts:3180, winRate:81, avgACS:251, kd:1.44, trend:"same" },
  { rank:3,  prev:4,  name:"GhostRider",  ign:"Ghost#NA1",     team:"PHN",  region:"NA",   role:"Entry",    pts:2940, winRate:77, avgACS:248, kd:1.39, trend:"up"   },
  { rank:4,  prev:3,  name:"DarkMatter",  ign:"Dark#NA1",      team:"VOD",  region:"NA",   role:"IGL",      pts:2860, winRate:73, avgACS:242, kd:1.31, trend:"down" },
  { rank:5,  prev:6,  name:"ThunderBolt", ign:"Thunder#NA1",   team:"STM",  region:"EU",   role:"Duelist",  pts:2710, winRate:70, avgACS:238, kd:1.28, trend:"up"   },
  { rank:6,  prev:5,  name:"StarBlast",   ign:"Star#NA1",      team:"NOV",  region:"EU",   role:"Sentinel", pts:2590, winRate:68, avgACS:231, kd:1.21, trend:"down" },
  { rank:7,  prev:7,  name:"Inferno",     ign:"Inf#NA1",       team:"BLZ",  region:"APAC", role:"Entry",    pts:2440, winRate:64, avgACS:228, kd:1.18, trend:"same" },
  { rank:8,  prev:9,  name:"Colossus",    ign:"Colos#NA1",     team:"TTN",  region:"APAC", role:"Support",  pts:2310, winRate:61, avgACS:219, kd:1.09, trend:"up"   },
  { rank:9,  prev:8,  name:"NightOwl",    ign:"Night#NA2",     team:"ALPH", region:"NA",   role:"Entry",    pts:2280, winRate:88, avgACS:244, kd:1.34, trend:"down" },
  { rank:10, prev:10, name:"Venom",       ign:"Venom#NA4",     team:"ALPH", region:"NA",   role:"Duelist",  pts:2190, winRate:88, avgACS:238, kd:1.29, trend:"same" },
];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up")   return <TrendingUp   className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === "down") return <TrendingDown  className="w-3.5 h-3.5 text-rose-400"    />;
  return <Minus className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />;
}

function RankMedal({ rank }: { rank: number }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0";
  if (rank === 1) return <div className={`${base} text-white shadow-lg shadow-amber-500/30`} style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}><Trophy className="w-4 h-4" /></div>;
  if (rank === 2) return <div className={`${base} text-white`}          style={{ background: "linear-gradient(135deg,#cbd5e1,#94a3b8)" }}><Medal className="w-4 h-4" /></div>;
  if (rank === 3) return <div className={`${base} text-white`}          style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)" }}><Medal className="w-4 h-4" /></div>;
  return <div className={`${base}`} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>{rank}</div>;
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  borderRadius: "12px",
  padding: "8px 16px 8px 36px",
  fontSize: "14px",
  outline: "none",
  width: "100%",
};

export default function RankingsPage() {
  const router  = useRouter();
  const [type,   setType]   = useState<RankType>("teams");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [game,   setGame]   = useState("All Games");

  const filteredTeams = MOCK_TEAMS.filter(t => {
    const q  = search.toLowerCase();
    const mq = t.name.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q);
    const mr = region === "All Regions" || t.region === region;
    const mg = game   === "All Games"   || t.game.startsWith(game.split(" ")[0]);
    return mq && mr && mg;
  });

  const filteredPlayers = MOCK_PLAYERS.filter(p => {
    const q  = search.toLowerCase();
    const mq = p.name.toLowerCase().includes(q) || p.ign.toLowerCase().includes(q);
    const mr = region === "All Regions" || p.region === region;
    return mq && mr;
  });

  const pillBase: React.CSSProperties = {
    padding: "6px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.4)",
    transition: "all .15s",
  };

  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: "#7C3AED",
    borderColor: "#7C3AED",
    color: "#fff",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, color: "#fff" }}>
      <PublicNav />

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(to bottom, rgba(124,58,237,0.08), transparent)" }}>
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>
            <Trophy className="w-3.5 h-3.5" /> Global Rankings
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Leaderboards</h1>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>
            Top teams and players across all TournaOps tournaments
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex-1">

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Type toggle */}
          <div className="flex p-1 rounded-xl gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {([["teams","Teams"],["players","Players"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setType(v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={type === v
                  ? { background: "#7C3AED", color: "#fff" }
                  : { background: "transparent", color: "rgba(255,255,255,0.4)" }}>
                {v === "teams" ? <Users className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                {l}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={type === "teams" ? "Search teams…" : "Search players…"}
              style={inputStyle}
            />
          </div>

          {/* Region pills */}
          <div className="flex gap-2 flex-wrap ml-auto">
            {REGIONS.map(r => (
              <button key={r} onClick={() => setRegion(r)} style={region === r ? pillActive : pillBase}>
                {r === "All Regions" ? <Globe className="w-3 h-3 inline mr-1" /> : null}
                {r === "All Regions" ? "All" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Team table */}
        {type === "teams" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Header */}
            <div className="grid gap-3 px-5 py-3" style={{ gridTemplateColumns: "auto auto 1fr auto auto auto auto auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["","","Team","Region","W / L","Win %","Pts","Game"].map(h => (
                <span key={h} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.25)" }}>{h}</span>
              ))}
            </div>

            {filteredTeams.length === 0 && (
              <div className="py-16 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>No teams match your filters.</div>
            )}

            {filteredTeams.map((team, i) => (
              <div key={team.name}
                className="grid gap-3 px-5 py-4 items-center transition-colors cursor-pointer"
                style={{
                  gridTemplateColumns: "auto auto 1fr auto auto auto auto auto",
                  borderBottom: i < filteredTeams.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: team.rank <= 3 ? "rgba(245,158,11,0.02)" : "transparent",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = team.rank <= 3 ? "rgba(245,158,11,0.02)" : "transparent")}
                onClick={() => router.push("/tournaments")}>
                <RankMedal rank={team.rank} />
                <TrendIcon trend={team.trend} />
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{team.name}</p>
                  <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>[{team.tag}]</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>{team.region}</span>
                <div className="text-center">
                  <span className="font-bold text-sm text-emerald-400">{team.wins}</span>
                  <span className="mx-1" style={{ color: "rgba(255,255,255,0.2)" }}>-</span>
                  <span className="font-bold text-sm text-rose-400">{team.losses}</span>
                </div>
                <span className={`text-sm font-bold ${team.winRate >= 70 ? "text-emerald-400" : team.winRate >= 55 ? "text-white" : "text-rose-400"}`}>{team.winRate}%</span>
                <span className="font-black text-sm text-violet-400">{team.points.toLocaleString()}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{team.game}</span>
              </div>
            ))}
          </div>
        )}

        {/* Player table */}
        {type === "players" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid gap-3 px-5 py-3" style={{ gridTemplateColumns: "auto auto 1fr auto auto auto auto auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["","","Player","Team","Role","Win%","ACS","Pts"].map(h => (
                <span key={h} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.25)" }}>{h}</span>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="py-16 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>No players match your filters.</div>
            )}

            {filteredPlayers.map((player, i) => (
              <div key={player.name}
                className="grid gap-3 px-5 py-4 items-center transition-colors cursor-pointer"
                style={{
                  gridTemplateColumns: "auto auto 1fr auto auto auto auto auto",
                  borderBottom: i < filteredPlayers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: player.rank <= 3 ? "rgba(245,158,11,0.02)" : "transparent",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = player.rank <= 3 ? "rgba(245,158,11,0.02)" : "transparent")}
                onClick={() => router.push(`/players/${player.name.toLowerCase()}`)}>
                <RankMedal rank={player.rank} />
                <TrendIcon trend={player.trend} />
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{player.name}</p>
                  <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{player.ign}</p>
                </div>
                <span className="font-bold text-xs text-violet-400">[{player.team}]</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{player.role}</span>
                <span className={`font-bold text-sm ${player.winRate >= 70 ? "text-emerald-400" : "text-white"}`}>{player.winRate}%</span>
                <span className="font-bold text-sm text-amber-400">{player.avgACS}</span>
                <span className="font-black text-sm text-violet-400">{player.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
          Rankings update after every completed tournament · Last updated: just now
        </p>
      </div>

      <PublicFooter />
    </div>
  );
}