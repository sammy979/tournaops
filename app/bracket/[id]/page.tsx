"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowLeft,
  Trophy,
  Zap,
  CheckCircle2,
  Circle,
  RotateCcw,
  Share2,
  Download,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type MatchStatus = "completed" | "live" | "upcoming" | "bye";

interface BracketTeam {
  name:  string;
  tag:   string;
  score?: number;
  seed?: number;
}

interface BracketMatch {
  id:      string;
  round:   number;
  position:number;
  team1:   BracketTeam;
  team2:   BracketTeam;
  status:  MatchStatus;
  winner?: string;
  bestOf:  number;
}

interface BracketRound {
  name:    string;
  matches: BracketMatch[];
}

// ─── Mock Bracket Data ────────────────────────────────────────────────────────
const BRACKET: BracketRound[] = [
  {
    name: "Quarterfinals",
    matches: [
      { id: "qf1", round: 1, position: 1, team1: { name: "Team Alpha",   tag: "ALPH", score: 2, seed: 1 }, team2: { name: "Team Titan",   tag: "TTN",  score: 0, seed: 8 }, status: "completed", winner: "Team Alpha",   bestOf: 3 },
      { id: "qf2", round: 1, position: 2, team1: { name: "Team Nexus",   tag: "NEX",  score: 2, seed: 2 }, team2: { name: "Team Blaze",   tag: "BLZ",  score: 1, seed: 7 }, status: "completed", winner: "Team Nexus",   bestOf: 3 },
      { id: "qf3", round: 1, position: 3, team1: { name: "Team Void",    tag: "VOD",  score: 2, seed: 3 }, team2: { name: "Team Phantom", tag: "PHN",  score: 1, seed: 6 }, status: "completed", winner: "Team Void",    bestOf: 3 },
      { id: "qf4", round: 1, position: 4, team1: { name: "Team Storm",   tag: "STM",          seed: 4 }, team2: { name: "Team Nova",    tag: "NOV",          seed: 5 }, status: "live",                              bestOf: 3 },
    ],
  },
  {
    name: "Semifinals",
    matches: [
      { id: "sf1", round: 2, position: 1, team1: { name: "Team Alpha",   tag: "ALPH", seed: 1 }, team2: { name: "Team Nexus",   tag: "NEX",  seed: 2 }, status: "live",     bestOf: 5 },
      { id: "sf2", round: 2, position: 2, team1: { name: "Team Void",    tag: "VOD",  seed: 3 }, team2: { name: "TBD",          tag: "TBD"           }, status: "upcoming", bestOf: 5 },
    ],
  },
  {
    name: "Grand Finals",
    matches: [
      { id: "gf1", round: 3, position: 1, team1: { name: "TBD", tag: "TBD" }, team2: { name: "TBD", tag: "TBD" }, status: "upcoming", bestOf: 7 },
    ],
  },
];

// ─── Match Card ───────────────────────────────────────────────────────────────
function BracketMatchCard({ match }: { match: BracketMatch }) {
  const isLive  = match.status === "live";
  const isDone  = match.status === "completed";
  const isUpcoming = match.status === "upcoming";

  const Team = ({ team, isWinner }: { team: BracketTeam; isWinner: boolean }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
      isDone && isWinner  ? "bg-violet-500/20 border border-violet-500/30" :
      isDone && !isWinner ? "opacity-50" :
      isLive              ? "bg-white/[0.04]" :
      "bg-transparent"
    }`}>
      {team.seed !== undefined && (
        <span className="text-white/20 text-xs w-4 text-center font-bold flex-shrink-0">{team.seed}</span>
      )}
      <span className={`text-xs font-bold flex-1 truncate ${
        isDone && isWinner  ? "text-violet-300" :
        team.name === "TBD" ? "text-white/20" :
        "text-white"
      }`}>
        {team.name}
      </span>
      {team.score !== undefined && (
        <span className={`text-sm font-black w-5 text-center ${isWinner ? "text-white" : "text-white/30"}`}>
          {team.score}
        </span>
      )}
      {isDone && isWinner && (
        <CheckCircle2 className="w-3 h-3 text-violet-400 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div className={`w-52 rounded-xl border overflow-hidden transition-all ${
      isLive    ? "border-amber-500/40 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10" :
      isDone    ? "border-white/[0.08]" :
      "border-white/[0.05] opacity-60"
    } bg-[#0f1117]`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b ${
        isLive ? "border-amber-500/20 bg-amber-500/10" :
        isDone ? "border-white/[0.06] bg-white/[0.02]" :
        "border-white/[0.04]"
      }`}>
        <span className="text-white/30 text-xs font-mono">Bo{match.bestOf}</span>
        {isLive && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-xs font-bold">LIVE</span>
          </div>
        )}
        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
        {isUpcoming && <Circle className="w-3 h-3 text-white/20" />}
      </div>

      {/* Teams */}
      <div className="p-1.5 space-y-1">
        <Team team={match.team1} isWinner={match.winner === match.team1.name} />
        <div className="flex items-center gap-2 px-3">
          <div className="flex-1 h-px bg-white/[0.04]" />
          <span className="text-white/15 text-xs">vs</span>
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>
        <Team team={match.team2} isWinner={match.winner === match.team2.name} />
      </div>
    </div>
  );
}

// ─── Connector Lines (CSS-based) ──────────────────────────────────────────────
function ConnectorLine({ fromTop, toTop, x }: { fromTop: number; toTop: number; x: number }) {
  const midY = (fromTop + toTop) / 2;
  return (
    <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <path
        d={`M ${x} ${fromTop} L ${x + 40} ${fromTop} L ${x + 40} ${midY} L ${x + 80} ${midY} L ${x + 80} ${toTop} L ${x + 120} ${toTop}`}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"
      />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BracketPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [zoom,  setZoom]  = useState(1);
  const [panX,  setPanX]  = useState(0);
  const [panY,  setPanY]  = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const CARD_W   = 208;
  const CARD_H   = 110;
  const COL_GAP  = 120;
  const ROW_GAP  = 32;

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPanX(dragStart.current.panX + (e.clientX - dragStart.current.x));
    setPanY(dragStart.current.panY + (e.clientY - dragStart.current.y));
  };
  const handleMouseUp = () => setDragging(false);

  const maxMatchesInRound = Math.max(...BRACKET.map(r => r.matches.length));
  const totalHeight = maxMatchesInRound * (CARD_H + ROW_GAP);

  return (
    <div className="min-h-screen bg-[#060810] text-white flex flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-white/[0.06] bg-[#060810]/95 backdrop-blur-xl">
        <div className="max-w-full px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="h-5 w-px bg-white/[0.08]" />
            <div>
              <span className="text-white font-bold text-sm">Champions Circuit Season 4</span>
              <span className="text-white/30 text-xs ml-2">· Bracket View</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Legend */}
            <div className="hidden md:flex items-center gap-4 mr-4 text-xs text-white/30">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500/40 border border-violet-500/40" /> Winner</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-500/30" /> Live</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-white/[0.05] border border-white/[0.08]" /> Upcoming</span>
            </div>

            <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
              className="w-8 h-8 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] rounded-lg flex items-center justify-center transition-colors">
              <ZoomIn className="w-4 h-4 text-white/60" />
            </button>
            <div className="w-12 text-center text-white/40 text-xs font-mono">{Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))}
              className="w-8 h-8 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] rounded-lg flex items-center justify-center transition-colors">
              <ZoomOut className="w-4 h-4 text-white/60" />
            </button>
            <button onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}
              className="w-8 h-8 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] rounded-lg flex items-center justify-center transition-colors ml-1">
              <RotateCcw className="w-4 h-4 text-white/60" />
            </button>
            <button className="w-8 h-8 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] rounded-lg flex items-center justify-center transition-colors">
              <Share2 className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Bracket Canvas */}
      <div
        className={`flex-1 overflow-hidden relative ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background grid */}
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* Bracket layout */}
        <div
          className="absolute"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: "top left",
            top: 48, left: 60,
            userSelect: "none",
          }}
        >
          <div className="flex items-start gap-0">
            {BRACKET.map((round, roundIdx) => {
              const colX = roundIdx * (CARD_W + COL_GAP);
              const matchesInRound = round.matches.length;
              const totalSlots = maxMatchesInRound;
              const slotH = totalSlots > 1 ? totalHeight / totalSlots : CARD_H + ROW_GAP;

              return (
                <div key={round.name} className="flex flex-col" style={{ width: CARD_W + COL_GAP }}>
                  {/* Round label */}
                  <div className="mb-6 flex items-center gap-2">
                    <span className="text-white/50 text-sm font-bold">{round.name}</span>
                    <span className="text-white/20 text-xs">{round.matches.length} match{round.matches.length !== 1 ? "es" : ""}</span>
                  </div>

                  {/* Matches */}
                  <div className="relative flex flex-col" style={{ height: totalHeight }}>
                    {round.matches.map((match, matchIdx) => {
                      const slotsPerMatch = totalSlots / matchesInRound;
                      const topOffset    = matchIdx * slotsPerMatch * slotH + (slotsPerMatch * slotH - CARD_H) / 2;
                      return (
                        <div key={match.id} className="absolute" style={{ top: topOffset, left: 0 }}>
                          <BracketMatchCard match={match} />
                          {/* Connector to next round */}
                          {roundIdx < BRACKET.length - 1 && (
                            <div className="absolute" style={{ top: CARD_H / 2, left: CARD_W }}>
                              <div className="w-[120px] h-px bg-white/[0.08]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Champion placeholder */}
            <div className="flex flex-col ml-4">
              <div className="mb-6">
                <span className="text-amber-400/60 text-sm font-bold">Champion</span>
              </div>
              <div className="flex items-center justify-center mt-8">
                <div className="w-52 border-2 border-dashed border-amber-500/20 rounded-xl p-6 text-center bg-amber-500/[0.03]">
                  <Trophy className="w-8 h-8 text-amber-400/30 mx-auto mb-2" />
                  <p className="text-amber-400/30 text-sm font-bold">TBD</p>
                  <p className="text-white/20 text-xs mt-1">Season 4 Champion</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs font-medium bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full pointer-events-none">
          Drag to pan · Scroll to zoom · Use buttons to reset
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#060810]/95 backdrop-blur-xl">
        <div className="max-w-full px-6 h-12 flex items-center gap-6">
          {[
            { icon: CheckCircle2, label: "Completed", value: BRACKET.flatMap(r => r.matches).filter(m => m.status === "completed").length, color: "text-emerald-400" },
            { icon: Zap,          label: "Live",       value: BRACKET.flatMap(r => r.matches).filter(m => m.status === "live").length,      color: "text-amber-400"  },
            { icon: Circle,       label: "Upcoming",   value: BRACKET.flatMap(r => r.matches).filter(m => m.status === "upcoming").length,  color: "text-white/30"   },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className={`font-bold text-sm ${stat.color}`}>{stat.value}</span>
              <span className="text-white/25 text-xs">{stat.label}</span>
            </div>
          ))}
          <div className="ml-auto text-white/20 text-xs">Valorant · Double Elimination · NA</div>
        </div>
      </div>
    </div>
  );
}