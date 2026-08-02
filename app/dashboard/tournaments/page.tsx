"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Trophy, Users, Play, Trash2,
  Search, Eye, Edit, ArrowRight, Filter
} from "lucide-react";
import { getMyTournaments, deleteTournament, getTournamentStats } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "live" | "completed">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setTournaments(getMyTournaments());
  }, []);

  const filtered = tournaments.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || t.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    setTimeout(() => {
      deleteTournament(id);
      setTournaments(getMyTournaments());
      setDeleting(null);
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tournaments</h1>
          <p className="text-gray-400 mt-1">{tournaments.length} total · {tournaments.filter(t => t.status === "live").length} live</p>
        </div>
        <Link href="/dashboard/tournaments/create" className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <Plus className="w-4 h-4" />
          New Tournament
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tournaments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {(["all", "draft", "live", "completed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const stats = getTournamentStats(t);
            return (
              <div
                key={t.id}
                className={`glass-card rounded-2xl p-5 border flex flex-col gap-4 transition-all ${deleting === t.id ? "opacity-50 scale-95" : "hover:border-white/15"}`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 flex-shrink-0">
                      <Trophy className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{t.name}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${t.status === "live" ? "badge-live" : t.status === "completed" ? "badge-completed" : "badge-draft"}`}>
                    {t.status === "live" ? "● Live" : t.status}
                  </span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Squads", value: t.teams.length, icon: Users },
                    { label: "Matches", value: `${stats.completedMatches}/${stats.totalMatches}`, icon: Play },
                    { label: "Rounds", value: t.rounds.length, icon: Trophy },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="text-center p-2 rounded-lg bg-white/4">
                        <div className="text-white font-bold text-sm">{s.value}</div>
                        <div className="text-gray-600 text-xs">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress */}
                {stats.totalMatches > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-gray-400">{stats.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${stats.progress}%` }} />
                    </div>
                  </div>
                )}

                {/* Prize Pool */}
                {t.prizePool && (
                  <div className="flex items-center gap-1.5 text-yellow-400 text-sm font-medium">
                    <Trophy className="w-3.5 h-3.5" />
                    {t.prizePool}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/8">
                  <Link
                    href={`/dashboard/tournaments/${t.id}`}
                    className="flex-1 btn-primary text-xs py-2 justify-center"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Manage
                  </Link>
                  <Link
                    href={`/tournaments/${t.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-colors"
                    title="Public view"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="p-2 rounded-lg border border-white/10 hover:border-red-500/30 text-gray-600 hover:text-red-400 transition-colors"
                    title="Delete tournament"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">
            {search || filter !== "all" ? "No matches found" : "No tournaments yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {search || filter !== "all" ? "Try a different search or filter" : "Create your first PUBG Mobile tournament"}
          </p>
          {!search && filter === "all" && (
            <Link href="/dashboard/tournaments/create" className="btn-primary px-6 py-2.5">
              <Plus className="w-4 h-4" />
              Create Tournament
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
