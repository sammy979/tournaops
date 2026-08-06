"use client";
import { useEffect, useState, useRef, use } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2, Info } from "lucide-react";

// PMGC/PMWC Official Scoring
const PLACEMENT_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1,
};

type Standing = {
  teamId: string;
  teamName: string;
  teamTag: string;
  teamLogo: string;
  totalPoints: number;
  placementPoints: number;
  kills: number;
  wwcd: number;
  matchesPlayed: number;
  avgKills: number;
  avgPlacement: number;
  bestPlacement: number;
  highestKills: number;
};

function calculateStandings(teams: any[], matches: any[], filters: {
  matchIds?: string[];
  stageId?: string;
  groupId?: string;
  day?: number;
} = {}): Standing[] {
  const map = new Map<string, Standing>();
  teams.forEach((t: any) => {
    map.set(t.id, {
      teamId: t.id,
      teamName: t.name || "",
      teamTag: t.tag || "",
      teamLogo: t.logo || "",
      totalPoints: 0,
      placementPoints: 0,
      kills: 0,
      wwcd: 0,
      matchesPlayed: 0,
      avgKills: 0,
      avgPlacement: 0,
      bestPlacement: 999,
      highestKills: 0,
    });
  });
  
  const placementSums = new Map<string, number>();
  
    // Apply filters
  let filteredMatches = matches;
  if (filters.matchIds && filters.matchIds.length > 0) {
    filteredMatches = filteredMatches.filter((m: any) => filters.matchIds!.includes(m.id));
  }
  if (filters.stageId) {
    filteredMatches = filteredMatches.filter((m: any) => m.stageId === filters.stageId);
  }
  if (filters.groupId) {
    filteredMatches = filteredMatches.filter((m: any) => m.groupId === filters.groupId);
  }
  if (filters.day !== undefined) {
    filteredMatches = filteredMatches.filter((m: any) => {
      if (!m.startTime) return false;
      const d = new Date(m.startTime);
      return d.getDate() === filters.day;
    });
  }
  
  filteredMatches.forEach((m: any) => {
    const results = Array.isArray(m.results) ? m.results : [];
    results.forEach((r: any) => {
      const s = map.get(r.teamId);
      if (!s) return;
      const kills = Number(r.kills) || 0;
      const placement = Number(r.placement) || 0;
      const pts = PLACEMENT_POINTS[placement] || 0;
      
      s.kills += kills;
      s.placementPoints += pts;
      s.totalPoints += kills + pts;
      if (r.wwcd || placement === 1) s.wwcd += 1;
      s.matchesPlayed += 1;
      
      if (placement > 0 && placement < s.bestPlacement) s.bestPlacement = placement;
      if (kills > s.highestKills) s.highestKills = kills;
      
      const currentSum = placementSums.get(r.teamId) || 0;
      placementSums.set(r.teamId, currentSum + (placement || 16));
    });
  });
  
  // Calculate averages
  map.forEach((s, teamId) => {
    if (s.matchesPlayed > 0) {
      s.avgKills = Math.round((s.kills / s.matchesPlayed) * 10) / 10;
      const placementSum = placementSums.get(teamId) || 0;
      s.avgPlacement = Math.round((placementSum / s.matchesPlayed) * 10) / 10;
    }
  });
  
  return Array.from(map.values())
    .filter(s => s.matchesPlayed > 0)
    .sort((a, b) => {
      // PMGC Official Tie-Breaker Rules
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.wwcd !== a.wwcd) return b.wwcd - a.wwcd;
      if (b.kills !== a.kills) return b.kills - a.kills;
      if (a.bestPlacement !== b.bestPlacement) return a.bestPlacement - b.bestPlacement;
      return 0;
    });
}

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tournament, setTournament] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [ready, setReady] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<{
    stageId?: string;
    groupId?: string;
    day?: number;
    matchIds?: string[];
    search?: string;
  }>({});
  const [config, setConfig] = useState({
    topN: 16,
    subtitle: "Overall Standings",
    format: "youtube",
    showSponsors: true,
    showSocial: true,
    showAdvanced: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      setConfig({
        topN: Math.min(Number(sp.get("top") || 16), 25),
        subtitle: sp.get("subtitle") || "Overall Standings",
        format: sp.get("format") || "youtube",
        showSponsors: sp.get("sponsors") !== "0",
        showSocial: sp.get("social") !== "0",
        showAdvanced: sp.get("advanced") !== "0",
      });
      setFilters({
        stageId: sp.get("stageId") || "",
        groupId: sp.get("groupId") || "",
        day: sp.get("day") ? Number(sp.get("day")) : undefined,
        matchIds: sp.get("matchIds") ? sp.get("matchIds")!.split(",") : [],
        search: sp.get("search") || "",
      });
    }
    fetch("/api/tournaments/" + id).then(r => r.json()).then(d => setTournament(d.tournament)).catch(() => {});
  }, [id]);

  useEffect(() => { if (tournament) setTimeout(() => setReady(true), 800); }, [tournament]);

  const download = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 500));
      const el = cardRef.current;
      const w = el.scrollWidth;
      const h = el.scrollHeight;
      console.log("[DOWNLOAD] Capturing:", w, "x", h, "teams:", config.topN);
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        width: w,
        height: h,
        backgroundColor: "#0a0a0a",
      });
      const link = document.createElement("a");
      link.download = (tournament?.name || "standings") + "-" + config.format + "-" + Date.now() + ".png";
      link.href = dataUrl;
      link.click();
    } catch (e: any) {
      alert("Download failed: " + e?.message + "\n\nTIP: Right-click the image below and select 'Save image as...' as backup!");
    } finally {
      setDownloading(false);
    }
  };

  if (!tournament) {
    return (
      <div style={{ padding: 40, color: "#999", background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 40, height: 40, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const sizes: Record<string, { w: number; h: number }> = {
    youtube: { w: 1920, h: 1080 },
    instagram: { w: 1080, h: 1080 },
    story: { w: 1080, h: 1920 },
  };
  const { w, h } = sizes[config.format] || sizes.youtube;

  let allStandings = calculateStandings(tournament.teams || [], tournament.matches || [], filters);
  // Apply search filter
  if (filters.search) {
    const q = filters.search.toLowerCase();
    allStandings = allStandings.filter(s => 
      s.teamName.toLowerCase().includes(q) || 
      s.teamTag.toLowerCase().includes(q)
    );
  }
  const standings = allStandings.slice(0, config.topN);
  const branding: any = tournament.brandingData || {};
  const primaryColor = branding.primaryColor || "#FFD700";
  const accentColor = branding.accentColor || "#3b82f6";
  const orgName = branding.orgName || branding.organizerName || "Tournament Organizer";
  const orgLogo = branding.orgLogo || "";
  const discordUrl = branding.discordUrl || tournament.discord || "";
  const websiteUrl = branding.websiteUrl || "";
  const instagramUrl = branding.instagramUrl || "";
  const sponsors: any[] = Array.isArray(tournament.sponsorLogos) ? tournament.sponsorLogos : [];

  const isVertical = h > w;
  const isSquare = w === h;
  const teamCount = standings.length;
  const factor = teamCount <= 8 ? 1 : teamCount <= 12 ? 0.9 : teamCount <= 16 ? 0.78 : 0.65;
  
  const titleSize = isVertical ? 88 : isSquare ? 72 : 96;
  const teamNameSize = Math.round((isVertical ? 30 : isSquare ? 24 : 28) * factor);
  const numSize = Math.round((isVertical ? 36 : isSquare ? 28 : 36) * factor);
  const totalSize = Math.round((isVertical ? 50 : isSquare ? 40 : 50) * factor);
  const rowHeight = Math.round(66 * factor);
  const rowGap = Math.max(4, Math.round(10 * factor));
  const logoSize = Math.max(36, Math.round(52 * factor));

  const scale = Math.min(1, 1360 / w);

  return (
    <div style={{ minHeight: "100vh", background: "#000", padding: 20 }}>
      {/* TOP BAR */}
      <div style={{ maxWidth: 1400, margin: "0 auto 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, background: "#111", padding: "14px 20px", borderRadius: 12, border: "1px solid #333" }}>
        <div style={{ color: "#fff", fontFamily: "system-ui" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{tournament.name}</div>
          <div style={{ fontSize: 13, color: "#999" }}>{standings.length} teams · PMGC Scoring</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button 
            onClick={() => setShowTip(!showTip)} 
            style={{ background: "#222", color: "#fff", border: "1px solid #444", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Info size={14} /> How to Save
          </button>
          <button
            onClick={download}
            disabled={downloading || !ready}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#facc15", color: "#000", fontWeight: 800,
              padding: "14px 28px", borderRadius: 10, border: "none",
              cursor: (downloading || !ready) ? "wait" : "pointer",
              fontSize: 16, opacity: (downloading || !ready) ? 0.6 : 1,
              fontFamily: "system-ui",
              boxShadow: "0 4px 20px rgba(250,204,21,0.3)",
            }}
          >
            {downloading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={18} />}
            {downloading ? "Downloading..." : "Download PNG (" + standings.length + " teams)"}
          </button>
        </div>
      </div>

      {/* Tips Panel */}
      {showTip && (
        <div style={{ maxWidth: 1400, margin: "0 auto 20px", background: "#1e293b", padding: "16px 20px", borderRadius: 12, border: "1px solid #3b82f6", color: "#fff", fontFamily: "system-ui", fontSize: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#60a5fa" }}>💾 3 Ways to Save This Image:</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <div><strong style={{ color: "#facc15" }}>Method 1 (Auto):</strong><br />Click the yellow "Download PNG" button above</div>
            <div><strong style={{ color: "#facc15" }}>Method 2 (Right-click):</strong><br />Right-click the image → "Save image as..."</div>
            <div><strong style={{ color: "#facc15" }}>Method 3 (Windows):</strong><br />Press Win+Shift+S → Select area → Ctrl+V to paste in Discord/browser</div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* CARD PREVIEW */}
      <div style={{ maxWidth: 1400, margin: "0 auto", background: "#111", padding: 20, borderRadius: 12, border: "1px solid #333", overflowX: "auto" }}>
        <div style={{ transformOrigin: "top left", transform: "scale(" + scale + ")", width: w, marginBottom: h * scale - h }}>
          {/* THE CARD */}
          <div ref={cardRef} style={{ width: w, minHeight: h, background: "linear-gradient(135deg, #0a0a0a 0%, #0f172a 40%, #1a1a2e 60%, #0a0a0a 100%)", display: "flex", flexDirection: "column", padding: isVertical ? "70px 60px" : "60px 80px", position: "relative", fontFamily: "Inter, system-ui, -apple-system, sans-serif", boxSizing: "border-box" }}>
            <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, background: primaryColor, opacity: 0.15, borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -200, left: -200, width: 600, height: 600, background: accentColor, opacity: 0.15, borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
            
            {/* HEADER */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, marginBottom: 20, borderBottom: "3px solid " + primaryColor, position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {orgLogo && <img src={orgLogo} alt="" crossOrigin="anonymous" style={{ width: 90, height: 90, borderRadius: 12, objectFit: "cover", border: "2px solid " + primaryColor }} />}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ color: primaryColor, fontSize: 16, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", lineHeight: 1 }}>Organized by</div>
                  <div style={{ color: "white", fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{orgName}</div>
                </div>
              </div>
            </div>
            
            {/* TITLE */}
            <div style={{ textAlign: "center", marginBottom: 22, position: "relative", zIndex: 2 }}>
              <div style={{ color: primaryColor, fontSize: 18, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", marginBottom: 8, lineHeight: 1 }}>{config.subtitle}</div>
              <div style={{ color: "white", fontSize: titleSize, fontWeight: 900, lineHeight: 1, letterSpacing: -2, marginBottom: 8, textShadow: "0 0 40px " + primaryColor + "80" }}>{tournament.name}</div>
              <div style={{ color: "#9ca3af", fontSize: 17, fontWeight: 500, lineHeight: 1 }}>Top {standings.length} · {(tournament.matches || []).length} Matches · PMGC Scoring</div>
            </div>
            
            {/* TABLE */}
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: rowGap }}>
              <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", background: primaryColor + "30", borderRadius: 10, color: primaryColor, fontWeight: 800, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", lineHeight: 1 }}>
                <div style={{ width: 70, textAlign: "center" }}>Rank</div>
                <div style={{ flex: 1 }}>Team</div>
                <div style={{ width: 70, textAlign: "center" }}>M</div>
                <div style={{ width: 80, textAlign: "center" }}>WWCD</div>
                <div style={{ width: 80, textAlign: "center" }}>Kills</div>
                {config.showAdvanced && <div style={{ width: 80, textAlign: "center" }}>Avg K</div>}
                <div style={{ width: 80, textAlign: "center" }}>Place</div>
                {config.showAdvanced && <div style={{ width: 80, textAlign: "center" }}>Avg P</div>}
                <div style={{ width: 120, textAlign: "center" }}>Total</div>
              </div>
              
              {standings.map((s, idx) => {
                const rank = idx + 1;
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;
                const rowBg = isFirst ? "linear-gradient(90deg, rgba(255,215,0,0.28) 0%, rgba(255,215,0,0.04) 100%)"
                  : isSecond ? "linear-gradient(90deg, rgba(192,192,192,0.22) 0%, rgba(192,192,192,0.04) 100%)"
                  : isThird ? "linear-gradient(90deg, rgba(205,127,50,0.22) 0%, rgba(205,127,50,0.04) 100%)"
                  : "rgba(255,255,255,0.04)";
                const rankColor = isFirst ? "#FFD700" : isSecond ? "#C0C0C0" : isThird ? "#CD7F32" : "white";
                return (
                  <div key={s.teamId} style={{ display: "flex", alignItems: "center", padding: "10px 20px", background: rowBg, borderRadius: 10, height: rowHeight, border: isFirst ? "2px solid " + rankColor + "70" : "1px solid rgba(255,255,255,0.06)", boxSizing: "border-box" }}>
                    <div style={{ width: 70, textAlign: "center", color: rankColor, fontSize: numSize, fontWeight: 900, lineHeight: 1 }}>#{rank}</div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                      {s.teamLogo ? <img src={s.teamLogo} alt="" crossOrigin="anonymous" style={{ width: logoSize, height: logoSize, borderRadius: 8, objectFit: "cover", border: "2px solid " + primaryColor + "80" }} /> : <div style={{ width: logoSize, height: logoSize, borderRadius: 8, background: primaryColor + "30", display: "flex", alignItems: "center", justifyContent: "center", color: primaryColor, fontSize: Math.round(logoSize * 0.35), fontWeight: 900, lineHeight: 1 }}>{(s.teamTag || s.teamName).slice(0, 2).toUpperCase()}</div>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {s.teamTag && <div style={{ color: primaryColor, fontSize: Math.max(10, Math.round(teamNameSize * 0.4)), fontWeight: 700, lineHeight: 1, letterSpacing: 1 }}>[{s.teamTag}]</div>}
                        <div style={{ color: "white", fontSize: teamNameSize, fontWeight: 700, lineHeight: 1.1 }}>{s.teamName}</div>
                      </div>
                    </div>
                    <div style={{ width: 70, textAlign: "center", color: "white", fontSize: numSize - 6, fontWeight: 600, lineHeight: 1 }}>{s.matchesPlayed}</div>
                    <div style={{ width: 80, textAlign: "center" }}>
                      <span style={{ display: "inline-block", background: s.wwcd > 0 ? primaryColor : "rgba(255,255,255,0.1)", color: s.wwcd > 0 ? "#000" : "#666", padding: "5px 14px", borderRadius: 20, fontSize: numSize - 8, fontWeight: 900, lineHeight: 1, minWidth: 36 }}>{s.wwcd}</span>
                    </div>
                    <div style={{ width: 80, textAlign: "center", color: "#ef4444", fontSize: numSize - 2, fontWeight: 900, lineHeight: 1 }}>{s.kills}</div>
                    {config.showAdvanced && <div style={{ width: 80, textAlign: "center", color: "#f97316", fontSize: numSize - 6, fontWeight: 700, lineHeight: 1 }}>{s.avgKills}</div>}
                    <div style={{ width: 80, textAlign: "center", color: "#a5f3fc", fontSize: numSize - 4, fontWeight: 700, lineHeight: 1 }}>{s.placementPoints}</div>
                    {config.showAdvanced && <div style={{ width: 80, textAlign: "center", color: "#93c5fd", fontSize: numSize - 6, fontWeight: 700, lineHeight: 1 }}>{s.avgPlacement}</div>}
                    <div style={{ width: 120, textAlign: "center", color: primaryColor, fontSize: totalSize, fontWeight: 900, lineHeight: 1, textShadow: "0 0 20px " + primaryColor + "80" }}>{s.totalPoints}</div>
                  </div>
                );
              })}
            </div>
            
            {/* SPONSORS */}
            {config.showSponsors && sponsors.length > 0 && (
              <div style={{ position: "relative", zIndex: 2, marginTop: 18, padding: "16px 30px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: primaryColor, fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", textAlign: "center", marginBottom: 10, lineHeight: 1 }}>Official Sponsors</div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
                  {sponsors.slice(0, 6).map((sp: any, i: number) => (
                    <img key={i} src={typeof sp === "string" ? sp : sp.url} alt="" crossOrigin="anonymous" style={{ height: 50, maxWidth: 140, objectFit: "contain", opacity: 0.95 }} />
                  ))}
                </div>
              </div>
            )}
            
            {/* FOOTER */}
            <div style={{ position: "relative", zIndex: 2, marginTop: 16, paddingTop: 12, borderTop: "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 30, alignItems: "center", flexWrap: "wrap" }}>
                {config.showSocial && discordUrl && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: 1 }}><span style={{ color: "#5865F2", fontWeight: 800 }}>DISCORD</span><span style={{ color: "#9ca3af" }}>{discordUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span></div>}
                {config.showSocial && instagramUrl && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: 1 }}><span style={{ color: "#E1306C", fontWeight: 800 }}>INSTA</span><span style={{ color: "#9ca3af" }}>{instagramUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span></div>}
                {config.showSocial && websiteUrl && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: 1 }}><span style={{ color: primaryColor, fontWeight: 800 }}>WEB</span><span style={{ color: "#9ca3af" }}>{websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span></div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ color: primaryColor, fontSize: 14, fontWeight: 800, lineHeight: 1 }}>TournaOps.com</div>
                <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1 }}>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}