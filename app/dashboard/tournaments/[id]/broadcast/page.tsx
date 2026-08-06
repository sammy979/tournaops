"use client";
import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Trophy, Users, Crown, Target, Award, Zap, Search, Filter as FilterIcon, X } from "lucide-react";

type Template = {
  id: string;
  name: string;
  description: string;
  icon: any;
  ready: boolean;
};

const TEMPLATES: Template[] = [
  { id: "standings", name: "Points Table", description: "Full standings with all stats", icon: Trophy, ready: true },
  { id: "podium", name: "Podium Top 3", description: "Winners showcase (coming soon)", icon: Crown, ready: false },
  { id: "mvp", name: "MVP / Top Fragger", description: "Kill leader spotlight (coming soon)", icon: Target, ready: false },
  { id: "roster", name: "Team Roster", description: "4 players display (coming soon)", icon: Users, ready: false },
  { id: "match", name: "Match Result", description: "Single match highlights (coming soon)", icon: Zap, ready: false },
  { id: "wwcd", name: "Chicken Dinner", description: "WWCD team celebration (coming soon)", icon: Award, ready: false },
];

type Size = { name: string; width: number; height: number; label: string };
const SIZES: Size[] = [
  { name: "youtube", width: 1920, height: 1080, label: "YouTube / Twitter (16:9)" },
  { name: "instagram", width: 1080, height: 1080, label: "Instagram Post (1:1)" },
  { name: "story", width: 1080, height: 1920, label: "Instagram Story (9:16)" },
];

export default function BroadcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  
  // Config
  const [topN, setTopN] = useState(16);
  const [size, setSize] = useState<Size>(SIZES[0]);
  const [subtitle, setSubtitle] = useState("Overall Standings");
  const [showSponsors, setShowSponsors] = useState(true);
  const [showSocial, setShowSocial] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(true);
  
  // Filters
  const [filterType, setFilterType] = useState<"overall" | "stage" | "group" | "match" | "day">("overall");
  const [filterStageId, setFilterStageId] = useState<string>("");
  const [filterGroupId, setFilterGroupId] = useState<string>("");
  const [filterMatchIds, setFilterMatchIds] = useState<string[]>([]);
  const [filterDay, setFilterDay] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/tournaments/" + id)
      .then(r => r.json())
      .then(d => setTournament(d.tournament))
      .finally(() => setLoading(false));
  }, [id]);

  // Extract unique days from matches
  const availableDays = useMemo(() => {
    if (!tournament?.matches) return [];
    const days = new Set<number>();
    tournament.matches.forEach((m: any) => {
      if (m.startTime) {
        days.add(new Date(m.startTime).getDate());
      }
    });
    return Array.from(days).sort((a, b) => a - b);
  }, [tournament]);

  const stages = tournament?.stages || [];
  const groups = useMemo(() => {
    if (!filterStageId) return [];
    const stage = stages.find((s: any) => s.id === filterStageId);
    return stage?.groups || [];
  }, [filterStageId, stages]);

  const filteredMatches = useMemo(() => {
    if (!tournament?.matches) return [];
    let m = tournament.matches;
    if (filterType === "stage" && filterStageId) m = m.filter((x: any) => x.stageId === filterStageId);
    if (filterType === "group" && filterGroupId) m = m.filter((x: any) => x.groupId === filterGroupId);
    if (filterType === "day" && filterDay) m = m.filter((x: any) => x.startTime && new Date(x.startTime).getDate() === filterDay);
    return m;
  }, [tournament, filterType, filterStageId, filterGroupId, filterDay]);

  const openPreview = () => {
    const params = new URLSearchParams({
      top: String(topN),
      subtitle: subtitle,
      format: size.name,
      sponsors: showSponsors ? "1" : "0",
      social: showSocial ? "1" : "0",
      advanced: showAdvanced ? "1" : "0",
    });
    
    // Add filters
    if (filterType === "stage" && filterStageId) params.set("stageId", filterStageId);
    if (filterType === "group" && filterGroupId) params.set("groupId", filterGroupId);
    if (filterType === "day" && filterDay) params.set("day", String(filterDay));
    if (filterType === "match" && filterMatchIds.length > 0) params.set("matchIds", filterMatchIds.join(","));
    if (searchQuery) params.set("search", searchQuery);
    
    window.open("/preview/" + id + "?" + params.toString(), "_blank");
  };

  const clearFilters = () => {
    setFilterType("overall");
    setFilterStageId("");
    setFilterGroupId("");
    setFilterMatchIds([]);
    setFilterDay("");
    setSearchQuery("");
    setSubtitle("Overall Standings");
  };

  const toggleMatch = (matchId: string) => {
    setFilterMatchIds(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;
  if (!tournament) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Tournament not found</div>;

  const hasFilters = filterType !== "overall" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push("/dashboard/tournaments/" + id)} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Tournament
        </button>

        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            Broadcast Studio
          </h1>
          <p className="text-neutral-400">PMGC-grade graphics with your real tournament data</p>
        </div>

        {/* Templates */}
        <div className="mb-6">
          <div className="text-sm text-neutral-400 font-bold mb-3">1. TEMPLATE</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TEMPLATES.map(t => {
              const Icon = t.icon;
              const isSelected = selectedTemplate.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => t.ready && setSelectedTemplate(t)}
                  disabled={!t.ready}
                  className={"text-left p-3 rounded-xl border-2 transition-all relative " +
                    (isSelected ? "border-yellow-400 bg-yellow-400/10" : t.ready ? "border-neutral-800 hover:border-neutral-600 bg-neutral-900" : "border-neutral-900 bg-neutral-900/50 opacity-50 cursor-not-allowed")
                  }
                >
                  {!t.ready && <span className="absolute top-1 right-1 text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full font-bold">SOON</span>}
                  <Icon className={"w-5 h-5 mb-1 " + (isSelected ? "text-yellow-400" : "text-neutral-500")} />
                  <div className="font-bold text-white text-xs">{t.name}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{t.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-neutral-400 font-bold flex items-center gap-2">
              <FilterIcon className="w-4 h-4" />
              2. FILTERS
              {hasFilters && <span className="bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-full font-black">ACTIVE</span>}
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-neutral-500 hover:text-white flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            {/* Filter Type Tabs */}
            <div className="flex gap-1 mb-4 flex-wrap">
              {[
                { key: "overall", label: "Overall" },
                { key: "stage", label: "Stage", disabled: stages.length === 0 },
                { key: "group", label: "Group", disabled: stages.length === 0 },
                { key: "day", label: "By Day", disabled: availableDays.length === 0 },
                { key: "match", label: "By Match" },
              ].map((f: any) => (
                <button
                  key={f.key}
                  onClick={() => !f.disabled && setFilterType(f.key)}
                  disabled={f.disabled}
                  className={"px-3 py-1.5 rounded text-xs font-bold transition-all " +
                    (filterType === f.key ? "bg-yellow-400 text-black" : f.disabled ? "bg-neutral-800 text-neutral-600 cursor-not-allowed" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700")
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Stage Filter */}
            {filterType === "stage" && (
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Select Stage</label>
                <select value={filterStageId} onChange={e => { setFilterStageId(e.target.value); setSubtitle("Stage Standings"); }} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm">
                  <option value="">-- Select --</option>
                  {stages.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}

            {/* Group Filter */}
            {filterType === "group" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Stage</label>
                  <select value={filterStageId} onChange={e => { setFilterStageId(e.target.value); setFilterGroupId(""); }} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm">
                    <option value="">-- Select Stage --</option>
                    {stages.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Group</label>
                  <select value={filterGroupId} onChange={e => { setFilterGroupId(e.target.value); setSubtitle("Group Standings"); }} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm" disabled={!filterStageId}>
                    <option value="">-- Select Group --</option>
                    {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Day Filter */}
            {filterType === "day" && (
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Select Day</label>
                <select value={filterDay} onChange={e => { setFilterDay(Number(e.target.value)); setSubtitle("Day " + e.target.value + " Standings"); }} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm">
                  <option value="">-- Select Day --</option>
                  {availableDays.map(d => <option key={d} value={d}>Day {d}</option>)}
                </select>
              </div>
            )}

            {/* Match Filter */}
            {filterType === "match" && (
              <div>
                <label className="text-xs text-neutral-400 block mb-2">Select Matches ({filterMatchIds.length} selected)</label>
                <div className="max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {tournament.matches.slice(0, 30).map((m: any, idx: number) => {
                    const isSel = filterMatchIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => { toggleMatch(m.id); setSubtitle("Match Highlights"); }}
                        className={"p-2 rounded text-xs border-2 " + (isSel ? "border-yellow-400 bg-yellow-400/10 text-yellow-400" : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600")}
                      >
                        <div className="font-bold">Match {m.matchNumber || idx + 1}</div>
                        <div className="text-[10px] text-neutral-500">{m.map || "Erangel"}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <div className="text-sm text-neutral-400 font-bold mb-3 flex items-center gap-2">
            <Search className="w-4 h-4" />
            3. SEARCH
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search team name or tag..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder:text-neutral-600"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CONFIG */}
        <div className="mb-6">
          <div className="text-sm text-neutral-400 font-bold mb-3">4. CONFIGURE</div>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-2">FORMAT</label>
                <select value={size.name} onChange={e => setSize(SIZES.find(s => s.name === e.target.value) || SIZES[0])} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm">
                  {SIZES.map(s => <option key={s.name} value={s.name}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-2">SHOW TOP</label>
                <select value={topN} onChange={e => setTopN(Number(e.target.value))} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm">
                  <option value={5}>Top 5</option>
                  <option value={8}>Top 8</option>
                  <option value={10}>Top 10</option>
                  <option value={12}>Top 12</option>
                  <option value={16}>Top 16</option>
                  <option value={20}>Top 20</option>
                  <option value={25}>Top 25</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-400 block mb-2">SUBTITLE</label>
                <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm" placeholder="Overall Standings, Day 1, Grand Final..." />
              </div>
              <label className="flex items-center gap-2 bg-neutral-800 rounded p-3 cursor-pointer border border-neutral-700 text-xs">
                <input type="checkbox" checked={showSponsors} onChange={e => setShowSponsors(e.target.checked)} className="w-4 h-4" />
                <span className="text-white">Sponsors</span>
              </label>
              <label className="flex items-center gap-2 bg-neutral-800 rounded p-3 cursor-pointer border border-neutral-700 text-xs">
                <input type="checkbox" checked={showSocial} onChange={e => setShowSocial(e.target.checked)} className="w-4 h-4" />
                <span className="text-white">Social Links</span>
              </label>
              <label className="flex items-center gap-2 bg-neutral-800 rounded p-3 cursor-pointer border border-neutral-700 text-xs col-span-2">
                <input type="checkbox" checked={showAdvanced} onChange={e => setShowAdvanced(e.target.checked)} className="w-4 h-4" />
                <span className="text-white">Show Advanced Stats (Avg Kills, Avg Placement)</span>
              </label>
            </div>
            
            {hasFilters && (
              <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-xs text-yellow-300">
                <div className="font-bold mb-1">📊 Active Filters:</div>
                <div className="text-yellow-200/80">
                  Showing standings from {filteredMatches.length} matches
                  {filterType === "stage" && filterStageId && ` in stage`}
                  {filterType === "group" && filterGroupId && ` in group`}
                  {filterType === "day" && filterDay && ` on day ${filterDay}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GENERATE */}
        <div className="mb-6">
          <div className="text-sm text-neutral-400 font-bold mb-3">5. GENERATE</div>
          <button
            onClick={openPreview}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black py-4 rounded-xl text-lg shadow-lg shadow-yellow-500/20"
          >
            <ExternalLink className="w-5 h-5" />
            OPEN PREVIEW & DOWNLOAD
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-xs text-blue-200">
          <div className="font-bold text-blue-300 mb-2">💡 3 Ways to Save Your Image:</div>
          <ol className="list-decimal list-inside space-y-1 text-blue-200/80">
            <li>Click yellow <strong className="text-yellow-400">Download PNG</strong> button in preview</li>
            <li><strong>Right-click</strong> the image → "Save image as..."</li>
            <li>Press <strong>Win+Shift+S</strong> → Select area → Ctrl+V to paste anywhere</li>
          </ol>
        </div>
      </div>
    </div>
  );
}