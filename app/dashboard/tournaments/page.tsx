"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Plus, Users, Calendar, Zap, ExternalLink, Trash2 } from "lucide-react";
import { getMyTournaments, deleteTournament } from "@/lib/storage/tournaments";
import type { Tournament } from "@/types/tournament";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    setTournaments(getMyTournaments());
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteTournament(id);
    setTournaments(getMyTournaments());
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-1">My Tournaments</h1>
          <p className="text-white/60">{tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/tournaments/create" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="font-display font-bold text-xl mb-2">No tournaments yet</h3>
          <p className="text-white/60 mb-6">Create your first tournament to get started</p>
          <Link href="/dashboard/tournaments/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Tournament
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {tournaments.map(t => (
            <div key={t.id} className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all card-3d group">
              {/* Banner */}
              <div className={`h-24 bg-gradient-to-br ${t.bannerColor || "from-indigo-500 to-purple-500"} relative`}>
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-bold uppercase backdrop-blur-md">
                    {t.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4">
                  <div className="text-xs text-white/80 uppercase tracking-wider font-bold">{t.game}</div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-cyan-400 transition truncate">
                  {t.name}
                </h3>
                <p className="text-sm text-white/60 mb-4 line-clamp-2">{t.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {t.teams.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    {t.matches.filter(m => m.status === "completed").length}/{t.matches.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link 
                    href={`/dashboard/tournaments/${t.id}`}
                    className="flex-1 btn-primary text-xs py-2 justify-center"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="w-10 h-10 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}