// app/dashboard/notifications/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Clock } from "lucide-react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

const NOTIFICATION_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  RESULT_PENDING: { icon: Clock, color: "text-orange-500" },
  RESULT_REJECTED: { icon: XCircle, color: "text-red-500" },
  DISCORD_IMPORT_COMPLETED: { icon: CheckCircle, color: "text-green-500" },
  DISCORD_IMPORT_FAILED: { icon: AlertTriangle, color: "text-red-500" },
  MATCH_COMPLETED: { icon: CheckCircle, color: "text-green-500" },
  STAGE_READY: { icon: Bell, color: "text-blue-500" },
  TOURNAMENT_WARNING: { icon: AlertTriangle, color: "text-yellow-500" },
  CRITICAL_ISSUE: { icon: XCircle, color: "text-red-600" },
  NEW_REGISTRATION: { icon: Info, color: "text-blue-500" },
  DEFAULT: { icon: Bell, color: "text-gray-500" },
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    // Extend existing notification infrastructure
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" }).catch(() => {})
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" }).catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-orange-600 mt-0.5">{unreadCount} unread</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["all", "unread"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors capitalize ${filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                {f}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-purple-600 hover:text-purple-700 font-semibold">
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const config = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.DEFAULT
            const Icon = config.icon
            return (
              <div key={notif.id}
                onClick={() => { if (!notif.read) markRead(notif.id); if (notif.link) window.location.href = notif.link }}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  notif.read ? "bg-white border-gray-100 hover:border-gray-200" : "bg-blue-50 border-blue-200 hover:border-blue-300"
                }`}>
                <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${notif.read ? "text-gray-700" : "text-gray-900"}`}>{notif.title}</p>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
