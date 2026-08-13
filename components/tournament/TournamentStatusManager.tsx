// components/tournament/TournamentStatusManager.tsx
"use client"
import { useState } from "react"
import { CheckCircle, XCircle, Clock, Play, Trophy, AlertTriangle, ChevronDown } from "lucide-react"

interface Props {
  tournamentId: string
  currentStatus: string
  onStatusChange?: (newStatus: string) => void
}

const STATUSES = [
  { value: "draft", label: "Draft", color: "#9ca3af", icon: Clock, description: "Not yet public" },
  { value: "registration", label: "Registration Open", color: "#60a5fa", icon: CheckCircle, description: "Teams can register" },
  { value: "live", label: "Live", color: "#4ade80", icon: Play, description: "Tournament in progress" },
  { value: "completed", label: "Completed", color: "#D4AF37", icon: Trophy, description: "Tournament finished" },
  { value: "cancelled", label: "Cancelled", color: "#f87171", icon: XCircle, description: "Tournament cancelled" },
]

export default function TournamentStatusManager({ tournamentId, currentStatus, onStatusChange }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const current = STATUSES.find(s => s.value === currentStatus?.toLowerCase()) || STATUSES[0]
  const CurrentIcon = current.icon

  const changeStatus = async (newStatus: string) => {
    if (newStatus === currentStatus) { setOpen(false); return }

    setSaving(true)
    setError("")

    try {
      // Try PATCH first
      let res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      // Fallback to PUT
      if (res.status === 405) {
        res = await fetch(`/api/tournaments/${tournamentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to update status")
        return
      }

      setOpen(false)
      if (onStatusChange) onStatusChange(newStatus)
      // Reload to reflect changes
      window.location.reload()
    } catch (err: any) {
      setError(err?.message || "Network error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(!open)} disabled={saving}
        style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: `${current.color}22`,
          border: `1px solid ${current.color}55`,
          borderRadius: "0.625rem",
          padding: "0.5rem 0.875rem",
          color: current.color,
          cursor: saving ? "wait" : "pointer",
          fontWeight: 600,
          fontSize: "0.8125rem",
          opacity: saving ? 0.6 : 1,
        }}>
        <CurrentIcon style={{ width: "0.875rem", height: "0.875rem" }} />
        {current.label}
        <ChevronDown style={{ width: "0.875rem", height: "0.875rem" }} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{
            position: "absolute",
            top: "calc(100% + 0.375rem)",
            right: 0,
            background: "#1a1a24",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.75rem",
            padding: "0.375rem",
            minWidth: "280px",
            zIndex: 50,
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}>
            <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Change Status
            </div>
            {STATUSES.map(s => {
              const Icon = s.icon
              const isActive = s.value === currentStatus?.toLowerCase()
              return (
                <button key={s.value} onClick={() => changeStatus(s.value)} disabled={isActive}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "0.5rem",
                    width: "100%", padding: "0.5rem 0.75rem",
                    background: isActive ? `${s.color}15` : "transparent",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: isActive ? "default" : "pointer",
                    textAlign: "left",
                    marginBottom: "0.125rem",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent" }}
                >
                  <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: "0.75rem", height: "0.75rem", color: s.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: isActive ? s.color : "#e5e7eb" }}>
                      {s.label} {isActive && "✓"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.125rem" }}>{s.description}</div>
                  </div>
                </button>
              )
            })}
            {error && (
              <div style={{ padding: "0.5rem", marginTop: "0.25rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.375rem", fontSize: "0.7rem", color: "#f87171", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <AlertTriangle style={{ width: "0.75rem", height: "0.75rem" }} />
                {error}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}