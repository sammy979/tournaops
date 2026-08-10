// app/dashboard/settings/organizer/page.tsx
"use client"
import { useEffect, useState } from "react"
import { Save, Loader2, CheckCircle, Trophy, Image as ImageIcon, User } from "lucide-react"

interface Profile {
  displayName: string
  organizerName: string
  organizerLogo?: string | null
  organizerBio?: string | null
}

export default function OrganizerSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const [organizerName, setOrganizerName] = useState("")
  const [organizerLogo, setOrganizerLogo] = useState("")
  const [organizerBio, setOrganizerBio] = useState("")

  useEffect(() => {
    fetch("/api/organizer/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile)
          setOrganizerName(d.profile.organizerName || "")
          setOrganizerLogo(d.profile.organizerLogo || "")
          setOrganizerBio(d.profile.organizerBio || "")
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setError("")
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch("/api/organizer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerName, organizerLogo, organizerBio }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Save failed")
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const input = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.5rem",
    padding: "0.625rem 0.75rem",
    fontSize: "0.875rem",
    color: "#fff",
    outline: "none",
  } as const

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Trophy style={{ width: "1.25rem", height: "1.25rem", color: "#f59e0b" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Organizer Identity
            </span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>Organizer Profile</h1>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginTop: "0.375rem", margin: 0 }}>
            Set the name and branding that appears on your tournaments
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            background: saved ? "#10b981" : "#a855f7",
            color: "#fff", fontWeight: 600,
            padding: "0.625rem 1rem", borderRadius: "0.625rem",
            fontSize: "0.875rem", border: "none",
            cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} /> Saving...</>
          ) : saved ? (
            <><CheckCircle style={{ width: "1rem", height: "1rem" }} /> Saved!</>
          ) : (
            <><Save style={{ width: "1rem", height: "1rem" }} /> Save Profile</>
          )}
        </button>
      </div>

      {/* Preview Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.05))",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "1rem",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
          Preview
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {organizerLogo ? (
            <img
              src={organizerLogo}
              alt="Logo"
              style={{ width: "3.5rem", height: "3.5rem", borderRadius: "0.75rem", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          ) : (
            <div style={{
              width: "3.5rem", height: "3.5rem", borderRadius: "0.75rem",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <User style={{ width: "1.5rem", height: "1.5rem", color: "#6b7280" }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>
              {organizerName.trim() || profile?.displayName || "Your Organizer Name"}
            </div>
            {organizerBio && (
              <div style={{ fontSize: "0.8125rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                {organizerBio}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Organizer Name */}
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.375rem" }}>
            Organizer / Brand Name *
          </label>
          <input
            type="text"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            placeholder="e.g. Nepal Esports Arena, Team RHYN, Kais Gaming"
            maxLength={60}
            style={input}
          />
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.375rem", margin: 0 }}>
            This name will appear on your tournaments, overlays, and Discord announcements.
            {" "}<span style={{ color: "#9ca3af" }}>{organizerName.length}/60</span>
          </p>
        </div>

        {/* Logo */}
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.375rem" }}>
            Organizer Logo URL
          </label>
          <input
            type="url"
            value={organizerLogo}
            onChange={(e) => setOrganizerLogo(e.target.value)}
            placeholder="https://... (paste image URL)"
            style={input}
          />
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.375rem", margin: 0 }}>
            Square image works best. Upload to Imgur, ImgBB, or your hosting.
          </p>
        </div>

        {/* Bio */}
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.375rem" }}>
            Bio / Description
          </label>
          <textarea
            value={organizerBio}
            onChange={(e) => setOrganizerBio(e.target.value)}
            placeholder="Tell people about your tournaments and community..."
            maxLength={500}
            rows={4}
            style={{ ...input, resize: "vertical" }}
          />
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.375rem", margin: 0 }}>
            <span style={{ color: "#9ca3af" }}>{organizerBio.length}/500</span>
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "0.5rem",
            padding: "0.625rem 0.875rem",
            fontSize: "0.8125rem",
            color: "#f87171",
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Tips */}
      <div style={{
        marginTop: "2rem",
        background: "rgba(59,130,246,0.05)",
        border: "1px solid rgba(59,130,246,0.15)",
        borderRadius: "0.75rem",
        padding: "1rem",
      }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#60a5fa", marginBottom: "0.5rem" }}>
          💡 Tips for a Great Organizer Profile
        </div>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8125rem", color: "#9ca3af", lineHeight: 1.6 }}>
          <li>Use a memorable name that reflects your community or brand</li>
          <li>Add a clean square logo (200x200px or larger works best)</li>
          <li>Keep your bio short and clear about what tournaments you run</li>
        </ul>
      </div>
    </div>
  )
}