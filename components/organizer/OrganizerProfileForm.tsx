"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initial: {
    organizerName: string;
    organizerLogo: string;
    organizerBio: string;
  };
}

export default function OrganizerProfileForm({ initial }: Props) {
  const router = useRouter();
  const [organizerName, setOrganizerName] = useState(initial.organizerName);
  const [organizerLogo, setOrganizerLogo] = useState(initial.organizerLogo);
  const [organizerBio, setOrganizerBio] = useState(initial.organizerBio);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const bioLen = organizerBio.length;
  const bioMax = 500;

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function save() {
    setSaving(true);
    setMessage(null);

    try {
      let logoUrl = organizerLogo;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          logoUrl = data.url || data.imageUrl || logoUrl;
        }
      }

      const res = await fetch("/api/organizer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerName: organizerName.trim(),
          organizerLogo: logoUrl || null,
          organizerBio: organizerBio.trim() || null,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile saved" });
        setLogoFile(null);
        setLogoPreview(null);
        router.refresh();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Save failed" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      padding: "28px 24px",
    }}>
      <div style={{ marginBottom: "20px" }}>
        <label style={{
          display: "block",
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.72rem",
          letterSpacing: "0.12em",
          color: "var(--white-70)",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}>Organizer Name *</label>
        <input
          type="text"
          value={organizerName}
          onChange={(e) => setOrganizerName(e.target.value)}
          placeholder="e.g. Nepal Esports Cup Organizer"
          maxLength={60}
          minLength={2}
          style={{
            width: "100%",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.92rem",
            padding: "10px 14px",
            background: "var(--surface-2)",
            color: "var(--white)",
            border: "1px solid var(--border)",
            outline: "none",
          }}
        />
        <div style={{ fontSize: "0.72rem", color: "var(--white-40)", marginTop: "4px" }}>
          2-60 characters. Displayed on all public tournament pages.
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{
          display: "block",
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.72rem",
          letterSpacing: "0.12em",
          color: "var(--white-70)",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}>Logo</label>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            {(logoPreview || organizerLogo) ? (
              <img
                src={logoPreview || organizerLogo}
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "1.4rem",
                color: "var(--white-40)",
              }}>
                {(organizerName || "O")[0].toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{
                width: "100%",
                fontSize: "0.78rem",
                padding: "8px",
                background: "var(--surface-2)",
                color: "var(--white-70)",
                border: "1px solid var(--border)",
              }}
            />
            <div style={{ fontSize: "0.72rem", color: "var(--white-40)", marginTop: "4px" }}>
              Square logo recommended. PNG, JPG, or WEBP.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}>
          <label style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            color: "var(--white-70)",
            textTransform: "uppercase",
          }}>About / Bio</label>
          <span style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.7rem",
            color: bioLen > bioMax ? "var(--red)" : "var(--white-40)",
          }}>{bioLen}/{bioMax}</span>
        </div>
        <textarea
          value={organizerBio}
          onChange={(e) => setOrganizerBio(e.target.value)}
          rows={5}
          placeholder="Tell teams about your organization..."
          maxLength={bioMax}
          style={{
            width: "100%",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.88rem",
            padding: "10px 14px",
            background: "var(--surface-2)",
            color: "var(--white)",
            border: "1px solid var(--border)",
            outline: "none",
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
      </div>

      {message && (
        <div style={{
          padding: "10px 14px",
          marginBottom: "16px",
          background: message.type === "success" ? "var(--green-dim)" : "var(--red-dim)",
          border: `1px solid ${message.type === "success" ? "var(--green)" : "var(--red)"}`,
          borderLeft: `3px solid ${message.type === "success" ? "var(--green)" : "var(--red)"}`,
          fontSize: "0.82rem",
          color: message.type === "success" ? "var(--green)" : "var(--red)",
          fontFamily: "Barlow Condensed, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}>{message.text}</div>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          onClick={save}
          disabled={saving || organizerName.trim().length < 2}
          className="btn-gold"
          style={{
            opacity: (saving || organizerName.trim().length < 2) ? 0.5 : 1,
            cursor: (saving || organizerName.trim().length < 2) ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}