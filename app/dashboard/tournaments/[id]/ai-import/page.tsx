// app/dashboard/tournaments/[id]/ai-import/page.tsx
"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Upload, Sparkles, Loader2, CheckCircle, AlertCircle, Camera, X, ChevronRight } from "lucide-react"

interface Match {
  id: string
  matchNumber: number
  map?: string
  status: string
  scheduledAt?: string
  results?: any[]
}

interface ExtractedTeam {
  teamName: string
  placement: number
  kills: number
  survivalPoints?: number
  totalPoints?: number
  matched?: string  // matched team ID
  confidence?: number
}

export default function AIImportPage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params?.id as string

  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [extracting, setExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedTeam[]>([])
  const [error, setError] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(true)

  useEffect(() => {
    fetch(`/api/tournaments/${tournamentId}`)
      .then((r) => r.json())
      .then((d) => {
        const t = d.tournament || d
        const allMatches: Match[] = []
        if (t.stages) {
          t.stages.forEach((s: any) => {
            if (s.matches) allMatches.push(...s.matches)
          })
        }
        setMatches(allMatches)
        if (allMatches.length > 0) setSelectedMatch(allMatches[0].id)
      })
      .catch(() => setError("Failed to load tournament data"))
      .finally(() => setLoadingMatches(false))
  }, [tournamentId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (!f.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB")
      return
    }

    setFile(f)
    setError("")
    setExtractedData([])
    setSaved(false)

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleExtract = async () => {
    if (!file || !selectedMatch) {
      setError("Select a match and upload screenshot")
      return
    }

    setExtracting(true)
    setError("")
    setExtractedData([])

    try {
      // First upload the image
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        setError("Failed to upload image")
        setExtracting(false)
        return
      }

      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url || uploadData.imageUrl

      // Extract via AI
      const extractRes = await fetch(`/api/matches/${selectedMatch}/extract-screenshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })

      const extractData = await extractRes.json()

      if (!extractRes.ok) {
        setError(extractData.error || "AI extraction failed")
        setExtracting(false)
        return
      }

      const teams = extractData.teams || extractData.results || extractData.data || []
      if (!Array.isArray(teams) || teams.length === 0) {
        setError("AI could not detect any team data in this screenshot")
        setExtracting(false)
        return
      }

      setExtractedData(teams)
    } catch (err: any) {
      setError(err?.message || "Extraction failed")
    } finally {
      setExtracting(false)
    }
  }

  const handleSave = async () => {
    if (!extractedData.length || !selectedMatch) return

    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/matches/${selectedMatch}/qualifier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: extractedData, source: "SCREENSHOT" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to save results")
      } else {
        setSaved(true)
      }
    } catch (err: any) {
      setError(err?.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const updateTeam = (idx: number, field: keyof ExtractedTeam, value: any) => {
    setExtractedData((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const removeTeam = (idx: number) => {
    setExtractedData((prev) => prev.filter((_, i) => i !== idx))
  }

  const clearAll = () => {
    setFile(null)
    setPreview("")
    setExtractedData([])
    setSaved(false)
    setError("")
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "9999px", padding: "0.25rem 0.75rem", marginBottom: "0.5rem" }}>
            <Sparkles style={{ width: "0.875rem", height: "0.875rem", color: "#a78bfa" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.05em" }}>AI POWERED</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: 0 }}>Screenshot Match Import</h1>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginTop: "0.375rem" }}>
            Upload a match results screenshot and let AI extract the data
          </p>
        </div>
        <button onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/match-results`)}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e7eb", padding: "0.5rem 0.875rem", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
          ← Back to Match Results
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Left: Upload */}
        <div style={{ background: "rgba(30,30,40,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.875rem", padding: "1.25rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", margin: 0, marginBottom: "0.75rem" }}>1. Select Match & Upload</h2>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.375rem", fontWeight: 600 }}>Match</label>
            {loadingMatches ? (
              <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.5rem", color: "#6b7280", fontSize: "0.8125rem" }}>Loading matches...</div>
            ) : matches.length === 0 ? (
              <div style={{ padding: "0.75rem", background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)", borderRadius: "0.5rem", color: "#facc15", fontSize: "0.8125rem" }}>
                No matches yet. Create stages/matches first.
              </div>
            ) : (
              <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem", outline: "none" }}>
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    Match #{m.matchNumber} {m.map ? `- ${m.map}` : ""} ({m.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.375rem", fontWeight: 600 }}>Screenshot</label>

            {!preview ? (
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", background: "rgba(139,92,246,0.05)", border: "2px dashed rgba(139,92,246,0.3)", borderRadius: "0.75rem", cursor: "pointer", transition: "all 0.15s" }}>
                <Camera style={{ width: "2rem", height: "2rem", color: "#a78bfa", marginBottom: "0.5rem" }} />
                <div style={{ fontSize: "0.875rem", color: "#a78bfa", fontWeight: 600 }}>Click to upload</div>
                <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem" }}>PNG, JPG, WEBP • Max 5MB</div>
                <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
              </label>
            ) : (
              <div style={{ position: "relative", borderRadius: "0.75rem", overflow: "hidden", background: "#000" }}>
                <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "contain", display: "block" }} />
                <button onClick={clearAll}
                  style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "0.375rem", borderRadius: "0.375rem", cursor: "pointer", display: "flex" }}>
                  <X style={{ width: "0.875rem", height: "0.875rem" }} />
                </button>
              </div>
            )}
          </div>

          <button onClick={handleExtract} disabled={!file || !selectedMatch || extracting}
            style={{ width: "100%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 700, padding: "0.75rem", borderRadius: "0.625rem", border: "none", cursor: !file || !selectedMatch || extracting ? "not-allowed" : "pointer", opacity: !file || !selectedMatch || extracting ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.9375rem" }}>
            {extracting ? (
              <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} /> Analyzing screenshot...</>
            ) : (
              <><Sparkles style={{ width: "1rem", height: "1rem" }} /> Extract with AI</>
            )}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

          {error && (
            <div style={{ marginTop: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.625rem 0.75rem", fontSize: "0.8125rem", color: "#f87171", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0, marginTop: "0.125rem" }} />
              {error}
            </div>
          )}
        </div>

        {/* Right: Extracted Results */}
        <div style={{ background: "rgba(30,30,40,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.875rem", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", margin: 0 }}>2. Review & Save</h2>
            {extractedData.length > 0 && (
              <span style={{ fontSize: "0.7rem", color: "#a78bfa", fontWeight: 600 }}>{extractedData.length} teams detected</span>
            )}
          </div>

          {saved ? (
            <div style={{ padding: "2rem 1rem", textAlign: "center", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "0.75rem" }}>
              <CheckCircle style={{ width: "2.5rem", height: "2.5rem", color: "#10b981", margin: "0 auto 0.75rem" }} />
              <h3 style={{ color: "#10b981", fontWeight: 700, marginBottom: "0.5rem", fontSize: "1rem" }}>Results Saved!</h3>
              <p style={{ color: "#6ee7b7", fontSize: "0.8125rem", margin: 0, marginBottom: "1rem" }}>Match results imported successfully</p>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                <button onClick={clearAll} style={{ padding: "0.5rem 0.875rem", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
                  Import Another
                </button>
                <button onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/standings`)}
                  style={{ padding: "0.5rem 0.875rem", background: "#10b981", border: "none", color: "#fff", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  View Standings <ChevronRight style={{ width: "0.875rem", height: "0.875rem" }} />
                </button>
              </div>
            </div>
          ) : extractedData.length === 0 ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#6b7280" }}>
              <Sparkles style={{ width: "2rem", height: "2rem", margin: "0 auto 0.75rem", opacity: 0.3 }} />
              <p style={{ fontSize: "0.8125rem", margin: 0 }}>Extracted results will appear here</p>
              <p style={{ fontSize: "0.7rem", margin: "0.375rem 0 0", opacity: 0.7 }}>Upload a screenshot and click Extract</p>
            </div>
          ) : (
            <>
              <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "1rem" }}>
                <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={{ textAlign: "left", padding: "0.5rem 0.25rem", color: "#9ca3af", fontWeight: 700 }}>#</th>
                      <th style={{ textAlign: "left", padding: "0.5rem 0.25rem", color: "#9ca3af", fontWeight: 700 }}>Team</th>
                      <th style={{ textAlign: "center", padding: "0.5rem 0.25rem", color: "#9ca3af", fontWeight: 700 }}>Pos</th>
                      <th style={{ textAlign: "center", padding: "0.5rem 0.25rem", color: "#9ca3af", fontWeight: 700 }}>Kills</th>
                      <th style={{ padding: "0.5rem 0.25rem" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.map((t, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "0.375rem 0.25rem", color: "#6b7280" }}>{i + 1}</td>
                        <td style={{ padding: "0.375rem 0.25rem" }}>
                          <input value={t.teamName} onChange={(e) => updateTeam(i, "teamName", e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.25rem", padding: "0.25rem 0.375rem", color: "#fff", fontSize: "0.75rem", outline: "none" }} />
                        </td>
                        <td style={{ padding: "0.375rem 0.25rem" }}>
                          <input type="number" value={t.placement || 0} onChange={(e) => updateTeam(i, "placement", parseInt(e.target.value) || 0)}
                            style={{ width: "3rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.25rem", padding: "0.25rem", color: "#fff", fontSize: "0.75rem", outline: "none", textAlign: "center" }} />
                        </td>
                        <td style={{ padding: "0.375rem 0.25rem" }}>
                          <input type="number" value={t.kills || 0} onChange={(e) => updateTeam(i, "kills", parseInt(e.target.value) || 0)}
                            style={{ width: "3rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.25rem", padding: "0.25rem", color: "#fff", fontSize: "0.75rem", outline: "none", textAlign: "center" }} />
                        </td>
                        <td style={{ padding: "0.375rem 0.25rem" }}>
                          <button onClick={() => removeTeam(i)}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "0.125rem" }}>
                            <X style={{ width: "0.875rem", height: "0.875rem" }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button onClick={handleSave} disabled={saving}
                style={{ width: "100%", background: "#10b981", color: "#fff", fontWeight: 700, padding: "0.75rem", borderRadius: "0.625rem", border: "none", cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                {saving ? (
                  <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} /> Saving...</>
                ) : (
                  <><CheckCircle style={{ width: "1rem", height: "1rem" }} /> Save {extractedData.length} Results</>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tips */}
      <div style={{ marginTop: "1rem", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "0.75rem", padding: "0.875rem" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#60a5fa", marginBottom: "0.5rem" }}>💡 Tips for best AI extraction</div>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.6 }}>
          <li>Use clear, high-resolution screenshots (no blur, no watermarks over data)</li>
          <li>Full leaderboard screens work best (all teams visible)</li>
          <li>Standard PUBG/BGMI post-match results screen is ideal</li>
          <li>You can edit team names and points before saving</li>
          <li>AI extracts placement + kills automatically</li>
        </ul>
      </div>
    </div>
  )
}