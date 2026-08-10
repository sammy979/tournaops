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
    { label: "Add Team", icon: UserPlus, color: "bg-blue-600 hover:bg-blue-700", onClick: onAddTeam || (() => router.push(`/dashboard/tournaments/${tournamentId}/teams`)) },
    { label: "Import Teams", icon: Upload, color: "bg-indigo-600 hover:bg-indigo-700", onClick: onImportTeams || (() => router.push(`/dashboard/tournaments/${tournamentId}/bulk-import`)) },
    { label: "Enter Result", icon: ClipboardList, color: "bg-green-600 hover:bg-green-700", onClick: onEnterResult || (() => router.push(`/dashboard/tournaments/${tournamentId}/match-results`)) },
    { label: "Standings", icon: BarChart2, color: "bg-orange-600 hover:bg-orange-700", onClick: () => router.push(`/dashboard/tournaments/${tournamentId}/standings`) },
    { label: "Advance Stage", icon: ArrowUpCircle, color: "bg-purple-600 hover:bg-purple-700", onClick: () => router.push(`/dashboard/tournaments/${tournamentId}/stages`) },
    { label: "Discord", icon: MessageSquare, color: "bg-[#5865F2] hover:bg-[#4752c4]", onClick: () => router.push("/dashboard/discord") },
    { label: "Broadcast", icon: Radio, color: "bg-red-600 hover:bg-red-700", onClick: () => router.push("/dashboard/broadcast") },
    { label: "Announce", icon: Megaphone, color: "bg-yellow-600 hover:bg-yellow-700", onClick: onAnnounce },
    { label: "Export", icon: FileText, color: "bg-gray-600 hover:bg-gray-700", onClick: () => router.push(`/dashboard/tournaments/${tournamentId}/export`) },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-9 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button key={action.label} onClick={action.onClick}
              className={`${action.color} text-white rounded-lg p-2.5 flex flex-col items-center gap-1 transition-colors text-center min-w-0`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium leading-tight">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
