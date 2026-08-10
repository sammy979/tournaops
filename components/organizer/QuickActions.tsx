// components/organizer/QuickActions.tsx
"use client"
import { useRouter } from "next/navigation"
import { UserPlus, Upload, ClipboardList, BarChart2, ArrowUpCircle, MessageSquare, Radio, Megaphone, FileText } from "lucide-react"

interface QuickActionsProps {
  tournamentId: string
  onAddTeam?: () => void
  onImportTeams?: () => void
  onEnterResult?: () => void
  onAnnounce?: () => void
}

export default function QuickActions({ tournamentId, onAddTeam, onImportTeams, onEnterResult, onAnnounce }: QuickActionsProps) {
  const router = useRouter()

  const actions = [
    { label: "Add Team", icon: UserPlus, color: "#3b82f6", onClick: onAddTeam || (() => router.push(`/dashboard/tournaments/${tournamentId}/teams`)) },
    { label: "Import Teams", icon: Upload, color: "#6366f1", onClick: onImportTeams || (() => router.push(`/dashboard/tournaments/${tournamentId}/bulk-import`)) },
    { label: "Enter Result", icon: ClipboardList, color: "#10b981", onClick: onEnterResult || (() => router.push(`/dashboard/tournaments/${tournamentId}/match-results`)) },
    { label: "Standings", icon: BarChart2, color: "#f59e0b", onClick: () => router.push(`/dashboard/tournaments/${tournamentId}/standings`) },
    { label: "Advance Stage", icon: ArrowUpCircle, color: "#a855f7", onClick: () => router.push(`/dashboard/tournaments/${tournamentId}/stages`) },
    { label: "Discord", icon: MessageSquare, color: "#5865F2", onClick: () => router.push(`/dashboard/tournaments/${tournamentId}/discord`) },
    { label: "Broadcast", icon: Radio, color: "#ef4444", onClick: () => router.push(`/dashboard/tournaments/${tournamentId}/broadcast`) },
    { label: "Export", icon: FileText, color: "#6b7280", onClick: () => router.push(`/dashboard/tournaments/${tournamentId}/export`) },
  ]

  return (
    <div style={{ background: "rgba(30,30,40,0.6)", borderRadius: "0.875rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
        Quick Actions
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "0.5rem" }}>
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button key={action.label} onClick={action.onClick}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem",
                background: `${action.color}22`, border: `1px solid ${action.color}44`, borderRadius: "0.625rem",
                padding: "0.625rem 0.5rem", cursor: "pointer", color: "#fff", transition: "all 0.15s" }}>
              <Icon style={{ width: "1rem", height: "1rem", color: action.color }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#e5e7eb" }}>{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}