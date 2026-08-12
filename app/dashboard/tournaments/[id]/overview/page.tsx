"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface OverviewData {
  tournament: any;
  stats: {
    totalTeams: number;
    maxTeams: number;
    totalMatches: number;
    completedMatches: number;
    pendingMatches: number;
    registrationPercent: number;
  };
  activeStage: any;
  recentActivity: any[];
}

export default function TournamentOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/tournaments/${id}/overview`);
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Failed to load tournament");
        }
        const d = await res.json();
        setData(d);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
        <div style={{ color: "var(--white-40)", fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.1rem" }}>
          Loading tournament...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "2rem", background: "rgba(230,57,70,0.1)", border: "1px solid var(--red)", borderRadius: "8px", color: "var(--red)" }}>
        {error || "Tournament not found"}
      </div>
    );
  }

  const { tournament, stats, activeStage, recentActivity } = data;

  const statusColor = (status: string) => {
    switch (status) {
      case "live": return "var(--green)";
      case "completed": return "var(--white-40)";
      case "cancelled": return "var(--red)";
      default: return "var(--amber)";
    }
  };

  return (
    <div style={{ fontFamily: "Barlow, sans-serif", maxWidth: "1000px" }}>
      {/* Tournament header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <h1 style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--white)",
                letterSpacing: "0.02em",
                margin: 0,
              }}>
                {tournament.name}
              </h1>
              <span style={{
                padding: "0.2rem 0.625rem",
                background: `${statusColor(tournament.status)}22`,
                border: `1px solid ${statusColor(tournament.status)}`,
                borderRadius: "6px",
                color: statusColor(tournament.status),
                fontSize: "0.75rem",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
              }}>
                {tournament.status}
              </span>
            </div>
            <div style={{ color: "var(--white-40)", fontSize: "0.8rem" }}>
              {tournament.game} · {tournament.teamSize}v{tournament.teamSize} · tournaops.com/tournaments/{tournament.slug}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              href={`/tournaments/${tournament.slug}`}
              target="_blank"
              style={{
                padding: "0.5rem 1rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--white-70)",
                textDecoration: "none",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              Public Page ↗
            </Link>
            <Link
              href={`/dashboard/tournaments/${id}/settings`}
              style={{
                padding: "0.5rem 1rem",
                background: "var(--gold)",
                border: "none",
                borderRadius: "8px",
                color: "var(--black)",
                textDecoration: "none",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        {[
          {
            label: "Teams Registered",
            value: `${stats.totalTeams} / ${stats.maxTeams}`,
            sub: `${stats.registrationPercent}% full`,
            color: stats.registrationPercent >= 100 ? "var(--green)" : "var(--gold)",
          },
          {
            label: "Matches Total",
            value: stats.totalMatches,
            sub: `${stats.completedMatches} completed`,
            color: "var(--white)",
          },
          {
            label: "Pending Results",
            value: stats.pendingMatches,
            sub: "awaiting entry",
            color: stats.pendingMatches > 0 ? "var(--amber)" : "var(--green)",
          },
          {
            label: "Stages",
            value: tournament.stages?.length || 0,
            sub: activeStage ? `Active: ${activeStage.name}` : "None active",
            color: "var(--white)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "1.25rem",
              background: "var(--charcoal)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
            }}
          >
            <div style={{ color: "var(--white-40)", fontSize: "0.75rem", fontFamily: "Barlow Condensed, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              {stat.label}
            </div>
            <div style={{ color: stat.color, fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ color: "var(--white-40)", fontSize: "0.75rem", marginTop: "0.35rem" }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Stages */}
        <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", color: "var(--white)", fontSize: "1rem", margin: 0 }}>
              Tournament Stages
            </h3>
            <Link
              href={`/dashboard/tournaments/${id}/stages`}
              style={{ color: "var(--gold)", fontSize: "0.8rem", textDecoration: "none" }}
            >
              Manage →
            </Link>
          </div>

          {tournament.stages?.length === 0 ? (
            <div style={{ color: "var(--white-40)", fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
              No stages configured yet.
              <Link href={`/dashboard/tournaments/${id}/stages`} style={{ color: "var(--gold)", display: "block", marginTop: "0.5rem" }}>
                Add Stages
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {tournament.stages?.map((stage: any) => (
                <div
                  key={stage.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.625rem 0.75rem",
                    background: "var(--surface)",
                    borderRadius: "6px",
                    border: stage.status === "active" ? "1px solid var(--gold)" : "1px solid transparent",
                  }}
                >
                  <div>
                    <div style={{ color: "var(--white)", fontSize: "0.875rem", fontWeight: 600 }}>{stage.name}</div>
                    <div style={{ color: "var(--white-40)", fontSize: "0.75rem" }}>{stage.type} · {stage._count?.matches || 0} matches</div>
                  </div>
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    background: stage.status === "active" ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.05)",
                    color: stage.status === "active" ? "var(--gold)" : "var(--white-40)",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}>
                    {stage.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", color: "var(--white)", fontSize: "1rem", margin: 0 }}>
              Recent Matches
            </h3>
            <Link
              href={`/dashboard/tournaments/${id}/matches`}
              style={{ color: "var(--gold)", fontSize: "0.8rem", textDecoration: "none" }}
            >
              All Matches →
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ color: "var(--white-40)", fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
              No completed matches yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {recentActivity.map((match: any) => (
                <div
                  key={match.id}
                  style={{
                    padding: "0.625rem 0.75rem",
                    background: "var(--surface)",
                    borderRadius: "6px",
                  }}
                >
                  <div style={{ color: "var(--white)", fontSize: "0.8rem", fontWeight: 600 }}>
                    Match {match.matchNumber || match.id.slice(0, 6)} — {match.stage?.name}
                  </div>
                  <div style={{ color: "var(--white-40)", fontSize: "0.7rem", marginTop: "0.2rem" }}>
                    {match.result?.winner ? `Winner: ${match.result.winner}` : "Result recorded"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
        {[
          { label: "Teams", href: `/dashboard/tournaments/${id}/teams` },
          { label: "Matches", href: `/dashboard/tournaments/${id}/matches` },
          { label: "Results", href: `/dashboard/tournaments/${id}/results` },
          { label: "Standings", href: `/dashboard/tournaments/${id}/standings` },
          { label: "Stages", href: `/dashboard/tournaments/${id}/stages` },
          { label: "Scoring", href: `/dashboard/tournaments/${id}/scoring` },
          { label: "Registrations", href: `/dashboard/tournaments/${id}/registrations` },
          { label: "Broadcast", href: `/dashboard/tournaments/${id}/broadcast` },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: "0.75rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--white-70)",
              textDecoration: "none",
              textAlign: "center",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "border-color 0.2s",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}