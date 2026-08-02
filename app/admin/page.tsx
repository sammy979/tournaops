"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield, Users, Trophy, MessageSquare, Trash2,
  Search, Crown, AlertTriangle, Database, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminData {
  isAdmin: boolean;
  stats: {
    totalUsers: number;
    totalTournaments: number;
    totalTeams: number;
    totalMatches: number;
    totalDiscordImports: number;
    pendingDiscordImports: number;
  };
  users: any[];
  tournaments: any[];
  recentImports: any[];
}

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"users" | "tournaments" | "discord">("users");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.status === 403) {
        setError("Access denied - Admin only");
        setTimeout(() => router.replace("/dashboard"), 2000);
        return;
      }
      if (!res.ok) {
        setError("Failed to load admin data");
        return;
      }
      const d = await res.json();
      setData(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? All their tournaments will be deleted too!`)) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) load();
    else alert("Failed to delete");
  };

  const deleteTournament = async (id: string, name: string) => {
    if (!confirm(`Delete tournament "${name}"?`)) return;
    const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert("Failed to delete");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-bold">{error}</p>
          <p className="text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const filteredUsers = data.users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTournaments = data.tournaments.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Full system control</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
              <RefreshCw className="w-4 h-4" />Refresh
            </button>
            <Link href="/dashboard" className="btn-secondary px-4 py-2 text-sm">Back to App</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Users", value: data.stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Tournaments", value: data.stats.totalTournaments, icon: Trophy, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Teams", value: data.stats.totalTeams, icon: Shield, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Matches", value: data.stats.totalMatches, icon: Trophy, color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Discord Imports", value: data.stats.totalDiscordImports, icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Pending", value: data.stats.pendingDiscordImports, icon: Database, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass-card rounded-xl p-4 border border-white/10">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
            {(["users", "tournaments", "discord"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  tab === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        {tab === "users" && (
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Username</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Display Name</th>
                    <th className="text-center py-3 px-4 text-gray-500 text-xs uppercase">Tournaments</th>
                    <th className="text-center py-3 px-4 text-gray-500 text-xs uppercase">Admin</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Joined</th>
                    <th className="text-center py-3 px-4 text-gray-500 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-3 px-4 text-white font-medium">{u.email}</td>
                      <td className="py-3 px-4 text-gray-400">@{u.username}</td>
                      <td className="py-3 px-4 text-gray-300">{u.displayName}</td>
                      <td className="py-3 px-4 text-center text-blue-400 font-bold">{u._count?.tournaments || 0}</td>
                      <td className="py-3 px-4 text-center">
                        {u.isAdmin && <Crown className="w-4 h-4 text-yellow-400 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => deleteUser(u.id, u.email)} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "tournaments" && (
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Name</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Owner</th>
                    <th className="text-center py-3 px-4 text-gray-500 text-xs uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-gray-500 text-xs uppercase">Teams</th>
                    <th className="text-center py-3 px-4 text-gray-500 text-xs uppercase">Matches</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Created</th>
                    <th className="text-center py-3 px-4 text-gray-500 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTournaments.map(t => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-3 px-4 text-white font-medium">{t.name}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{t.createdBy?.email || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${t.status === "live" ? "badge-live" : t.status === "completed" ? "badge-completed" : "badge-draft"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-purple-400 font-bold">{t._count?.teams || 0}</td>
                      <td className="py-3 px-4 text-center text-orange-400 font-bold">{t._count?.matches || 0}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center flex gap-1 justify-center">
                        <Link href={`/dashboard/tournaments/${t.id}`} className="p-1.5 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-blue-500/10">
                          <Trophy className="w-4 h-4" />
                        </Link>
                        <button onClick={() => deleteTournament(t.id, t.name)} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "discord" && (
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Guild</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Channel</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">User</th>
                    <th className="text-center py-3 px-4 text-gray-500 text-xs uppercase">Slots</th>
                    <th className="text-center py-3 px-4 text-gray-500 text-xs uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs uppercase">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentImports.map(i => (
                    <tr key={i.id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-3 px-4 text-white font-medium">{i.discordGuildName}</td>
                      <td className="py-3 px-4 text-gray-400">#{i.discordChannelName}</td>
                      <td className="py-3 px-4 text-gray-400">{i.discordUsername}</td>
                      <td className="py-3 px-4 text-center text-purple-400 font-bold">{i.parseResult?.totalDetected || 0}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${i.status === "pending" ? "badge-pending" : "badge-completed"}`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{new Date(i.receivedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}