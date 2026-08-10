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

const ACTIVITY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  TEAM_ADDED: { icon: UserPlus, color: "text-blue-500 bg-blue-50" },
  TEAM_IMPORTED: { icon: Upload, color: "text-indigo-500 bg-indigo-50" },
  RESULT_SUBMITTED: { icon: CheckCircle, color: "text-green-500 bg-green-50" },
  RESULT_VERIFIED: { icon: CheckCircle, color: "text-green-600 bg-green-50" },
  RESULT_EDITED: { icon: Edit, color: "text-orange-500 bg-orange-50" },
  STAGE_ADVANCED: { icon: ArrowUpCircle, color: "text-purple-500 bg-purple-50" },
  DISCORD_ANNOUNCEMENT_SENT: { icon: Megaphone, color: "text-yellow-500 bg-yellow-50" },
  DEFAULT: { icon: AlertTriangle, color: "text-gray-500 bg-gray-50" },
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function RecentActivity({ activities, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h3>
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h3>
      {!activities.length ? (
        <p className="text-sm text-gray-400 py-2">No recent activity</p>
      ) : (
        <div className="space-y-2">
          {activities.map((item) => {
            const config = ACTIVITY_CONFIG[item.type] || ACTIVITY_CONFIG.DEFAULT
            const Icon = config.icon
            return (
              <div key={item.id} className="flex items-start gap-2.5 py-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{item.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.actor && <span className="text-xs text-gray-400">{item.actor}</span>}
                    <span className="text-xs text-gray-400">{timeAgo(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
