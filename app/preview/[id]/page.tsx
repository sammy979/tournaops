"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, Trophy, Users, Calendar, Globe, Lock,
  ArrowRight, Edit3, Share2, Copy, CheckCircle2,
  Zap, ChevronRight, ExternalLink,
} from "lucide-react";
import { useState } from "react";

export default function TournamentPreviewPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params?.id as string;
  const [copied, setCopied] = useState(false);

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/tournaments/champions-circuit-s4`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const MOCK = {
    name: "Champions Circuit Season 4", game: "Valorant", region: "NA",
    status: "live", format: "Double Elimination", maxTeams: 16,
    registeredTeams: 14, startDate: "Jul 1, 2025", endDate: "Jul 28, 2025",
    prizePool: "$10,000", description: "The premier seasonal championship for top-tier Valorant teams.",
    organizer: "TournaOps Official",
  };

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      {/* Preview bar */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-300 text-sm">
          <Eye className="w-4 h-4" />
          <span className="font-semibold">Preview Mode</span>
          <span className="text-amber-300/60">â€” This is how your tournament appears to the public</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyUrl}
            className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
            {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Public URL</>}
          </button>
          <button onClick={() => router.push(`/dashboard/tournaments/${id}/settings`)}
            className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Open Public Page
          </a>
        </div>
      </div>

      {/* Simulated public page */}
      <div className="relative bg-gradient-to-br from-violet-950/60 via-[#060810] to-indigo-950/40 border-b border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-14">
          <div className="flex items-center gap-2 text-white/40 text-sm mb-5">
            <span>Tournaments</span><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">{MOCK.name}</span>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Now
                </span>
                <span className="text-white/40 text-sm">{MOCK.game} Â· {MOCK.region}</span>
              </div>
              <h1 className="text-4xl font-black text-white mb-4">{MOCK.name}</h1>
              <p className="text-white/50 mb-6 max-w-lg">{MOCK.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-6">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-white/25" />{MOCK.startDate} â€” {MOCK.endDate}</span>
                <span className="flex items-center gap-1.5"><Globe    className="w-4 h-4 text-white/25" />{MOCK.region}</span>
                <span className="flex items-center gap-1.5"><Users    className="w-4 h-4 text-white/25" />{MOCK.registeredTeams}/{MOCK.maxTeams} Teams</span>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.10] text-white/50 px-5 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed">
                  <Lock className="w-4 h-4" /> Registration Closed
                </div>
                <button className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm">
                  View Bracket
                </button>
              </div>
            </div>
            <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl p-5 w-full lg:w-64 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-white font-bold">Prize Pool</span>
                <span className="ml-auto text-xl font-black text-amber-400">{MOCK.prizePool}</span>
              </div>
              {[["1st","$5,000"],["2nd","$2,500"],["3rd","$1,500"],["4th","$1,000"]].map(([p,a]) => (
                <div key={p} className="flex justify-between py-1.5 border-b border-white/[0.06] last:border-0 text-sm">
                  <span className="text-white/60">{p} Place</span>
                  <span className="text-white font-bold">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <p className="text-white/25 text-sm mb-4">Public URL for this tournament:</p>
        <div className="inline-flex items-center gap-3 bg-[#0f1117] border border-white/[0.08] rounded-xl px-4 py-2.5 mb-6">
          <code className="text-violet-400 text-sm font-mono">{publicUrl}</code>
          <button onClick={copyUrl} className="text-white/30 hover:text-white/60 transition-colors">
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)}
            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
            Back to Dashboard
          </button>
          <button onClick={() => router.push(`/dashboard/tournaments/${id}/settings`)}
            className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 px-6 py-2.5 rounded-xl transition-colors">
            Edit Settings
          </button>
        </div>
      </div>
    </div>
  );
}