"use client";
import { useState } from "react";
import { Save, X } from "lucide-react";
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
    const reader = new FileReader();
    reader.onload = e => updateTeam(id, "logo", e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass neon-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20">
          <h2 className="text-2xl font-black">Edit Teams</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
          {edited.map((team, i) => (
            <div key={team.id} className="flex items-center gap-3 p-3 bg-purple-900/20 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center font-bold text-purple-300 flex-shrink-0">
                {i + 1}
              </div>
              
              {team.logo ? (
                <img src={team.logo} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <label className="w-12 h-12 rounded-lg bg-purple-500/10 border-2 border-dashed border-purple-500/30 flex items-center justify-center cursor-pointer hover:bg-purple-500/20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleLogoUpload(team.id, e.target.files[0])}
                    className="hidden"
                  />
                  <span className="text-xs text-purple-400">Logo</span>
                </label>
              )}
              
              <input
                type="text"
                value={team.name}
                onChange={e => updateTeam(team.id, "name", e.target.value)}
                className="input flex-1"
                placeholder={`Team ${i + 1}`}
              />
            </div>
          ))}
        </div>
        
        <div className="px-6 py-4 border-t border-purple-500/20 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => onSave(edited)} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Teams
          </button>
        </div>
      </div>
    </div>
  );
}