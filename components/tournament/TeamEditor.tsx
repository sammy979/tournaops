"use client";
import { useState } from "react";
import { Save, X, Camera, User, Trash2, Users } from "lucide-react";

interface Props {
  teams: any[];
  onSave: (teams: any[]) => void;
  onClose: () => void;
}

export default function TeamEditor({ teams, onSave, onClose }: Props) {
  const [edited, setEdited] = useState<any[]>(JSON.parse(JSON.stringify(teams)));
  const [activeIdx, setActiveIdx] = useState(0);

  const updateTeam = (idx: number, field: string, value: any) => {
    const u = [...edited]; u[idx] = { ...u[idx], [field]: value }; setEdited(u);
  };

  const updatePlayer = (tIdx: number, pIdx: number, field: string, value: any) => {
    const u = [...edited]; u[tIdx].players[pIdx] = { ...u[tIdx].players[pIdx], [field]: value }; setEdited(u);
  };

  const uploadImage = (cb: (data: string) => void) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 500 * 1024) { alert("Max 500KB"); return; }
      const reader = new FileReader();
      reader.onload = (ev: any) => cb(ev.target.result);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const team = edited[activeIdx];
  if (!team) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl md:text-2xl">Edit Squads</h2>
              <p className="text-xs text-white/50">{edited.length} squads</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost text-xs py-2 px-3">Cancel</button>
            <button onClick={() => onSave(edited)} className="btn-primary text-xs py-2 px-4" style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>
              <Save className="w-3.5 h-3.5 mr-1 inline" /> Save All
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
          {edited.map((t: any, i: number) => (
            <button key={t.id} onClick={() => setActiveIdx(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeIdx === i ? "bg-yellow-500 text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}>
              {t.logo ? <img src={t.logo} alt="" className="w-4 h-4 rounded object-cover" /> : <span className="w-4 h-4 rounded bg-white/20 text-[8px] flex items-center justify-center font-black">{i+1}</span>}
              {t.name}
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex flex-col items-center gap-1">
              <div onClick={() => uploadImage((d) => updateTeam(activeIdx, "logo", d))}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition overflow-hidden">
                {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <div className="text-center"><Camera className="w-5 h-5 text-white/40 mx-auto" /><span className="text-[8px] text-white/40">Logo</span></div>}
              </div>
              {team.logo && <button onClick={() => updateTeam(activeIdx, "logo", undefined)} className="text-[9px] text-red-400">Remove</button>}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-[9px] text-white/40 uppercase font-bold">Squad Name</label>
                <input type="text" value={team.name} onChange={e => updateTeam(activeIdx, "name", e.target.value)} className="input font-bold" />
              </div>
              <div>
                <label className="text-[9px] text-white/40 uppercase font-bold">Tag (4 chars)</label>
                <input type="text" value={team.tag || ""} onChange={e => updateTeam(activeIdx, "tag", e.target.value.toUpperCase().substring(0, 4))} className="input" maxLength={4} />
              </div>
            </div>
          </div>

          <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Players</h4>
          <div className="space-y-2">
            {(team.players || []).map((p: any, pi: number) => (
              <div key={p.id} className="glass rounded-xl p-3 border border-white/5 flex items-center gap-3">
                <div onClick={() => uploadImage((d) => updatePlayer(activeIdx, pi, "photo", d))}
                  className="w-12 h-12 rounded-lg border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition overflow-hidden flex-shrink-0">
                  {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white/30" />}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input type="text" value={p.name} onChange={e => updatePlayer(activeIdx, pi, "name", e.target.value)} className="input text-xs py-1.5" placeholder="Name" />
                  <input type="text" value={p.ign} onChange={e => updatePlayer(activeIdx, pi, "ign", e.target.value)} className="input text-xs py-1.5" placeholder="IGN" />
                  <select value={p.role} onChange={e => updatePlayer(activeIdx, pi, "role", e.target.value)} className="input text-xs py-1.5">
                    <option>IGL</option><option>Fragger</option><option>Support</option><option>Entry</option><option>Sniper</option><option>Assaulter</option><option>Scout</option>
                  </select>
                </div>
                {p.photo && <button onClick={() => updatePlayer(activeIdx, pi, "photo", undefined)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}