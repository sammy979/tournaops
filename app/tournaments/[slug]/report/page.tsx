"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, AlertTriangle, ArrowLeft, Send, CheckCircle2, Loader2 } from "lucide-react";

const REPORT_TYPES = ["Match Dispute","Cheating / Hacking","Unsportsmanlike Conduct","Rule Violation","Technical Issue","Other"];

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [type,    setType]    = useState(REPORT_TYPES[0]);
  const [match,   setMatch]   = useState("");
  const [desc,    setDesc]    = useState("");
  const [evidence,setEvidence]= useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const submit = (e:React.FormEvent)=>{ e.preventDefault(); setLoading(true); setTimeout(()=>{setLoading(false);setSent(true);},1600); };

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={()=>router.push("/")} className="text-white font-black text-lg">Tourna<span className="text-violet-400">Ops</span></button>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <button onClick={()=>router.push(`/tournaments/${slug}`)} className="hover:text-white/70 transition-colors">Champions Circuit S4</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">Report</span>
          </div>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={()=>router.push(`/tournaments/${slug}`)} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {sent ? (
          <div className="bg-[#0f1117] border border-emerald-500/20 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4"/>
            <h2 className="text-white font-bold text-xl mb-2">Report Submitted</h2>
            <p className="text-white/40 mb-6">The tournament organizer will review your report within 24 hours.</p>
            <button onClick={()=>router.push(`/tournaments/${slug}`)} className="bg-yellow-500 hover:bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">Back to Tournament</button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 p-4 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
              <p className="text-amber-300/80 text-sm">Reports are reviewed by tournament organizers. False reports may result in penalties. Please provide accurate and complete information.</p>
            </div>
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
              <h1 className="text-white font-bold text-xl mb-5">Submit a Report</h1>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs font-medium block mb-1.5">Report Type</label>
                  <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-[#0f1117] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50">
                    {REPORT_TYPES.map(t=><option key={t} value={t} className="bg-[#0f1117]">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-medium block mb-1.5">Match Number (if applicable)</label>
                  <input value={match} onChange={e=>setMatch(e.target.value)} placeholder="e.g. Match #14 or leave blank"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-yellow-500/50"/>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-medium block mb-1.5">Description *</label>
                  <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={5} placeholder="Describe the issue in detail. Include timestamps, player names, and what happened."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-yellow-500/50 resize-none"/>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-medium block mb-1.5">Evidence Links (screenshots, videos)</label>
                  <input value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="https://imgur.com/... or https://streamable.com/..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-yellow-500/50"/>
                </div>
                <button type="submit" disabled={loading||!desc.trim()} className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors">
                  {loading?<><Loader2 className="w-4 h-4 animate-spin"/>Submittingâ€¦</>:<><Send className="w-4 h-4"/>Submit Report</>}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}