"use client";

import { useState, useEffect } from "react";
import { Trophy, DollarSign, Plus, Trash2, Download, Check, Edit2 } from "lucide-react";
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
    { rank: 4, label: "4th Place", amount: "50", paid: false },
  ]);

  useEffect(() => {
    const t = getMyTournaments();
    setTournaments(t);
    if (t.length > 0) setSelected(t[0].id);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const t = tournaments.find(t => t.id === selected);
    if (!t) return;
    const lb = getLeaderboard(t);
    setTiers(prev => prev.map(tier => ({
      ...tier,
      teamName: lb.find(e => e.rank === tier.rank)?.teamName || "TBD",
    })));
  }, [selected, tournaments]);

  const total = tiers.reduce((a, t) => a + (parseFloat(t.amount) || 0), 0);
  const paid = tiers.filter(t => t.paid).reduce((a, t) => a + (parseFloat(t.amount) || 0), 0);
  const remaining = total - paid;

  const addTier = () => {
    const nextRank = Math.max(...tiers.map(t => t.rank), 0) + 1;
    setTiers(prev => [...prev, { rank: nextRank, label: `${nextRank}th Place`, amount: "0", paid: false }]);
  };

  const removeTier = (rank: number) => {
    setTiers(prev => prev.filter(t => t.rank !== rank));
  };

  const togglePaid = (rank: number) => {
    setTiers(prev => prev.map(t => t.rank === rank ? { ...t, paid: !t.paid } : t));
  };

  const updateTier = (rank: number, field: keyof PrizeTier, value: any) => {
    setTiers(prev => prev.map(t => t.rank === rank ? { ...t, [field]: value } : t));
  };

  const symbols: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£", AED: "د.إ" };
  const sym = symbols[currency] || "$";

  const exportCSV = () => {
    const t = tournaments.find(t => t.id === selected);
    const rows = [
      ["Rank", "Label", "Team", "Amount", "Paid"],
      ...tiers.map(tier => [tier.rank, tier.label, tier.teamName || "TBD", `${sym}${tier.amount}`, tier.paid ? "Yes" : "No"]),
      ["", "", "TOTAL", `${sym}${total}`, `${sym}${paid} paid`],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `prizes-${t?.name || "tournament"}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Prize Distribution</h1>
          <p className="text-gray-400 mt-1">Track and manage prize payouts</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
          <Download className="w-4 h-4" />Export CSV
        </button>
      </div>

      {/* Settings */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Prize Pool", value: `${sym}${total.toLocaleString()}`, color: "text-white", bg: "bg-white/5" },
          { label: "Paid Out", value: `${sym}${paid.toLocaleString()}`, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Remaining", value: `${sym}${remaining.toLocaleString()}`, color: "text-yellow-400", bg: "bg-yellow-500/10" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white/8 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tiers */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/3">
          <h3 className="text-white font-semibold text-sm">Prize Tiers</h3>
          <button onClick={addTier} className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />Add Tier
          </button>
        </div>

        <div className="divide-y divide-white/6">
          {tiers.sort((a,b) => a.rank - b.rank).map(tier => (
            <div key={tier.rank} className={`flex items-center gap-4 p-4 transition-all ${tier.paid ? "bg-green-500/5" : ""}`}>
              {/* Rank */}
              <div className="w-8 text-center">
                <span className={`font-bold font-mono text-sm ${tier.rank === 1 ? "text-yellow-400" : tier.rank === 2 ? "text-gray-300" : tier.rank === 3 ? "text-amber-600" : "text-gray-500"}`}>
                  {tier.rank <= 3 ? ["🥇","🥈","🥉"][tier.rank-1] : `#${tier.rank}`}
                </span>
              </div>

              {/* Label */}
              <input
                type="text"
                value={tier.label}
                onChange={e => updateTier(tier.rank, "label", e.target.value)}
                className="bg-transparent text-white text-sm font-medium border-b border-transparent hover:border-white/20 focus:border-blue-500 outline-none w-32"
              />

              {/* Team */}
              <div className="flex-1">
                <span className={`text-sm ${tier.teamName && tier.teamName !== "TBD" ? "text-blue-300" : "text-gray-600"}`}>
                  {tier.teamName || "TBD"}
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">{sym}</span>
                <input
                  type="number"
                  value={tier.amount}
                  onChange={e => updateTier(tier.rank, "amount", e.target.value)}
                  className="input-field w-24 text-sm py-1.5 text-right font-mono"
                />
              </div>

              {/* Paid toggle */}
              <button
                onClick={() => togglePaid(tier.rank)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  tier.paid
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
                }`}
              >
                {tier.paid ? <><Check className="w-3 h-3" />Paid</> : "Mark Paid"}
              </button>

              {/* Remove */}
              <button onClick={() => removeTier(tier.rank)} className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="px-5 py-4 border-t border-white/10 bg-white/3">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Payout Progress</span>
            <span>{total > 0 ? Math.round((paid/total)*100) : 0}% paid ({sym}{paid} / {sym}{total})</span>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (paid/total)*100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}