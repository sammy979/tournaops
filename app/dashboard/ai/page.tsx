"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot, Camera, FileText, Zap, Trophy, MessageSquare,
  TrendingUp, Sparkles, Star, Radio, Shield, DollarSign,
  Cpu, ChevronRight, Info, CheckCircle, Clock
} from "lucide-react";

const AI_FEATURES = [
  {
    icon: Camera,
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
    title: "AI Screenshot Import",
    desc: "Upload PUBG Mobile result screenshots and AI extracts placements and kills automatically",
    action: "Tournament → Matches → Screenshot Import",
    status: "available",
  },
  {
    icon: FileText,
    color: "#c084fc",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.25)",
    title: "AI Text Parser",
    desc: "Paste messy Discord/WhatsApp text and AI structures it into proper team data",
    action: "Tournament → Discord Import",
    status: "available",
  },
  {
    icon: Zap,
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    title: "Result Validator",
    desc: "Automatically checks for errors and inconsistencies before publishing results",
    action: "Built into every result submission",
    status: "active",
  },
  {
    icon: Trophy,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    title: "Smart Points Table",
    desc: "Leaderboard with team insights, trends, and predictive analytics",
    action: "Tournament → Standings tab",
    status: "available",
  },
  {
    icon: Bot,
    color: "#4ade80",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    title: "OpsAI Assistant",
    desc: "Ask natural language questions about standings, kills, teams, and predictions",
    action: "Blue bot button on tournament page",
    status: "available",
  },
  {
    icon: TrendingUp,
    color: "#22d3ee",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.25)",
    title: "What-If Simulator",
    desc: "Simulate hypothetical match outcomes and see live rank changes",
    action: "Coming in next update",
    status: "soon",
  },
  {
    icon: MessageSquare,
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.25)",
    title: "Social Post Generator",
    desc: "Auto-generate Discord, Twitter, and Instagram posts from match results",
    action: "Broadcast Studio or Share panel",
    status: "available",
  },
  {
    icon: Star,
    color: "#f472b6",
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.25)",
    title: "AI Commentary",
    desc: "Generate professional esports commentary from match data",
    action: "Broadcast Studio",
    status: "available",
  },
  {
    icon: Radio,
    color: "#f87171",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
    title: "Tournament Report",
    desc: "Auto-generated post-tournament report with champion, awards, and AI summary",
    action: "Public tournament → Report tab",
    status: "available",
  },
  {
    icon: Sparkles,
    color: "#c084fc",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.25)",
    title: "Scoring Assistant",
    desc: "Upload official scoring rules and AI creates the template automatically",
    action: "Dashboard → Scoring Systems",
    status: "available",
  },
];

const STATUS_LABELS: Record<string, { text: string; color: string; bg: string }> = {
  available: { text: "AVAILABLE", color: "#4ade80", bg: "rgba(34,197,94,0.15)" },
  active: { text: "ACTIVE", color: "#60a5fa", bg: "rgba(59,130,246,0.15)" },
  soon: { text: "COMING SOON", color: "#9ca3af", bg: "rgba(107,114,128,0.15)" },
};

const AI_STACK = [
  { icon: Cpu, label: "Points calculation", type: "Pure code", ai: false },
  { icon: Cpu, label: "Ranking + sorting", type: "Pure code", ai: false },
  { icon: Cpu, label: "Tiebreakers", type: "Pure code", ai: false },
  { icon: Cpu, label: "Statistics", type: "Pure code", ai: false },
  { icon: Camera, label: "Screenshot reading", type: "Groq Vision", ai: true },
  { icon: FileText, label: "Text parsing", type: "Regex → AI fallback", ai: true },
  { icon: Bot, label: "Summaries", type: "Groq Llama 3.3", ai: true },
  { icon: MessageSquare, label: "Content generation", type: "Groq + Gemini", ai: true },
];

export default function AIDashboardPage() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <div style={{
          width: "3rem", height: "3rem",
          borderRadius: "0.875rem",
          background: "linear-gradient(135deg, #a855f7, #ec4899)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 30px rgba(168,85,247,0.3)",
        }}>
          <Bot style={{ width: "1.5rem", height: "1.5rem", color: "#fff" }} />
        </div>
        <div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
            TournaOps AI
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            AI-powered tournament operations
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div style={{
        background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.05))",
        border: "1px solid rgba(168,85,247,0.25)",
        borderRadius: "0.875rem",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}>
        <Shield style={{ width: "1.125rem", height: "1.125rem", color: "#c084fc", flexShrink: 0, marginTop: "0.125rem" }} />
        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c084fc", marginBottom: "0.25rem" }}>
            Human-in-the-Loop
          </div>
          <div style={{ fontSize: "0.8rem", color: "#d1d5db", lineHeight: 1.5 }}>
            AI features enhance your workflow but <strong>never publish results automatically</strong>. Every AI extraction is reviewed by you before it becomes official.
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
          AI Features
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "0.875rem",
        }}>
          {AI_FEATURES.map(f => {
            const Icon = f.icon;
            const status = STATUS_LABELS[f.status];
            return (
              <div
                key={f.title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.875rem",
                  padding: "1.25rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = f.border;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                  <div style={{
                    width: "2.5rem", height: "2.5rem",
                    borderRadius: "0.625rem",
                    background: f.bg,
                    border: `1px solid ${f.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: "1.125rem", height: "1.125rem", color: f.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{f.title}</h3>
                      <span style={{
                        fontSize: "0.6rem", fontWeight: 800,
                        padding: "0.1rem 0.5rem",
                        borderRadius: "9999px",
                        letterSpacing: "0.05em",
                        background: status.bg,
                        color: status.color,
                      }}>
                        {status.text}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                      {f.desc}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.65rem", color: "#6b7280" }}>
                      {f.status === "soon" ? (
                        <Clock style={{ width: "0.7rem", height: "0.7rem" }} />
                      ) : (
                        <CheckCircle style={{ width: "0.7rem", height: "0.7rem", color: "#4ade80" }} />
                      )}
                      {f.action}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Stack Breakdown */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem",
        padding: "1.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <DollarSign style={{ width: "1.125rem", height: "1.125rem", color: "#4ade80" }} />
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
            Cost-Optimized Architecture
          </h3>
        </div>

        <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "1rem", lineHeight: 1.6 }}>
          TournaOps uses AI strategically to minimize costs. Only tasks that genuinely benefit from AI use it.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}>
          {AI_STACK.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: "0.625rem",
                  padding: "0.625rem 0.75rem",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${item.ai ? "rgba(168,85,247,0.2)" : "rgba(34,197,94,0.2)"}`,
                  borderRadius: "0.5rem",
                }}
              >
                <Icon style={{
                  width: "0.875rem", height: "0.875rem",
                  color: item.ai ? "#c084fc" : "#4ade80",
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: item.ai ? "#c084fc" : "#4ade80" }}>
                    {item.type}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          padding: "0.75rem 1rem",
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.15)",
          borderRadius: "0.625rem",
          fontSize: "0.75rem",
          color: "#4ade80",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          <Info style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />
          <span>
            Estimated cost: <strong>$0.01 - $0.05</strong> per tournament operation
          </span>
        </div>
      </div>
    </div>
  );
}