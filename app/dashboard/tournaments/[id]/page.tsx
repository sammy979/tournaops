"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TournamentRootRedirect() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  useEffect(() => {
    if (id) router.replace(`/dashboard/tournaments/${id}/overview`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#080a0e] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Redirecting to overview…</p>
      </div>
    </div>
  );
}