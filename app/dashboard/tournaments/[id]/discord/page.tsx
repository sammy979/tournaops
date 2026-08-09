"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TournamentNav from "@/components/tournament/TournamentNav";
import {
  MessageSquare, Save, Check, ChevronLeft, Loader2,
  ExternalLink, Zap, Bell, AlertCircle, Send, Bot,
  Trophy, Users, Radio, Crown, Copy
} from "lucide-react";

export default function TournamentDiscordPage() {
  const params = useParams();
  const id = params?.id as string;
  const [tournament, setTournament] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(d => {
        setTournament(d.tournament);
        setWebhookUrl(d.tournament?.discord || "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function saveWebhook() {
    setSaving(true);
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discord: webhookUrl.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    if (!webhookUrl.trim()) {
      setTestResult({ success: false, message: "Enter a webhook URL first" });
      return;
    }
    if (!webhookUrl.startsWith("https://discord.com/api/webhooks/") &&
        !webhookUrl.startsWith("https://discordapp.com/api/webhooks/")) {
      setTestResult({ success: false, message: "Invalid Discord webhook URL format" });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const testPayload = {
        embeds: [{
          title: "\uD83C\uDFC6 TournaOps Discord Test",
          description: `Successfully connected **${tournament?.name || "your tournament"}** to Discord!\n\nMatch results, standings, and announcements will now be posted automatically.`,
          color: 0xf59e0b,
          fields: [
            { name: "\u2705 Status", value: "Connected", inline: true },
            { name: "\uD83D\uDD17 Tournament", value: tournament?.name || "Unknown", inline: true },
          ],
          footer: { text: "TournaOps.com" },
          timestamp: new Date().toISOString(),
        }],
      };

      const res = await fetch("/api/discord/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: id, payload: testPayload }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: "\u2705 Test message sent! Check your Discord channel." });
      } else {
        setTestResult({ success: false, message: data.error || "Failed to send test message" });
      }
    } catch {
      setTestResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setTesting(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isConfigured = webhookUrl && webhookUrl.startsWith("https://discord.com/api/webhooks/");

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <Link href={`/dashboard/tournaments/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", textDecoration: "none", marginBottom: "1rem" }}>
        <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />Back to Tournament
      </Link>

      <TournamentNav tournamentId={id} />

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <MessageSquare style={{ width: "1.75rem", height: "1.75rem", color: "#5865F2" }} />
          Discord Integration
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Auto-post match results and announcements to your Discord server
        </p>
      </div>

      {/* Status Card */}
      <div style={{
        background: isConfigured ? "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))" : "rgba(107,114,128,0.05)",
        border: isConfigured ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <div style={{
          width: "3rem", height: "3rem", borderRadius: "0.75rem",
          background: isConfigured ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isConfigured
            ? <Check style={{ width: "1.5rem", height: "1.5rem", color: "#4ade80" }} />
            : <Bell style={{ width: "1.5rem", height: "1.5rem", color: "#9ca3af" }} />
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
            {isConfigured ? "Discord Connected" : "Not Connected"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.125rem" }}>
            {isConfigured
              ? "Match results will auto-post to Discord when completed"
              : "Add a webhook URL below to enable Discord notifications"}
          </div>
        </div>
      </div>

      {/* Webhook Config */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Zap style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
          Webhook URL
        </h3>
        <input
          type="url"
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
          placeholder="https://discord.com/api/webhooks/1234567890/abc..."
          style={{
            width: "100%", background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem",
            padding: "0.75rem", color: "#fff", fontSize: "0.85rem",
            fontFamily: "monospace", boxSizing: "border-box",
          }}
        />

        {testResult && (
          <div style={{
            marginTop: "0.75rem", padding: "0.75rem 1rem",
            background: testResult.success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: testResult.success ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.25)",
            borderRadius: "0.5rem",
            fontSize: "0.8rem",
            color: testResult.success ? "#4ade80" : "#f87171",
            display: "flex", alignItems: "center", gap: "0.5rem",
          }}>
            {testResult.success ? <Check style={{ width: "0.875rem", height: "0.875rem" }} /> : <AlertCircle style={{ width: "0.875rem", height: "0.875rem" }} />}
            {testResult.message}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <button onClick={saveWebhook} disabled={saving}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: saved ? "#22c55e" : "#f59e0b", color: "#000", borderRadius: "0.625rem", padding: "0.625rem 1.25rem", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
            {saved ? <><Check style={{ width: "0.875rem", height: "0.875rem" }} />Saved!</>
              : saving ? <><Loader2 style={{ width: "0.875rem", height: "0.875rem", animation: "spin 0.8s linear infinite" }} />Saving...</>
              : <><Save style={{ width: "0.875rem", height: "0.875rem" }} />Save Webhook</>}
          </button>
          <button onClick={sendTest} disabled={testing || !webhookUrl.trim()}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(88,101,242,0.15)", color: "#818cf8", border: "1px solid rgba(88,101,242,0.3)", borderRadius: "0.625rem", padding: "0.625rem 1.25rem", fontSize: "0.8rem", fontWeight: 700, cursor: testing || !webhookUrl.trim() ? "not-allowed" : "pointer" }}>
            {testing ? <><Loader2 style={{ width: "0.875rem", height: "0.875rem", animation: "spin 0.8s linear infinite" }} />Testing...</> : <><Send style={{ width: "0.875rem", height: "0.875rem" }} />Send Test Message</>}
          </button>
        </div>
      </div>

      {/* Setup Guide */}
      <div style={{ background: "rgba(88,101,242,0.05)", border: "1px solid rgba(88,101,242,0.2)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Bot style={{ width: "1rem", height: "1rem", color: "#818cf8" }} />
          How to Get a Discord Webhook URL
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { step: "1", text: "Open Discord and go to your server settings" },
            { step: "2", text: "Navigate to Integrations \u2192 Webhooks \u2192 New Webhook" },
            { step: "3", text: "Give it a name (e.g. \"TournaOps Bot\") and select the channel" },
            { step: "4", text: "Click Copy Webhook URL, paste it above, then Save" },
            { step: "5", text: "Click Send Test Message to verify" },
          ].map(s => (
            <div key={s.step} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: "rgba(88,101,242,0.2)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
              <p style={{ fontSize: "0.85rem", color: "#d1d5db", lineHeight: 1.5 }}>{s.text}</p>
            </div>
          ))}
        </div>
        <a href="https://support.discord.com/hc/en-us/articles/228383668" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginTop: "1rem", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#818cf8", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
          <ExternalLink style={{ width: "0.75rem", height: "0.75rem" }} />
          Discord Official Guide
        </a>
      </div>

      {/* What Gets Posted */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem" }}>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem" }}>
          What Gets Auto-Posted
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {[
            { icon: Trophy, label: "Match Results", desc: "Top 5 + WWCD + top fragger", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            { icon: Crown, label: "Chicken Dinner", desc: "Winner announcement", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
            { icon: Users, label: "Sponsors", desc: "Featured in every post", color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
            { icon: Radio, label: "Broadcast Links", desc: "OBS overlay URLs", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.625rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: "1rem", height: "1rem", color: item.color }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>{item.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.125rem" }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}