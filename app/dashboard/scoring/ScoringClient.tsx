"use client";

import { useState } from "react";

interface PlacementPoint { position: number; points: number; }

interface ScoringPreset {
  id: string;
  name: string;
  description: string | null;
  isBuiltIn: boolean;
  userId: string | null;
  killPoints: number;
  placementPoints: PlacementPoint[] | unknown;
  createdAt: string;
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  scoringPresetId: string | null;
}

interface Props {
  presets: ScoringPreset[];
  tournaments: Tournament[];
  userId: string;
}

const BUILT_IN_PRESETS = [
  {
    name: "PMGC",
    description: "PUBG Mobile Global Championship scoring",
    killPoints: 1,
    placementPoints: [
      { position: 1, points: 15 },
      { position: 2, points: 12 },
      { position: 3, points: 10 },
      { position: 4, points: 8 },
      { position: 5, points: 6 },
      { position: 6, points: 4 },
      { position: 7, points: 2 },
      { position: 8, points: 1 },
    ],
  },
  {
    name: "PMPL",
    description: "PUBG Mobile Pro League scoring",
    killPoints: 1,
    placementPoints: [
      { position: 1, points: 10 },
      { position: 2, points: 6 },
      { position: 3, points: 5 },
      { position: 4, points: 4 },
      { position: 5, points: 3 },
      { position: 6, points: 2 },
      { position: 7, points: 1 },
      { position: 8, points: 1 },
    ],
  },
];

function parsePlacements(raw: unknown): PlacementPoint[] {
  if (!raw) return [];
  try {
    if (typeof raw === "string") return JSON.parse(raw);
    if (Array.isArray(raw)) return raw as PlacementPoint[];
    return [];
  } catch { return []; }
}

export default function ScoringClient({ presets: initialPresets, tournaments, userId }: Props) {
  const [presets, setPresets] = useState<ScoringPreset[]>(initialPresets);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assigningTournament, setAssigningTournament] = useState<string>("");
  const [assigningPreset, setAssigningPreset] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [tournamentPresets, setTournamentPresets] = useState<Record<string, string>>(
    Object.fromEntries(tournaments.map((t) => [t.id, t.scoringPresetId || ""]))
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    killPoints: "1",
    placements: [
      { position: 1, points: 15 },
      { position: 2, points: 12 },
      { position: 3, points: 10 },
      { position: 4, points: 8 },
    ],
  });

  function resetForm() {
    setForm({ name: "", description: "", killPoints: "1", placements: [{ position: 1, points: 15 }, { position: 2, points: 12 }, { position: 3, points: 10 }, { position: 4, points: 8 }] });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  function startEdit(preset: ScoringPreset) {
    const placements = parsePlacements(preset.placementPoints);
    setForm({
      name: preset.name,
      description: preset.description || "",
      killPoints: String(preset.killPoints),
      placements: placements.length > 0 ? placements : [{ position: 1, points: 10 }],
    });
    setEditingId(preset.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  }

  function addPlacementRow() {
    const nextPos = form.placements.length > 0 ? Math.max(...form.placements.map((p) => p.position)) + 1 : 1;
    setForm((prev) => ({ ...prev, placements: [...prev.placements, { position: nextPos, points: 0 }] }));
  }

  function removePlacementRow(idx: number) {
    setForm((prev) => ({ ...prev, placements: prev.placements.filter((_, i) => i !== idx) }));
  }

  function updatePlacement(idx: number, field: "position" | "points", value: number) {
    setForm((prev) => {
      const updated = [...prev.placements];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, placements: updated };
    });
  }

  async function loadBuiltIn(template: typeof BUILT_IN_PRESETS[0]) {
    setForm({ name: template.name, description: template.description, killPoints: String(template.killPoints), placements: template.placementPoints });
    setShowForm(true);
    setEditingId(null);
  }

  async function savePreset() {
    if (!form.name.trim()) { setError("Preset name is required"); return; }
    if (isNaN(Number(form.killPoints)) || Number(form.killPoints) < 0) { setError("Kill points must be a non-negative number"); return; }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        killPoints: Number(form.killPoints),
        placementPoints: form.placements.sort((a, b) => a.position - b.position),
      };
      const url = editingId ? `/api/scoring-presets/${editingId}` : "/api/scoring-presets";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save preset"); return; }
      setSuccess(editingId ? "Preset updated" : "Preset created");
      if (editingId) {
        setPresets((prev) => prev.map((p) => p.id === editingId ? data.preset : p));
      } else {
        setPresets((prev) => [data.preset, ...prev]);
      }
      resetForm();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePreset(id: string) {
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/scoring-presets/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete preset"); return; }
      setSuccess("Preset deleted");
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function assignPreset() {
    if (!assigningTournament || !assigningPreset) { setError("Select both tournament and preset"); return; }
    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/tournaments/${assigningTournament}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoringPresetId: assigningPreset }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to assign preset"); return; }
      setSuccess("Preset assigned to tournament");
      setTournamentPresets((prev) => ({ ...prev, [assigningTournament]: assigningPreset }));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setAssigning(false);
    }
  }

  const myPresets = presets.filter((p) => !p.isBuiltIn && p.userId === userId);
  const builtInPresets = presets.filter((p) => p.isBuiltIn);

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", fontFamily: "Barlow Condensed, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>DASHBOARD / SCORING</div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.01em" }}>Scoring Presets</h1>
      </div>

      {error && <div style={{ background: "#1a0000", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</div>}
      {success && <div style={{ background: "#001a00", border: "1px solid var(--gold)", color: "var(--gold)", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "1rem" }}>{success}</div>}

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button onClick={() => { setShowForm(true); setEditingId(null); setError(null); }} style={{ padding: "0.5rem 1.25rem", background: "transparent", color: "var(--gold)", border: "1px solid var(--gold)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>
          + NEW PRESET
        </button>
        {BUILT_IN_PRESETS.map((t) => (
          <button key={t.name} onClick={() => loadBuiltIn(t)} style={{ padding: "0.5rem 1.25rem", background: "var(--surface)", color: "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", cursor: "pointer" }}>
            LOAD {t.name} TEMPLATE
          </button>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--gold)", padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", marginBottom: "1rem" }}>{editingId ? "EDIT PRESET" : "NEW PRESET"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>PRESET NAME</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Custom BGMI Rules" style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.4rem 0.6rem", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>DESCRIPTION</label>
              <input type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Short description..." style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.4rem 0.6rem", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>KILL PTS</label>
              <input type="number" value={form.killPoints} onChange={(e) => setForm((p) => ({ ...p, killPoints: e.target.value }))} min="0" step="0.5" style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.4rem 0.6rem", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>PLACEMENT POINTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.75rem" }}>
            {form.placements.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input type="number" value={p.position} onChange={(e) => updatePlacement(i, "position", Number(e.target.value))} min="1" style={{ width: "70px", background: "var(--black)", border: "1px solid var(--border)", color: "var(--gold)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.3rem 0.5rem", textAlign: "center" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)" }}>→</span>
                <input type="number" value={p.points} onChange={(e) => updatePlacement(i, "points", Number(e.target.value))} min="0" style={{ width: "80px", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.3rem 0.5rem", textAlign: "center" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)" }}>pts</span>
                <button onClick={() => removePlacementRow(i)} style={{ padding: "0.25rem 0.5rem", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", fontFamily: "var(--font-mono)", fontSize: "0.6rem", cursor: "pointer" }}>×</button>
              </div>
            ))}
          </div>
          <button onClick={addPlacementRow} style={{ padding: "0.35rem 0.75rem", background: "transparent", color: "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", marginBottom: "1rem" }}>+ ADD POSITION</button>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={savePreset} disabled={saving} style={{ padding: "0.5rem 1.5rem", background: "var(--gold)", color: "var(--black)", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "SAVING..." : editingId ? "UPDATE" : "CREATE PRESET"}
            </button>
            <button onClick={resetForm} style={{ padding: "0.5rem 1.5rem", background: "transparent", color: "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", cursor: "pointer" }}>CANCEL</button>
          </div>
        </div>
      )}

      {builtInPresets.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>BUILT-IN PRESETS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {builtInPresets.map((preset) => {
              const placements = parsePlacements(preset.placementPoints);
              return (
                <div key={preset.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.1rem", fontWeight: "700", color: "var(--gold)" }}>{preset.name}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", border: "1px solid var(--border)", padding: "0.1rem 0.4rem" }}>BUILT-IN</span>
                      </div>
                      {preset.description && <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)" }}>{preset.description}</div>}
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)", marginTop: "0.35rem" }}>
                        Kill: <span style={{ color: "#fff" }}>{preset.killPoints} pt</span> · Positions: <span style={{ color: "#fff" }}>{placements.length}</span>
                      </div>
                    </div>
                  </div>
                  {placements.length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                      {placements.slice(0, 8).map((p) => (
                        <div key={p.position} style={{ background: "var(--black)", border: "1px solid var(--border)", padding: "0.25rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>
                          <span style={{ color: "var(--charcoal)" }}>#{p.position}</span>
                          <span style={{ color: "var(--gold)", marginLeft: "0.3rem" }}>{p.points}pt</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>MY PRESETS ({myPresets.length})</div>
        {myPresets.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--border)", background: "var(--surface)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--charcoal)" }}>
            No custom presets yet. Click NEW PRESET or load a template.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {myPresets.map((preset) => {
              const placements = parsePlacements(preset.placementPoints);
              return (
                <div key={preset.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.1rem", fontWeight: "700", color: "#fff", marginBottom: "0.25rem" }}>{preset.name}</div>
                      {preset.description && <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)" }}>{preset.description}</div>}
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)", marginTop: "0.35rem" }}>
                        Kill: <span style={{ color: "#fff" }}>{preset.killPoints} pt</span> · Positions: <span style={{ color: "#fff" }}>{placements.length}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => startEdit(preset)} style={{ padding: "0.3rem 0.75rem", background: "transparent", color: "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer" }}>EDIT</button>
                      <button onClick={() => deletePreset(preset.id)} disabled={deletingId === preset.id} style={{ padding: "0.3rem 0.75rem", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: deletingId === preset.id ? "not-allowed" : "pointer", opacity: deletingId === preset.id ? 0.6 : 1 }}>
                        {deletingId === preset.id ? "..." : "DELETE"}
                      </button>
                    </div>
                  </div>
                  {placements.length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                      {placements.slice(0, 8).map((p) => (
                        <div key={p.position} style={{ background: "var(--black)", border: "1px solid var(--border)", padding: "0.25rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>
                          <span style={{ color: "var(--charcoal)" }}>#{p.position}</span>
                          <span style={{ color: "var(--gold)", marginLeft: "0.3rem" }}>{p.points}pt</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {tournaments.length > 0 && presets.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", marginBottom: "1rem" }}>ASSIGN PRESET TO TOURNAMENT</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>TOURNAMENT</label>
              <select value={assigningTournament} onChange={(e) => setAssigningTournament(e.target.value)} style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}>
                <option value="">Select tournament...</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>SCORING PRESET</label>
              <select value={assigningPreset} onChange={(e) => setAssigningPreset(e.target.value)} style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}>
                <option value="">Select preset...</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}{p.isBuiltIn ? " (Built-in)" : ""}</option>
                ))}
              </select>
            </div>
            <button onClick={assignPreset} disabled={assigning} style={{ padding: "0.5rem 1.25rem", background: "var(--gold)", color: "var(--black)", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: "700", cursor: assigning ? "not-allowed" : "pointer", opacity: assigning ? 0.6 : 1 }}>
              {assigning ? "..." : "ASSIGN"}
            </button>
          </div>
          {assigningTournament && tournamentPresets[assigningTournament] && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)", marginTop: "0.75rem" }}>
              Current: <span style={{ color: "var(--gold)" }}>{presets.find((p) => p.id === tournamentPresets[assigningTournament])?.name || "Unknown"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}