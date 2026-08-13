"use client";
import type { BracketMatch } from "@/types/tournament";

interface BracketTreeProps {
  matches: BracketMatch[];
  editable?: boolean;
  onUpdate?: (match: BracketMatch) => void;
}

export default function BracketTree({ matches }: BracketTreeProps) {
  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);

  return (
    <div className="flex gap-8 overflow-x-auto p-4">
      {rounds.map(round => {
        const roundMatches = matches
          .filter(m => m.round === round)
          .sort((a, b) => a.position - b.position);

        return (
          <div key={round} className="flex flex-col gap-4 min-w-[240px]">
            <h3 className="text-center text-sm font-bold text-yellow-300 uppercase tracking-widest mb-2">
              Round {round}
            </h3>
            {roundMatches.map(match => (
              <div
                key={match.id}
                className={"rounded-xl border p-3 " + (match.isComplete ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/5")}
              >
                <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">
                  Match {match.position + 1} &bull; BO{match.bestOf}
                </div>
                <div className={"flex items-center justify-between p-2 rounded-lg mb-1 " + (match.winner?.id === match.team1?.id ? "bg-green-500/20" : "bg-white/5")}>
                  <span className="text-sm font-medium text-white truncate">
                    {match.team1?.name ?? "TBD"}
                  </span>
                  <span className={"text-sm font-bold " + (match.winner?.id === match.team1?.id ? "text-green-400" : "text-gray-400")}>
                    {match.score1}
                  </span>
                </div>
                <div className={"flex items-center justify-between p-2 rounded-lg " + (match.winner?.id === match.team2?.id ? "bg-green-500/20" : "bg-white/5")}>
                  <span className="text-sm font-medium text-white truncate">
                    {match.team2?.name ?? "TBD"}
                  </span>
                  <span className={"text-sm font-bold " + (match.winner?.id === match.team2?.id ? "text-green-400" : "text-gray-400")}>
                    {match.score2}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
