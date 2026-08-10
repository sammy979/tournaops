// components/CommandPalette.tsx
"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search, UserPlus, Upload, ClipboardList, BarChart2,
  ArrowUpCircle, MessageSquare, Radio, Megaphone, Settings,
  Trophy, Calendar, X,
} from "lucide-react"

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  tournamentId?: string
}

export default function CommandPalette({ tournamentId }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const tid = tournamentId || ""

  const commands: Command[] = [
    { id: "add-team", label: "Add Team", description: "Add a new team to the tournament", icon: UserPlus, action: () => router.push(`/dashboard/tournaments/${tid}/teams`), keywords: ["add", "team", "register"] },
    { id: "import-teams", label: "Import Teams", description: "Bulk import teams", icon: Upload, action: () => router.push(`/dashboard/tournaments/${tid}/bulk-import`), keywords: ["import", "bulk", "teams"] },
    { id: "enter-result", label: "Enter Result", description: "Enter match result", icon: ClipboardList, action: () => router.push(`/dashboard/tournaments/${tid}/match-results`), keywords: ["result", "enter", "score"] },
    { id: "standings", label: "Standings", description: "View tournament standings", icon: BarChart2, action: () => router.push(`/dashboard/tournaments/${tid}/standings`), keywords: ["standings", "leaderboard", "points"] },
    { id: "advance-stage", label: "Advance Stage", description: "Advance to next stage", icon: ArrowUpCircle, action: () => router.push(`/dashboard/tournaments/${tid}/stages`), keywords: ["advance", "stage", "progress"] },
    { id: "discord", label: "Discord Operations", description: "Open Discord Operations Center", icon: MessageSquare, action: () => router.push("/dashboard/discord"), keywords: ["discord", "import", "announce"] },
    { id: "broadcast", label: "Broadcast Studio", description: "Open Broadcast Studio", icon: Radio, action: () => router.push("/dashboard/broadcast"), keywords: ["broadcast", "obs", "stream"] },
    { id: "announce", label: "Send Announcement", description: "Send tournament announcement", icon: Megaphone, action: () => router.push("/dashboard/discord#announcements"), keywords: ["announce", "message", "notify"] },
    { id: "schedule", label: "Schedule", description: "View match schedule", icon: Calendar, action: () => router.push(`/dashboard/tournaments/${tid}/stages`), keywords: ["schedule", "matches", "time"] },
    { id: "settings", label: "Tournament Settings", description: "Configure tournament settings", icon: Settings, action: () => router.push(`/dashboard/tournaments/${tid}/settings`), keywords: ["settings", "config", "configure"] },
    { id: "tournaments", label: "My Tournaments", description: "View all tournaments", icon: Trophy, action: () => router.push("/dashboard/tournaments"), keywords: ["tournaments", "all", "list"] },
  ]

  const filtered = query
    ? commands.filter((cmd) => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some((k) => k.includes(q))
        )
      })
    : commands

  useEffect(() => { setSelectedIndex(0) }, [query])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
        setQuery("")
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === "Enter" && filtered[selectedIndex]) {
      filtered[selectedIndex].action()
      setOpen(false)
      setQuery("")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 text-sm outline-none text-gray-900 placeholder-gray-400"
          />
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Commands */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">No commands found</div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon
              return (
                <button key={cmd.id} onClick={() => { cmd.action(); setOpen(false); setQuery("") }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selectedIndex ? "bg-purple-50" : "hover:bg-gray-50"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${i === selectedIndex ? "bg-purple-100" : "bg-gray-100"}`}>
                    <Icon className={`w-4 h-4 ${i === selectedIndex ? "text-purple-600" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${i === selectedIndex ? "text-purple-700" : "text-gray-800"}`}>{cmd.label}</div>
                    {cmd.description && <div className="text-xs text-gray-400 truncate">{cmd.description}</div>}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-3 text-xs text-gray-400">
          <span>?? navigate</span>
          <span>? select</span>
          <span>Esc close</span>
          <span className="ml-auto">Ctrl+K</span>
        </div>
      </div>
    </div>
  )
}
