"use client";
import { useDialog } from "@/lib/use-confirm";

import { useState, useRef } from "react";
import {
  X, Download, Trophy, Crosshair, Crown, Zap,
  Instagram, Twitter, MessageSquare, Palette,
  Image as ImageIcon, Check, Sparkles, Flame, Target
} from "lucide-react";
import { Tournament, Match } from "@/types/tournament";
import { getLeaderboard, getTopPlayers } from "@/lib/storage/tournaments";

interface BroadcastStudioProps {
  tournament: Tournament;
  onClose: () => void;
}

type CardType = "wwcd" | "standings" | "mvp" | "champion" | "recap";
type Theme = "midnight" | "inferno" | "toxic" | "royal" | "arctic";
type Size = "square" | "wide" | "story";

const THEMES: Record<Theme, {
  name: string;
  bg: string;
  accent: string;
  accentSoft: string;
  text: string;
  sub: string;
  glow: string;
  border: string;
}> = {
  midnight: {
    name: "Midnight",
    bg: "linear-gradient(145deg, #0a0a1a 0%, #12122a 50%, #0a0a1a 100%)",
    accent: "#60a5fa",
    accentSoft: "rgba(96,165,250,0.15)",
    text: "#ffffff",
    sub: "#8b9dc3",
    glow: "rgba(96,165,250,0.4)",
    border: "rgba(96,165,250,0.3)",
  },
  inferno: {
    name: "Inferno",
    bg: "linear-gradient(145deg, #1a0505 0%, #2d0a0a 50%, #1a0505 100%)",
    accent: "#f97316",
    accentSoft: "rgba(249,115,22,0.15)",
    text: "#ffffff",
    sub: "#d4a373",
    glow: "rgba(249,115,22,0.4)",
    border: "rgba(249,115,22,0.3)",
  },
  toxic: {
    name: "Toxic",
    bg: "linear-gradient(145deg, #051505 0%, #0a2410 50%, #051505 100%)",
    accent: "#22c55e",
    accentSoft: "rgba(34,197,94,0.15)",
    text: "#ffffff",
    sub: "#86c99a",
    glow: "rgba(34,197,94,0.4)",
    border: "rgba(34,197,94,0.3)",
  },
  royal: {
    name: "Royal",
    bg: "linear-gradient(145deg, #14051f 0%, #240a35 50%, #14051f 100%)",
    accent: "#D4AF37",
    accentSoft: "rgba(168,85,247,0.15)",
    text: "#ffffff",
    sub: "#c4a3d9",
    glow: "rgba(168,85,247,0.4)",
    border: "rgba(168,85,247,0.3)",
  },
  arctic: {
    name: "Arctic",
    bg: "linear-gradient(145deg, #051419 0%, #0a2530 50%, #051419 100%)",
    accent: "#22d3ee",
    accentSoft: "rgba(34,211,238,0.15)",
    text: "#ffffff",
    sub: "#7dd3e0",
    glow: "rgba(34,211,238,0.4)",
    border: "rgba(34,211,238,0.3)",
  },
};

const SIZES: Record<Size, { w: number; h: number; label: string; icon: any }> = {
  square: { w: 1080, h: 1080, label: "Instagram", icon: Instagram },
  wide: { w: 1600, h: 900, label: "Twitter / Discord", icon: Twitter },
  story: { w: 1080, h: 1920, label: "Story / Reels", icon: MessageSquare },
};

export default function BroadcastStudio({ tournament, onClose }: BroadcastStudioProps) {
  const dialog = useDialog();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [cardType, setCardType] = useState<CardType>("standings");
  const [theme, setTheme] = useState<Theme>("midnight");
  const [size, setSize] = useState<Size>("square");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const t = THEMES[theme];
  const dim = SIZES[size];
  const leaderboard = getLeaderboard(tournament);
  const { topKillers, topDamage } = getTopPlayers(tournament);
  const completedMatches = (tournament.matches ?? []).filter(m => m.status === "completed");
  const selectedMatch = completedMatches.find(m => m.id === selectedMatchId) || completedMatches[completedMatches.length - 1];

  const exportCard = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${tournament.name}-${cardType}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setExported(true);
      setTimeout(() => setExported(false), 2500);
    } catch (err) {
      console.error("Export failed:", err);
      void dialog.alert({ title: "Export Failed", description: "Export failed. Please try again.", variant: "danger" });
    } finally {
      setExporting(false);
    }
  };

  // Scale preview to fit
  const previewScale = size === "story" ? 0.22 : size === "wide" ? 0.32 : 0.38;

  const CARD_TYPES: { id: CardType; label: string; icon: any; desc: string }[] = [
    { id: "standings", label: "Standings", icon: Trophy, desc: "Top 10 leaderboard" },
    { id: "wwcd", label: "WWCD", icon: Crown, desc: "Match winner" },
    { id: "mvp", label: "MVP", icon: Crosshair, desc: "Top fragger" },
    { id: "champion", label: "Champion", icon: Sparkles, desc: "Tournament winner" },
    { id: "recap", label: "Match Recap", icon: Target, desc: "Full breakdown" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="min-h-screen p-4 lg:p-6">

        {/*  HEADER  */}
        <div className="max-w-[1600px] mx-auto flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-yellow-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Broadcast Studio</h2>
              <p className="text-gray-500 text-xs">Generate share-ready esports graphics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCard}
              disabled={exporting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                exported
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "btn-primary"
              }`}
            >
              {exported ? (
                <><Check className="w-4 h-4" />Downloaded!</>
              ) : exporting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Rendering...</>
              ) : (
                <><Download className="w-4 h-4" />Download PNG</>
              )}
            </button>
            <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white border border-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/*  CONTROLS SIDEBAR  */}
          <div className="space-y-4">

            {/* Card Type */}
            <div className="glass-card rounded-xl p-4 border border-white/10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Card Type</p>
              <div className="space-y-1.5">
                {CARD_TYPES.map(ct => {
                  const Icon = ct.icon;
                  const active = cardType === ct.id;
                  return (
                    <button
                      key={ct.id}
                      onClick={() => setCardType(ct.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                        active
                          ? "bg-blue-500/15 border border-blue-500/30"
                          : "border border-transparent hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-400" : "text-gray-600"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${active ? "text-white" : "text-gray-400"}`}>{ct.label}</p>
                        <p className="text-[10px] text-gray-600">{ct.desc}</p>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme */}
            <div className="glass-card rounded-xl p-4 border border-white/10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Palette className="w-3 h-3" />Theme
              </p>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(THEMES) as Theme[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setTheme(k)}
                    className={`aspect-square rounded-lg border-2 transition-all ${
                      theme === k ? "border-white scale-105" : "border-white/10 hover:border-white/30"
                    }`}
                    style={{ background: THEMES[k].bg }}
                    title={THEMES[k].name}
                  >
                    <div className="w-full h-full rounded-md flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: THEMES[k].accent }} />
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">{t.name}</p>
            </div>

            {/* Size */}
            <div className="glass-card rounded-xl p-4 border border-white/10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Format</p>
              <div className="space-y-1.5">
                {(Object.keys(SIZES) as Size[]).map(k => {
                  const S = SIZES[k];
                  const Icon = S.icon;
                  const active = size === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setSize(k)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                        active ? "bg-blue-500/15 border border-blue-500/30" : "border border-transparent hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "text-gray-600"}`} />
                      <div className="flex-1 text-left">
                        <p className={`text-sm ${active ? "text-white" : "text-gray-400"}`}>{S.label}</p>
                        <p className="text-[10px] text-gray-600">{S.w}  {S.h}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Match Selector */}
            {(cardType === "wwcd" || cardType === "recap") && completedMatches.length > 0 && (
              <div className="glass-card rounded-xl p-4 border border-white/10">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Match</p>
                <select
                  value={selectedMatchId || selectedMatch?.id || ""}
                  onChange={e => setSelectedMatchId(e.target.value)}
                  className="input-field text-sm"
                >
                  {completedMatches.map(m => (
                    <option key={m.id} value={m.id}>{m.name}  {m.map}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Info */}
            <div className="glass-card rounded-xl p-4 border border-white/10 bg-blue-500/5">
              <p className="text-xs text-gray-400 leading-relaxed">
                <Zap className="w-3 h-3 inline text-blue-400 mr-1" />
                Cards export at 2x resolution for crisp quality on all platforms.
              </p>
            </div>
          </div>

          {/*  PREVIEW AREA  */}
          <div className="flex items-start justify-center">
            <div className="relative">
              {/* Scale wrapper */}
              <div
                style={{
                  width: dim.w * previewScale,
                  height: dim.h * previewScale,
                  overflow: "hidden",
                }}
                className="rounded-2xl shadow-2xl"
              >
                <div
                  ref={canvasRef}
                  style={{
                    width: dim.w,
                    height: dim.h,
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                    background: t.bg,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Background effects */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `radial-gradient(circle at 20% 20%, ${t.accentSoft} 0%, transparent 45%), radial-gradient(circle at 80% 80%, ${t.accentSoft} 0%, transparent 45%)`,
                  }} />
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                  }} />

                  {/* Corner accents */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: 120, height: 4, background: t.accent }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 120, background: t.accent }} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 120, height: 4, background: t.accent }} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 4, height: 120, background: t.accent }} />

                  {/*  CARD CONTENT  */}
                  <div style={{
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    padding: size === "story" ? "100px 70px" : "70px",
                  }}>

                    {/*  HEADER (all cards)  */}
                    <div style={{ textAlign: "center", marginBottom: size === "story" ? 70 : 50 }}>
                      <div style={{
                        display: "inline-block",
                        padding: "8px 24px",
                        borderRadius: 999,
                        background: t.accentSoft,
                        border: `2px solid ${t.border}`,
                        marginBottom: 28,
                      }}>
                        <span style={{
                          color: t.accent,
                          fontSize: 20,
                          fontWeight: 800,
                          letterSpacing: 4,
                          textTransform: "uppercase",
                        }}>
                          PUBG MOBILE
                        </span>
                      </div>
                      <h1 style={{
                        color: t.text,
                        fontSize: size === "wide" ? 58 : 64,
                        fontWeight: 900,
                        lineHeight: 1.05,
                        margin: 0,
                        letterSpacing: -1.5,
                        textShadow: `0 0 60px ${t.glow}`,
                      }}>
                        {tournament.name.toUpperCase()}
                      </h1>
                    </div>

                    {/*  STANDINGS CARD  */}
                    {cardType === "standings" && (
                      <>
                        <div style={{ textAlign: "center", marginBottom: 40 }}>
                          <span style={{
                            color: t.accent,
                            fontSize: 28,
                            fontWeight: 800,
                            letterSpacing: 8,
                            textTransform: "uppercase",
                          }}>
                            OVERALL STANDINGS
                          </span>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                          {leaderboard.slice(0, size === "story" ? 12 : size === "wide" ? 8 : 10).map((e, i) => {
                            const isTop3 = e.rank <= 3;
                            const medals = ["", "", ""];
                            const rankColors = ["#facc15", "#e5e7eb", "#d97706"];
                            return (
                              <div key={e.teamId} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 24,
                                padding: "18px 28px",
                                borderRadius: 16,
                                background: isTop3
                                  ? `linear-gradient(90deg, ${rankColors[e.rank-1]}18 0%, rgba(255,255,255,0.03) 100%)`
                                  : "rgba(255,255,255,0.035)",
                                border: `2px solid ${isTop3 ? rankColors[e.rank-1] + "50" : "rgba(255,255,255,0.06)"}`,
                              }}>
                                {/* Rank */}
                                <div style={{
                                  width: 56,
                                  fontSize: isTop3 ? 36 : 28,
                                  fontWeight: 900,
                                  color: isTop3 ? rankColors[e.rank-1] : t.sub,
                                  textAlign: "center",
                                  fontFamily: "monospace",
                                }}>
                                  {isTop3 ? medals[e.rank-1] : e.rank}
                                </div>

                                {/* Team name */}
                                <div style={{
                                  flex: 1,
                                  color: t.text,
                                  fontSize: 30,
                                  fontWeight: isTop3 ? 800 : 600,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}>
                                  {e.teamName}
                                </div>

                                {/* Kills */}
                                <div style={{ textAlign: "center", minWidth: 90 }}>
                                  <div style={{ color: "#f97316", fontSize: 26, fontWeight: 800, fontFamily: "monospace" }}>
                                    {e.totalKills}
                                  </div>
                                  <div style={{ color: t.sub, fontSize: 12, letterSpacing: 1.5, marginTop: 2 }}>KILLS</div>
                                </div>

                                {/* Points */}
                                <div style={{ textAlign: "center", minWidth: 110 }}>
                                  <div style={{
                                    color: isTop3 ? rankColors[e.rank-1] : t.accent,
                                    fontSize: 34,
                                    fontWeight: 900,
                                    fontFamily: "monospace",
                                  }}>
                                    {e.totalPoints}
                                  </div>
                                  <div style={{ color: t.sub, fontSize: 12, letterSpacing: 1.5, marginTop: 2 }}>POINTS</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/*  WWCD CARD  */}
                    {cardType === "wwcd" && selectedMatch?.results && (
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                        <div style={{ fontSize: 120, marginBottom: 24 }}></div>
                        <div style={{
                          color: "#facc15",
                          fontSize: 34,
                          fontWeight: 900,
                          letterSpacing: 12,
                          marginBottom: 24,
                        }}>
                          WINNER WINNER
                        </div>
                        <div style={{
                          color: t.text,
                          fontSize: size === "wide" ? 88 : 104,
                          fontWeight: 900,
                          lineHeight: 1,
                          marginBottom: 20,
                          textShadow: `0 0 80px ${t.glow}`,
                          letterSpacing: -2,
                        }}>
                          {selectedMatch?.results?.[0]?.teamName?.toUpperCase() ?? ""}
                        </div>
                        <div style={{
                          padding: "12px 32px",
                          borderRadius: 999,
                          background: "rgba(250,204,21,0.15)",
                          border: "2px solid rgba(250,204,21,0.4)",
                          marginBottom: 60,
                        }}>
                          <span style={{ color: "#facc15", fontSize: 24, fontWeight: 700, letterSpacing: 4 }}>
                            CHICKEN DINNER
                          </span>
                        </div>

                        {/* Stats row */}
                        <div style={{ display: "flex", gap: 24, marginBottom: 50 }}>
                          {[
                            { label: "KILLS", value: selectedMatch.results[0]?.kills || 0, color: "#f97316" },
                            { label: "POINTS", value: selectedMatch.results[0]?.totalPoints || 0, color: t.accent },
                            { label: "DAMAGE", value: (selectedMatch.results[0]?.damage || 0).toLocaleString(), color: "#22c55e" },
                          ].map(s => (
                            <div key={s.label} style={{
                              padding: "24px 44px",
                              borderRadius: 20,
                              background: "rgba(255,255,255,0.04)",
                              border: `2px solid ${t.border}`,
                              minWidth: 180,
                            }}>
                              <div style={{ color: s.color, fontSize: 52, fontWeight: 900, fontFamily: "monospace", lineHeight: 1 }}>
                                {s.value}
                              </div>
                              <div style={{ color: t.sub, fontSize: 14, letterSpacing: 3, marginTop: 10 }}>{s.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Match info */}
                        <div style={{ color: t.sub, fontSize: 22, letterSpacing: 3 }}>
                          {(selectedMatch?.name ?? "").toUpperCase()}  {(selectedMatch?.map ?? "").toUpperCase()}
                        </div>
                      </div>
                    )}

                    {/*  MVP CARD  */}
                    {cardType === "mvp" && topKillers.length > 0 && (
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                        <div style={{
                          color: t.accent,
                          fontSize: 30,
                          fontWeight: 900,
                          letterSpacing: 12,
                          marginBottom: 40,
                        }}>
                          TOP FRAGGER
                        </div>

                        {/* Avatar circle */}
                        <div style={{
                          width: 220,
                          height: 220,
                          borderRadius: 999,
                          background: `linear-gradient(135deg, ${t.accent}, ${t.accent}60)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 36,
                          boxShadow: `0 0 100px ${t.glow}`,
                          border: `6px solid ${t.accent}`,
                        }}>
                          <span style={{ fontSize: 100, fontWeight: 900, color: "#fff" }}>
                            {topKillers[0].playerName.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div style={{
                          color: t.text,
                          fontSize: 72,
                          fontWeight: 900,
                          marginBottom: 12,
                          textShadow: `0 0 60px ${t.glow}`,
                        }}>
                          {topKillers[0].playerName.toUpperCase()}
                        </div>
                        <div style={{ color: t.sub, fontSize: 30, marginBottom: 60, letterSpacing: 2 }}>
                          {topKillers[0].teamName}
                        </div>

                        <div style={{ display: "flex", gap: 28 }}>
                          <div style={{
                            padding: "32px 60px",
                            borderRadius: 24,
                            background: "rgba(249,115,22,0.12)",
                            border: "3px solid rgba(249,115,22,0.4)",
                          }}>
                            <div style={{ color: "#f97316", fontSize: 84, fontWeight: 900, fontFamily: "monospace", lineHeight: 1 }}>
                              {topKillers[0].kills}
                            </div>
                            <div style={{ color: t.sub, fontSize: 18, letterSpacing: 5, marginTop: 12 }}>TOTAL KILLS</div>
                          </div>
                          <div style={{
                            padding: "32px 60px",
                            borderRadius: 24,
                            background: "rgba(34,197,94,0.12)",
                            border: "3px solid rgba(34,197,94,0.4)",
                          }}>
                            <div style={{ color: "#22c55e", fontSize: 84, fontWeight: 900, fontFamily: "monospace", lineHeight: 1 }}>
                              {(topKillers[0].damage / 1000).toFixed(1)}K
                            </div>
                            <div style={{ color: t.sub, fontSize: 18, letterSpacing: 5, marginTop: 12 }}>DAMAGE</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/*  CHAMPION CARD  */}
                    {cardType === "champion" && leaderboard.length > 0 && (
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                        <div style={{ fontSize: 140, marginBottom: 16 }}></div>
                        <div style={{
                          color: "#facc15",
                          fontSize: 32,
                          fontWeight: 900,
                          letterSpacing: 14,
                          marginBottom: 28,
                        }}>
                          CHAMPIONS
                        </div>
                        <div style={{
                          color: t.text,
                          fontSize: size === "wide" ? 96 : 112,
                          fontWeight: 900,
                          lineHeight: 1,
                          marginBottom: 40,
                          textShadow: `0 0 100px rgba(250,204,21,0.5)`,
                          letterSpacing: -3,
                        }}>
                          {leaderboard[0].teamName.toUpperCase()}
                        </div>

                        <div style={{
                          display: "flex",
                          gap: 20,
                          marginBottom: 60,
                        }}>
                          {[
                            { label: "TOTAL POINTS", value: leaderboard[0].totalPoints, color: "#facc15" },
                            { label: "TOTAL KILLS", value: leaderboard[0].totalKills, color: "#f97316" },
                            { label: "WWCDs", value: leaderboard[0].wwcds, color: "#22c55e" },
                          ].map(s => (
                            <div key={s.label} style={{
                              padding: "28px 48px",
                              borderRadius: 20,
                              background: "rgba(255,255,255,0.04)",
                              border: `2px solid ${t.border}`,
                            }}>
                              <div style={{ color: s.color, fontSize: 60, fontWeight: 900, fontFamily: "monospace", lineHeight: 1 }}>
                                {s.value}
                              </div>
                              <div style={{ color: t.sub, fontSize: 14, letterSpacing: 3, marginTop: 10 }}>{s.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Runner ups */}
                        <div style={{ display: "flex", gap: 40 }}>
                          {leaderboard.slice(1, 3).map((e, i) => (
                            <div key={e.teamId} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 40, marginBottom: 8 }}>{["",""][i]}</div>
                              <div style={{ color: t.text, fontSize: 26, fontWeight: 700 }}>{e.teamName}</div>
                              <div style={{ color: t.sub, fontSize: 18, marginTop: 4 }}>{e.totalPoints} pts</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/*  MATCH RECAP CARD  */}
                    {cardType === "recap" && selectedMatch?.results && (
                      <>
                        <div style={{ textAlign: "center", marginBottom: 36 }}>
                          <div style={{ color: t.accent, fontSize: 30, fontWeight: 900, letterSpacing: 8, marginBottom: 10 }}>
                            {(selectedMatch?.name ?? "").toUpperCase()}
                          </div>
                          <div style={{ color: t.sub, fontSize: 22, letterSpacing: 4 }}>
                            {(selectedMatch?.map ?? "").toUpperCase()}
                          </div>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                          {selectedMatch.results.slice(0, size === "story" ? 12 : 8).map((r) => {
                            const isTop3 = r.placement <= 3;
                            const colors = ["#facc15", "#e5e7eb", "#d97706"];
                            return (
                              <div key={r.teamId} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                                padding: "16px 26px",
                                borderRadius: 14,
                                background: isTop3 ? `${colors[r.placement-1]}14` : "rgba(255,255,255,0.03)",
                                border: `2px solid ${isTop3 ? colors[r.placement-1] + "40" : "rgba(255,255,255,0.05)"}`,
                              }}>
                                <div style={{
                                  width: 48,
                                  fontSize: 30,
                                  fontWeight: 900,
                                  color: isTop3 ? colors[r.placement-1] : t.sub,
                                  fontFamily: "monospace",
                                  textAlign: "center",
                                }}>
                                  #{r.placement}
                                </div>
                                <div style={{ flex: 1, color: t.text, fontSize: 28, fontWeight: 700 }}>
                                  {r.teamName}
                                </div>
                                <div style={{ color: "#f97316", fontSize: 24, fontWeight: 800, fontFamily: "monospace", minWidth: 70, textAlign: "right" }}>
                                  {r.kills}K
                                </div>
                                <div style={{ color: t.accent, fontSize: 28, fontWeight: 900, fontFamily: "monospace", minWidth: 80, textAlign: "right" }}>
                                  {r.totalPoints}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/*  FOOTER (all cards)  */}
                    <div style={{
                      marginTop: 40,
                      paddingTop: 28,
                      borderTop: `2px solid rgba(255,255,255,0.06)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `linear-gradient(135deg, ${t.accent}, ${t.accent}80)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <span style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}></span>
                        </div>
                        <span style={{ color: t.text, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
                          TournaOps
                        </span>
                      </div>
                      <span style={{ color: t.sub, fontSize: 18, letterSpacing: 2 }}>
                        tournaops.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Size label */}
              <div className="text-center mt-4">
                <span className="text-gray-600 text-xs font-mono">
                  {dim.w}  {dim.h} px  exports at 2x = {dim.w*2}  {dim.h*2}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}