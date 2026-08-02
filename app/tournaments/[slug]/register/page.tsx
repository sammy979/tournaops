"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Zap, Users, User, AtSign, Shield, Send, Check, AlertCircle, Trophy } from "lucide-react";
import { getTournamentBySlug } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

const ROLES = ["IGL", "Fragger", "Support", "Entry", "Sniper", "Assaulter", "Scout"];

export default function TeamRegisterPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    teamName: "",
    teamTag: "",
    contactEmail: "",
    contactDiscord: "",
    players: Array.from({ length: 4 }, (_, i) => ({
      name: "",
      ign: "",
      uid: "",
      role: ["IGL", "Fragger", "Support", "Entry"][i] as string,
    })),
  });

  const load = useCallback(() => {
    const slug = params?.slug as string;
    if (slug) {
      const t = getTournamentBySlug(slug);
      setTournament(t || null);
    }
    setLoading(false);
  }, [params?.slug]);

  useEffect(() => { load(); }, [load]);

  const updatePlayer = (idx: number, field: string, value: string) => {
    setForm(f => ({
      ...f,
      players: f.players.map((p, i) => i === idx ? { ...p, [field]: value } : p),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.teamName.trim()) { setError("Team name is required"); return; }
    if (form.players.some(p => !p.name.trim() || !p.ign.trim())) {
      setError("All players need a name and IGN"); return;
    }

    setSubmitting(true);

    // Save registration to localStorage
    setTimeout(() => {
      try {
        const key = `registrations_${tournament?.id}`;
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        existing.push({
          ...form,
          id: Math.random().toString(36).substring(2, 10),
          submittedAt: new Date().toISOString(),
          status: "pending",
        });
        localStorage.setItem(key, JSON.stringify(existing));
        setSubmitted(true);
      } catch {
        setError("Submission failed. Please try again.");
      }
      setSubmitting(false);
    }, 1000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!tournament) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4">
      <div>
        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h1 className="text-white text-2xl font-bold mb-2">Tournament Not Found</h1>
        <Link href="/" className="btn-primary px-6 py-2.5 mt-4">Go to TournaOps</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">TournaOps</span>
        </Link>
        <Link href={`/tournaments/${tournament.slug}`} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
          View Tournament →
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Tournament Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Users className="w-3 h-3" /> Team Registration
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
          <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
            <span>{tournament.teams.length} squads registered</span>
            {tournament.prizePool && <span className="text-yellow-400">🏆 {tournament.prizePool}</span>}
          </div>
        </div>

        {submitted ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-green-500/20 bg-green-500/5">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Registration Submitted!</h2>
            <p className="text-gray-500 mb-2">
              <strong className="text-white">{form.teamName}</strong> has been registered.
            </p>
            <p className="text-gray-600 text-sm mb-6">The organizer will review your registration and confirm your spot.</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/tournaments/${tournament.slug}`} className="btn-primary px-6 py-2.5">
                Watch Tournament Live
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Info */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" /> Team Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1.5">Team Name *</label>
                    <input
                      type="text"
                      value={form.teamName}
                      onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))}
                      className="input-field"
                      placeholder="Team Alpha"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1.5">Team Tag</label>
                    <input
                      type="text"
                      value={form.teamTag}
                      onChange={e => setForm(f => ({ ...f, teamTag: e.target.value.toUpperCase().slice(0, 4) }))}
                      className="input-field font-mono"
                      placeholder="ALPH"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1.5">Contact Email</label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                      className="input-field"
                      placeholder="captain@team.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1.5">Discord ID</label>
                    <input
                      type="text"
                      value={form.contactDiscord}
                      onChange={e => setForm(f => ({ ...f, contactDiscord: e.target.value }))}
                      className="input-field"
                      placeholder="username#0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Players */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Player Roster
              </h2>
              <div className="space-y-4">
                {form.players.map((player, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/4 border border-white/8 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-white text-sm font-medium">
                        {idx === 0 ? "Captain (IGL)" : `Player ${idx + 1}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Display Name *</label>
                        <input
                          type="text"
                          value={player.name}
                          onChange={e => updatePlayer(idx, "name", e.target.value)}
                          className="input-field text-sm py-1.5"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">In-Game Name *</label>
                        <input
                          type="text"
                          value={player.ign}
                          onChange={e => updatePlayer(idx, "ign", e.target.value)}
                          className="input-field text-sm py-1.5 font-mono"
                          placeholder="IGN"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Role</label>
                        <select
                          value={player.role}
                          onChange={e => updatePlayer(idx, "role", e.target.value)}
                          className="input-field text-sm py-1.5"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">PUBG Mobile UID (optional)</label>
                      <input
                        type="text"
                        value={player.uid}
                        onChange={e => updatePlayer(idx, "uid", e.target.value)}
                        className="input-field text-sm py-1.5 font-mono"
                        placeholder="5xxxxxxxxx"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base">
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
              ) : (
                <><Send className="w-4 h-4" />Submit Registration</>
              )}
            </button>

            <p className="text-center text-gray-600 text-xs">
              Registration is subject to organizer approval. You will be contacted via email or Discord.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}