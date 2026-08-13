"use client";

import { useState } from "react";

type ImageType = "BANNER" | "THUMBNAIL" | "TEAMCARD" | "POSTER";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  type: ImageType;
  savedAt: string | null;
}

const IMAGE_TYPES: { id: ImageType; label: string; desc: string; aspectRatio: string }[] = [
  { id: "BANNER", label: "TOURNAMENT BANNER", desc: "16:9 wide banner for streams and websites", aspectRatio: "16/9" },
  { id: "THUMBNAIL", label: "MATCH THUMBNAIL", desc: "YouTube / Facebook thumbnail", aspectRatio: "16/9" },
  { id: "TEAMCARD", label: "TEAM CARD", desc: "Square team profile card", aspectRatio: "1/1" },
  { id: "POSTER", label: "EVENT POSTER", desc: "Portrait poster for social media", aspectRatio: "9/16" },
];

const STYLE_PRESETS = [
  "Dark esports with gold accents",
  "Neon cyberpunk gaming",
  "Military tactical dark theme",
  "Clean minimal white and gold",
  "Fire and smoke dramatic",
  "Nepal flag colors red and blue",
];

export default function AIImagesClient() {
  const [imageType, setImageType] = useState<ImageType>("BANNER");
  const [prompt, setPrompt] = useState("");
  const [stylePreset, setStylePreset] = useState("");
  const [tournamentName, setTournamentName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedImage[]>([]);

  const activeType = IMAGE_TYPES.find((t) => t.id === imageType)!;

  function buildPrompt() {
    const parts: string[] = [];
    if (tournamentName.trim()) parts.push(`Tournament: "${tournamentName.trim()}"`);
    if (prompt.trim()) parts.push(prompt.trim());
    if (stylePreset) parts.push(`Style: ${stylePreset}`);
    parts.push(`Format: ${activeType.label}`);
    return parts.join(". ");
  }

  async function generateImage() {
    const fullPrompt = buildPrompt();
    if (!fullPrompt.trim()) {
      setError("Enter a prompt or tournament name");
      return;
    }
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/ai-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, type: imageType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Image generation failed");
        return;
      }
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.imageUrl,
        prompt: fullPrompt,
        type: imageType,
        savedAt: null,
      };
      setGenerated((prev) => [newImage, ...prev]);
      setSuccess("Image generated successfully");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function saveToAssets(image: GeneratedImage) {
    setSaving(image.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `AI ${image.type} - ${new Date().toLocaleDateString("en-NP")}`,
          url: image.url,
          type: image.type === "TEAMCARD" ? "IMAGE" : image.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save to assets");
        return;
      }
      setGenerated((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, savedAt: new Date().toISOString() } : img
        )
      );
      setSuccess("Image saved to Media Library");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  function downloadImage(url: string, type: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `tournaops-${type.toLowerCase()}-${Date.now()}.png`;
    a.target = "_blank";
    a.click();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", fontFamily: "Barlow Condensed, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>
          DASHBOARD / AI IMAGES
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
          AI Image Generator
        </h1>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--charcoal)", marginTop: "0.25rem" }}>
          Generate tournament banners, thumbnails, and team cards with AI
        </div>
      </div>

      {error && (
        <div style={{ background: "#1a0000", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#001a00", border: "1px solid var(--gold)", color: "var(--gold)", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "1rem" }}>
          {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.25rem" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", marginBottom: "1rem" }}>
              IMAGE TYPE
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {IMAGE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setImageType(t.id)}
                  style={{
                    padding: "0.75rem 0.5rem",
                    background: imageType === t.id ? "var(--gold)" : "var(--black)",
                    color: imageType === t.id ? "var(--black)" : "var(--charcoal)",
                    border: `1px solid ${imageType === t.id ? "var(--gold)" : "var(--border)"}`,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ marginBottom: "0.2rem" }}>{t.label}</div>
                  <div style={{ fontSize: "0.55rem", opacity: 0.7, fontWeight: "400" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.25rem" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", marginBottom: "1rem" }}>
              PROMPT BUILDER
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>
                TOURNAMENT NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="e.g. Nepal Esports Championship 2025"
                style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.4rem 0.6rem", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>
                CUSTOM PROMPT
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to see in the image..."
                rows={4}
                style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.5rem 0.6rem", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.4rem" }}>
                STYLE PRESETS
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {STYLE_PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStylePreset(stylePreset === s ? "" : s)}
                    style={{
                      padding: "0.25rem 0.6rem",
                      background: stylePreset === s ? "var(--gold)" : "var(--black)",
                      color: stylePreset === s ? "var(--black)" : "var(--charcoal)",
                      border: `1px solid ${stylePreset === s ? "var(--gold)" : "var(--border)"}`,
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateImage}
              disabled={generating}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: "var(--gold)",
                color: "var(--black)",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                fontWeight: "900",
                cursor: generating ? "not-allowed" : "pointer",
                opacity: generating ? 0.6 : 1,
                letterSpacing: "0.1em",
              }}
            >
              {generating ? "GENERATING..." : "⚡ GENERATE IMAGE"}
            </button>
          </div>
        </div>

        <div>
          <div style={{ background: "var(--black)", border: "1px solid var(--border)", padding: "1.25rem", minHeight: "400px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)", letterSpacing: "0.15em", marginBottom: "1rem" }}>
              PREVIEW — {activeType.label}
            </div>

            {generating ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gold)", letterSpacing: "0.2em" }}>
                  AI IS CREATING YOUR IMAGE...
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)" }}>
                  This may take 10-30 seconds
                </div>
              </div>
            ) : generated.length > 0 ? (
              <div>
                <div style={{
                  aspectRatio: activeType.aspectRatio,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  marginBottom: "0.75rem",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <img
                    src={generated[0].url}
                    alt="Generated"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)", marginBottom: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {generated[0].prompt}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => saveToAssets(generated[0])}
                    disabled={saving === generated[0].id || !!generated[0].savedAt}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      background: generated[0].savedAt ? "var(--surface)" : "var(--gold)",
                      color: generated[0].savedAt ? "var(--charcoal)" : "var(--black)",
                      border: "1px solid var(--border)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      cursor: saving === generated[0].id || !!generated[0].savedAt ? "not-allowed" : "pointer",
                      opacity: saving === generated[0].id ? 0.6 : 1,
                    }}
                  >
                    {generated[0].savedAt ? "SAVED ✓" : saving === generated[0].id ? "SAVING..." : "SAVE TO ASSETS"}
                  </button>
                  <button
                    onClick={() => downloadImage(generated[0].url, generated[0].type)}
                    style={{ padding: "0.5rem 0.75rem", background: "transparent", color: "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", cursor: "pointer" }}
                  >
                    DOWNLOAD
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "3rem", color: "var(--charcoal)" }}>🎨</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)" }}>
                  Generated image will appear here
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {generated.length > 1 && (
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>
            GENERATION HISTORY ({generated.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1px", background: "var(--border)" }}>
            {generated.slice(1).map((img) => (
              <div key={img.id} style={{ background: "var(--surface)", padding: "0.75rem" }}>
                <div style={{ aspectRatio: "16/9", background: "var(--black)", border: "1px solid var(--border)", marginBottom: "0.5rem", overflow: "hidden" }}>
                  <img src={img.url} alt="Generated" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.4rem" }}>
                  {img.type}
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button
                    onClick={() => saveToAssets(img)}
                    disabled={saving === img.id || !!img.savedAt}
                    style={{ flex: 1, padding: "0.25rem", background: img.savedAt ? "transparent" : "var(--gold)", color: img.savedAt ? "var(--charcoal)" : "var(--black)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.55rem", fontWeight: "700", cursor: img.savedAt ? "not-allowed" : "pointer" }}
                  >
                    {img.savedAt ? "SAVED" : "SAVE"}
                  </button>
                  <button
                    onClick={() => downloadImage(img.url, img.type)}
                    style={{ padding: "0.25rem 0.4rem", background: "transparent", color: "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.55rem", cursor: "pointer" }}
                  >
                    DL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}