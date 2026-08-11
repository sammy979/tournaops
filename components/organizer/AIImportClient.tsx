"use client";
import { useState, useRef } from "react";
import Link from "next/link";

interface Match {
  id: string;
  name: string;
  matchNumber: number | null;
  map: string;
  status: string;
}

interface Props {
  tournamentId: string;
  matches: Match[];
}

interface ExtractedTeam {
  position: number;
  teamName: string;
  kills: number;
  points?: number;
  confidence?: number;
}

interface ExtractionResult {
  success: boolean;
  teams: ExtractedTeam[];
  detected?: { map?: string; matchInfo?: string };
  error?: string;
}

export default function AIImportClient({ tournamentId, matches }: Props) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingMatches = matches.filter(
    (m) => (m.status || "").toUpperCase() !== "COMPLETED"
  );

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setSaved(false);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }

  async function extractResults() {
    if (!file || !selectedMatchId) return;
    setExtracting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tournamentId", tournamentId);

      const res = await fetch(`/api/matches/${selectedMatchId}/extract-screenshot`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          teams: data.teams || data.results || [],
          detected: data.detected,
        });
      } else {
        setResult({ success: false, teams: [], error: data.error || "Extraction failed" });
      }
    } catch (err: any) {
      setResult({ success: false, teams: [], error: err.message || "Network error" });
    } finally {
      setExtracting(false);
    }
  }

  async function saveResults() {
    if (!result || !selectedMatchId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/matches/${selectedMatchId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: result.teams }),
      });

      if (res.ok) {
        setSaved(true);
      } else {
        const err = await res.json();
        alert("Save failed: " + (err.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
    }}>
      {/* LEFT — UPLOAD */}
      <div>
        <div className="section-label">Upload Screenshot</div>

        {/* MATCH SELECTOR */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 600,
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            color: "var(--white-40)",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}>Select Match</label>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            style={{
              width: "100%",
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.85rem",
              padding: "10px 14px",
              background: "var(--surface-2)",
              color: "var(--white)",
              border: "1px solid var(--border)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">-- Choose a match --</option>
            {pendingMatches.map((m) => (
              <option key={m.id} value={m.id}>
                Match {m.matchNumber ?? "?"} — {m.map} — {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* DROP ZONE */}
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? "var(--gold)" : "var(--border-2)"}`,
            background: dragActive ? "var(--gold-dim)" : "var(--surface)",
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "16px",
          }}
        >
          {preview ? (
            <div>
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  marginBottom: "12px",
                  border: "1px solid var(--border)",
                }}
              />
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontSize: "0.75rem",
                color: "var(--white-40)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>Click to change · {file?.name}</div>
            </div>
          ) : (
            <>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "1.1rem",
                letterSpacing: "0.05em",
                color: "var(--white-70)",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}>Drop Screenshot Here</div>
              <div style={{ fontSize: "0.8rem", color: "var(--white-40)" }}>
                Or click to browse · JPG, PNG, WEBP
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {/* EXTRACT BUTTON */}
        <button
          onClick={extractResults}
          disabled={!file || !selectedMatchId || extracting}
          className="btn-gold"
          style={{
            width: "100%",
            opacity: !file || !selectedMatchId || extracting ? 0.5 : 1,
            cursor: !file || !selectedMatchId || extracting ? "not-allowed" : "pointer",
          }}
        >
          {extracting ? "Extracting..." : "→ Extract with Ops AI"}
        </button>

        {extracting && (
          <div style={{
            marginTop: "12px",
            padding: "12px",
            background: "var(--surface)",
            border: "1px solid var(--gold)",
            borderLeft: "3px solid var(--gold)",
            fontSize: "0.8rem",
            color: "var(--gold)",
            fontFamily: "Barlow Condensed, sans-serif",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            <span className="live-dot" style={{ background: "var(--gold)", marginRight: "8px" }} />
            AI analyzing screenshot...
          </div>
        )}
      </div>

      {/* RIGHT — REVIEW */}
      <div>
        <div className="section-label">Review &amp; Publish</div>

        {!result && (
          <div style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
            padding: "48px 24px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "var(--white-40)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "8px",
            }}>Awaiting Extraction</div>
            <p style={{ fontSize: "0.8rem", color: "var(--white-40)", lineHeight: 1.6 }}>
              Upload a screenshot and click Extract to see AI-detected results here.
            </p>
          </div>
        )}

        {result && !result.success && (
          <div style={{
            border: "1px solid var(--red)",
            background: "var(--red-dim)",
            padding: "20px",
            borderLeft: "3px solid var(--red)",
          }}>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "var(--red)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "6px",
            }}>Extraction Failed</div>
            <p style={{ fontSize: "0.82rem", color: "var(--white-70)" }}>
              {result.error}
            </p>
          </div>
        )}

        {result && result.success && (
          <>
            {/* SUCCESS BANNER */}
            <div style={{
              background: "var(--green-dim)",
              border: "1px solid var(--green)",
              borderLeft: "3px solid var(--green)",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}>
              <div>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: "var(--green)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}>Extraction Complete</div>
                <div style={{ fontSize: "0.78rem", color: "var(--white-70)", marginTop: "2px" }}>
                  {result.teams.length} teams detected
                </div>
              </div>
              <span className="badge-completed">Ready</span>
            </div>

            {/* RESULTS TABLE */}
            <div style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
              marginBottom: "16px",
              overflow: "hidden",
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 60px 60px",
                padding: "10px 14px",
                background: "var(--surface-2)",
                borderBottom: "1px solid var(--border)",
              }}>
                {["#", "Team", "Kills", "Pts"].map((col, i) => (
                  <div key={col} style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.68rem",
                    letterSpacing: "0.15em",
                    color: "var(--white-40)",
                    textTransform: "uppercase",
                    textAlign: i > 1 ? "right" : "left",
                  }}>{col}</div>
                ))}
              </div>

              <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                {result.teams.map((team, i) => (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 60px 60px",
                    padding: "10px 14px",
                    borderBottom: i < result.teams.length - 1 ? "1px solid var(--border)" : "none",
                    alignItems: "center",
                    background: i === 0 ? "var(--gold-dim)" : "transparent",
                  }}>
                    <div style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: i === 0 ? "var(--gold)" : "var(--white-40)",
                    }}>{String(team.position).padStart(2, "0")}</div>
                    <div style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      color: "var(--white)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}>{team.teamName}</div>
                    <div style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.82rem",
                      color: "var(--white-70)",
                      textAlign: "right",
                    }}>{team.kills}</div>
                    <div style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      color: i === 0 ? "var(--gold)" : "var(--white)",
                      textAlign: "right",
                    }}>{team.points ?? "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            {!saved ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={saveResults}
                  disabled={saving}
                  className="btn-primary"
                  style={{ flex: 1, opacity: saving ? 0.5 : 1 }}
                >
                  {saving ? "Saving..." : "✓ Save & Publish"}
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="btn-secondary"
                >
                  Discard
                </button>
              </div>
            ) : (
              <div style={{
                background: "var(--green-dim)",
                border: "1px solid var(--green)",
                padding: "16px",
                textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: "var(--green)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "10px",
                }}>✓ Results Saved</div>
                <p style={{ fontSize: "0.8rem", color: "var(--white-70)", marginBottom: "12px" }}>
                  Standings have been updated automatically.
                </p>
                <Link
                  href={`/dashboard/tournaments/${tournamentId}/standings`}
                  className="btn-gold"
                  style={{ padding: "7px 16px" }}
                >
                  View Standings →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}