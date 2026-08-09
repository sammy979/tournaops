"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TournamentNav from "@/components/tournament/TournamentNav";
import { Radio, Copy, Check, ExternalLink, ChevronLeft, Loader2, Monitor, Zap, Trophy, Crosshair, Clock, Star } from "lucide-react";

const OVERLAYS = [
  { key: "standings", label: "Live Standings", desc: "Real-time leaderboard panel for OBS", path: "", icon: Trophy, color: "#f59e0b", recommended: true },
  { key: "match", label: "Match Live", desc: "Compact standings during active match", path: "/match", icon: Radio, color: "#4ade80" },
  { key: "chicken-dinner", label: "Chicken Dinner", desc: "Winner winner! WWCD celebration screen", path: "/chicken-dinner", icon: Star, color: "#fbbf24" },
  { key: "final-results", label: "Final Results", desc: "Podium with top 3 + full standings", path: "/final-results", icon: Trophy, color: "#c084fc" },
  { key: "next-match", label: "Next Match", desc: "Countdown + participating teams", path: "/next-match", icon: Clock, color: "#60a5fa" },
  { key: "top-fragger", label: "Top Fragger", desc: "MVP / highest kill player spotlight", path: "/top-fragger", icon: Crosshair, color: "#f87171" },
];

export default function OverlaysPage() {
  const params = useParams();
  const id = params?.id as string;
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(d => setTournament(d.tournament))
      .finally(() => setLoading(false));
  }, [id]);

  function copyUrl(url: string, key: string) {
    navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const token = tournament?.overlayToken;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.tournaops.com";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Link href={`/dashboard/tournaments/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", textDecoration: "none", marginBottom: "1rem" }}>
        <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />Back to Tournament
      </Link>

      <TournamentNav tournamentId={id} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Radio style={{ width: "1.75rem", height: "1.75rem", color: "#f59e0b" }} />OBS Overlays
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {tournament?.name} · Browser source URLs for OBS Studio
          </p>
        </div>
      </div>

      {/* Setup Guide */}
      <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Monitor style={{ width: "1rem", height: "1rem", color: "#60a5fa" }} />
          How to use in OBS
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {[
            { step: "1", text: "Copy the overlay URL below" },
            { step: "2", text: 'In OBS: Add Source → Browser Source' },
            { step: "3", text: "Set Width: 1920, Height: 1080" },
            { step: "4", text: "Paste URL, check transparent background" },
          ].map(s => (
            <div key={s.step} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
              <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: "rgba(59,130,246,0.2)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
              <p style={{ fontSize: "0.78rem", color: "#9ca3af", lineHeight: 1.4 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Token info */}
      {token && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "0.875rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }}>OVERLAY TOKEN</div>
          <code style={{ flex: 1, fontSize: "0.75rem", color: "#f59e0b", fontFamily: "monospace", background: "rgba(245,158,11,0.08)", padding: "0.25rem 0.625rem", borderRadius: "0.375rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {token}
          </code>
          <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>Auto-updates every 5 seconds · No login required</div>
        </div>
      )}

      {/* Overlays Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
        {OVERLAYS.map(overlay => {
          const Icon = overlay.icon;
          const url = token ? `${baseUrl}/overlay/${token}${overlay.path}` : null;
          const isCopied = copied === overlay.key;

          return (
            <div key={overlay.key} style={{
              background: "rgba(255,255,255,0.03)",
              border: overlay.recommended ? `1px solid ${overlay.color}30` : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "1.25rem",
              position: "relative",
            }}>
              {overlay.recommended && (
                <div style={{ position: "absolute", top: "-0.75rem", left: "1rem", background: overlay.color, color: "#000", fontSize: "0.6rem", fontWeight: 800, padding: "0.2rem 0.625rem", borderRadius: "9999px", letterSpacing: "0.05em" }}>
                  RECOMMENDED
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", marginBottom: "1rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", background: `${overlay.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: "1.25rem", height: "1.25rem", color: overlay.color }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{overlay.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.125rem" }}>{overlay.desc}</div>
                </div>
              </div>

              {url ? (
                <>
                  <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", marginBottom: "0.75rem", overflow: "hidden" }}>
                    <code style={{ fontSize: "0.65rem", color: "#9ca3af", fontFamily: "monospace", wordBreak: "break-all" }}>{url}</code>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => copyUrl(url, overlay.key)}
                      style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", background: isCopied ? "rgba(34,197,94,0.15)" : `${overlay.color}15`, border: isCopied ? "1px solid rgba(34,197,94,0.3)" : `1px solid ${overlay.color}30`, borderRadius: "0.5rem", padding: "0.5rem", color: isCopied ? "#4ade80" : overlay.color, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                      {isCopied ? <><Check style={{ width: "0.75rem", height: "0.75rem" }} />Copied!</> : <><Copy style={{ width: "0.75rem", height: "0.75rem" }} />Copy URL</>}
                    </button>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#9ca3af", fontSize: "0.75rem", textDecoration: "none" }}>
                      <ExternalLink style={{ width: "0.75rem", height: "0.75rem" }} />Preview
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "0.5rem", fontSize: "0.75rem", color: "#f87171" }}>
                  No overlay token configured for this tournament.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Refresh note */}
      <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.875rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Zap style={{ width: "1rem", height: "1rem", color: "#f59e0b", flexShrink: 0 }} />
        <p style={{ fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.5 }}>
          All overlays <strong style={{ color: "#9ca3af" }}>auto-refresh every 5 seconds</strong>. Results entered in the dashboard appear live in OBS within seconds. Overlays use your tournament branding colors and sponsor logos automatically.
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}