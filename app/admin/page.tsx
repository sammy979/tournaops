"use client";
import { useState, useEffect } from "react";
import { Shield, Users, Trophy, AlertCircle } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => setStats(d));
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Shield color="#f59e0b"/> System Admin
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginTop: "2rem" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Users color="#60a5fa" style={{ marginBottom: "0.5rem" }}/>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{stats?.totalUsers || 0}</div>
          <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>TOTAL USERS</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Trophy color="#f59e0b" style={{ marginBottom: "0.5rem" }}/>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{stats?.totalTournaments || 0}</div>
          <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>TOTAL TOURNAMENTS</div>
        </div>
      </div>
    </div>
  );
}