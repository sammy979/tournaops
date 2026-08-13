"use client";
import type { Team } from "@/types/tournament";
import { Trophy, Users, Edit3 } from "lucide-react";

interface Props {
  teams: Team[];
  onEditTeams?: () => void;
}

export default function TeamsTable({ teams, onEditTeams }: Props) {
  return (
    <div className="glass-heavy rounded-3xl overflow-hidden border-2 border-yellow-500/30 relative">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl rotate-slow"></div>
      
      <div className="relative px-6 py-5 border-b border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-yellow-500">
              <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black gradient-text">ALL TEAMS</h3>
              <p className="text-xs text-yellow-300 uppercase tracking-widest font-semibold mt-1">
                {teams.length} teams competing
              </p>
            </div>
          </div>
          
          {onEditTeams && (
            <button 
              onClick={onEditTeams}
              className="btn-ghost text-xs inline-flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> EDIT ALL
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{width: "80px"}}>Seed</th>
              <th>Team</th>
              <th style={{width: "120px"}} className="text-center">Logo</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr key={team.id}>
                <td>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-display font-black text-lg bg-gradient-to-br from-yellow-500/30 to-yellow-500/30 border border-yellow-500/40 text-yellow-200">
                    {idx + 1}
                  </div>
                </td>
                <td>
                  <div className="font-display font-bold text-lg">{team.name}</div>
                </td>
                <td className="text-center">
                  {team.logo ? (
                    <img src={team.logo} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-yellow-500/30 inline-block" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 via-yellow-500 to-cyan-500 flex items-center justify-center text-white font-black text-lg inline-block">
                      {team.name.charAt(0)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}