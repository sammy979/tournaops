"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Crown, Users, Star, Share2, Download,
  Twitter, MessageSquare, Copy, Check, Award,
  RefreshCw, Zap, Sparkles
} from "lucide-react";
import { getTournamentBySlug } from "@/lib/storage/tournaments";

export default function PublicGrandFinalPage() {
  const params = useParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [stage, setStage] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    const slug = params?.slug as string;
    if (!slug) return;

    const t = await getTournamentBySlug(slug);
    if (!t) { setLoading(false); return; }
    setTournament(t);

    // Find Grand Final stage
    const stagesRes = await fetch(`/api/tournaments/${t.id}/stages`);
    if (stagesRes.ok) {
      const d = await stagesRes.json();
      const grandFinal = (d.stages || []).find((s: any) =>
        s.type === "GRAND_FINAL" || s.name.toLowerCase().includes("grand final") || s.name.toLowerCase().includes("final")
      );

      if (grandFinal) {
        setStage(grandFinal);
        const lbRes = await fetch(`/api/stages/${grandFinal.id}/leaderboard`);
        if (lbRes.ok) {
          const lbData = await lbRes.json();
          setLeaderboard(lbData);
        }
      }
    }
    setLoading(false);
  }, [params?.slug]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!stage?.isLocked) {
      const i = setInterval(load, 30000);
      return () => clearInterval(i);
    }
  }, [load, stage?.isLocked]);

  const publicUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyShare = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const shareTwitter = () => {
    const champion = leaderboard?.rows?.[0];
    const text = champion
      ? `${champion.teamName} wins ${tournament?.name}! Congrats to all finalists.`
      : `Watch ${tournament?.name} Grand Final live!`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(publicUrl)}`,
      "_blank"
    );
  };

  const exportCertificate = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#0a0a0f",
        quality: 1,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${tournament?.name}-champion.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert("Export failed");
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament || !stage) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4">
        <div>
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">
            {!tournament ? "Tournament Not Found" : "No Grand Final Yet"}
          </h1>
          <Link href="/" className="btn-primary px-6 py-2.5">TournaOps</Link>
        </div>
      </div>
    );
  }

  const rows = leaderboard?.rows || [];
  const champion = rows[0];
  const runnerUp = rows[1];
  const third = rows[2];
  const isFinished = stage.isLocked && rows.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <div className="border-b border-white/8 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-500">
              <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" />
            </div>
            <span className="text-yellow-400 font-bold text-lg">TournaOps</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={shareTwitter} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white">
              <Twitter className="w-3.5 h-3.5" />Share
            </button>
            <button onClick={copyShare} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${
              copiedShare ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}>
              {copiedShare ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-yellow-900/20 via-orange-900/10 to-transparent border-b border-yellow-500/20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-blob-delay" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold mb-6 uppercase tracking-widest">
            <Crown className="w-3 h-3" />Grand Final
            {stage.isLocked && <span className="ml-1"> LOCKED</span>}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
            {tournament.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 text-sm">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{rows.length} Finalists</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" />{stage.totalTeams || 0} matches</span>
            {tournament.prizePool && (
              <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                <Trophy className="w-4 h-4" />{tournament.prizePool}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CHAMPION CROWNING SECTION */}
      {isFinished && champion && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div ref={cardRef} className="glass-card rounded-3xl p-10 border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent relative overflow-hidden shadow-2xl shadow-yellow-500/30">

            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-yellow-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="relative text-center">
              {/* Sparkles */}
              <div className="flex justify-center gap-4 mb-4">
                {[0, 1, 2].map(i => (
                  <Sparkles key={i} className="w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>

              {/* Champion label */}
              <div className="text-xs font-black text-yellow-400 uppercase tracking-[0.3em] mb-2">
                CHAMPION 
              </div>

              {/* Team logo (huge) */}
              {champion.teamLogo ? (
                <img src={champion.teamLogo} alt="" className="w-32 h-32 rounded-3xl mx-auto mb-4 shadow-2xl shadow-yellow-500/40" />
              ) : (
                <div className="w-32 h-32 rounded-3xl mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/40">
                  <span className="text-6xl font-black text-white">{champion.teamName.charAt(0)}</span>
                </div>
              )}

              {/* Team name */}
              <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 mb-2 tracking-tight">
                {champion.teamName}
              </h2>

              <div className="text-white/60 text-lg mb-6">is the champion of {tournament.name}</div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div>
                  <div className="text-3xl font-black text-yellow-400">{champion.totalPoints}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Points</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-orange-400">{champion.kills}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Kills</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-red-400">{champion.wwcds}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">WWCD</div>
                </div>
              </div>

              {/* TournaOps watermark */}
              <div className="mt-8 pt-6 border-t border-yellow-500/20 text-yellow-500/50 text-xs font-mono">
                TournaOps - tournaops.com  {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Export button */}
          <div className="text-center mt-4">
            <button onClick={exportCertificate} disabled={exporting} className="btn-primary flex items-center gap-2 px-6 py-2.5 mx-auto">
              <Download className="w-4 h-4" />
              {exporting ? "Generating..." : "Download Champion Certificate"}
            </button>
          </div>
        </div>
      )}

      {/* PODIUM (if notLOCKED yet or additional showcase) */}
      {rows.length >= 3 && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-black text-white text-center mb-8">Top 3 Podium</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 0, 2].map(displayIdx => {
              const r = rows[displayIdx];
              if (!r) return null;
              const rank = r.rank;

              return (
                <div key={r.teamId} className={`glass-card rounded-2xl p-6 text-center border ${
                  rank === 1 ? "border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 to-transparent -translate-y-4 shadow-2xl shadow-yellow-500/20" :
                  rank === 2 ? "border-gray-400/30 bg-gradient-to-b from-gray-400/5 to-transparent" :
                  "border-amber-700/30 bg-gradient-to-b from-amber-700/5 to-transparent"
                }`}>
                  <div className="text-5xl mb-3">
                    {rank === 1 ? <Crown style={{ width: "2.5rem", height: "2.5rem", color: "#f59e0b", margin: "0 auto" }} /> : rank === 2 ? <Trophy style={{ width: "2rem", height: "2rem", color: "#d1d5db", margin: "0 auto" }} /> : <Award style={{ width: "2rem", height: "2rem", color: "#f97316", margin: "0 auto" }} />}
                  </div>
                  {r.teamLogo && (
                    <img src={r.teamLogo} alt="" className="w-16 h-16 rounded-xl mx-auto mb-3" />
                  )}
                  <div className={`text-xl font-black ${
                    rank === 1 ? "text-yellow-400" :
                    rank === 2 ? "text-gray-300" :
                    "text-amber-600"
                  }`}>
                    {r.teamName}
                  </div>
                  <div className="text-gray-500 text-sm mt-1">{r.wwcds} WWCD  {r.kills}K</div>
                  <div className={`text-4xl font-black font-mono mt-3 ${
                    rank === 1 ? "text-yellow-400" :
                    rank === 2 ? "text-gray-300" :
                    "text-amber-600"
                  }`}>
                    {r.totalPoints}
                  </div>
                  <div className="text-[10px] text-gray-600 uppercase tracking-widest">points</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL STANDINGS */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Final Standings
        </h2>
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left py-3 px-3 text-gray-500 text-[10px] uppercase w-12">Rank</th>
                  <th className="text-left py-3 px-3 text-gray-500 text-[10px] uppercase">Team</th>
                  <th className="text-center py-3 px-2 text-yellow-500 text-[10px] uppercase">WWCD</th>
                  <th className="text-center py-3 px-2 text-orange-400 text-[10px] uppercase">Kills</th>
                  <th className="text-center py-3 px-2 text-blue-400 text-[10px] uppercase">Place</th>
                  <th className="text-center py-3 px-3 text-white text-[10px] uppercase font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.teamId} className={`border-b border-white/5 hover:bg-white/3 ${
                    r.rank === 1 ? "bg-yellow-500/5" : ""
                  }`}>
                    <td className="py-3 px-3">
                      <span className={`font-mono font-black ${
                        r.rank === 1 ? "text-yellow-400" :
                        r.rank === 2 ? "text-gray-300" :
                        r.rank === 3 ? "text-amber-600" : "text-gray-500"
                      }`}>
                        {r.rank <= 3 ? ["1st","2nd","3rd"][r.rank-1] : `#${r.rank}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white font-semibold">
                      {r.teamName}
                      {r.rank === 1 && <Crown className="w-3.5 h-3.5 text-yellow-400 inline ml-2" />}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`font-bold ${r.wwcds > 0 ? "text-yellow-400" : "text-gray-700"}`}>{r.wwcds}</span>
                    </td>
                    <td className="py-3 px-2 text-center text-orange-400 font-mono font-bold">{r.kills}</td>
                    <td className="py-3 px-2 text-center text-blue-300 font-mono text-xs">{r.placementPoints}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono font-black text-lg ${r.rank <= 3 ? "text-yellow-400" : "text-white"}`}>
                        {r.totalPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 mt-12 py-6 text-center">
        <p className="text-gray-600 text-sm">
          Powered by <Link href="/" className="text-yellow-400 hover:text-yellow-300 font-semibold">TournaOps</Link>
        </p>
      </div>
    </div>
  );
}