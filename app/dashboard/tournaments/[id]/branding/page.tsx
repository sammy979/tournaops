"use client";

import { useParams, useRouter } from "next/navigation";
import DashboardShell from "@/components/ui/DashboardShell";
import { ChevronRight, Palette } from "lucide-react";

export default function TournamentBrandingPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#080a0e] text-white">
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)} className="hover:text-slate-300 transition-colors">Champions Circuit S4</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">Branding</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Branding</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <Palette className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">Branding settings coming soon</p>
          <p className="text-slate-600 text-sm mt-1">Customize logos, colors, and tournament assets</p>
        </div>
      </div>
    </DashboardShell>
  );
}