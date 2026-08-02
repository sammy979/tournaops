"use client";
import { useState } from "react";
import { Check, X, Trophy } from "lucide-react";
import type { Match, Team } from "@/types/tournament";

interface Props {
  match: Match;
  editable?: boolean;
  onUpdate?: (match: Match) => void;
}

export default function MatchCard({ match, editable = false, onUpdate }: Props) {
  const [score1, setScore1] = useState(match.score1);
  const [score2, setScore2] = useState(match.score2);
  const [editing, setEditing] = useState(false);

  const threshold = Math.ceil(match.bestOf / 2);

  const setWinner = (team: Team | null | undefined) => {
    if (!team || !onUpdate) return;
    const winsNeeded = threshold;
    const s1 = team.id === match.team1?.id ? winsNeeded : 0;
    const s2 = team.id === match.team2?.id ? winsNeeded : 0;
    onUpdate({
      ...match,
      score1: s1,
      score2: s2,
      winner: team,
      isComplete: true
    });
  };

  const saveScore = () => {
    if (!onUpdate) return;
    let winner: Team | null = null;
    if (score1 > score2 && score1 >= threshold) winner = match.team1 || null;
    else if (score2 > score1 && score2 >= threshold) winner = match.team2 || null;
    
    onUpdate({
      ...match,
      score1,
      score2,
      winner,
      isComplete: winner !== null
    });
    setEditing(false);
  };

  const isWinner1 = match.winner?.id === match.team1?.id;
  const isWinner2 = match.winner?.id === match.team2?.id;

  return (
    <div className={`match-card rounded-xl p-3 min-w-[240px] ${match.isComplete ? "winner" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
          Round {match.round} · Match {match.position + 1}
        </span>
        <span className="text-[10px] text-purple-300">BO{match.bestOf}</span>
      </div>

      {/* Team 1 */}
      <div
        onClick={() => editable && !editing && setWinner(match.team1)}
        className={`flex items-center justify-between p-2.5 rounded-lg mb-1 transition-all ${
          isWinner1 ? "bg-green-500/20 border border-green-500/50" : "bg-white/5"
        } ${editable && !editing && match.team1 && match.team2 ? "cursor-pointer hover:bg-white/10" : ""}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {match.team1?.logo && (
            <img src={match.team1.logo} alt="" className="w-6 h-6 rounded object-cover" />
          )}
          <span className={`text-sm font-semibold truncate ${
            !match.team1 ? "text-purple-400/50 italic" : ""
          }`}>
            {match.team1?.name || "TBD"}
          </span>
          {isWinner1 && <Trophy className="w-3.5 h-3.5 text-green-400" />}
        </div>
        {editing ? (
          <input
            type="number"
            min={0}
            max={99}
            value={score1}
            onChange={e => setScore1(Number(e.target.value))}
            className="w-14 text-center bg-black/30 rounded px-1 py-1 text-sm font-bold"
          />
        ) : (
          <span className={`text-lg font-black min-w-[24px] text-right ${
            isWinner1 ? "text-green-400" : "text-purple-300"
          }`}>
            {match.score1}
          </span>
        )}
      </div>

      {/* Team 2 */}
      <div
        onClick={() => editable && !editing && setWinner(match.team2)}
        className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${
          isWinner2 ? "bg-green-500/20 border border-green-500/50" : "bg-white/5"
        } ${editable && !editing && match.team1 && match.team2 ? "cursor-pointer hover:bg-white/10" : ""}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {match.team2?.logo && (
            <img src={match.team2.logo} alt="" className="w-6 h-6 rounded object-cover" />
          )}
          <span className={`text-sm font-semibold truncate ${
            !match.team2 ? "text-purple-400/50 italic" : ""
          }`}>
            {match.team2?.name || "TBD"}
          </span>
          {isWinner2 && <Trophy className="w-3.5 h-3.5 text-green-400" />}
        </div>
        {editing ? (
          <input
            type="number"
            min={0}
            max={99}
            value={score2}
            onChange={e => setScore2(Number(e.target.value))}
            className="w-14 text-center bg-black/30 rounded px-1 py-1 text-sm font-bold"
          />
        ) : (
          <span className={`text-lg font-black min-w-[24px] text-right ${
            isWinner2 ? "text-green-400" : "text-purple-300"
          }`}>
            {match.score2}
          </span>
        )}
      </div>

      {/* Actions */}
      {editable && match.team1 && match.team2 && (
        <div className="mt-2 flex gap-1">
          {editing ? (
            <>
              <button onClick={saveScore} className="flex-1 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded font-bold">
                <Check className="w-3 h-3 inline" /> Save
              </button>
              <button onClick={() => { setEditing(false); setScore1(match.score1); setScore2(match.score2); }} className="flex-1 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded font-bold">
                <X className="w-3 h-3 inline" /> Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="w-full py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded font-bold">
              Edit Score
            </button>
          )}
        </div>
      )}
    </div>
  );
}