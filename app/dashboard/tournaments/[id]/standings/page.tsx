"use client";
import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trophy, Search, X, ExternalLink, Filter as FilterIcon, Download, ChevronDown, FileText, FileSpreadsheet, FileImage, File, Sparkles } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export-standings";
import TeamDetailModal from "@/components/tournament/TeamDetailModal";

const PLACEMENT_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1,
};

function calculateStandings(teams: any[], matches: any[]) {
  const map = new Map<string, any>();
  const matchHistory = new Map<string, any[]>();
  
  teams.forEach((t: any) => {
    map.set(t.id, {
      id: t.id, name: t.name || "", tag: t.tag || "", logo: t.logo || "",
      players: t.players || t.playersList || [],
      totalPoints: 0, placementPoints: 0, totalKills: 0, wwcdCount: 0, matchesPlayed: 0,
      avgKills: 0, avgPlacement: 0, bestPlacement: 999, highestKills: 0,
      highestKillsMatch: null,
    });
    matchHistory.set(t.id, []);
  });
  
  const placementSums = new Map<string, number>();
  
  matches.forEach((m: any, mIdx: number) => {
    const results = Array.isArray(m.results) ? m.results : [];
    results.forEach((r: any) => {
      const s = map.get(r.teamId);
      if (!s) return;
      const kills = Number(r.kills) || 0;
      const placement = Number(r.placement) || 0;
      const pts = PLACEMENT_POINTS[placement] || 0;
      const totalPts = kills + pts;
      
      s.totalKills += kills;
      s.placementPoints += pts;
      s.totalPoints += totalPts;
      if (r.wwcd || placement === 1) s.wwcdCount += 1;
      s.matchesPlayed += 1;
      
      if (placement > 0 && placement < s.bestPlacement) s.bestPlacement = placement;
      if (kills > s.highestKills) {
        s.highestKills = kills;
        s.highestKillsMatch = {
          matchId: m.id, matchNumber: m.matchNumber || mIdx + 1,
          map: m.map || "", placement, kills, points: totalPts,
          wwcd: !!r.wwcd || placement === 1, startTime: m.startTime,
        };
      }
      
      const currentSum = placementSums.get(r.teamId) || 0;
      placementSums.set(r.teamId, currentSum + (placement || 16));
      
      matchHistory.get(r.teamId)!.push({
        matchId: m.id, matchNumber: m.matchNumber || mIdx + 1,
        map: m.map || "", placement, kills, points: totalPts,
        wwcd: !!r.wwcd || placement === 1, startTime: m.startTime,
      });
    });
  });
  
  map.forEach((s, teamId) => {
    if (s.matchesPlayed > 0) {
      s.avgKills = s.totalKills / s.matchesPlayed;
      s.avgPlacement = (placementSums.get(teamId) || 0) / s.matchesPlayed;
    }
    s.matchHistory = (matchHistory.get(teamId) || []).sort((a: any, b: any) => a.matchNumber - b.matchNumber);
  });
  
  return Array.from(map.values())
    .filter((s: any) => s.matchesPlayed > 0)
    .sort((a: any, b: any) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.wwcdCount !== a.wwcdCount) return b.wwcdCount - a.wwcdCount;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      if (a.bestPlacement !== b.bestPlacement) return a.bestPlacement - b.bestPlacement;
      return 0;
    })
    .map((s: any, idx: number) => ({ ...s, currentRank: idx + 1 }));
}

export default function StandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    fetch("/api/tournaments/" + id)
      .then(r => r.json())
      .then(d => setTournament(d.tournament))
      .finally(() => setLoading(false));
  }, [id]);

  const standings = useMemo(() => {
    if (!tournament) return [];
    return calculateStandings(tournament.teams || [], tournament.matches || []);
  }, [tournament]);

  const filtered = useMemo(() => {
    if (!search) return standings;
    const q = search.toLowerCase();
    return standings.filter((s: any) => 
      s.name.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q)
    );
  }, [standings, search]);

  const exportRows = filtered.map((s: any) => ({
    rank: s.currentRank,
    teamName: s.name,
    teamTag: s.tag || "",
    matchesPlayed: s.matchesPlayed,
    wwcdCount: s.wwcdCount,
    totalKills: s.totalKills,
    avgKills: s.avgKills,
    placementPoints: s.placementPoints,
    avgPlacement: s.avgPlacement,
    totalPoints: s.totalPoints,
    bestPlacement: s.bestPlacement,
    highestKills: s.highestKills,
  }));

  const exportOpts = {
    tournamentName: tournament?.name || "Tournament",
    subtitle: "Overall Standings",
    organizerName: tournament?.brandingData?.orgName || tournament?.brandingData?.organizerName || "Tournament Organizer",
  };

  const handleExport = (format: string) => {
    setExportOpen(false);
    try {
      if (format === "csv") exportToCSV(exportRows, exportOpts);
      else if (format === "excel") exportToExcel(exportRows, exportOpts);
      else if (format === "pdf") exportToPDF(exportRows, exportOpts);
      else if (format === "png") {
        const params = new URLSearchParams({ top: String(filtered.length), subtitle: "Overall Standings", format: "youtube", advanced: "1", sponsors: "1", social: "1" });
        window.open("/preview/" + id + "?" + params.toString(), "_blank");
      }
    } catch (e: any) {
      alert("Export failed: " + e?.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;
  if (!tournament) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Not found</div>;

  const primaryColor = tournament.brandingData?.primaryColor || "#FFD700";

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => router.push("/dashboard/tournaments/" + id)} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Tournament
          </button>

        <TournamentNav tournamentId={id} />
          
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
                <Trophy className="w-8 h-8" style={{ color: primaryColor }} />
                Standings
              </h1>
              <p className="text-neutral-400 mt-1">{tournament.name} · Click any team to view details</p>
            </div>
            
            <div className="flex gap-2 items-center">
              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm border border-neutral-700"
                >
                  <Download className="w-4 h-4" /> Export
                  <ChevronDown className={"w-4 h-4 transition-transform " + (exportOpen ? "rotate-180" : "")} />
                </button>
                {exportOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                      <button onClick={() => handleExport("csv")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 text-left text-sm border-b border-neutral-700">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-bold text-white">CSV</div>
                          <div className="text-xs text-neutral-400">Spreadsheet format</div>
                        </div>
                      </button>
                      <button onClick={() => handleExport("excel")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 text-left text-sm border-b border-neutral-700">
                        <FileSpreadsheet className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="font-bold text-white">Excel (.xlsx)</div>
                          <div className="text-xs text-neutral-400">Full formatting</div>
                        </div>
                      </button>
                      <button onClick={() => handleExport("pdf")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 text-left text-sm border-b border-neutral-700">
                        <File className="w-4 h-4 text-red-400" />
                        <div>
                          <div className="font-bold text-white">PDF</div>
                          <div className="text-xs text-neutral-400">Print-ready document</div>
                        </div>
                      </button>
                      <button onClick={() => handleExport("png")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 text-left text-sm">
                        <FileImage className="w-4 h-4 text-yellow-400" />
                        <div>
                          <div className="font-bold text-white">PNG Image</div>
                          <div className="text-xs text-neutral-400">Opens broadcast preview</div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => router.push("/dashboard/tournaments/" + id + "/insights")}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-4 py-2.5 rounded-lg text-sm"
              >
                <Sparkles className="w-4 h-4" /> AI Insights
              </button>
              
              <button
                onClick={() => router.push("/dashboard/tournaments/" + id + "/broadcast")}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2.5 rounded-lg text-sm"
              >
                <ExternalLink className="w-4 h-4" /> Broadcast
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search team name or tag..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder:text-neutral-600"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
            <div className="text-xs text-neutral-400 font-bold">TEAMS</div>
            <div className="text-2xl font-black text-white">{filtered.length}</div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
            <div className="text-xs text-neutral-400 font-bold">MATCHES</div>
            <div className="text-2xl font-black text-white">{(tournament.matches || []).length}</div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
            <div className="text-xs text-neutral-400 font-bold">TOTAL KILLS</div>
            <div className="text-2xl font-black text-red-400">{filtered.reduce((sum: number, s: any) => sum + s.totalKills, 0)}</div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
            <div className="text-xs text-neutral-400 font-bold">WWCD</div>
            <div className="text-2xl font-black" style={{ color: primaryColor }}>{filtered.reduce((sum: number, s: any) => sum + s.wwcdCount, 0)}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_60px_70px_70px_70px_70px_100px] gap-2 items-center p-3 border-b border-neutral-800 text-xs font-black text-neutral-400 tracking-widest uppercase">
            <div className="text-center">Rank</div>
            <div>Team</div>
            <div className="text-center">M</div>
            <div className="text-center">WWCD</div>
            <div className="text-center">Kills</div>
            <div className="text-center hidden sm:block">Avg K</div>
            <div className="text-center hidden md:block">Place</div>
            <div className="text-center">Total</div>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <div>No teams found</div>
            </div>
          ) : (
            filtered.map((s: any) => {
              const isFirst = s.currentRank === 1;
              const isSecond = s.currentRank === 2;
              const isThird = s.currentRank === 3;
              const rankColor = isFirst ? "#FFD700" : isSecond ? "#C0C0C0" : isThird ? "#CD7F32" : "#ffffff";
              const rowBg = isFirst ? "bg-yellow-500/10" : isSecond ? "bg-gray-400/5" : isThird ? "bg-orange-600/5" : "";
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedTeam(s)}
                  className={"w-full grid grid-cols-[60px_1fr_60px_70px_70px_70px_70px_100px] gap-2 items-center p-3 border-b border-neutral-800 hover:bg-neutral-800/50 transition-all cursor-pointer " + rowBg}
                >
                  <div className="text-center font-black text-xl" style={{ color: rankColor }}>#{s.currentRank}</div>
                  <div className="flex items-center gap-3 min-w-0">
                    {s.logo ? (
                      <img src={s.logo} alt="" className="w-9 h-9 rounded-lg object-cover border border-neutral-700 flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: primaryColor + "30", color: primaryColor }}>
                        {(s.tag || s.name).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 text-left">
                      {s.tag && <div className="text-xs font-bold" style={{ color: primaryColor }}>[{s.tag}]</div>}
                      <div className="text-white font-bold truncate">{s.name}</div>
                    </div>
                  </div>
                  <div className="text-center text-neutral-300 font-bold">{s.matchesPlayed}</div>
                  <div className="text-center">
                    <span className={"inline-block px-2 py-0.5 rounded font-black text-sm " + (s.wwcdCount > 0 ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-500")}>{s.wwcdCount}</span>
                  </div>
                  <div className="text-center text-red-400 font-black">{s.totalKills}</div>
                  <div className="text-center text-orange-400 font-bold hidden sm:block">{s.avgKills.toFixed(1)}</div>
                  <div className="text-center text-cyan-400 font-bold hidden md:block">{s.placementPoints}</div>
                  <div className="text-center font-black text-2xl" style={{ color: primaryColor }}>{s.totalPoints}</div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedTeam && (
        <TeamDetailModal team={selectedTeam} primaryColor={primaryColor} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  );
}