"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "settings", label: "Settings" },
  { id: "stages", label: "Stages" },
  { id: "review", label: "Review" },
];

const STAGE_TEMPLATES = {
  "16": [
    { name: "Group Stage", type: "group", order: 1, groupCount: 4, teamsPerGroup: 4, teamsAdvancing: 2 },
    { name: "Grand Final", type: "final", order: 2 },
  ],
  "24": [
    { name: "Group Stage", type: "group", order: 1, groupCount: 6, teamsPerGroup: 4, teamsAdvancing: 2 },
    { name: "Grand Final", type: "final", order: 2 },
  ],
  "32": [
    { name: "Qualifiers", type: "qualifier", order: 1, groupCount: 8, teamsPerGroup: 4, teamsAdvancing: 2 },
    { name: "Semi Final", type: "semi_final", order: 2, groupCount: 2, teamsPerGroup: 8, teamsAdvancing: 4 },
    { name: "Grand Final", type: "final", order: 3 },
  ],
  "48": [
    { name: "Qualifiers", type: "qualifier", order: 1, groupCount: 12, teamsPerGroup: 4, teamsAdvancing: 2 },
    { name: "Semi Final", type: "semi_final", order: 2, groupCount: 3, teamsPerGroup: 8, teamsAdvancing: 4 },
    { name: "Grand Final", type: "final", order: 3 },
  ],
  "64": [
    { name: "Qualifiers", type: "qualifier", order: 1, groupCount: 16, teamsPerGroup: 4, teamsAdvancing: 2 },
    { name: "Semi Final", type: "semi_final", order: 2, groupCount: 4, teamsPerGroup: 8, teamsAdvancing: 4 },
    { name: "Grand Final", type: "final", order: 3 },
  ],
  "custom": [],
};

type StageTemplate = {
  name: string;
  type: string;
  order: number;
  groupCount?: number;
  teamsPerGroup?: number;
  teamsAdvancing?: number;
};

export default function CreateTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitAttempted = useRef(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    game: "PUBG Mobile",
    teamSize: 4,
    maxTeams: 16,
    registrationOpen: true,
    registrationDeadline: "",
    startDate: "",
    endDate: "",
    prizePool: "",
    prizeDescription: "",
    rules: "",
    entryFee: "",
    isPublic: true,
  });

  const [stages, setStages] = useState<StageTemplate[]>(STAGE_TEMPLATES["16"]);
  const [stagePreset, setStagePreset] = useState("16");

  const handleFormChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStagePreset = (preset: string) => {
    setStagePreset(preset);
    if (preset !== "custom") {
      const maxTeamsMap: Record<string, number> = { "16": 16, "24": 24, "32": 32, "48": 48, "64": 64 };
      if (maxTeamsMap[preset]) {
        setForm((prev) => ({ ...prev, maxTeams: maxTeamsMap[preset] }));
      }
      setStages(STAGE_TEMPLATES[preset as keyof typeof STAGE_TEMPLATES] || []);
    }
  };

  const autoSlug = () => {
    if (!form.slug && form.name) {
      const slug = form.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 80);
      handleFormChange("slug", slug);
    }
  };

  const handleSubmit = async () => {
    if (submitAttempted.current) return; // Prevent double submit
    submitAttempted.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        game: form.game.trim(),
        teamSize: form.teamSize,
        maxTeams: form.maxTeams,
        registrationOpen: form.registrationOpen,
        registrationDeadline: form.registrationDeadline || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        prizePool: form.prizePool ? parseFloat(form.prizePool) : undefined,
        prizeDescription: form.prizeDescription || undefined,
        rules: form.rules || undefined,
        entryFee: form.entryFee ? parseFloat(form.entryFee) : undefined,
        isPublic: form.isPublic,
        stages: stages.length > 0 ? stages : undefined,
      };

      const res = await fetch("/api/dashboard/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create tournament");

      router.push(`/dashboard/tournaments/${data.tournament.id}/overview`);
    } catch (e: any) {
      setSubmitError(e.message);
      submitAttempted.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--white)",
    fontSize: "0.875rem",
    fontFamily: "Barlow, sans-serif",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--white-70)",
    fontSize: "0.8rem",
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: "0.4rem",
  };

  const sectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1rem", fontFamily: "Barlow, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--white)",
          letterSpacing: "0.02em",
          marginBottom: "0.5rem",
        }}>
          Create Tournament
        </h1>
        <p style={{ color: "var(--white-40)", fontSize: "0.875rem" }}>
          Fill in the tournament details. You can edit everything after creation.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: "0", marginBottom: "2.5rem" }}>
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: i < step ? "var(--green)" : i === step ? "var(--gold)" : "var(--surface)",
              border: `2px solid ${i < step ? "var(--green)" : i === step ? "var(--gold)" : "var(--border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: i <= step ? "var(--black)" : "var(--white-40)",
              fontWeight: 700,
              fontSize: "0.8rem",
              zIndex: 1,
            }}>
              {i < step ? "✓" : i + 1}
            </div>
            <div style={{
              marginTop: "0.4rem",
              fontSize: "0.75rem",
              fontFamily: "Barlow Condensed, sans-serif",
              color: i === step ? "var(--gold)" : "var(--white-40)",
              fontWeight: i === step ? 700 : 400,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div style={{
        background: "var(--charcoal)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "2rem",
        marginBottom: "1.5rem",
      }}>

        {/* Step 0: Basics */}
        {step === 0 && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.25rem", color: "var(--white)", margin: 0 }}>Basic Information</h2>

            <div>
              <label style={labelStyle}>Tournament Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                onBlur={autoSlug}
                placeholder="e.g. PUBG Mobile Championship Season 3"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleFormChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="auto-generated from name"
                style={{ ...inputStyle, fontFamily: "JetBrains Mono, monospace" }}
              />
              <p style={{ color: "var(--white-40)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                tournaops.com/tournaments/{form.slug || "your-slug"}
              </p>
            </div>

            <div>
              <label style={labelStyle}>Game</label>
              <input
                type="text"
                value={form.game}
                onChange={(e) => handleFormChange("game", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                placeholder="Tell participants about this tournament..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Team Size</label>
                <select
                  value={form.teamSize}
                  onChange={(e) => handleFormChange("teamSize", parseInt(e.target.value))}
                  style={inputStyle}
                >
                  <option value={1}>Solo (1)</option>
                  <option value={2}>Duo (2)</option>
                  <option value={3}>Trio (3)</option>
                  <option value={4}>Squad (4)</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Max Teams</label>
                <input
                  type="number"
                  value={form.maxTeams}
                  onChange={(e) => handleFormChange("maxTeams", parseInt(e.target.value))}
                  min={2}
                  max={128}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Settings */}
        {step === 1 && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.25rem", color: "var(--white)", margin: 0 }}>Tournament Settings</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => handleFormChange("startDate", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => handleFormChange("endDate", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Registration Deadline</label>
              <input
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(e) => handleFormChange("registrationDeadline", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Prize Pool (NPR)</label>
                <input
                  type="number"
                  value={form.prizePool}
                  onChange={(e) => handleFormChange("prizePool", e.target.value)}
                  min={0}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Entry Fee (NPR)</label>
                <input
                  type="number"
                  value={form.entryFee}
                  onChange={(e) => handleFormChange("entryFee", e.target.value)}
                  min={0}
                  placeholder="0 (free)"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Prize Distribution</label>
              <textarea
                value={form.prizeDescription}
                onChange={(e) => handleFormChange("prizeDescription", e.target.value)}
                placeholder="1st: Rs 5000, 2nd: Rs 3000, 3rd: Rs 2000..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div>
              <label style={labelStyle}>Rules & Format</label>
              <textarea
                value={form.rules}
                onChange={(e) => handleFormChange("rules", e.target.value)}
                placeholder="Tournament rules, format, anti-cheat policies..."
                rows={5}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.registrationOpen}
                  onChange={(e) => handleFormChange("registrationOpen", e.target.checked)}
                />
                <span style={{ color: "var(--white-70)", fontSize: "0.875rem" }}>Registration Open</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => handleFormChange("isPublic", e.target.checked)}
                />
                <span style={{ color: "var(--white-70)", fontSize: "0.875rem" }}>Public Tournament</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Stages */}
        {step === 2 && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.25rem", color: "var(--white)", margin: 0 }}>Stage Configuration</h2>
            <p style={{ color: "var(--white-40)", fontSize: "0.875rem", margin: 0 }}>
              Choose a tournament size template or configure stages manually.
            </p>

            <div>
              <label style={labelStyle}>Tournament Size Template</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["16", "24", "32", "48", "64", "custom"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleStagePreset(preset)}
                    style={{
                      padding: "0.4rem 0.875rem",
                      background: stagePreset === preset ? "var(--gold-dim)" : "var(--surface)",
                      border: `1px solid ${stagePreset === preset ? "var(--gold)" : "var(--border)"}`,
                      borderRadius: "6px",
                      color: stagePreset === preset ? "var(--gold)" : "var(--white-70)",
                      cursor: "pointer",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {preset === "custom" ? "Custom" : `${preset} Teams`}
                  </button>
                ))}
              </div>
            </div>

            {stages.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {stages.map((stage, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, color: "var(--gold)", fontSize: "1rem" }}>
                        Stage {stage.order}: {stage.name}
                      </div>
                      <span style={{
                        fontSize: "0.7rem",
                        fontFamily: "Barlow Condensed, sans-serif",
                        background: "var(--gold-dim)",
                        color: "var(--gold)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                      }}>
                        {stage.type}
                      </span>
                    </div>
                    {stage.groupCount && (
                      <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "var(--white-70)" }}>
                        <span>Groups: {stage.groupCount}</span>
                        {stage.teamsPerGroup && <span>Teams/Group: {stage.teamsPerGroup}</span>}
                        {stage.teamsAdvancing && <span>Advance: {stage.teamsAdvancing}/group</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {stagePreset === "custom" && stages.length === 0 && (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--white-40)", border: "1px dashed var(--border)", borderRadius: "8px" }}>
                Stages can be configured after tournament creation from the tournament dashboard.
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.25rem", color: "var(--white)", margin: 0 }}>Review & Create</h2>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              {[
                { label: "Name", value: form.name },
                { label: "Game", value: form.game },
                { label: "Slug", value: form.slug || "(auto-generated)" },
                { label: "Team Size", value: `${form.teamSize} players` },
                { label: "Max Teams", value: form.maxTeams },
                { label: "Registration", value: form.registrationOpen ? "Open" : "Closed" },
                { label: "Public", value: form.isPublic ? "Yes" : "No" },
                { label: "Prize Pool", value: form.prizePool ? `Rs ${form.prizePool}` : "None" },
                { label: "Entry Fee", value: form.entryFee ? `Rs ${form.entryFee}` : "Free" },
                { label: "Stages", value: stages.length > 0 ? stages.map(s => s.name).join(" → ") : "To be configured" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.625rem", background: "var(--surface)", borderRadius: "6px" }}>
                  <span style={{ color: "var(--white-40)", fontSize: "0.875rem" }}>{label}</span>
                  <span style={{ color: "var(--white)", fontSize: "0.875rem", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{String(value)}</span>
                </div>
              ))}
            </div>

            {submitError && (
              <div style={{
                padding: "0.75rem 1rem",
                background: "rgba(230,57,70,0.1)",
                border: "1px solid var(--red)",
                borderRadius: "8px",
                color: "var(--red)",
                fontSize: "0.875rem",
              }}>
                {submitError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: "0.75rem 1.5rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: step === 0 ? "var(--white-40)" : "var(--white)",
            cursor: step === 0 ? "not-allowed" : "pointer",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 0 && !form.name.trim()) return;
              setStep((s) => s + 1);
            }}
            disabled={step === 0 && !form.name.trim()}
            style={{
              padding: "0.75rem 1.5rem",
              background: step === 0 && !form.name.trim() ? "rgba(201,168,76,0.4)" : "var(--gold)",
              border: "none",
              borderRadius: "8px",
              color: "var(--black)",
              cursor: step === 0 && !form.name.trim() ? "not-allowed" : "pointer",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !form.name.trim()}
            style={{
              padding: "0.75rem 1.5rem",
              background: submitting ? "rgba(201,168,76,0.4)" : "var(--gold)",
              border: "none",
              borderRadius: "8px",
              color: "var(--black)",
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {submitting ? "Creating..." : "Create Tournament"}
          </button>
        )}
      </div>
    </div>
  );
}