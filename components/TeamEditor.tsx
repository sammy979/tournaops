"use client";
import { useState } from "react";
import { Save, X, Upload, Trash2, Sparkles, Users, ImageIcon } from "lucide-react";
import type { Team } from "@/types/tournament";

interface Props {
  teams: Team[];
  onSave: (teams: Team[]) => void;
  onClose: () => void;
}

export default function TeamEditor({ teams, onSave, onClose }: Props) {
  const [edited, setEdited] = useState<Team[]>(teams);

  const updateTeam = (id: string, field: keyof Team, value: any) => {
    setEdited(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleLogoUpload = (id: string, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo too large. Please use images under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => updateTeam(id, "logo", e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = (id: string) => {
    updateTeam(id, "logo", undefined);
  };

  const shuffleNames = () => {
    const funnyNames = [
      "Cyber Wolves", "Neon Ninjas", "Quantum Kings", "Digital Dragons",
      "Void Vipers", "Plasma Phoenix", "Astral Aces", "Rogue Rebels",
      "Zenith Zombies", "Blitz Bandits", "Nova Nomads", "Pulse Panthers"
    ];
    setEdited(prev => prev.map((t, i) => ({
      ...t,
      name: funnyNames[i % funnyNames.length] || `Team ${i + 1}`
    })));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-heavy neon-border rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-display text-3xl font-black gradient-text">EDIT TEAMS</h2>
              <p className="text-xs text-purple-300 uppercase tracking-widest font-semibold mt-1">
                Customize names & logos
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={shuffleNames}
              className="btn-ghost text-xs px-4 py-2 inline-flex items-center gap-1.5"
              title="Generate fun team names"
            >
              <Sparkles className="w-3.5 h-3.5" /> RANDOM
            </button>
            <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
          {edited.map((team, i) => (
            <div key={team.id} className="glass rounded-2xl p-4 border border-purple-500/20 hover:border-cyan-400 transition-all group">
              <div className="flex items-center gap-4">
                {/* Seed badge */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/40">
                  <span className="font-display font-black text-lg text-white">{i + 1}</span>
                </div>
                
                {/* Logo */}
                {team.logo ? (
                  <div className="relative group/logo flex-shrink-0">
                    <img src={team.logo} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-purple-500/50" />
                    <button
                      onClick={() => removeLogo(team.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-2 border-dashed border-purple-500/40 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-purple-500/20 transition flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleLogoUpload(team.id, e.target.files[0])}
                      className="hidden"
                    />
                    <ImageIcon className="w-5 h-5 text-purple-400 mb-0.5" />
                    <span className="text-[9px] text-purple-400 font-bold">LOGO</span>
                  </label>
                )}
                
                {/* Name input */}
                <input
                  type="text"
                  value={team.name}
                  onChange={e => updateTeam(team.id, "name", e.target.value)}
                  className="input flex-1 font-display font-bold text-lg"
                  placeholder={`Team ${i + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-5 border-t border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-cyan-500/5">
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">
              CANCEL
            </button>
            <button 
              onClick={() => onSave(edited)} 
              className="btn-primary flex-[2] inline-flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> SAVE TEAMS
            </button>
          </div>
          <p className="text-center text-xs text-purple-300/60 mt-3">
             Tip: Upload PNG/JPG logos under 2MB. Names will appear on brackets & standings.
          </p>
        </div>
      </div>
    </div>
  );
}