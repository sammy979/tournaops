"use client";

import { X, Trophy, Crown, Star, Sparkles, Zap, Info } from "lucide-react";

interface CalculationDetailsProps {
  teamName: string;
  matches: Array<{
    matchId: string;
    matchName: string;
    map: string;
    placement: number;
    kills: number;
    placementPoints: number;
    killPoints: number;
    wwcdBonus?: number;
    top3Bonus?: number;
    compensationPoints?: number;
    penaltyPoints?: number;
    totalPoints: number;
    compensationReason?: string;
    penaltyReason?: string;
  }>;
  grandTotal: number;
  onClose: () => void;
}

export default function CalculationDetails({ teamName, matches, grandTotal, onClose }: CalculationDetailsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-2xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              Calculation Details
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              <strong className="text-white">{teamName}</strong>  Transparent scoring breakdown
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {matches.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No match data yet</div>
          ) : (
            matches.map((m, idx) => {
              const hasBonus = (m.wwcdBonus || 0) + (m.top3Bonus || 0) > 0;
              const hasComp = (m.compensationPoints || 0) > 0;
              const hasPenalty = (m.penaltyPoints || 0) > 0;

              return (
                <div key={m.matchId} className={`glass-card rounded-xl p-4 border ${
                  m.placement === 1 ? "border-yellow-500/20 bg-yellow-500/3" : "border-white/10"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-bold text-sm">{m.matchName}</div>
                      <div className="text-gray-500 text-xs">{m.map}</div>
                    </div>
                    <div className={`text-2xl font-black ${
                      m.placement === 1 ? "text-yellow-400" :
                      m.placement === 2 ? "text-gray-300" :
                      m.placement === 3 ? "text-amber-600" : "text-gray-500"
                    }`}>
                      {m.placement <= 3 ? ["","",""][m.placement-1] : `#${m.placement}`}
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5" />
                        Placement #{m.placement}
                      </span>
                      <span className="text-blue-300 font-bold">{m.placementPoints} pts</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" />
                        Kills ({m.kills})
                      </span>
                      <span className="text-orange-400 font-bold">+{m.killPoints} pts</span>
                    </div>

                    {(m.wwcdBonus || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-400 flex items-center gap-2">
                          <Crown className="w-3.5 h-3.5" />
                          WWCD Bonus
                        </span>
                        <span className="text-yellow-400 font-bold">+{m.wwcdBonus} pts</span>
                      </div>
                    )}

                    {(m.top3Bonus || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-400 flex items-center gap-2">
                          <Star className="w-3.5 h-3.5" />
                          Top 3 Bonus
                        </span>
                        <span className="text-blue-400 font-bold">+{m.top3Bonus} pts</span>
                      </div>
                    )}

                    {hasComp && (
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-400 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          Compensation
                        </span>
                        <span className="text-cyan-400 font-bold">+{m.compensationPoints} pts</span>
                      </div>
                    )}

                    {m.compensationReason && (
                      <div className="text-[10px] text-cyan-300/70 ml-6 italic">"{m.compensationReason}"</div>
                    )}

                    {hasPenalty && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 flex items-center gap-2">
                          <X className="w-3.5 h-3.5" />
                          Penalty
                        </span>
                        <span className="text-red-400 font-bold">-{m.penaltyPoints} pts</span>
                      </div>
                    )}

                    {m.penaltyReason && (
                      <div className="text-[10px] text-red-300/70 ml-6 italic">"{m.penaltyReason}"</div>
                    )}

                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Match Total</span>
                      <span className="text-white font-black text-lg">{m.totalPoints} pts</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Grand Total */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-yellow-500/10 to-pink-500/10 border-2 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Grand Total</div>
                <div className="text-white font-black text-3xl mt-1">{teamName}</div>
              </div>
              <div className="text-right">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-yellow-400 to-pink-400">
                  {grandTotal}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Total Points</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 text-center">
          <button onClick={onClose} className="btn-secondary px-6 py-2">Close</button>
        </div>
      </div>
    </div>
  );
}