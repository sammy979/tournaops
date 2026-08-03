"use client";

import { useState, useEffect } from "react";
import { Trophy, DollarSign, Plus, Trash2, Download, Check } from "lucide-react";
import { getMyTournaments, getLeaderboard } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

interface PrizeTier {
  rank: number;
  label: string;
  amount: string;
  paid: boolean;
  teamName?: string;
}

export default function PrizesPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tiers, setTiers] = useState<PrizeTier[]>([
    { rank: 1, label: "1st Place", amount: "500", paid: false },
    { rank: 2, label: "2nd Place", amount: "300", paid: false },
    { rank: 3, label: "3rd Place", amount: "150", paid: false },
  ]);

  useEffect(() => {
    (async () => {
      const t = await getMyTournaments();
      setTournaments(t || []);
      if (t && t.length > 0) setSelected(t[0].id);
    })();
  }, []);

  const total = tiers.reduce((a, t) => a + (parseFloat(t.amount) || 0), 0);
  const paid = tiers.filter(t => t.paid).reduce((a, t) => a + (parseFloat(t.amount) || 0), 0);

  const symbols: Record<string, string> = { USD: "$", INR: "", EUR: "", GBP: "" };
  const sym = symbols[currency] || "$";

  const addTier = () => {
    const nextRank = Math.max(...tiers.map(t => t.rank), 0) + 1;
    setTiers(prev => [...prev, { rank: nextRank, label: `${nextRank}th Place`, amount: "0", paid: false }]);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Prize Distribution</h1>
        <p className="text-gray-400 mt-1">Track and manage prize payouts</p>
      </div>

      <div className="glass-card rounded-xl p-5 border border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Tournament</label>
            <select value={selected} onChange={e => setSelected(e.target.value)} className="input-field text-sm">
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-field text-sm">
              {Object.keys(symbols).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <div className="text-2xl font-bold text-white">{sym}{total.toLocaleString()}</div>
          <div className="text-gray-500 text-xs mt-1">Total Prize Pool</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-bold text-green-400">{sym}{paid.toLocaleString()}</div>
          <div className="text-gray-500 text-xs mt-1">Paid Out</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-bold text-yellow-400">{sym}{(total - paid).toLocaleString()}</div>
          <div className="text-gray-500 text-xs mt-1">Remaining</div>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/3">
          <h3 className="text-white font-semibold text-sm">Prize Tiers</h3>
          <button onClick={addTier} className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />Add Tier
          </button>
        </div>
        <div className="divide-y divide-white/6">
          {tiers.sort((a, b) => a.rank - b.rank).map(tier => (
            <div key={tier.rank} className="flex items-center gap-4 p-4">
              <div className="w-8 text-center text-yellow-400 font-bold">#{tier.rank}</div>
              <input type="text" value={tier.label} onChange={e => setTiers(prev => prev.map(t => t.rank === tier.rank ? { ...t, label: e.target.value } : t))} className="input-field w-32 text-sm" />
              <input type="number" value={tier.amount} onChange={e => setTiers(prev => prev.map(t => t.rank === tier.rank ? { ...t, amount: e.target.value } : t))} className="input-field w-24 text-sm text-right ml-auto" />
              <button onClick={() => setTiers(prev => prev.map(t => t.rank === tier.rank ? { ...t, paid: !t.paid } : t))} className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${tier.paid ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-white/5 text-gray-500 border-white/10"}`}>
                {tier.paid ? "Paid" : "Mark Paid"}
              </button>
              <button onClick={() => setTiers(prev => prev.filter(t => t.rank !== tier.rank))} className="p-1.5 rounded-lg text-gray-700 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}