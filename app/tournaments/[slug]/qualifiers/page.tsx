"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, Crosshair, RefreshCw, Share2,
  Check, X, Award, Clock, Map, Twitter, MessageSquare,
  Copy, Zap, Filter, ExternalLink
} from "lucide-react";
import { getTournamentBySlug } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

interface Stage {
  id: string;
  name: string;
  type: string;
  order: number;
  status: string;
  totalTeams: number;
  teamsAdvancing: number;
  numGroups: number;
  groups: any[];
  qualificationRule: any;
  mapRotation: string[];
}

export default function PublicQualifiersPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeView, setActiveView] = useState<"standings" | "matches" | "qualified">("standings");

  const loadData = useCallback(async () => {
    const slug = params?.slug as string;
    if (!slug) return;

    const t = await getTournamentBySlug(slug);
    if (!t) { setLoading(false); return; }
    setTournament(t);

    // Fetch stages
    const stagesRes = await fetch(`/api/tournaments/${t.id}/stages`);
    if (stagesRes.ok) {
      const d = await stagesRes.json();
      const qualifierStages = (d.stages || []).filter((s: Stage) =>
        ["OPEN_QUALIFIER", "CLOSED_QUALIFIER", "GROUP_STAGE"].includes(s.type) ||
        s.name.toLowerCase().includes("qualifier")
      );
      setStages(qualifierStages);
      if (qualifierStages.length > 0 && !selectedStage) {
        setSelectedStage(qualifierStages[0].id);
      }
    }
    setLastUpdated(new Date());
    setLoading(false);
  }, [params?.slug, selectedStage]);

  const loadLeaderboard = useCallback(async () => {
    if (!selectedStage) return;
    const res = await fetch(
      `/api/stages/${selectedStage}/leaderboard?group=${groupFilter}&status=${statusFilter}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const d = await res.json();
      setLeaderboard(d);
    }
    setLastUpdated(new Date());
  }, [selectedStage, groupFilter, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  // Auto-refresh every 30s
  useEffect(() => {
    const i = setInterval(() => {
      loadLeaderboard();
    }, 30000);
    return () => clearInterval(i);
  }, [loadLeaderboard]);

  const currentStage = stages.find(s => s.id === selectedStage);
  const publicUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = tournament ? ` ${tournament.name} - Live Qualifier Standings` : "";

  const copyShareUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(publicUrl)}`,
      "_blank"
    );
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + " " + publicUrl)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4">
        <div>
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Tournament Not Found</h1>
          <Link href="/" className="btn-primary px-6 py-2.5">Go to TournaOps</Link>
        </div>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <PublicNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Award className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h1 className="text-white text-3xl font-bold mb-2">{tournament.name}</h1>
          <p className="text-gray-500 mb-6">No qualifier stages configured yet</p>
          <Link href={`/tournaments/${tournament.slug}`} className="btn-primary px-6 py-2.5">
            View Tournament Page
          </Link>
        </div>
      </div>
    );
  }

  const qualified = leaderboard?.rows?.filter((r: any) => r.qualificationStatus === "QUALIFIED") || [];
  const eliminated = leaderboard?.rows?.filter((r: any) => r.qualificationStatus === "ELIMINATED") || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <PublicNav />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-900/20 to-transparent border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-3 uppercase tracking-widest">
                <Award className="w-3 h-3" />Qualifier Stage
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">{tournament.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{currentStage?.totalTeams || 0} Teams</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4" />{currentStage?.numGroups || 0} Groups</span>
                {currentStage?.mapRotation && (
                  <span className="flex items-center gap-1.5"><Map className="w-4 h-4" />{currentStage.mapRotation.length} Maps</span>
                )}
                {tournament.prizePool && (
                  <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                    <Trophy className="w-4 h-4" />{tournament.prizePool}
                  </span>
                )}
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <button onClick={shareTwitter} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-sm">
                <Twitter className="w-4 h-4" />Tweet
              </button>
              <button onClick={shareWhatsApp} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm">
                <MessageSquare className="w-4 h-4" />Share
              </button>
              <button onClick={copyShareUrl} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                copiedShare ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white"
              }`}>
                {copiedShare ? <><Check className="w-4 h-4" />Copied</> : <><Copy className="w-4 h-4" />Copy Link</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Selector */}
      {stages.length > 1 && (
        <div className="border-b border-white/8 bg-white/2">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-shrink-0">Stages:</span>
            {stages.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStage(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  selectedStage === s.id ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {s.name}
                <span className="ml-1.5 text-[10px] opacity-70">({s.status})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {(["standings", "matches", "qualified"] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeView === v
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                {v === "standings" && <><Trophy className="w-4 h-4 inline mr-1.5" />Live Standings</>}
                {v === "matches" && <><Zap className="w-4 h-4 inline mr-1.5" />Matches</>}
                {v === "qualified" && <><Check className="w-4 h-4 inline mr-1.5" />Qualified Teams</>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* STANDINGS VIEW */}
        {activeView === "standings" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="input-field w-auto text-sm">
                <option value="all">All Groups</option>
                {currentStage?.groups?.map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto text-sm">
                <option value="all">All Status</option>
                <option value="qualified"> Qualified</option>
                <option value="eliminated"> Eliminated</option>
                <option value="pending"> Pending</option>
              </select>
              <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Auto-refresh  Last: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>

            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left py-3 px-3 text-gray-500 text-xs uppercase w-12">Rank</th>
                      <th className="text-left py-3 px-3 text-gray-500 text-xs uppercase">Squad</th>
                      <th className="text-left py-3 px-2 text-gray-500 text-xs uppercase">Group</th>
                      <th className="text-center py-3 px-2 text-yellow-500 text-xs uppercase">WWCD</th>
                      <th className="text-center py-3 px-2 text-orange-400 text-xs uppercase">Kills</th>
                      <th className="text-center py-3 px-2 text-blue-400 text-xs uppercase">Place</th>
                      <th className="text-center py-3 px-2 text-white text-xs uppercase font-bold">Total</th>
                      <th className="text-center py-3 px-2 text-gray-500 text-xs uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard?.rows?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-500">
                          <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          Waiting for matches to complete
                        </td>
                      </tr>
                    ) : leaderboard?.rows?.map((r: any) => (
                      <tr key={r.teamId} className={`border-b border-white/5 hover:bg-white/3 ${
                        r.rank === 1 ? "bg-yellow-500/5" :
                        r.rank === 2 ? "bg-gray-400/3" :
                        r.rank === 3 ? "bg-amber-700/3" : ""
                      }`}>
                        <td className="py-2.5 px-3">
                          <span className={`font-mono font-black text-sm ${
                            r.rank === 1 ? "text-yellow-400" :
                            r.rank === 2 ? "text-gray-300" :
                            r.rank === 3 ? "text-amber-600" : "text-gray-500"
                          }`}>
                            {r.rank <= 3 ? ["","",""][r.rank-1] : `#${r.rank}`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {r.teamLogo ? (
                              <img src={r.teamLogo} alt="" className="w-7 h-7 rounded" />
                            ) : (
                              <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-xs font-bold">
                                {r.teamName.charAt(0)}
                              </div>
                            )}
                            <span className="text-white font-semibold">{r.teamName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-gray-500 text-xs">{r.groupName}</td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`font-bold font-mono ${r.wwcds > 0 ? "text-yellow-400" : "text-gray-700"}`}>{r.wwcds}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-orange-400 font-mono font-bold">{r.kills}</td>
                        <td className="py-2.5 px-2 text-center text-blue-300 font-mono text-xs">{r.placementPoints}</td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`font-mono font-black text-lg ${r.rank <= 3 ? "text-yellow-400" : "text-white"}`}>
                            {r.totalPoints}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            r.qualificationStatus === "QUALIFIED" ? "bg-green-500/15 text-green-400 border-green-500/30" :
                            r.qualificationStatus === "ELIMINATED" ? "bg-red-500/15 text-red-400 border-red-500/30" :
                            "bg-gray-500/15 text-gray-400 border-gray-500/20"
                          }`}>
                            {r.qualificationStatus === "QUALIFIED" ? " QUALIFIED" :
                             r.qualificationStatus === "ELIMINATED" ? " ELIMINATED" :
                             " PENDING"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MATCHES VIEW */}
        {activeView === "matches" && (
          <div>
            {leaderboard?.matches?.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No matches scheduled yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leaderboard?.matches?.map((m: any) => (
                  <div key={m.id} className="glass-card rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-bold text-sm">{m.name}</p>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                          <Map className="w-3 h-3" />{m.map}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {m.status === "completed" ? " Done" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QUALIFIED TEAMS VIEW */}
        {activeView === "qualified" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="glass-card rounded-xl p-4 border border-green-500/20 bg-green-500/5 text-center">
                <div className="text-4xl font-black text-green-400">{qualified.length}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Qualified</div>
              </div>
              <div className="glass-card rounded-xl p-4 border border-red-500/20 bg-red-500/5 text-center">
                <div className="text-4xl font-black text-red-400">{eliminated.length}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Eliminated</div>
              </div>
              <div className="glass-card rounded-xl p-4 border border-blue-500/20 bg-blue-500/5 text-center">
                <div className="text-4xl font-black text-blue-400">{currentStage?.totalTeams || 0}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Total Teams</div>
              </div>
            </div>

            {qualified.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-2xl"></span>Qualified Teams ({qualified.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {qualified.map((t: any) => (
                    <div key={t.teamId} className="glass-card rounded-xl p-4 border border-green-500/20 bg-green-500/5">
                      <div className="flex items-center gap-3">
                        {t.teamLogo ? (
                          <img src={t.teamLogo} alt="" className="w-12 h-12 rounded-xl" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 flex items-center justify-center text-white font-black text-xl">
                            {t.teamName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-bold">{t.teamName}</p>
                          <p className="text-gray-500 text-xs">{t.groupName}  Rank #{t.rank}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-black font-mono text-lg">{t.totalPoints}</div>
                          <div className="text-gray-600 text-[10px]">pts</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 mt-12 py-6 text-center">
        <p className="text-gray-600 text-sm">
          Powered by <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold">TournaOps</Link>
        </p>
      </div>
    </div>
  );
}

function PublicNav() {
  return (
    <div className="border-b border-white/8 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
            <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" />
          </div>
          <span className="text-blue-400 font-bold text-lg">TournaOps</span>
        </Link>
        <Link href="/" className="text-xs text-gray-500 hover:text-white">Home </Link>
      </div>
    </div>
  );
}