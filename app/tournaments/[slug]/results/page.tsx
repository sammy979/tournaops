"use client";
import { useState, useEffect, use } from "react";
import { Trophy, Target, MapPin, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PublicResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/public/tournaments/${slug}`).then(r => r.json()).then(d => setData(d));
  }, [slug]);

  if (!data?.tournament) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <Link href={`/tournaments/${slug}`} style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.9rem" }}>← Back</Link>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginTop: "1rem" }}>Match Results</h1>
        <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
          {data.tournament.matches?.map((m:any) => (
            <div key={m.id} style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><h3 style={{ fontWeight: 800 }}>{m.name}</h3><span style={{ color: "#6b7280" }}>{m.map}</span></div>
                <div style={{ color: "#4ade80", fontWeight: 700 }}>COMPLETED</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}