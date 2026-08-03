"use client";

import { X, Trophy, ChevronRight, Users, Award } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { getLeaderboard } from "@/lib/storage/tournaments";

interface BracketViewProps {
  tournament: Tournament;
  onClose: () => void;
}

export default function BracketView({ tournament, onClose }: BracketViewProps) {
  const leaderboard = getLeaderboard(tournament);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-6xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              Tournament Bracket
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {tournament.name}  {tournament.rounds.length} rounds
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bracket */}
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {tournament.rounds.map((round, rIdx) => {
              const roundMatches = tournament.matches.filter(m => m.roundId === round.id);
              const completedCount = roundMatches.filter(m => m.status === "completed").length;
              const isLast = rIdx === tournament.rounds.length - 1;

              return (
                <div key={round.id} className="flex flex-col" style={{ minWidth: 260 }}>

                  {/* Round Header */}
                  <div className={`text-center mb-4 p-3 rounded-xl border ${
                    isLast
                      ? "bg-yellow-500/10 border-yellow-500/20"
                      : "bg-white/4 border-white/10"
                  }`}>
                    <p className={`font-bold text-sm ${isLast ? "text-yellow-400" : "text-white"}`}>
                      {isLast ? " " : ""}{round.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {round.lobbies.length} {round.lobbies.length === 1 ? "lobby" : "lobbies"}  {completedCount}/{roundMatches.length} done
                    </p>
                  </div>

                  {/* Lobbies */}
                  <div className="space-y-3 flex-1">
                    {round.lobbies.map((lobby) => {
                      const lobbyTeams = tournament.teams.filter(t => lobby.teamIds.includes(t.id));
                      const lobbyMatches = tournament.matches.filter(m => lobby.matchIds.includes(m.id));
                      const lobbyDone = lobbyMatches.filter(m => m.status === "completed").length;
                      const lobbyBoard = getLeaderboard(tournament, lobby.id).filter(e => e.matchesPlayed > 0);
                      const displayList = lobbyBoard.length > 0 ? lobbyBoard : lobbyTeams.map((t, i) => ({ teamId: t.id, teamName: t.name, totalPoints: 0, rank: i + 1 }));

                      return (
                        <div key={lobby.id} className="bg-white/3 rounded-xl border border-white/8 overflow-hidden">

                          {/* Lobby header */}
                          <div className="flex items-center justify-between px-3 py-2 bg-white/4 border-b border-white/8">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3 h-3 text-gray-500" />
                              <span className="text-xs font-medium text-gray-400">{lobby.name}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              lobbyDone === lobbyMatches.length && lobbyMatches.length > 0
                                ? "bg-green-500/20 text-green-400"
                                : lobbyDone > 0
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-white/8 text-gray-600"
                            }`}>
                              {lobbyDone}/{lobbyMatches.length}
                            </span>
                          </div>

                          {/* Teams */}
                          <div className="divide-y divide-white/5">
                            {displayList.slice(0, 6).map((entry, i) => {
                              const pts = (entry as any).totalPoints || 0;
                              const name = (entry as any).teamName || (entry as any).name || "";
                              const willAdvance = round.advanceTop && i < round.advanceTop;

                              return (
                                <div key={(entry as any).teamId || i} className={`flex items-center gap-2 px-3 py-1.5 text-xs ${
                                  willAdvance ? "bg-green-500/4" : ""
                                }`}>
                                  <span className={`w-4 font-mono font-bold ${
                                    i === 0 ? "text-yellow-400" :
                                    i === 1 ? "text-gray-300" :
                                    i === 2 ? "text-amber-600" :
                                    "text-gray-600"
                                  }`}>
                                    {i + 1}
                                  </span>
                                  <span className={`flex-1 truncate font-medium ${i < 3 ? "text-white" : "text-gray-400"}`}>
                                    {name}
                                  </span>
                                  {pts > 0 && (
                                    <span className="text-blue-400 font-mono font-bold">{pts}</span>
                                  )}
                                  {willAdvance && (
                                    <ChevronRight className="w-3 h-3 text-green-400 flex-shrink-0" />
                                  )}
                                </div>
                              );
                            })}

                            {lobbyTeams.length > 6 && (
                              <div className="px-3 py-1.5 text-[10px] text-gray-600 text-center">
                                +{lobbyTeams.length - 6} more teams
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/8 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />Completed
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-600" />Pending
            </span>
            <span className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-green-400" />Advances next round
            </span>
          </div>
          <button onClick={onClose} className="btn-secondary px-5 py-2 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}