"use client";
import { useMemo } from "react";
import MatchCard from "./MatchCard";
import type { Match } from "@/types/tournament";

interface Props {
  matches: Match[];
  editable?: boolean;
  onUpdate?: (m: Match) => void;
}

export default function BracketTree({ matches, editable, onUpdate }: Props) {
  const rounds = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    matches.filter(m => m.bracket === "winners" || !m.bracket).forEach(m => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return Object.entries(grouped).map(([r, ms]) => ({
      round: Number(r),
      matches: ms.sort((a, b) => a.position - b.position)
    })).sort((a, b) => a.round - b.round);
  }, [matches]);

  const maxRound = rounds.length;

  return (
    <div className="overflow-x-auto pb-8">
      <div className="flex gap-8 min-w-max p-4">
        {rounds.map((r, idx) => (
          <div key={r.round} className="flex flex-col">
            <div className="text-center mb-4">
              <div className="inline-block px-4 py-1 rounded-full bg-purple-500/20 border border-purple-500/40">
                <span className="text-xs font-black uppercase tracking-widest text-purple-300">
                  {r.round === maxRound ? " Final" : 
                   r.round === maxRound - 1 ? "Semifinal" :
                   r.round === maxRound - 2 ? "Quarterfinal" :
                   `Round ${r.round}`}
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-around flex-1" style={{
              minHeight: `${Math.pow(2, idx) * 100}px`,
              gap: `${Math.pow(2, idx) * 20}px`
            }}>
              {r.matches.map(match => (
                <div key={match.id} className="relative">
                  <MatchCard match={match} editable={editable} onUpdate={onUpdate} />
                  {idx < rounds.length - 1 && (
                    <svg className="absolute left-full top-1/2 w-8 h-16 -translate-y-1/2 pointer-events-none" viewBox="0 0 40 80">
                      <path d="M 0 40 L 40 40" className="bracket-line" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}