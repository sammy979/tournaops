"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit, Copy, Trophy, Star, Sparkles, Lock, Globe, User, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";

const ScoringBuilder = dynamic(() => import("@/components/scoring/ScoringBuilder"), { ssr: false });

export default function ScoringPresetsPage() {
  const [presets, setPresets] = useState<{ builtIn: any[]; custom: any[] }>({ builtIn: [], custom: [] });
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/scoring-presets", { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setPresets(d);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deletePreset = async (id: string) => {
    if (!confirm("Delete this preset?")) return;
    const res = await fetch(`/api/scoring-presets/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const duplicateFromBuiltIn = (preset: any) => {
    setEditing({ ...preset, id: null, name: `${preset.name} (Copy)`, isBuiltIn: false });
    setShowBuilder(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Scoring Systems
          </h1>
          <p className="text-gray-500 mt-1">Create custom scoring rules · Reusable across stages</p>
        </div>
        <button onClick={() => { setEditing(null); setShowBuilder(true); }} className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <Plus className="w-4 h-4" />Create Scoring System
        </button>
      </div>

      {/* Warning */}
      <div className="glass-card rounded-xl p-4 border border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-bold text-sm mb-1">Preset Verification Notice</p>
            <p className="text-yellow-300/70 text-xs">
              Built-in presets (PMGC/PMPL/etc.) are named after popular formats but are <strong>approximations</strong>.
              Always verify against the latest official tournament rules before using in a competitive event.
            </p>
          </div>
        </div>
      </div>

      {/* Built-in Presets */}
      <div>
        <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />Reference Presets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.builtIn.map(p => (
            <div key={p.id} className="glass-card rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold text-sm">{p.name}</h3>
                <Lock className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <p className="text-gray-500 text-xs mb-3">{p.description}</p>
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="text-center p-2 rounded bg-white/3">
                  <div className="text-yellow-400 font-bold">{p.placementPoints[0]}</div>
                  <div className="text-gray-600 text-[9px]">1st</div>
                </div>
                <div className="text-center p-2 rounded bg-white/3">
                  <div className="text-orange-400 font-bold">{p.killPoints}</div>
                  <div className="text-gray-600 text-[9px]">Kill</div>
                </div>
                <div className="text-center p-2 rounded bg-white/3">
                  <div className="text-purple-400 font-bold">{p.wwcdBonus || "0"}</div>
                  <div className="text-gray-600 text-[9px]">WWCD</div>
                </div>
              </div>
              <button onClick={() => duplicateFromBuiltIn(p)} className="btn-secondary w-full text-xs py-1.5">
                <Copy className="w-3 h-3" />Duplicate & Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Presets */}
      <div>
        <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />Your Presets
        </h2>
        {presets.custom.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border-dashed border-2 border-white/10">
            <Sparkles className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No custom scoring systems yet</p>
            <p className="text-gray-500 text-sm mb-4">Duplicate a reference preset or create from scratch</p>
            <button onClick={() => { setEditing(null); setShowBuilder(true); }} className="btn-primary px-5 py-2 text-sm">
              <Plus className="w-4 h-4" />Create Your First
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {presets.custom.map(p => (
              <div key={p.id} className="glass-card rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-sm">{p.name}</h3>
                  {p.isPublic && <Globe className="w-3.5 h-3.5 text-blue-400" title="Public preset" />}
                </div>
                {p.description && <p className="text-gray-500 text-xs mb-3">{p.description}</p>}
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div className="text-center p-2 rounded bg-white/3">
                    <div className="text-yellow-400 font-bold">{p.placementPoints[0]}</div>
                    <div className="text-gray-600 text-[9px]">1st</div>
                  </div>
                  <div className="text-center p-2 rounded bg-white/3">
                    <div className="text-orange-400 font-bold">{p.killPoints}</div>
                    <div className="text-gray-600 text-[9px]">Kill</div>
                  </div>
                  <div className="text-center p-2 rounded bg-white/3">
                    <div className="text-purple-400 font-bold">{p.wwcdBonus || "0"}</div>
                    <div className="text-gray-600 text-[9px]">WWCD</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(p); setShowBuilder(true); }} className="flex-1 btn-secondary text-xs py-1.5">
                    <Edit className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => deletePreset(p.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-white/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBuilder && (
        <ScoringBuilder
          initialPreset={editing}
          onSave={() => { load(); }}
          onClose={() => { setShowBuilder(false); setEditing(null); }}
        />
      )}
    </div>
  );
}