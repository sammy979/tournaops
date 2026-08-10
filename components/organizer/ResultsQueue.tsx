// components/organizer/ResultsQueue.tsx
"use client"
import { useRouter } from "next/navigation"
import { Clock, MessageSquare, Image, FileText } from "lucide-react"

export interface PendingResult {
  id: string
  matchNumber: number
  source: "MANUAL" | "DISCORD" | "SCREENSHOT" | "CSV" | "API"
  status: "PENDING" | "UNDER_REVIEW"
  submittedAt: string
  submittedBy?: string
}

interface ResultsQueueProps {
  tournamentId: string
  results: PendingResult[]
  loading?: boolean
}

const SOURCE_ICONS = {
  DISCORD: MessageSquare,
  SCREENSHOT: Image,
  CSV: FileText,
  MANUAL: FileText,
  API: FileText,
}

const SOURCE_COLORS = {
  DISCORD: "text-indigo-600 bg-indigo-50",
  SCREENSHOT: "text-blue-600 bg-blue-50",
  CSV: "text-gray-600 bg-gray-50",
  MANUAL: "text-gray-600 bg-gray-50",
  API: "text-green-600 bg-green-50",
}

export default function ResultsQueue({ tournamentId, results, loading }: ResultsQueueProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Results Needing Verification</h3>
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
      </div>
    )
  }

  if (!results.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Results Needing Verification</h3>
        <div className="flex items-center gap-2 text-green-600 py-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">All results verified</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-orange-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider">
          Results Needing Verification ({results.length})
        </h3>
        <button onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/match-results`)}
          className="text-xs text-purple-600 hover:text-purple-700 font-semibold">View All</button>
      </div>

      <div className="space-y-2">
        {results.slice(0, 5).map((result) => {
          const Icon = SOURCE_ICONS[result.source] || FileText
          const colorClass = SOURCE_COLORS[result.source] || "text-gray-600 bg-gray-50"

          return (
            <div key={result.id} className="flex items-center gap-3 p-2.5 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-900">Match #{result.matchNumber}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${colorClass}`}>
                    <Icon className="w-3 h-3" />{result.source}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(result.submittedAt).toLocaleTimeString()}</span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/match-results?review=${result.id}`)}
                className="bg-white border border-orange-300 hover:bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                Review
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
