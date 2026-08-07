"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Check, AlertCircle, Users, Send, Trophy,
  ArrowLeft, User, Shield, MessageSquare, Sparkles
} from "lucide-react";

const ROLES = [
  { key: "IGL", label: "IGL", desc: "In-Game Leader" },
  { key: "Fragger", label: "Fragger", desc: "Main damage" },
  { key: "Support", label: "Support", desc: "Utility" },
  { key: "Entry", label: "Entry", desc: "First push" },
];

export default function PublicRegisterPage() {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    teamName: "",
    teamTag: "",
    contact: "",
    players: [
      { name: "", ign: "", role: "IGL" },
      { name: "", ign: "", role: "Fragger" },
      { name: "", ign: "", role: "Entry" },
      { name: "", ign: "", role: "Support" },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/public/tournaments/${params.slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) setSubmitted(true);
      else setError(data.error || "Submission failed");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ maxWidth: "28rem", width: "100%", background: "linear-gradient(135deg, rgba(34,197,94,0.1), transparent)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "1.5rem", padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ width: "5rem", height: "5rem", borderRadius: "1.25rem", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Check style={{ width: "2.5rem", height: "2.5rem", color: "#4ade80" }} />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>Registration Sent!</h2>
          <p style={{ color: "#d1d5db", fontSize: "0.9rem", marginBottom: "1.5rem" }}>The organizer will review your team registration. Good luck!</p>
          <Link href={`/tournaments/${params.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "0.625rem 1.5rem", borderRadius: "0.75rem", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
            <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
            Back to Tournament
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 1.5rem", background: "rgba(10,10,15,0.9)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{ width: "2rem", height: "2rem", background: "linear-gradient(135deg, #f59e0b, #f97316)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trophy style={{ width: "1rem", height: "1rem", color: "#000" }} />
            </div>
            <span style={{ fontWeight: 800, color: "#fff" }}>TournaOps</span>
          </Link>
          <Link href={`/tournaments/${params.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.8rem", textDecoration: "none" }}>
            <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
            Tournament
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", padding: "0.3rem 0.875rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, marginBottom: "1rem", border: "1px solid rgba(99,102,241,0.25)" }}>
            <Sparkles style={{ width: "0.75rem", height: "0.75rem" }} />
            TEAM REGISTRATION
          </div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <Users style={{ width: "2rem", height: "2rem", color: "#818cf8" }} />
            Register Your Team
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Submit your team details for organizer review</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Team Info */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Trophy style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
              Team Information
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.875rem" }}>
              <div>
                <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.375rem", fontWeight: 600 }}>TEAM NAME</label>
                <input required value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} placeholder="Team Alpha" style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.375rem", fontWeight: 600 }}>TAG</label>
                <input value={formData.teamTag} onChange={e => setFormData({...formData, teamTag: e.target.value})} placeholder="ALPH" maxLength={4} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", color: "#fff", fontSize: "0.875rem", outline: "none", textTransform: "uppercase", boxSizing: "border-box" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.375rem", fontWeight: 600 }}>
                  <MessageSquare style={{ width: "0.75rem", height: "0.75rem", display: "inline", marginRight: "0.25rem" }} />
                  CONTACT (WhatsApp/Discord/Email)
                </label>
                <input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="+977... or Discord username" style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Roster */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield style={{ width: "1rem", height: "1rem", color: "#a78bfa" }} />
              Team Roster (4 Players)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {formData.players.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: "0.5rem", alignItems: "center", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.625rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(139,92,246,0.15)", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <input required value={p.name} onChange={e => { const p2 = [...formData.players]; p2[i].name = e.target.value; setFormData({...formData, players: p2}); }} placeholder="Real Name" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.375rem", padding: "0.5rem", color: "#fff", fontSize: "0.75rem", outline: "none" }} />
                  <input required value={p.ign} onChange={e => { const p2 = [...formData.players]; p2[i].ign = e.target.value; setFormData({...formData, players: p2}); }} placeholder="IGN" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.375rem", padding: "0.5rem", color: "#fff", fontSize: "0.75rem", outline: "none" }} />
                  <select value={p.role} onChange={e => { const p2 = [...formData.players]; p2[i].role = e.target.value; setFormData({...formData, players: p2}); }} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.375rem", padding: "0.5rem", color: "#fff", fontSize: "0.75rem", outline: "none", cursor: "pointer" }}>
                    {ROLES.map(r => <option key={r.key} value={r.key} style={{ background: "#111116" }}>{r.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ padding: "0.875rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: "0.75rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button disabled={loading} type="submit" style={{
            width: "100%", padding: "0.875rem",
            background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(to right, #6366f1, #818cf8)",
            color: "#fff", fontWeight: 800, fontSize: "0.95rem",
            border: "none", borderRadius: "0.875rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            boxShadow: "0 8px 25px rgba(99,102,241,0.3)",
          }}>
            {loading ? "Submitting..." : <><Send style={{ width: "1rem", height: "1rem" }} />Submit Registration</>}
          </button>
        </form>
      </div>
    </div>
  );
}