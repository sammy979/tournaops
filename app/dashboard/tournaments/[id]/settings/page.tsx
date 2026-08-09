"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TournamentNav from "@/components/tournament/TournamentNav";
import { useDialog } from "@/lib/use-confirm";
import {
  Settings, Save, Loader2, Check, ChevronLeft, Trash2,
  Globe, Lock, Users, MapPin, Trophy, AlertCircle,
  Calendar, DollarSign, MessageSquare, FileText
} from "lucide-react";

const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Rondo", "Nusa", "Livik", "Karakin"];
const FORMATS = [
  { value: "squad", label: "Squad (4 players)" },
  { value: "duo", label: "Duo (2 players)" },
  { value: "solo", label: "Solo (1 player)" },
];
const STATUSES = [
  { value: "draft", label: "Draft", color: "#9ca3af" },
  { value: "registration", label: "Registration Open", color: "#60a5fa" },
  { value: "live", label: "Live", color: "#4ade80" },
  { value: "completed", label: "Completed", color: "#c084fc" },
  { value: "cancelled", label: "Cancelled", color: "#f87171" },
];

export default function SettingsPage() {
  const dialog = useDialog();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "draft",
    format: "squad",
    maxTeams: 16,
    prizePool: "",
    discord: "",
    rules: "",
    isPublic: true,
    mapRotation: [] as string[],
  });
  const [tournamentName, setTournamentName] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(d => {
        const t = d.tournament;
        if (!t) return;
        setTournamentName(t.name);
        setForm({
          name: t.name || "",
          description: t.description || "",
          status: t.status || "draft",
          format: t.format || "squad",
          maxTeams: t.maxTeams || 16,
          prizePool: t.prizePool || "",
          discord: t.discord || "",
          rules: t.rules || "",
          isPublic: t.isPublic !== false,
          mapRotation: t.mapRotation || [],
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleMap(map: string) {
    setForm(prev => ({
      ...prev,
      mapRotation: prev.mapRotation.includes(map)
        ? prev.mapRotation.filter(m => m !== map)
        : [...prev.mapRotation, map],
    }));
  }

  async function save() {
    if (!form.name.trim()) return alert("Tournament name required");
    setSaving(true);
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          status: form.status,
          format: form.format,
          maxTeams: Number(form.maxTeams),
          prizePool: form.prizePool.trim(),
          discord: form.discord.trim(),
          rules: form.rules.trim(),
          isPublic: form.isPublic,
          mapRotation: form.mapRotation,
        }),
      });
      if (res.ok) {
        setTournamentName(form.name);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteTournament() {
    if (deleteInput !== tournamentName) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/tournaments");
      } else {
        alert("Failed to delete tournament");
      }
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem",
    padding: "0.625rem 0.75rem", color: "#fff", fontSize: "0.875rem",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600,
    display: "block", marginBottom: "0.375rem",
  };
  const sectionStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "1rem", padding: "1.5rem",
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <Link href={`/dashboard/tournaments/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", textDecoration: "none", marginBottom: "1rem" }}>
        <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />Back to Tournament
      </Link>

      <TournamentNav tournamentId={id} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Settings style={{ width: "1.75rem", height: "1.75rem", color: "#f59e0b" }} />Settings
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>{tournamentName}</p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: saved ? "#22c55e" : "#f59e0b", color: "#000", borderRadius: "0.75rem", padding: "0.625rem 1.5rem", border: "none", fontSize: "0.875rem", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
          {saved ? <><Check style={{ width: "1rem", height: "1rem" }} />Saved!</>
            : saving ? <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 0.8s linear infinite" }} />Saving...</>
            : <><Save style={{ width: "1rem", height: "1rem" }} />Save Changes</>}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Basic Info */}
        <div style={sectionStyle}>
          <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Trophy style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />Basic Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Tournament Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} placeholder="e.g. PUBG Mobile Championship 2025" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} placeholder="Tournament description..." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Prize Pool</label>
                <input value={form.prizePool} onChange={e => set("prizePool", e.target.value)} style={inputStyle} placeholder="e.g. $500 USDT" />
              </div>
              <div>
                <label style={labelStyle}>Max Teams</label>
                <input type="number" min={2} max={400} value={form.maxTeams} onChange={e => set("maxTeams", e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Status + Format */}
        <div style={sectionStyle}>
          <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />Status & Format
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Tournament Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Format</label>
              <select value={form.format} onChange={e => set("format", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          {/* Public toggle */}
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              {form.isPublic ? <Globe style={{ width: "1rem", height: "1rem", color: "#4ade80" }} /> : <Lock style={{ width: "1rem", height: "1rem", color: "#9ca3af" }} />}
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>
                  {form.isPublic ? "Public Tournament" : "Private Tournament"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                  {form.isPublic ? "Visible on public pages and search" : "Only accessible via direct link"}
                </div>
              </div>
            </div>
            <button onClick={() => set("isPublic", !form.isPublic)}
              style={{ width: "3rem", height: "1.5rem", borderRadius: "9999px", background: form.isPublic ? "#4ade80" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
              <div style={{ position: "absolute", top: "0.125rem", left: form.isPublic ? "1.625rem" : "0.125rem", width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </button>
          </div>
        </div>

        {/* Map Rotation */}
        <div style={sectionStyle}>
          <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />Map Rotation
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {MAPS.map(map => {
              const selected = form.mapRotation.includes(map);
              return (
                <button key={map} onClick={() => toggleMap(map)}
                  style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", border: selected ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.1)", background: selected ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)", color: selected ? "#f59e0b" : "#9ca3af", transition: "all 0.15s" }}>
                  {map}
                </button>
              );
            })}
          </div>
          {form.mapRotation.length > 0 && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>
              Selected: {form.mapRotation.join(", ")}
            </p>
          )}
        </div>

        {/* Discord + Rules */}
        <div style={sectionStyle}>
          <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MessageSquare style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />Discord & Rules
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Discord Webhook URL</label>
              <input value={form.discord} onChange={e => set("discord", e.target.value)}
                style={inputStyle} placeholder="https://discord.com/api/webhooks/..." />
              <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.375rem" }}>
                Match results and announcements will be posted here automatically
              </p>
            </div>
            <div>
              <label style={labelStyle}>Tournament Rules</label>
              <textarea value={form.rules} onChange={e => set("rules", e.target.value)} rows={5}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                placeholder="1. No teaming&#10;2. No cheating&#10;3. Respect all players..." />
            </div>
          </div>
        </div>

        {/* Save button */}
        <button onClick={save} disabled={saving}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: saved ? "#22c55e" : "#f59e0b", color: "#000", borderRadius: "0.875rem", padding: "0.875rem", border: "none", fontSize: "0.95rem", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>
          {saved ? <><Check style={{ width: "1.125rem", height: "1.125rem" }} />Changes Saved!</>
            : saving ? <><Loader2 style={{ width: "1.125rem", height: "1.125rem", animation: "spin 0.8s linear infinite" }} />Saving...</>
            : <><Save style={{ width: "1.125rem", height: "1.125rem" }} />Save All Changes</>}
        </button>

        {/* Auto-Fill Demo Data */}
        <div style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "1rem", padding: "1.5rem" }}>
          <h3 style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            🎯 Auto-Fill Demo Data
          </h3>
          <p style={{ color: "#93c5fd", fontSize: "0.8rem", marginBottom: "1rem", lineHeight: 1.5 }}>
            Instantly fill this tournament with realistic demo data for testing.
            Creates teams (up to max), assigns them to Stage 1 groups, adds sponsors, and simulates match results.
          </p>
          <button
            onClick={async () => {
              const ok = await dialog.confirm({
      title: "Auto-fill tournament with demo data?",
      description: "Teams will be filled up to max, 13 demo sponsors added across 4 tiers, teams assigned to Stage 1 groups, and all Stage 1 match results simulated. Existing data will NOT be deleted.",
      confirmLabel: "Auto-fill demo data",
      variant: "info",
    });
    if (!ok) return;
              const btn = event?.target as HTMLButtonElement;
              if (btn) { btn.disabled = true; btn.innerText = "Filling..."; }
              try {
                const res = await fetch(`/api/tournaments/${id}/autofill-demo`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    fillTeams: true,
                    fillSponsors: true,
                    fillBranding: true,
                    simulateMatches: true,
                  }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  alert("✅ Demo data filled!\n\n" + (data.report?.actions || []).join("\n"));
                  window.location.reload();
                } else {
                  alert("Failed: " + (data.error || "Unknown"));
                }
              } catch (e: any) {
                alert("Error: " + e.message);
              } finally {
                if (btn) { btn.disabled = false; btn.innerText = "🎯 Auto-Fill Everything"; }
              }
            }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "#3b82f6", color: "#fff",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.625rem", border: "none",
              fontSize: "0.9rem", fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🎯 Auto-Fill Everything
          </button>
          <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.75rem" }}>
            💡 Perfect for demoing to organizers, testing Discord/OBS, or preparing screenshots
          </p>
        </div>

        {/* Danger Zone */}
        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "1rem", padding: "1.5rem" }}>
          <h3 style={{ color: "#f87171", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle style={{ width: "1rem", height: "1rem" }} />Danger Zone
          </h3>
          {!showDeleteConfirm ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>Delete Tournament</div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>This permanently deletes all teams, matches, results and data.</div>
              </div>
              <button onClick={() => setShowDeleteConfirm(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "0.625rem", padding: "0.5rem 1rem", color: "#f87171", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />Delete Tournament
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "0.85rem", color: "#f87171", marginBottom: "0.75rem" }}>
                Type <strong>{tournamentName}</strong> to confirm deletion:
              </p>
              <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                placeholder={tournamentName}
                style={{ ...inputStyle, borderColor: "rgba(239,68,68,0.3)", marginBottom: "0.75rem" }} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={deleteTournament} disabled={deleteInput !== tournamentName || deleting}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: deleteInput === tournamentName ? "#ef4444" : "rgba(239,68,68,0.1)", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1rem", color: deleteInput === tournamentName ? "#fff" : "#6b7280", fontSize: "0.8rem", fontWeight: 700, cursor: deleteInput === tournamentName ? "pointer" : "not-allowed" }}>
                  {deleting ? <Loader2 style={{ width: "0.875rem", height: "0.875rem", animation: "spin 0.8s linear infinite" }} /> : <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />}
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.625rem", padding: "0.5rem 1rem", color: "#9ca3af", fontSize: "0.8rem", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}