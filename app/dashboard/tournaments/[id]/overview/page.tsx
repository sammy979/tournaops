"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TournamentNav from "@/components/tournament/TournamentNav";
import TeamLogo from "@/components/tournament/TeamLogo";
import {
  Trophy, Users, Play, BarChart3, Shield, Crosshair,
  Radio, Sparkles, Loader2, ExternalLink, Copy, Check,
  Settings2, Calendar, Target, Palette, MessageSquare,
  ChevronRight, Layers, FileText, Crown, Zap, Award,
  TrendingUp, Clock, Globe, Lock, Unlock, AlertCircle
} from "lucide-react";

interface QuickStat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
}

export default function TournamentOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regCopied, setRegCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(d => setTournament(d.tournament))
      .finally(() => setLoading(false));
  }, [id]);

  function copyLink(type: "public" | "register") {
    if (!tournament?.slug) return;
    const url = type === "public"
      ? `${window.location.origin}/tournaments/${tournament.slug}`
      : `${window.location.origin}/tournaments/${tournament.slug}/register`;
    navigator.clipboard.writeText(url);
    if (type === "public") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setRegCopied(true);
      setTimeout(() => setRegCopied(false), 2000);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!tournament) return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <Trophy style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
      <p style={{ color: "#9ca3af" }}>Tournament not found</p>
    </div>
  );

  const teams = tournament.teams || [];
  const matches = tournament.matches || [];
  const stages = tournament.stages || [];
  const completedMatches = matches.filter((m: any) => m.status === "completed").length;
  const pendingMatches = matches.filter((m: any) => m.status === "pending").length;
  const progress = matches.length > 0 ? Math.round((completedMatches / matches.length) * 100) : 0;
  const primaryColor = tournament.brandingData?.primaryColor || "#f59e0b";

  // Calculate leaderboard
  const leaderboard = (() => {
    const map = new Map<string, any>();
    for (const t of teams) {
      map.set(t.id, { id: t.id, name: t.name, tag: t.tag, logo: t.logo, totalPoints: 0, totalKills: 0, wwcds: 0 });
    }
    const sr = tournament.scoringRule || {};
    const kp = Number(sr.killPoints) || 1;
    let pp: number[] = [10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0];
    if (Array.isArray(sr.placementPoints)) pp = sr.placementPoints;
    for (const m of matches) {
      if (m.status !== "completed" || !Array.isArray(m.results)) continue;
      for (const r of m.results) {
        const s = map.get(r.teamId);
        if (!s) continue;
        const kills = Number(r.kills) || 0;
        const placement = Number(r.placement) || 16;
        const pIdx = Math.max(0, placement - 1);
        const pPts = pp[pIdx] || 0;
        const isW = placement === 1 || r.wwcd;
        s.totalKills += kills;
        s.totalPoints += pPts + kills * kp;
        if (isW) s.wwcds++;
      }
    }
    return Array.from(map.values())
      .filter(s => s.totalPoints > 0 || completedMatches > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  })();

  const leader = leaderboard[0] || null;

  const statusConfig: Record<string, any> = {
    live: { label: "LIVE", color: "#4ade80", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)", dot: true },
    draft: { label: "DRAFT", color: "#9ca3af", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)" },
    registration: { label: "REGISTRATION", color: "#60a5fa", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)" },
    completed: { label: "COMPLETED", color: "#c084fc", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)" },
    cancelled: { label: "CANCELLED", color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
  };
  const sc = statusConfig[tournament.status] || statusConfig.draft;

  const quickStats: QuickStat[] = [
    { label: "Teams", value: teams.length, icon: Users, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
    { label: "Completed", value: completedMatches, icon: Check, color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
    { label: "Pending", value: pendingMatches, icon: Clock, color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
    { label: "Stages", value: stages.length, icon: Layers, color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
  ];

  const commandActions = [
    { icon: Trophy, label: "Match Results", desc: "Enter & edit results", href: `/dashboard/tournaments/${id}/match-results`, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
    { icon: BarChart3, label: "Standings", desc: "Live leaderboard", href: `/dashboard/tournaments/${id}/standings`, color: "#60a5fa", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)" },
    { icon: Users, label: "Teams", desc: `${teams.length} registered`, href: `/dashboard/tournaments/${id}/teams`, color: "#4ade80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
    { icon: Layers, label: "Stages", desc: "Manage stages", href: `/dashboard/tournaments/${id}/stages`, color: "#c084fc", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.2)" },
    { icon: Play, label: "Matches", desc: `${matches.length} total`, href: `/dashboard/tournaments/${id}/matches`, color: "#fb923c", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)" },
    { icon: Radio, label: "OBS Overlays", desc: "Broadcast tools", href: `/dashboard/tournaments/${id}/overlays`, color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.2)" },
    { icon: MessageSquare, label: "Discord", desc: "Webhooks & bots", href: `/dashboard/tournaments/${id}/broadcast`, color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.2)" },
    { icon: Palette, label: "Branding", desc: "Colors & sponsors", href: `/dashboard/tournaments/${id}/branding`, color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
    { icon: Sparkles, label: "AI Insights", desc: "Smart analysis", href: `/dashboard/tournaments/${id}/insights`, color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)" },
    { icon: FileText, label: "Report", desc: "Tournament report", href: `/tournaments/${tournament.slug}/report`, color: "#38bdf8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.2)", external: true },
    { icon: Settings2, label: "Settings", desc: "Tournament config", href: `/dashboard/tournaments/${id}/settings`, color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" },
    { icon: Globe, label: "Public Page", desc: "View public site", href: `/tournaments/${tournament.slug}`, color: "#fb923c", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", external: true },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <TournamentNav tournamentId={id} />

      {/* ── HERO ── */}
      <div style={{
        background: tournament.bannerImage
          ? `linear-gradient(180deg,rgba(10,10,15,.65),rgba(10,10,15,.97)),url(${tournament.bannerImage}) center/cover`
          : `linear-gradient(135deg,${primaryColor}08,rgba(249,115,22,.02))`,
        borderRadius: "1.25rem",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                padding: "0.2rem 0.75rem", borderRadius: "9999px",
                fontSize: "0.65rem", fontWeight: 800,
                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {sc.dot && <span style={{ width: "0.4rem", height: "0.4rem", borderRadius: "50%", background: sc.color, animation: "pulse 2s infinite" }} />}
                {sc.label}
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 800, color: "#fff", marginBottom: "0.5rem", lineHeight: 1.1 }}>
              {tournament.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#9ca3af", fontSize: "0.8rem", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                <Users style={{ width: "0.875rem", height: "0.875rem" }} />
                {teams.length}/{tournament.maxTeams} Teams
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                <Play style={{ width: "0.875rem", height: "0.875rem" }} />
                {completedMatches}/{matches.length} Matches
              </span>
              {tournament.prizePool && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#fbbf24" }}>
                  <Trophy style={{ width: "0.875rem", height: "0.875rem" }} />
                  {tournament.prizePool}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button onClick={() => copyLink("public")}
              style={{ display:"inline-flex",alignItems:"center",gap:"0.375rem",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"0.625rem",padding:"0.5rem 0.875rem",color:copied?"#4ade80":"#d1d5db",fontSize:"0.75rem",fontWeight:600,cursor:"pointer" }}>
              {copied ? <><Check style={{width:"0.875rem",height:"0.875rem"}}/>Copied!</> : <><Copy style={{width:"0.875rem",height:"0.875rem"}}/>Copy Link</>}
            </button>
            {tournament.status === "registration" && (
              <button onClick={() => copyLink("register")}
                style={{ display:"inline-flex",alignItems:"center",gap:"0.375rem",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"0.625rem",padding:"0.5rem 0.875rem",color:regCopied?"#4ade80":"#60a5fa",fontSize:"0.75rem",fontWeight:600,cursor:"pointer" }}>
                {regCopied ? <><Check style={{width:"0.875rem",height:"0.875rem"}}/>Copied!</> : <><Copy style={{width:"0.875rem",height:"0.875rem"}}/>Reg Link</>}
              </button>
            )}
            {tournament.slug && (
              <Link href={`/tournaments/${tournament.slug}`} target="_blank"
                style={{ display:"inline-flex",alignItems:"center",gap:"0.375rem",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"0.625rem",padding:"0.5rem 0.875rem",color:"#d1d5db",fontSize:"0.75rem",fontWeight:600,textDecoration:"none" }}>
                <ExternalLink style={{width:"0.875rem",height:"0.875rem"}}/>View Public
              </Link>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {matches.length > 0 && (
          <div style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.375rem" }}>
              <span>Tournament Progress</span>
              <span style={{ color: primaryColor, fontWeight: 700 }}>{progress}% ({completedMatches}/{matches.length})</span>
            </div>
            <div style={{ height: "0.375rem", background: "rgba(255,255,255,0.08)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(to right,${primaryColor},#f97316)`, borderRadius: "9999px", transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}
      </div>

      {/* ── QUICK STATS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {quickStats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"1rem",padding:"1rem" }}>
              <div style={{ width:"1.75rem",height:"1.75rem",borderRadius:"0.5rem",background:stat.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"0.625rem" }}>
                <Icon style={{ width:"0.875rem",height:"0.875rem",color:stat.color }} />
              </div>
              <div style={{ fontSize:"1.5rem",fontWeight:800,color:"#fff",lineHeight:1 }}>{stat.value}</div>
              <div style={{ fontSize:"0.65rem",color:"#6b7280",marginTop:"0.375rem",textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600 }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }} className="overview-grid">

        {/* ── COMMAND CENTER ── */}
        <div>
          <div style={{ fontSize:"0.65rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.75rem" }}>
            Command Center
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"0.625rem" }}>
            {commandActions.map(action => {
              const Icon = action.icon;
              const content = (
                <div style={{
                  display:"flex",alignItems:"center",gap:"0.75rem",
                  padding:"0.875rem 1rem",
                  background:"rgba(255,255,255,0.03)",
                  border:`1px solid ${action.border}`,
                  borderRadius:"0.875rem",
                  textDecoration:"none",
                  transition:"all 0.2s",
                  cursor:"pointer",
                  width:"100%",
                  textAlign:"left",
                }}>
                  <div style={{ width:"2.25rem",height:"2.25rem",borderRadius:"0.625rem",background:action.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Icon style={{ width:"1.125rem",height:"1.125rem",color:action.color }} />
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:"0.85rem",fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:"0.25rem" }}>
                      {action.label}
                      {action.external && <ExternalLink style={{width:"0.625rem",height:"0.625rem",color:"#6b7280"}}/>}
                    </div>
                    <div style={{ fontSize:"0.7rem",color:"#6b7280",marginTop:"0.125rem" }}>{action.desc}</div>
                  </div>
                  <ChevronRight style={{ width:"0.875rem",height:"0.875rem",color:"#4b5563",flexShrink:0 }} />
                </div>
              );
              return action.external
                ? <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>{content}</a>
                : <Link key={action.label} href={action.href} style={{ textDecoration:"none" }}>{content}</Link>;
            })}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>

          {/* Current Leader */}
          {leader && (
            <div style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${primaryColor}30`,borderRadius:"1rem",padding:"1.25rem" }}>
              <div style={{ fontSize:"0.65rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.875rem",display:"flex",alignItems:"center",gap:"0.375rem" }}>
                <Crown style={{ width:"0.75rem",height:"0.75rem",color:primaryColor }} />
                Current Leader
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:"0.875rem" }}>
                <TeamLogo name={leader.name} tag={leader.tag} logo={leader.logo} size={52} />
                <div style={{ flex:1,minWidth:0 }}>
                  {leader.tag && <div style={{ fontSize:"0.65rem",color:primaryColor,fontWeight:700 }}>[{leader.tag}]</div>}
                  <div style={{ fontSize:"1rem",fontWeight:800,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{leader.name}</div>
                  <div style={{ display:"flex",gap:"0.875rem",marginTop:"0.25rem",fontSize:"0.75rem" }}>
                    <span style={{ color:primaryColor,fontWeight:700 }}>{leader.totalPoints} pts</span>
                    <span style={{ color:"#f87171" }}>{leader.totalKills}K</span>
                    {leader.wwcds > 0 && <span style={{ color:"#c084fc" }}>{leader.wwcds}W</span>}
                  </div>
                </div>
                <div style={{ fontSize:"2rem",fontWeight:900,color:primaryColor }}>1st</div>
              </div>
            </div>
          )}

          {/* Top 5 Standings */}
          {leaderboard.length > 0 && (
            <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"1rem",padding:"1.25rem" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.875rem" }}>
                <div style={{ fontSize:"0.65rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.1em" }}>Top Teams</div>
                <Link href={`/dashboard/tournaments/${id}/standings`} style={{ fontSize:"0.65rem",color:primaryColor,fontWeight:700,textDecoration:"none" }}>View All</Link>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem" }}>
                {leaderboard.slice(0, 5).map(s => {
                  const rc = s.rank === 1 ? "#fbbf24" : s.rank === 2 ? "#d1d5db" : s.rank === 3 ? "#f97316" : "#6b7280";
                  return (
                    <div key={s.id} style={{ display:"flex",alignItems:"center",gap:"0.625rem",padding:"0.5rem 0.375rem" }}>
                      <span style={{ width:"1.5rem",textAlign:"center",fontWeight:800,fontSize:"0.85rem",color:rc }}>#{s.rank}</span>
                      <TeamLogo name={s.name} tag={s.tag} logo={s.logo} size={28} />
                      <span style={{ flex:1,fontSize:"0.8rem",fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.name}</span>
                      <span style={{ fontSize:"0.85rem",fontWeight:800,color:primaryColor }}>{s.totalPoints}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Discord Status */}
          <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"1rem",padding:"1.25rem" }}>
            <div style={{ fontSize:"0.65rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.875rem" }}>Integrations</div>
            <div style={{ display:"flex",flexDirection:"column",gap:"0.625rem" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                  <div style={{ width:"0.5rem",height:"0.5rem",borderRadius:"50%",background:tournament.discord?"#4ade80":"#374151" }} />
                  <span style={{ fontSize:"0.8rem",color:"#d1d5db" }}>Discord Webhook</span>
                </div>
                <span style={{ fontSize:"0.7rem",color:tournament.discord?"#4ade80":"#6b7280",fontWeight:600 }}>
                  {tournament.discord ? "Connected" : "Not set"}
                </span>
              </div>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                  <div style={{ width:"0.5rem",height:"0.5rem",borderRadius:"50%",background:tournament.overlayToken?"#4ade80":"#374151" }} />
                  <span style={{ fontSize:"0.8rem",color:"#d1d5db" }}>OBS Overlay</span>
                </div>
                <span style={{ fontSize:"0.7rem",color:tournament.overlayToken?"#4ade80":"#6b7280",fontWeight:600 }}>
                  {tournament.overlayToken ? "Ready" : "Not set"}
                </span>
              </div>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                  <div style={{ width:"0.5rem",height:"0.5rem",borderRadius:"50%",background:tournament.brandingData?.sponsors?.length>0?"#4ade80":"#374151" }} />
                  <span style={{ fontSize:"0.8rem",color:"#d1d5db" }}>Sponsors</span>
                </div>
                <span style={{ fontSize:"0.7rem",color:tournament.brandingData?.sponsors?.length>0?"#4ade80":"#6b7280",fontWeight:600 }}>
                  {tournament.brandingData?.sponsors?.length > 0 ? `${tournament.brandingData.sponsors.length} active` : "None"}
                </span>
              </div>
            </div>
          </div>

          {/* OBS Quick Links */}
          {tournament.overlayToken && (
            <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"1rem",padding:"1.25rem" }}>
              <div style={{ fontSize:"0.65rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.875rem" }}>OBS Overlays</div>
              <div style={{ display:"flex",flexDirection:"column",gap:"0.375rem" }}>
                {["Standings","Match","Chicken Dinner","Final Results","Next Match","Top Fragger"].map((name, i) => {
                  const paths = ["","match","chicken-dinner","final-results","next-match","top-fragger"];
                  const path = paths[i] ? `/${paths[i]}` : "";
                  const url = `/overlay/${tournament.overlayToken}${path}`;
                  return (
                    <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.5rem 0.625rem",borderRadius:"0.5rem",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",textDecoration:"none",transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}}>
                      <span style={{ fontSize:"0.75rem",fontWeight:600,color:"#d1d5db" }}>{name}</span>
                      <ExternalLink style={{ width:"0.75rem",height:"0.75rem",color:"#6b7280" }} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @media (max-width: 900px) {
          .overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}