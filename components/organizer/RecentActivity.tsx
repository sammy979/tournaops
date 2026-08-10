// components/organizer/RecentActivity.tsx
"use client"
import { UserPlus, CheckCircle, Upload, ArrowUpCircle, Megaphone, Edit, AlertTriangle } from "lucide-react"

export interface ActivityItem {
  id: string
  type: string
  message: string
  timestamp: string
  actor?: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
  loading?: boolean
}

const CFG: Record<string, { icon: any; color: string }> = {
  TEAM_ADDED: { icon: UserPlus, color: "#60a5fa" },
  TEAM_IMPORTED: { icon: Upload, color: "#818cf8" },
  RESULT_SUBMITTED: { icon: CheckCircle, color: "#4ade80" },
  RESULT_VERIFIED: { icon: CheckCircle, color: "#4ade80" },
  RESULT_EDITED: { icon: Edit, color: "#fb923c" },
  STAGE_ADVANCED: { icon: ArrowUpCircle, color: "#a78bfa" },
  DISCORD_ANNOUNCEMENT_SENT: { icon: Megaphone, color: "#facc15" },
  DEFAULT: { icon: AlertTriangle, color: "#9ca3af" },
}

function timeAgo(t: string): string {
  const diff = Date.now() - new Date(t).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function RecentActivity({ activities, loading }: RecentActivityProps) {
  return (
    <div style={{ background: "rgba(30,30,40,0.6)", borderRadius: "0.875rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
        Recent Activity
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: "2rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.375rem" }} />)}
        </div>
      ) : activities.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>No recent activity</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {activities.map((item) => {
            const c = CFG[item.type] || CFG.DEFAULT
            const Icon = c.icon
            return (
              <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.375rem 0" }}>
                <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: `${c.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: "0.75rem", height: "0.75rem", color: c.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.8125rem", color: "#e5e7eb", margin: 0, lineHeight: 1.3 }}>{item.message}</p>
                  <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: 0 }}>{timeAgo(item.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}