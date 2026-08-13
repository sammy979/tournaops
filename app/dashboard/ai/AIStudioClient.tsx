"use client";

import { useState } from "react";

type Tool = "EXTRACT" | "COMMENTARY" | "SUMMARY";

interface ToolConfig {
  id: Tool;
  label: string;
  description: string;
  inputLabel: string;
  inputType: "text" | "textarea" | "url";
  placeholder: string;
  buttonText: string;
}

const TOOLS: ToolConfig[] = [
  {
    id: "EXTRACT",
    label: "RESULT EXTRACTOR",
    description: "Paste a screenshot URL or describe the scoreboard. AI will extract team names, kills, placement and format it.",
    inputLabel: "SCREENSHOT URL OR SCOREBOARD DESCRIPTION",
    inputType: "textarea",
    placeholder: "Paste image URL or describe the scoreboard:\ne.g. Team Alpha - Rank 1, 8 kills\nTeam Nexus - Rank 2, 5 kills...",
    buttonText: "EXTRACT RESULTS",
  },
  {
    id: "COMMENTARY",
    label: "LIVE COMMENTARY",
    description: "Describe the match situation and get exciting live commentary for your stream or broadcast.",
    inputLabel: "MATCH SITUATION",
    inputType: "textarea",
    placeholder: "Describe what is happening:\ne.g. Final circle, 3 teams left, Team Alpha has zone advantage with 2 players alive...",
    buttonText: "GENERATE COMMENTARY",
  },
  {
    id: "SUMMARY",
    label: "MATCH SUMMARY",
    description: "Enter match results and get a professional post-match summary for social media or reports.",
    inputLabel: "MATCH RESULTS",
    inputType: "textarea",
    placeholder: "Enter full match results:\ne.g. Match 1 results: 1st Team Alpha (12 kills), 2nd Team Nexus (8 kills)...",
    buttonText: "GENERATE SUMMARY",
  },
];

export default function AIStudioClient() {
  const [activeTool, setActiveTool] = useState<Tool>("EXTRACT");
  const [input, setInput] = useState<Record<Tool, string>>({
    EXTRACT: "",
    COMMENTARY: "",
    SUMMARY: "",
  });
  const [output, setOutput] = useState<Record<Tool, string>>({
    EXTRACT: "",
    COMMENTARY: "",
    SUMMARY: "",
  });
  const [loading, setLoading] = useState<Tool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const tool = TOOLS.find((t) => t.id === activeTool)!;
  const activeInput = input[activeTool];
  const activeOutput = output[activeTool];

  async function runTool() {
    if (!activeInput.trim()) {
      setError("Input is required");
      return;
    }
    setLoading(activeTool);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: activeTool, input: activeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "AI request failed");
        return;
      }
      setOutput((prev) => ({ ...prev, [activeTool]: data.result }));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  function copyOutput() {
    if (!activeOutput) return;
    navigator.clipboard.writeText(activeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function clearAll() {
    setInput((prev) => ({ ...prev, [activeTool]: "" }));
    setOutput((prev) => ({ ...prev, [activeTool]: "" }));
    setError(null);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", fontFamily: "Barlow Condensed, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>
          DASHBOARD / AI STUDIO
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
          OPS AI Studio
        </h1>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--charcoal)", marginTop: "0.25rem" }}>
          Powered by Groq + Gemini · Built for esports organizers
        </div>
      </div>

      {error && (
        <div style={{ background: "#1a0000", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id); setError(null); }}
            style={{
              padding: "0.625rem 1.25rem",
              background: activeTool === t.id ? "var(--gold)" : "var(--surface)",
              color: activeTool === t.id ? "var(--black)" : "var(--charcoal)",
              border: `1px solid ${activeTool === t.id ? "var(--gold)" : "var(--border)"}`,
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.25rem" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
              {tool.label}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              {tool.description}
            </div>

            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
              {tool.inputLabel}
            </label>
            <textarea
              value={activeInput}
              onChange={(e) => setInput((prev) => ({ ...prev, [activeTool]: e.target.value }))}
              placeholder={tool.placeholder}
              rows={10}
              style={{
                width: "100%",
                background: "var(--black)",
                border: "1px solid var(--border)",
                color: "#fff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                padding: "0.75rem",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: 1.5,
              }}
            />

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
              <button
                onClick={runTool}
                disabled={loading === activeTool}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "var(--gold)",
                  color: "var(--black)",
                  border: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  fontWeight: "900",
                  cursor: loading === activeTool ? "not-allowed" : "pointer",
                  opacity: loading === activeTool ? 0.6 : 1,
                  letterSpacing: "0.1em",
                }}
              >
                {loading === activeTool ? "PROCESSING..." : tool.buttonText}
              </button>
              <button
                onClick={clearAll}
                style={{
                  padding: "0.75rem 1rem",
                  background: "transparent",
                  color: "var(--charcoal)",
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                CLEAR
              </button>
            </div>
          </div>
        </div>

        <div>
          <div style={{
            background: "var(--black)",
            border: `1px solid ${activeOutput ? "var(--gold)" : "var(--border)"}`,
            padding: "1.25rem",
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: activeOutput ? "var(--gold)" : "var(--charcoal)", letterSpacing: "0.15em" }}>
                {loading === activeTool ? "GENERATING..." : activeOutput ? "OUTPUT" : "WAITING FOR INPUT"}
              </div>
              {activeOutput && (
                <button
                  onClick={copyOutput}
                  style={{
                    padding: "0.25rem 0.75rem",
                    background: copied ? "var(--gold)" : "transparent",
                    color: copied ? "var(--black)" : "var(--charcoal)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {copied ? "COPIED!" : "COPY"}
                </button>
              )}
            </div>

            {loading === activeTool ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gold)", letterSpacing: "0.2em" }}>
                  AI IS THINKING...
                </div>
              </div>
            ) : activeOutput ? (
              <pre style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "#fff",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                flex: 1,
                overflowY: "auto",
              }}>
                {activeOutput}
              </pre>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", color: "var(--charcoal)" }}>🤖</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)" }}>
                  Output will appear here
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "2rem", background: "var(--surface)", border: "1px solid var(--border)", padding: "1.25rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>
          HOW TO USE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {[
            { step: "01", title: "RESULT EXTRACTOR", desc: "Paste screenshot URL or type out a scoreboard. AI reads it and formats structured results." },
            { step: "02", title: "LIVE COMMENTARY", desc: "Describe the match moment. Get broadcaster-quality commentary for OBS overlays or Discord." },
            { step: "03", title: "MATCH SUMMARY", desc: "Input final results and receive a polished summary ready for Twitter, Facebook, or reports." },
          ].map((item) => (
            <div key={item.step}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", fontWeight: "900", color: "var(--gold)", marginBottom: "0.25rem" }}>
                {item.step}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: "700", color: "#fff", marginBottom: "0.25rem" }}>
                {item.title}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)", lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}