"use client";
import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ExternalLink, Loader2, Trophy, Users, Crown,
  Target, Award, Zap, Search, Filter as FilterIcon, X,
  Sparkles, Download, Radio, Monitor
} from "lucide-react";
import TournamentNav from "@/components/tournament/TournamentNav";

const TEMPLATES = [
  { id: "standings", name: "Points Table", desc: "Full standings with all stats", icon: Trophy, ready: true, color: "#f59e0b" },
  { id: "podium", name: "Podium Top 3", desc: "Winners showcase", icon: Crown, ready: false, color: "#fbbf24" },
  { id: "mvp", name: "MVP / Top Fragger", desc: "Kill leader spotlight", icon: Target, ready: false, color: "#f87171" },
  { id: "roster", name: "Team Roster", desc: "Players display", icon: Users, ready: false, color: "#60a5fa" },
  { id: "match", name: "Match Result", desc: "Single match highlights", icon: Zap, ready: false, color: "#4ade80" },
  { id: "wwcd", name: "Chicken Dinner", desc: "WWCD team celebration", icon: Award, ready: false, color: "#c084fc" },
];

const SIZES = [
  { name: "youtube", width: 1920, height: 1080, label: "YouTube / Twitter (16:9)" },
  { name: "instagram", width: 1080, height: 1080, label: "Instagram Post (1:1)" },
  { name: "story", width: 1080, height: 1920, label: "Instagram Story (9:16)" },
];

export default function BroadcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [topN, setTopN] = useState(16);
  const [size, setSize] = useState(SIZES[0]);
  const [subtitle, setSubtitle] = useState("Overall Standings");
  const [showSponsors, setShowSponsors] = useState(true);
  const [showSocial, setShowSocial] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [filterType, setFilterType] = useState<"overall" | "stage" | "group" | "match" | "day">("overall");
  const [filterStageId, setFilterStageId] = useState<string>("");
  const [filterGroupId, setFilterGroupId] = useState<string>("");
  const [filterMatchIds, setFilterMatchIds] = useState<string[]>([]);
  const [filterDay, setFilterDay] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/tournaments/" + id).then(r => r.json()).then(d => setTournament(d.tournament)).finally(() => setLoading(false));
  }, [id]);

  const availableDays = useMemo(() => {
    if (!tournament?.matches) return [];
    const days = new Set<number>();
    tournament.matches.forEach((m: any) => m.startTime && days.add(new Date(m.startTime).getDate()));
    return Array.from(days).sort((a, b) => a - b);
  }, [tournament]);

  const stages = tournament?.stages || [];
  const groups = useMemo(() => {
    if (!filterStageId) return [];
    return stages.find((s: any) => s.id === filterStageId)?.groups || [];
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
    const p = new URLSearchParams({
      top: String(topN), subtitle, format: size.name,
      sponsors: showSponsors ? "1" : "0",
      social: showSocial ? "1" : "0",
      advanced: showAdvanced ? "1" : "0",
    });
    if (filterType === "stage" && filterStageId) p.set("stageId", filterStageId);
    if (filterType === "group" && filterGroupId) p.set("groupId", filterGroupId);
    if (filterType === "day" && filterDay) p.set("day", String(filterDay));
    if (filterType === "match" && filterMatchIds.length > 0) p.set("matchIds", filterMatchIds.join(","));
    if (searchQuery) p.set("search", searchQuery);
    window.open("/preview/" + id + "?" + p.toString(), "_blank");
  };

  const clearFilters = () => {
    setFilterType("overall"); setFilterStageId(""); setFilterGroupId("");
    setFilterMatchIds([]); setFilterDay(""); setSearchQuery("");
    setSubtitle("Overall Standings");
  };

  const toggleMatch = (matchId: string) => {
    setFilterMatchIds(prev => prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]);
  };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!tournament) return <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Tournament not found</div>;

  const hasFilters = filterType !== "overall" || searchQuery !== "";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <button onClick={() => router.push("/dashboard/tournaments/" + id)} style={{
        display: "inline-flex", alignItems: "center", gap: "0.375rem",
        color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500,
        background: "transparent", border: "none", cursor: "pointer", marginBottom: "1rem",
      }}>
        <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to Tournament
      </button>

      <div style={{ marginBottom: "1.5rem" }}>
        <TournamentNav tournamentId={id} />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", background: "linear-gradient(135deg, #f59e0b, #f97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Radio style={{ width: "1.25rem", height: "1.25rem", color: "#000" }} />
          </div>
          Broadcast Studio
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.375rem" }}>
          Generate PMGC-grade graphics from your tournament data
        </p>
      </div>

      {/* Templates */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>1. Choose Template</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.625rem" }}>
          {TEMPLATES.map(t => {
            const Icon = t.icon;
            const active = selectedTemplate.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => t.ready && setSelectedTemplate(t)}
                disabled={!t.ready}
                style={{
                  textAlign: "left", padding: "0.875rem", borderRadius: "0.75rem",
                  border: active ? `1px solid ${t.color}40` : "1px solid rgba(255,255,255,0.08)",
                  background: active ? `${t.color}10` : t.ready ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
                  opacity: t.ready ? 1 : 0.5, cursor: t.ready ? "pointer" : "not-allowed",
                  position: "relative", transition: "all 0.15s",
                }}
              >
                {!t.ready && (
                  <span style={{ position: "absolute", top: "0.375rem", right: "0.375rem", fontSize: "0.55rem", background: "rgba(168,85,247,0.2)", color: "#c084fc", padding: "0.1rem 0.375rem", borderRadius: "9999px", fontWeight: 800 }}>SOON</span>
                )}
                <Icon style={{ width: "1.125rem", height: "1.125rem", marginBottom: "0.375rem", color: active ? t.color : "#6b7280" }} />
                <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.75rem" }}>{t.name}</div>
                <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "0.125rem" }}>{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <FilterIcon style={{ width: "0.75rem", height: "0.75rem" }} />
            2. Filters
            {hasFilters && <span style={{ background: "#f59e0b", color: "#000", fontSize: "0.6rem", padding: "0.1rem 0.5rem", borderRadius: "9999px", fontWeight: 800 }}>ACTIVE</span>}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} style={{ fontSize: "0.7rem", color: "#6b7280", background: "transparent", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <X style={{ width: "0.7rem", height: "0.7rem" }} />
              Clear
            </button>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "1rem" }}>
          <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            {[
              { key: "overall", label: "Overall" },
              { key: "stage", label: "Stage", disabled: stages.length === 0 },
              { key: "group", label: "Group", disabled: stages.length === 0 },
              { key: "day", label: "Day", disabled: availableDays.length === 0 },
              { key: "match", label: "Match" },
            ].map((f: any) => (
              <button
                key={f.key}
                onClick={() => !f.disabled && setFilterType(f.key)}
                disabled={f.disabled}
                style={{
                  padding: "0.375rem 0.75rem", borderRadius: "0.375rem",
                  fontSize: "0.7rem", fontWeight: 700,
                  background: filterType === f.key ? "#f59e0b" : "rgba(255,255,255,0.05)",
                  color: filterType === f.key ? "#000" : f.disabled ? "#4b5563" : "#d1d5db",
                  border: "none", cursor: f.disabled ? "not-allowed" : "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filterType === "stage" && (
            <div>
              <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.25rem" }}>Select Stage</label>
              <select value={filterStageId} onChange={e => { setFilterStageId(e.target.value); setSubtitle("Stage Standings"); }} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.8rem", outline: "none" }}>
                <option value="" style={{ background: "#111116" }}>-- Select --</option>
                {stages.map((s: any) => <option key={s.id} value={s.id} style={{ background: "#111116" }}>{s.name}</option>)}
              </select>
            </div>
          )}

          {filterType === "group" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.25rem" }}>Stage</label>
                <select value={filterStageId} onChange={e => { setFilterStageId(e.target.value); setFilterGroupId(""); }} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.8rem", outline: "none" }}>
                  <option value="" style={{ background: "#111116" }}>-- Select Stage --</option>
                  {stages.map((s: any) => <option key={s.id} value={s.id} style={{ background: "#111116" }}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.25rem" }}>Group</label>
                <select value={filterGroupId} onChange={e => { setFilterGroupId(e.target.value); setSubtitle("Group Standings"); }} disabled={!filterStageId} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.8rem", outline: "none", opacity: filterStageId ? 1 : 0.5 }}>
                  <option value="" style={{ background: "#111116" }}>-- Select Group --</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id} style={{ background: "#111116" }}>{g.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {filterType === "day" && (
            <div>
              <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.25rem" }}>Select Day</label>
              <select value={filterDay} onChange={e => { setFilterDay(Number(e.target.value)); setSubtitle("Day " + e.target.value + " Standings"); }} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.8rem", outline: "none" }}>
                <option value="" style={{ background: "#111116" }}>-- Select Day --</option>
                {availableDays.map(d => <option key={d} value={d} style={{ background: "#111116" }}>Day {d}</option>)}
              </select>
            </div>
          )}

          {filterType === "match" && (
            <div>
              <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.5rem" }}>
                Select Matches ({filterMatchIds.length} selected)
              </label>
              <div style={{ maxHeight: "12rem", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.375rem" }}>
                {tournament.matches.slice(0, 30).map((m: any, idx: number) => {
                  const isSel = filterMatchIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => { toggleMatch(m.id); setSubtitle("Match Highlights"); }}
                      style={{
                        padding: "0.5rem", borderRadius: "0.375rem",
                        border: isSel ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.08)",
                        background: isSel ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                        color: isSel ? "#f59e0b" : "#d1d5db",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.7rem" }}>Match {m.matchNumber || idx + 1}</div>
                      <div style={{ fontSize: "0.6rem", color: "#6b7280" }}>{m.map || "Erangel"}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <Search style={{ width: "0.75rem", height: "0.75rem" }} />
          3. Search
        </div>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#6b7280" }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search team name or tag..." style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "0.75rem 2.75rem", color: "#fff", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#6b7280", cursor: "pointer" }}>
              <X style={{ width: "1rem", height: "1rem" }} />
            </button>
          )}
        </div>
      </div>

      {/* Config */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>4. Configure</div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.375rem" }}>FORMAT</label>
              <select value={size.name} onChange={e => setSize(SIZES.find(s => s.name === e.target.value) || SIZES[0])} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.8rem", outline: "none" }}>
                {SIZES.map(s => <option key={s.name} value={s.name} style={{ background: "#111116" }}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.375rem" }}>SHOW TOP</label>
              <select value={topN} onChange={e => setTopN(Number(e.target.value))} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.8rem", outline: "none" }}>
                {[5,8,10,12,16,20,25].map(n => <option key={n} value={n} style={{ background: "#111116" }}>Top {n}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.375rem" }}>SUBTITLE</label>
              <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Overall Standings, Day 1..." style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#fff", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.75rem" }}>
              <input type="checkbox" checked={showSponsors} onChange={e => setShowSponsors(e.target.checked)} style={{ width: "1rem", height: "1rem", accentColor: "#f59e0b" }} />
              <span style={{ color: "#fff" }}>Sponsors</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.75rem" }}>
              <input type="checkbox" checked={showSocial} onChange={e => setShowSocial(e.target.checked)} style={{ width: "1rem", height: "1rem", accentColor: "#f59e0b" }} />
              <span style={{ color: "#fff" }}>Social Links</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.75rem", gridColumn: "1 / -1" }}>
              <input type="checkbox" checked={showAdvanced} onChange={e => setShowAdvanced(e.target.checked)} style={{ width: "1rem", height: "1rem", accentColor: "#f59e0b" }} />
              <span style={{ color: "#fff" }}>Advanced Stats (Avg Kills, Avg Placement)</span>
            </label>
          </div>

          {hasFilters && (
            <div style={{ marginTop: "0.875rem", padding: "0.625rem 0.875rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "0.5rem", fontSize: "0.7rem", color: "#fbbf24" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.125rem" }}>Active Filters</div>
              <div>Showing standings from {filteredMatches.length} matches</div>
            </div>
          )}
        </div>
      </div>

      {/* Generate */}
      <button onClick={openPreview} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
        background: "linear-gradient(to right, #f59e0b, #f97316)",
        color: "#000", fontWeight: 800,
        padding: "1rem", borderRadius: "0.875rem", fontSize: "1rem",
        boxShadow: "0 10px 30px rgba(245,158,11,0.3)", border: "none", cursor: "pointer",
        marginBottom: "1rem",
      }}>
        <ExternalLink style={{ width: "1.125rem", height: "1.125rem" }} />
        Open Preview & Download
      </button>

      <div style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "0.75rem", padding: "1rem 1.25rem", fontSize: "0.75rem", color: "#93c5fd" }}>
        <div style={{ fontWeight: 700, color: "#60a5fa", marginBottom: "0.375rem" }}>3 Ways to Save Your Image</div>
        <ol style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <li>Click the yellow <strong style={{ color: "#fbbf24" }}>Download PNG</strong> button in preview</li>
          <li>Right-click the image → Save image as</li>
          <li>Press <strong>Win+Shift+S</strong> → Select area → Ctrl+V to paste</li>
        </ol>
      </div>
    </div>
  );
}