"use client";
import { useState } from "react";
import { Calendar, X, Save, Plus, Trash2, Loader2, MapPin, Check, AlertCircle } from "lucide-react";

interface DayConfig {
  name: string;
  date?: string;
  matches: number;
  mapRotation: string[];
}

interface DayConfigModalProps {
  stageId: string;
  stageName: string;
  currentMatchesPerGroup: number;
  currentMapRotation: string[];
  onClose: () => void;
  onSaved: () => void;
}

const AVAILABLE_MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Rondo", "Nusa", "Livik", "Karakin"];

export default function DayConfigModal({
  stageId, stageName, currentMatchesPerGroup, currentMapRotation,
  onClose, onSaved,
}: DayConfigModalProps) {
  const [useDays, setUseDays] = useState(false);
  const [totalMatches, setTotalMatches] = useState(currentMatchesPerGroup || 4);
  const [flatMaps, setFlatMaps] = useState<string[]>(currentMapRotation.length > 0 ? currentMapRotation : ["Erangel"]);
  const [days, setDays] = useState<DayConfig[]>([
    { name: "Day 1", matches: 4, mapRotation: ["Erangel", "Rondo", "Miramar", "Sanhok"] },
  ]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  function updateDay(idx: number, field: keyof DayConfig, value: any) {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  }

  function addDay() {
    setDays(prev => [...prev, {
      name: `Day ${prev.length + 1}`,
      matches: 4,
      mapRotation: ["Erangel", "Rondo", "Miramar", "Sanhok"],
    }]);
  }

  function removeDay(idx: number) {
    if (days.length <= 1) return;
    setDays(prev => prev.filter((_, i) => i !== idx));
  }

  function toggleMapForDay(dayIdx: number, map: string) {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      const has = d.mapRotation.includes(map);
      return { ...d, mapRotation: has ? d.mapRotation.filter(m => m !== map) : [...d.mapRotation, map] };
    }));
  }

  function toggleFlatMap(map: string) {
    setFlatMaps(prev => prev.includes(map) ? prev.filter(m => m !== map) : [...prev, map]);
  }

  async function save() {
    setSaving(true);
    setResult(null);
    try {
      const body: any = { useDays };
      if (useDays) {
        body.days = days.map(d => ({
          name: d.name,
          date: d.date || undefined,
          matches: d.matches,
          mapRotation: d.mapRotation.length > 0 ? d.mapRotation : ["Erangel"],
        }));
      } else {
        body.totalMatches = totalMatches;
        body.mapRotation = flatMaps.length > 0 ? flatMaps : ["Erangel"];
      }

      const res = await fetch(`/api/stages/${stageId}/configure-days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ success: true, message: data.message });
        setTimeout(() => { onSaved(); onClose(); }, 1500);
      } else {
        setResult({ success: false, message: data.error || "Failed" });
      }
    } catch (e: any) {
      setResult({ success: false, message: e?.message || "Network error" });
    } finally {
      setSaving(false);
    }
  }

  const totalMatchesFromDays = days.reduce((s, d) => s + d.matches, 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      overflowY: "auto", padding: "2rem 1rem",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#0d0d14",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "1.25rem",
        maxWidth: "800px", width: "100%",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", background: "linear-gradient(135deg, #D4AF37, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff" }}>Configure Matches & Days</h2>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.125rem" }}>{stageName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#9ca3af", cursor: "pointer" }}>
            <X style={{ width: "1rem", height: "1rem" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
          <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "0.75rem", padding: "0.875rem 1rem", marginBottom: "1.25rem", display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
            <AlertCircle style={{ width: "1rem", height: "1rem", color: "#fbbf24", flexShrink: 0, marginTop: "0.125rem" }} />
            <p style={{ fontSize: "0.8rem", color: "#fcd34d", lineHeight: 1.5 }}>
              Saving will <strong>delete existing matches</strong> for this stage and create new ones based on your config. Team assignments and match results will be lost for this stage only.
            </p>
          </div>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "0.5rem", padding: "0.375rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", marginBottom: "1.25rem" }}>
            <button onClick={() => setUseDays(false)}
              style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", background: !useDays ? "rgba(139,92,246,0.15)" : "transparent", color: !useDays ? "#a78bfa" : "#9ca3af", border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
              Simple (flat matches)
            </button>
            <button onClick={() => setUseDays(true)}
              style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", background: useDays ? "rgba(139,92,246,0.15)" : "transparent", color: useDays ? "#a78bfa" : "#9ca3af", border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
              With Days (Day 1, Day 2, ...)
            </button>
          </div>

          {!useDays ? (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, marginBottom: "0.375rem" }}>Total Matches Per Group</label>
              <input type="number" min={1} max={20} value={totalMatches} onChange={e => setTotalMatches(Number(e.target.value))}
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.625rem", color: "#fff", fontSize: "0.9rem", fontWeight: 700, boxSizing: "border-box", marginBottom: "1rem" }} />

              <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, marginBottom: "0.5rem" }}>Map Rotation (cycles through matches)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {AVAILABLE_MAPS.map(map => {
                  const selected = flatMaps.includes(map);
                  return (
                    <button key={map} onClick={() => toggleFlatMap(map)}
                      style={{ padding: "0.375rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: selected ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.1)", background: selected ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)", color: selected ? "#a78bfa" : "#9ca3af" }}>
                      {selected && "✓ "}{map}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              {days.map((day, dayIdx) => (
                <div key={dayIdx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "0.875rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "rgba(139,92,246,0.2)", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800 }}>
                        {dayIdx + 1}
                      </div>
                      <input value={day.name} onChange={e => updateDay(dayIdx, "name", e.target.value)}
                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.4rem 0.625rem", color: "#fff", fontSize: "0.9rem", fontWeight: 700 }} />
                    </div>
                    {days.length > 1 && (
                      <button onClick={() => removeDay(dayIdx)} style={{ padding: "0.375rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.375rem", color: "#f87171", cursor: "pointer" }}>
                        <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.875rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.25rem" }}>Date (optional)</label>
                      <input type="date" value={day.date || ""} onChange={e => updateDay(dayIdx, "date", e.target.value)}
                        style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.8rem", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.25rem" }}>Matches This Day</label>
                      <input type="number" min={1} max={10} value={day.matches} onChange={e => updateDay(dayIdx, "matches", Number(e.target.value))}
                        style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.85rem", fontWeight: 700, boxSizing: "border-box" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.375rem" }}>Maps for this day (cycles through matches)</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {AVAILABLE_MAPS.map(map => {
                        const selected = day.mapRotation.includes(map);
                        return (
                          <button key={map} onClick={() => toggleMapForDay(dayIdx, map)}
                            style={{ padding: "0.3rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", border: selected ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.1)", background: selected ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)", color: selected ? "#a78bfa" : "#9ca3af" }}>
                            {selected && "✓ "}{map}
                          </button>
                        );
                      })}
                    </div>
                    {day.mapRotation.length > 0 && (
                      <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.5rem" }}>
                        Match order: {Array.from({ length: day.matches }, (_, i) => day.mapRotation[i % day.mapRotation.length]).join(" → ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addDay} style={{ width: "100%", padding: "0.75rem", background: "rgba(139,92,246,0.08)", border: "1px dashed rgba(139,92,246,0.3)", borderRadius: "0.625rem", color: "#a78bfa", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                <Plus style={{ width: "0.875rem", height: "0.875rem" }} />Add Another Day
              </button>
            </div>
          )}

          {result && (
            <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: result.success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: result.success ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.25)", borderRadius: "0.625rem", color: result.success ? "#4ade80" : "#f87171", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {result.success ? <Check style={{ width: "1rem", height: "1rem" }} /> : <AlertCircle style={{ width: "1rem", height: "1rem" }} />}
              {result.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            <strong style={{ color: "#fff" }}>{useDays ? totalMatchesFromDays : totalMatches}</strong> matches per group
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={onClose} style={{ padding: "0.625rem 1.25rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.625rem", color: "#9ca3af", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={save} disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "#D4AF37", color: "#fff", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
              {saving ? <><Loader2 style={{ width: "0.875rem", height: "0.875rem", animation: "spin 0.8s linear infinite" }} />Saving...</> : <><Save style={{ width: "0.875rem", height: "0.875rem" }} />Save & Regenerate Matches</>}
            </button>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}