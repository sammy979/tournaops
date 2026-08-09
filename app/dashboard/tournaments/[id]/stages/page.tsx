"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Layers, RefreshCw, AlertTriangle, Check, X, Calendar } from "lucide-react";
import TournamentNav from "@/components/tournament/TournamentNav";
import dynamic from "next/dynamic";
import { useDialog } from "@/lib/use-confirm";

const StageManager = dynamic(() => import("@/components/stages/StageManager"), { ssr: false });
const DayConfigModal = dynamic(() => import("@/components/stages/DayConfigModal"), { ssr: false });

interface StageConfig {
  name: string;
  numGroups: number;
  teamsPerGroup: number;
  matchesPerGroup: number;
  type: string;
}

export default function StagesPage({ params }: { params: Promise<{ id: string }> }) {
  const dialog = useDialog();
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenResult, setRegenResult] = useState<{ success: boolean; message: string } | null>(null);
  const [stageConfigs, setStageConfigs] = useState<StageConfig[]>([
    { name: "Stage 1", numGroups: 1, teamsPerGroup: 16, matchesPerGroup: 4, type: "GROUP_STAGE" },
    { name: "Stage 2", numGroups: 1, teamsPerGroup: 16, matchesPerGroup: 4, type: "GROUP_STAGE" },
    { name: "Semi Final", numGroups: 1, teamsPerGroup: 16, matchesPerGroup: 4, type: "SEMI_FINAL" },
    { name: "Grand Final", numGroups: 1, teamsPerGroup: 16, matchesPerGroup: 4, type: "GRAND_FINAL" },
  ]);
  const [autoAssign, setAutoAssign] = useState(true);
  const [configuringStage, setConfiguringStage] = useState<any>(null);

  function refresh() {
    fetch("/api/tournaments/" + id)
      .then(r => r.json())
      .then(d => setTournament(d.tournament))
      .catch(console.error);
  }

  useEffect(() => {
    fetch("/api/tournaments/" + id)
      .then(r => r.json())
      .then(d => {
        setTournament(d.tournament);
        // Preload from existing stages if any
        if (d.tournament?.stages?.length > 0) {
          setStageConfigs(d.tournament.stages.map((s: any) => ({
            name: s.name,
            numGroups: s.numGroups || 1,
            teamsPerGroup: s.teamsPerGroup || 16,
            matchesPerGroup: s.matchesPerGroup || 4,
            type: s.type || "GROUP_STAGE",
          })));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function regenerateStages() {
    const ok = await dialog.confirm({
      title: "Regenerate all stages?",
      description: "Existing stages, matches, and completed match results will be permanently deleted, then fresh stages and matches will be created. This cannot be undone.",
      confirmLabel: "Regenerate stages",
      variant: "danger",
    });
    if (!ok) return;
    setRegenerating(true);
    setRegenResult(null);
    try {
      const res = await fetch(`/api/tournaments/${id}/regenerate-stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoAssignTeams: autoAssign,
          stages: stageConfigs,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegenResult({ success: true, message: data.message || "Stages regenerated!" });
        refresh();
        setTimeout(() => setShowRegenerate(false), 2000);
      } else {
        setRegenResult({ success: false, message: data.error || "Failed" });
      }
    } catch (e: any) {
      setRegenResult({ success: false, message: e?.message || "Network error" });
    } finally {
      setRegenerating(false);
    }
  }

  function updateConfig(idx: number, field: keyof StageConfig, value: any) {
    setStageConfigs(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  }

  function addConfig() {
    setStageConfigs(prev => [...prev, {
      name: `Stage ${prev.length + 1}`,
      numGroups: 1, teamsPerGroup: 16, matchesPerGroup: 4, type: "GROUP_STAGE",
    }]);
  }

  function removeConfig(idx: number) {
    setStageConfigs(prev => prev.filter((_, i) => i !== idx));
  }

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!tournament) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Tournament not found</div>;
  }

  const stageCount = tournament.stages?.length || 0;
  const teamCount = tournament.teams?.length || 0;
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem", color: "#fff", fontSize: "0.85rem",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <button
        onClick={() => router.push("/dashboard/tournaments/" + id)}
        style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500, background: "transparent", border: "none", cursor: "pointer", marginBottom: "1rem" }}
      >
        <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to {tournament.name}
      </button>

      <TournamentNav tournamentId={id} />

      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{
            fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: "#fff",
            display: "flex", alignItems: "center", gap: "0.75rem",
          }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", background: "linear-gradient(135deg, #8b5cf6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Layers style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />
            </div>
            Stage Management
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.375rem" }}>
            {stageCount === 0
              ? `No stages yet — click Regenerate to create stages for your ${teamCount} teams`
              : `${stageCount} stages configured · ${teamCount} teams`}
          </p>
        </div>
        <button
          onClick={() => setShowRegenerate(!showRegenerate)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: showRegenerate ? "rgba(239,68,68,0.15)" : "#f59e0b", color: showRegenerate ? "#f87171" : "#000", padding: "0.625rem 1.25rem", borderRadius: "0.75rem", border: showRegenerate ? "1px solid rgba(239,68,68,0.3)" : "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
        >
          {showRegenerate ? <><X style={{ width: "1rem", height: "1rem" }} />Cancel</> : <><RefreshCw style={{ width: "1rem", height: "1rem" }} />Regenerate Stages</>}
        </button>
      </div>

      {/* Regenerate Panel */}
      {showRegenerate && (
        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <AlertTriangle style={{ width: "1.5rem", height: "1.5rem", color: "#f87171", flexShrink: 0 }} />
            <div>
              <h3 style={{ color: "#f87171", fontWeight: 800, fontSize: "1rem", marginBottom: "0.25rem" }}>Warning: Destructive Action</h3>
              <p style={{ color: "#fca5a5", fontSize: "0.8rem", lineHeight: 1.5 }}>
                Regenerating stages will <strong>delete all existing stages, groups, and their matches</strong>.
                Team registrations are preserved. Any completed match results in existing stages will be lost.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.75rem" }}>Stage Configuration</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {stageConfigs.map((cfg, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr auto", gap: "0.5rem", alignItems: "center", padding: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.625rem" }}>
                  <div>
                    <label style={{ fontSize: "0.65rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>Stage Name</label>
                    <input value={cfg.name} onChange={e => updateConfig(idx, "name", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.65rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>Groups</label>
                    <input type="number" min={1} max={16} value={cfg.numGroups} onChange={e => updateConfig(idx, "numGroups", Number(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.65rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>Teams/Group</label>
                    <input type="number" min={2} max={64} value={cfg.teamsPerGroup} onChange={e => updateConfig(idx, "teamsPerGroup", Number(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.65rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>Matches</label>
                    <input type="number" min={1} max={20} value={cfg.matchesPerGroup} onChange={e => updateConfig(idx, "matchesPerGroup", Number(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.65rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>Type</label>
                    <select value={cfg.type} onChange={e => updateConfig(idx, "type", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="GROUP_STAGE">Group Stage</option>
                      <option value="SEMI_FINAL">Semi Final</option>
                      <option value="GRAND_FINAL">Grand Final</option>
                      <option value="QUALIFIER">Qualifier</option>
                    </select>
                  </div>
                  <button onClick={() => removeConfig(idx)} style={{ padding: "0.5rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.375rem", color: "#f87171", cursor: "pointer" }}>
                    <X style={{ width: "0.875rem", height: "0.875rem" }} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addConfig} style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "0.5rem", color: "#9ca3af", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
              + Add Stage
            </button>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "0.625rem", marginBottom: "1rem", cursor: "pointer" }}>
            <input type="checkbox" checked={autoAssign} onChange={e => setAutoAssign(e.target.checked)} style={{ width: "1rem", height: "1rem", accentColor: "#3b82f6" }} />
            <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 600 }}>Auto-assign teams to Stage 1</span>
            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>(recommended)</span>
          </label>

          {regenResult && (
            <div style={{ padding: "0.75rem 1rem", background: regenResult.success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${regenResult.success ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: "0.5rem", color: regenResult.success ? "#4ade80" : "#f87171", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {regenResult.success ? <Check style={{ width: "1rem", height: "1rem" }} /> : <AlertTriangle style={{ width: "1rem", height: "1rem" }} />}
              {regenResult.message}
            </div>
          )}

          <button onClick={regenerateStages} disabled={regenerating || stageConfigs.length === 0} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: regenerating ? "rgba(239,68,68,0.4)" : "#ef4444", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "0.75rem", border: "none", fontSize: "0.9rem", fontWeight: 700, cursor: regenerating ? "wait" : "pointer" }}>
            {regenerating ? <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 0.8s linear infinite" }} />Regenerating...</> : <><RefreshCw style={{ width: "1rem", height: "1rem" }} />Confirm Regenerate ({stageConfigs.length} stages, {stageConfigs.reduce((s, c) => s + c.matchesPerGroup * c.numGroups, 0)} matches)</>}
          </button>
        </div>
      )}

      {/* Day Configuration Section */}
      {tournament.stages && tournament.stages.length > 0 && (
        <div style={{ marginBottom: "1.5rem", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "1rem", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar style={{ width: "1rem", height: "1rem", color: "#a78bfa" }} />
            Configure Matches Per Stage
          </h3>
          <p style={{ color: "#c4b5fd", fontSize: "0.75rem", marginBottom: "1rem", lineHeight: 1.5 }}>
            Set how many matches per group each stage has, organize by days (Day 1, Day 2, ...), and choose map rotation per day. Regenerates that stage's matches only.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.625rem" }}>
            {tournament.stages.map((stage: any) => (
              <button key={stage.id}
                onClick={() => setConfiguringStage(stage)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "0.625rem", color: "#fff", cursor: "pointer", textAlign: "left" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{stage.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.125rem" }}>
                    {stage.matchesPerGroup || 4} matches/group
                  </div>
                </div>
                <Calendar style={{ width: "1rem", height: "1rem", color: "#a78bfa" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {configuringStage && (
        <DayConfigModal
          stageId={configuringStage.id}
          stageName={configuringStage.name}
          currentMatchesPerGroup={configuringStage.matchesPerGroup || 4}
          currentMapRotation={configuringStage.mapRotation || tournament.mapRotation || ["Erangel"]}
          onClose={() => setConfiguringStage(null)}
          onSaved={() => { setConfiguringStage(null); refresh(); }}
        />
      )}

      <StageManager tournament={tournament} onStageChange={refresh} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}