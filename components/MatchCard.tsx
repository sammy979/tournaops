"use client";
import { useState } from "react";
import { Check, X, Trophy, Zap } from "lucide-react";
import type { BracketMatch, BracketTeam } from "@/types/tournament";

interface Props {
  match: BracketMatch;
  editable?: boolean;
  onUpdate?: (match: BracketMatch) => void;
}

export default function MatchCard({ match, editable = false, onUpdate }: Props) {
  const [score1, setScore1] = useState<number>(match.score1 ?? 0);
  const [score2, setScore2] = useState<number>(match.score2 ?? 0);
  const [editing, setEditing] = useState(false);

  const bestOf = match.bestOf ?? 1;
  const threshold = Math.ceil(bestOf / 2);

  const setWinner = (team: BracketTeam | null | undefined) => {
    if (!team || !onUpdate) return;
    const s1 = team.id === match.team1?.id ? threshold : 0;
    const s2 = team.id === match.team2?.id ? threshold : 0;
    onUpdate({ ...match, score1: s1, score2: s2, winner: team, isComplete: true });
  };

  const saveScore = () => {
    if (!onUpdate) return;
    let winner: BracketTeam | null = null;
    if (score1 > score2 && score1 >= threshold) winner = match.team1 ?? null;
    else if (score2 > score1 && score2 >= threshold) winner = match.team2 ?? null;
    onUpdate({ ...match, score1, score2, winner, isComplete: winner !== null });
    setEditing(false);
  };

  const isWinner1 = match.winner?.id === match.team1?.id;
  const isWinner2 = match.winner?.id === match.team2?.id;

  return (
    <div className={"rounded-2xl p-3 min-w-[260px] relative border " + (match.isComplete ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/5")}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
          R{match.round} M{match.position + 1}
        </span>
        <span className="text-[10px] font-bold text-purple-300 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/30">
          BO{bestOf}
        </span>
      </div>

      {/* Team 1 */}
      <div
        onClick={() => editable && !editing && setWinner(match.team1)}
        className={"flex items-center justify-between p-3 rounded-xl mb-2 transition-all " + (isWinner1 ? "bg-green-500/20 border border-green-500/40" : editable && match.team1 && match.team2 ? "bg-white/5 hover:bg-yellow-500/20 cursor-pointer border border-transparent" : "bg-white/5 border border-transparent")}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-xs font-bold text-purple-300">
            {match.team1?.seed ?? "?"}
          </div>
          <span className={"text-sm font-bold truncate " + (isWinner1 ? "text-white" : "text-purple-100")}>
            {match.team1?.name ?? "TBD"}
          </span>
          {isWinner1 && <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" />}
        </div>
        {editing ? (
          <input type="number" min={0} max={99} value={score1}
            onChange={e => setScore1(Number(e.target.value))}
            className="w-14 text-center bg-black/50 rounded-lg px-2 py-1 text-sm font-bold border border-cyan-500/50"
          />
        ) : (
          <div className={"text-2xl font-bold min-w-[32px] text-right " + (isWinner1 ? "text-green-400" : "text-purple-300/60")}>
            {match.score1 ?? 0}
          </div>
        )}
      </div>

      <div className="text-center py-1 mb-2">
        <span className="text-[9px] font-bold text-yellow-500 tracking-widest">VS</span>
      </div>

      {/* Team 2 */}
      <div
        onClick={() => editable && !editing && setWinner(match.team2)}
        className={"flex items-center justify-between p-3 rounded-xl transition-all " + (isWinner2 ? "bg-green-500/20 border border-green-500/40" : editable && match.team1 && match.team2 ? "bg-white/5 hover:bg-yellow-500/20 cursor-pointer border border-transparent" : "bg-white/5 border border-transparent")}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300">
            {match.team2?.seed ?? "?"}
          </div>
          <span className={"text-sm font-bold truncate " + (isWinner2 ? "text-white" : "text-purple-100")}>
            {match.team2?.name ?? "TBD"}
          </span>
          {isWinner2 && <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" />}
        </div>
        {editing ? (
          <input type="number" min={0} max={99} value={score2}
            onChange={e => setScore2(Number(e.target.value))}
            className="w-14 text-center bg-black/50 rounded-lg px-2 py-1 text-sm font-bold border border-cyan-500/50"
          />
        ) : (
          <div className={"text-2xl font-bold min-w-[32px] text-right " + (isWinner2 ? "text-green-400" : "text-purple-300/60")}>
            {match.score2 ?? 0}
          </div>
        )}
      </div>

      {editable && match.team1 && match.team2 && (
        <div className="mt-3 flex gap-1.5">
          {editing ? (
            <>
              <button onClick={saveScore} className="flex-1 py-2 text-xs bg-green-500/20 text-green-400 rounded-lg font-bold border border-green-500/50 hover:bg-green-500/30 transition-all">
                <Check className="w-3.5 h-3.5 inline mr-1" /> SAVE
              </button>
              <button onClick={() => { setEditing(false); setScore1(match.score1 ?? 0); setScore2(match.score2 ?? 0); }}
                className="flex-1 py-2 text-xs bg-red-500/20 text-red-400 rounded-lg font-bold border border-red-500/50 transition-all">
                <X className="w-3.5 h-3.5 inline mr-1" /> CANCEL
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="w-full py-2 text-xs bg-yellow-500/20 text-purple-300 hover:text-white rounded-lg font-bold border border-yellow-500/30 transition-all inline-flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5" /> EDIT SCORE
            </button>
          )}
        </div>
      )}
    </div>
  );
}