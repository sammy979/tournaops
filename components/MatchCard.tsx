"use client";
import { useState } from "react";
import { Check, X, Trophy, Zap } from "lucide-react";
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
    <div className={`match-card rounded-2xl p-3 min-w-[260px] relative overflow-hidden ${match.isComplete ? "winner" : ""}`}>
      {/* Match header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
            R{match.round} · M{match.position + 1}
          </span>
        </div>
        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
          BO{match.bestOf}
        </span>
      </div>

      {/* Team 1 */}
      <div
        onClick={() => editable && !editing && setWinner(match.team1)}
        className={`flex items-center justify-between p-3 rounded-xl mb-2 transition-all duration-300 ${
          isWinner1 
            ? "bg-gradient-to-r from-green-500/30 to-emerald-500/20 border border-green-500/60 shadow-lg shadow-green-500/30" 
            : match.team1 && match.team2 && editable && !editing
              ? "bg-white/5 hover:bg-purple-500/20 cursor-pointer border border-transparent hover:border-purple-500/50"
              : "bg-white/5 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {match.team1?.logo ? (
            <img src={match.team1.logo} alt="" className="w-8 h-8 rounded-lg object-cover border border-purple-500/30" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center text-xs font-black text-purple-300">
              {match.team1?.seed || "?"}
            </div>
          )}
          <span className={`text-sm font-bold truncate ${
            !match.team1 ? "text-purple-400/50 italic" : isWinner1 ? "text-white" : "text-purple-100"
          }`}>
            {match.team1?.name || "TBD"}
          </span>
          {isWinner1 && (
            <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0 animate-pulse" fill="currentColor" />
          )}
        </div>
        {editing ? (
          <input
            type="number"
            min={0}
            max={99}
            value={score1}
            onChange={e => setScore1(Number(e.target.value))}
            className="w-14 text-center bg-black/50 rounded-lg px-2 py-1 text-sm font-black border border-cyan-500/50"
          />
        ) : (
          <div className={`text-2xl font-display font-black min-w-[32px] text-right ${
            isWinner1 ? "text-green-400" : "text-purple-300/60"
          }`}>
            {match.score1}
          </div>
        )}
      </div>

      {/* VS divider */}
      <div className="text-center py-1 mb-2 relative">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        <span className="relative bg-gradient-to-br from-purple-900 to-black px-3 text-[9px] font-black text-purple-400 tracking-widest">VS</span>
      </div>

      {/* Team 2 */}
      <div
        onClick={() => editable && !editing && setWinner(match.team2)}
        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
          isWinner2 
            ? "bg-gradient-to-r from-green-500/30 to-emerald-500/20 border border-green-500/60 shadow-lg shadow-green-500/30" 
            : match.team1 && match.team2 && editable && !editing
              ? "bg-white/5 hover:bg-purple-500/20 cursor-pointer border border-transparent hover:border-purple-500/50"
              : "bg-white/5 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {match.team2?.logo ? (
            <img src={match.team2.logo} alt="" className="w-8 h-8 rounded-lg object-cover border border-purple-500/30" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/30 flex items-center justify-center text-xs font-black text-cyan-300">
              {match.team2?.seed || "?"}
            </div>
          )}
          <span className={`text-sm font-bold truncate ${
            !match.team2 ? "text-purple-400/50 italic" : isWinner2 ? "text-white" : "text-purple-100"
          }`}>
            {match.team2?.name || "TBD"}
          </span>
          {isWinner2 && (
            <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0 animate-pulse" fill="currentColor" />
          )}
        </div>
        {editing ? (
          <input
            type="number"
            min={0}
            max={99}
            value={score2}
            onChange={e => setScore2(Number(e.target.value))}
            className="w-14 text-center bg-black/50 rounded-lg px-2 py-1 text-sm font-black border border-cyan-500/50"
          />
        ) : (
          <div className={`text-2xl font-display font-black min-w-[32px] text-right ${
            isWinner2 ? "text-green-400" : "text-purple-300/60"
          }`}>
            {match.score2}
          </div>
        )}
      </div>

      {/* Actions */}
      {editable && match.team1 && match.team2 && (
        <div className="mt-3 flex gap-1.5">
          {editing ? (
            <>
              <button 
                onClick={saveScore} 
                className="flex-1 py-2 text-xs bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/50 hover:to-emerald-500/50 text-green-400 rounded-lg font-black border border-green-500/50 transition-all"
              >
                <Check className="w-3.5 h-3.5 inline mr-1" strokeWidth={3} /> SAVE
              </button>
              <button 
                onClick={() => { setEditing(false); setScore1(match.score1); setScore2(match.score2); }} 
                className="flex-1 py-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-black border border-red-500/50 transition-all"
              >
                <X className="w-3.5 h-3.5 inline mr-1" strokeWidth={3} /> CANCEL
              </button>
            </>
          ) : (
            <button 
              onClick={() => setEditing(true)} 
              className="w-full py-2 text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 text-purple-300 hover:text-white rounded-lg font-black border border-purple-500/30 hover:border-purple-500/50 transition-all inline-flex items-center justify-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" strokeWidth={3} /> EDIT SCORE
            </button>
          )}
        </div>
      )}
    </div>
  );
}