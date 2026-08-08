"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Layers } from "lucide-react";
import TournamentNav from "@/components/tournament/TournamentNav";
import dynamic from "next/dynamic";

const StageManager = dynamic(() => import("@/components/stages/StageManager"), { ssr: false });

export default function StagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments/" + id)
      .then(r => r.json())
      .then(d => setTournament(d.tournament))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
        Tournament not found
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <button
        onClick={() => router.push("/dashboard/tournaments/" + id)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.375rem",
          color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500,
          background: "transparent", border: "none", cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to {tournament.name}
      </button>

      <TournamentNav tournamentId={id} />

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{
          fontSize: "clamp(1.5rem, 4vw, 2rem)",
          fontWeight: 800, color: "#fff",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <div style={{
            width: "2.5rem", height: "2.5rem",
            borderRadius: "0.625rem",
            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Layers style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />
          </div>
          Stage Management
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.375rem" }}>
          Manage tournament stages, advance teams, and track progression
        </p>
      </div>

      <StageManager tournament={tournament} onStageChange={() => {
        fetch("/api/tournaments/" + id)
          .then(r => r.json())
          .then(d => setTournament(d.tournament));
      }} />
    </div>
  );
}