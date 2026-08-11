"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft, CheckCircle2, Clock, Users, Trophy } from "lucide-react";

const MOCK_QUALIFIERS = [
  { id:"q1", name:"NA Qualifier #1", date:"Jun 1-7",   teams:32, advancing:4, status:"completed", winner:"Team Alpha"  },
  { id:"q2", name:"NA Qualifier #2", date:"Jun 8-14",  teams:32, advancing:4, status:"completed", winner:"Team Nexus"  },
  { id:"q3", name:"EU Qualifier #1", date:"Jun 15-21", teams:24, advancing:4, status:"completed", winner:"Team Storm"  },
  { id:"q4", name:"Open Qualifier",  date:"Jun 22-28", teams:64, advancing:4, status:"completed", winner:"Team Void"   },
];

export default function QualifiersPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={()=>router.push("/")} className="text-white font-black text-lg">Tourna<span className="text-violet-400">Ops</span></button>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <button onClick={()=>router.push(`/tournaments/${slug}`)} className="hover:text-white/70 transition-colors">Champions Circuit S4</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">Qualifiers</span>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={()=>router.push(`/tournaments/${slug}`)} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tournament
        </button>
        <h1 className="text-3xl font-black text-white mb-1">Qualifier Events</h1>
        <p className="text-white/40 mb-8">Regional qualifiers feeding into the main event</p>
        <div className="space-y-4">
          {MOCK_QUALIFIERS.map(q=>(
            <div key={q.id} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-white font-bold">{q.name}</h2>
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-medium">Completed</span>
                  </div>
                  <div className="flex gap-4 text-sm text-white/40">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{q.date}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/>{q.teams} teams</span>
                    <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5"/>{q.advancing} advancing</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white/40 text-xs mb-1">Winner</p>
                  <p className="text-amber-400 font-bold text-sm">{q.winner}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="border-t border-white/[0.06] py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-white font-black">Tourna<span className="text-violet-400">Ops</span></span>
          <p className="text-white/20 text-sm">Â© 2025 TournaOps</p>
        </div>
      </footer>
    </div>
  );
}