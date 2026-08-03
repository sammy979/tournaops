"use client";

import { useRef, useState, useMemo } from "react";
import {
  Download, FileText, X, Trophy, Crosshair, Flame,
  Search, TrendingUp, TrendingDown, Minus,
  Filter, Eye, EyeOff, RefreshCw, Award
} from "lucide-react";
import { Tournament } from "@/types/tournament";
import { getLeaderboard, getTopPlayers } from "@/lib/storage/tournaments";

interface PointsTableProps {
  tournament: Tournament;
  onClose?: () => void;
  embedded?: boolean;
}

type ViewMode = "compact" | "detailed" | "matches";

export default function PointsTable({ tournament, onClose, embedded = false }: PointsTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("detailed");
  const [showKills, setShowKills] = useState(true);
  const [showDamage, setShowDamage] = useState(false);
  const [showWWCD, setShowWWCD] = useState(true);

  const leaderboard = useMemo(() => getLeaderboard(tournament), [tournament]);
  const { topKillers } = useMemo(() => getTopPlayers(tournament), [tournament]);
  const matches = tournament.matches || [];
  const completedMatches = matches.filter(m => m.status === "completed");

  const filtered = useMemo(() => {
    if (!search) return leaderboard;
    const q = search.toLowerCase();
    return leaderboard.filter(e => e.teamName.toLowerCase().includes(q));
  }, [leaderboard, search]);

  const exportPNG = async () => {
    if (!tableRef.current) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#0a0a0f",
        quality: 1,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${tournament.name.replace(/[^a-z0-9]/gi, "-")}-standings.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });

      // Background
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, 420, 297, "F");

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text(tournament.name.toUpperCase(), 210, 22, { align: "center" });

      doc.setFontSize(11);
      doc.setTextColor(150, 150, 170);
      doc.text(
        `${leaderboard.length} SQUADS  ${completedMatches.length} MATCHES  ${tournament.scoringRule.name.toUpperCase()}`,
        210, 32, { align: "center" }
      );

      // Table header
      const startY = 42;
      const rowH = 7;
      const cols = {
        rank: 10, team: 40, ...Object.fromEntries(
          matches.slice(0, 15).map((_, i) => [`m${i}`, 90 + i * 12])
        ),
        kills: 275, place: 300, kill: 325, wwcd: 350, total: 380,
      };

      doc.setFillColor(30, 30, 50);
      doc.rect(6, startY, 408, rowH, "F");
      doc.setTextColor(100, 150, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("RANK", 10, startY + 5);
      doc.text("SQUAD", 20, startY + 5);
      matches.slice(0, 15).forEach((_, i) => {
        doc.text(`M${i + 1}`, 90 + i * 12, startY + 5, { align: "center" });
      });
      doc.text("KILLS", 275, startY + 5, { align: "center" });
      doc.text("PLACE", 300, startY + 5, { align: "center" });
      doc.text("KILL", 325, startY + 5, { align: "center" });
      doc.text("WWCD", 350, startY + 5, { align: "center" });
      doc.text("TOTAL", 380, startY + 5, { align: "center" });

      // Rows
      leaderboard.slice(0, 25).forEach((entry, idx) => {
        const y = startY + rowH + idx * rowH;
        const isTop3 = idx < 3;

        if (idx % 2 === 0) {
          doc.setFillColor(20, 20, 30);
          doc.rect(6, y, 408, rowH, "F");
        }

        if (isTop3) {
          const colors: [number, number, number][] = [[255, 215, 0], [220, 220, 220], [205, 127, 50]];
          doc.setTextColor(...colors[idx]);
        } else {
          doc.setTextColor(210, 210, 220);
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", isTop3 ? "bold" : "normal");
        doc.text(`#${entry.rank}`, 10, y + 5);
        doc.text(entry.teamName.substring(0, 18), 20, y + 5);

        matches.slice(0, 15).forEach((m, i) => {
          const r = entry.matchResults?.[m.id];
          const text = r ? String(r.totalPoints) : "-";
          doc.text(text, 90 + i * 12, y + 5, { align: "center" });
        });

        doc.setTextColor(255, 150, 100);
        doc.text(String(entry.totalKills || 0), 275, y + 5, { align: "center" });
        doc.setTextColor(100, 200, 255);
        doc.text(String(entry.placementPoints || 0), 300, y + 5, { align: "center" });
        doc.text(String(entry.killPoints || 0), 325, y + 5, { align: "center" });
        doc.setTextColor(255, 215, 0);
        doc.text(String(entry.wwcds || 0), 350, y + 5, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 100);
        doc.text(String(entry.totalPoints), 380, y + 5, { align: "center" });
        doc.setFont("helvetica", "normal");
      });

      // Footer
      doc.setTextColor(80, 80, 100);
      doc.setFontSize(8);
      doc.text(
        `Generated by TournaOps  tournaops.com  ${new Date().toLocaleString()}`,
        210, 288, { align: "center" }
      );

      doc.save(`${tournament.name.replace(/[^a-z0-9]/gi, "-")}-standings.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    return "text-gray-500";
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return "";
    if (rank === 2) return "";
    if (rank === 3) return "";
    return `#${rank}`;
  };

  const table = (
    <div ref={tableRef} className="p-6 bg-[#0a0a0f] rounded-xl">
      {/* Watermark Header */}
      <div className="text-center mb-6">
        <div className="text-[10px] text-blue-500/60 font-mono uppercase tracking-widest mb-1">
          TournaOps  tournaops.com
        </div>
        <h2 className="text-2xl font-bold text-white">{tournament.name}</h2>
        <div className="flex items-center justify-center gap-4 text-gray-500 text-sm mt-2">
          <span>{leaderboard.length} Squads</span>
          <span className="text-gray-700"></span>
          <span>{completedMatches.length} of {matches.length} Matches</span>
          <span className="text-gray-700"></span>
          <span className="text-blue-400">{tournament.scoringRule.name}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/2">
              <th className="text-left py-3 px-3 text-gray-500 font-bold text-[10px] uppercase tracking-wider w-14">Rank</th>
              <th className="text-left py-3 px-3 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Squad</th>
              {viewMode === "detailed" && matches.slice(0, 15).map((m, i) => (
                <th key={m.id} className="text-center py-3 px-2 text-gray-600 font-bold text-[10px] w-10">M{i + 1}</th>
              ))}
              {showWWCD && (
                <th className="text-center py-3 px-2 text-yellow-500/70 font-bold text-[10px] uppercase w-12">WWCD</th>
              )}
              {showKills && (
                <th className="text-center py-3 px-3 text-orange-500/70 font-bold text-[10px] uppercase w-14">Kills</th>
              )}
              {showDamage && (
                <th className="text-center py-3 px-3 text-purple-500/70 font-bold text-[10px] uppercase w-16">DMG</th>
              )}
              <th className="text-center py-3 px-3 text-blue-400/70 font-bold text-[10px] uppercase w-14">Place</th>
              <th className="text-center py-3 px-3 text-green-400/70 font-bold text-[10px] uppercase w-14">Kill Pts</th>
              <th className="text-center py-3 px-3 text-blue-400 font-black text-xs uppercase w-16">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const isTop3 = entry.rank <= 3;
              return (
                <tr
                  key={entry.teamId}
                  className={`border-b border-white/5 transition-colors hover:bg-white/3 ${
                    entry.rank === 1 ? "bg-yellow-500/5" :
                    entry.rank === 2 ? "bg-gray-400/3" :
                    entry.rank === 3 ? "bg-amber-700/3" : ""
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className={`font-mono font-black text-lg ${getRankStyle(entry.rank)}`}>
                      {getMedal(entry.rank)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${isTop3 ? "text-white" : "text-gray-300"}`}>
                      {entry.teamName}
                    </span>
                  </td>
                  {viewMode === "detailed" && matches.slice(0, 15).map((m) => {
                    const r = entry.matchResults?.[m.id];
                    return (
                      <td key={m.id} className="py-3 px-2 text-center">
                        {r ? (
                          <div className="flex flex-col items-center">
                            <span className={`font-mono text-xs font-bold ${
                              r.placement === 1 ? "text-yellow-400" :
                              r.placement <= 3 ? "text-orange-400" : "text-gray-300"
                            }`}>{r.totalPoints}</span>
                            <span className="text-[9px] text-gray-600 font-mono">#{r.placement}</span>
                          </div>
                        ) : (
                          <span className="text-gray-700"></span>
                        )}
                      </td>
                    );
                  })}
                  {showWWCD && (
                    <td className="py-3 px-2 text-center">
                      <span className={`font-bold font-mono ${entry.wwcds > 0 ? "text-yellow-400" : "text-gray-700"}`}>
                        {entry.wwcds || 0}
                      </span>
                    </td>
                  )}
                  {showKills && (
                    <td className="py-3 px-3 text-center">
                      <span className="text-orange-400 font-mono font-bold">{entry.totalKills || 0}</span>
                    </td>
                  )}
                  {showDamage && (
                    <td className="py-3 px-3 text-center">
                      <span className="text-purple-400 font-mono text-xs">{(entry.totalDamage || 0).toLocaleString()}</span>
                    </td>
                  )}
                  <td className="py-3 px-3 text-center">
                    <span className="text-blue-300 font-mono">{entry.placementPoints || 0}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-green-400 font-mono">{entry.killPoints || 0}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`font-mono font-black text-lg ${isTop3 ? getRankStyle(entry.rank) : "text-white"}`}>
                      {entry.totalPoints}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              {search ? `No teams match "${search}"` : "No results yet  enter match data to see standings"}
            </p>
          </div>
        )}
      </div>

      {/* Footer stats bar */}
      {filtered.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-600 border-t border-white/5 pt-4">
          <span>Total Kills: <span className="text-orange-400 font-mono font-bold">{leaderboard.reduce((a, e) => a + (e.totalKills || 0), 0)}</span></span>
          <span>Total WWCDs: <span className="text-yellow-400 font-mono font-bold">{leaderboard.reduce((a, e) => a + (e.wwcds || 0), 0)}</span></span>
          {topKillers[0] && (
            <span>MVP: <span className="text-red-400 font-bold">{topKillers[0].playerName}</span> ({topKillers[0].kills}K)</span>
          )}
          <span className="text-gray-700">Generated {new Date().toLocaleString()}</span>
        </div>
      )}
    </div>
  );

  if (embedded) return table;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-4">
      <div className="w-full max-w-7xl mx-4">
        {/* Controls */}
        <div className="glass-card rounded-2xl border border-white/10 p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Points Table
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search team..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field text-sm py-1.5 pl-9 w-48"
                />
              </div>

              {/* View mode */}
              <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                {(["detailed", "compact"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`px-3 py-1 rounded text-xs font-medium capitalize ${viewMode === m ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Column toggles */}
              <button onClick={() => setShowWWCD(!showWWCD)} className={`p-2 rounded-lg border text-xs ${showWWCD ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" : "border-white/10 text-gray-600"}`} title="WWCD column">
                
              </button>
              <button onClick={() => setShowDamage(!showDamage)} className={`p-2 rounded-lg border text-xs ${showDamage ? "border-purple-500/30 text-purple-400 bg-purple-500/10" : "border-white/10 text-gray-600"}`} title="Damage column">
                
              </button>

              {/* Exports */}
              <button onClick={exportPNG} disabled={exporting} className="btn-secondary flex items-center gap-2 px-4 py-1.5 text-sm">
                <Download className="w-3.5 h-3.5" />PNG
              </button>
              <button onClick={exportPDF} disabled={exporting} className="btn-secondary flex items-center gap-2 px-4 py-1.5 text-sm">
                <FileText className="w-3.5 h-3.5" />PDF
              </button>

              {onClose && (
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white border border-white/10">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {table}
      </div>
    </div>
  );
}