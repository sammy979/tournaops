import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AIImportClient from "@/components/organizer/AIImportClient";

export const dynamic = "force-dynamic";

async function getTournament(id: string, userId: string) {
  return await prisma.tournament.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      userId,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      matches: {
        orderBy: { matchNumber: "asc" },
        select: {
          id: true,
          name: true,
          matchNumber: true,
          map: true,
          status: true,
        },
      },
    },
  });
}

export default async function AIImportPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const tournament = await getTournament(params.id, session.userId);
  if (!tournament) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* HEADER */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container-ops" style={{ padding: "24px 24px 0" }}>
          {/* BREADCRUMB */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            <Link href="/dashboard" style={{ color: "var(--white-40)", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ color: "var(--white-20)" }}>→</span>
            <Link href={`/dashboard/tournaments/${tournament.id}`} style={{ color: "var(--white-40)", textDecoration: "none" }}>{tournament.name}</Link>
            <span style={{ color: "var(--white-20)" }}>→</span>
            <span style={{ color: "var(--gold)" }}>Ops AI</span>
          </div>

          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            paddingBottom: "20px",
            flexWrap: "wrap",
          }}>
            <div>
              <div className="section-label">Tournament Operations Assistant</div>
              <h1 style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "1.8rem",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "var(--white)",
                lineHeight: 1,
              }}>Ops AI — Screenshot Import</h1>
              <p style={{
                fontSize: "0.85rem",
                color: "var(--white-40)",
                marginTop: "8px",
                maxWidth: "560px",
                lineHeight: 1.6,
              }}>
                Upload a PUBG Mobile results screenshot. Ops AI extracts team kills, placements,
                and points automatically. Review and publish in seconds.
              </p>
            </div>
            <Link
              href={`/dashboard/tournaments/${tournament.id}`}
              className="btn-secondary"
              style={{ padding: "7px 14px" }}
            >
              ← Back to Command Center
            </Link>
          </div>
        </div>
      </div>

      {/* WORKFLOW STEPS */}
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container-ops" style={{ padding: "20px 24px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
          }}>
            {[
              { step: "01", label: "Upload Result", desc: "Match screenshot" },
              { step: "02", label: "AI Extraction", desc: "Vision analysis" },
              { step: "03", label: "Review", desc: "Verify data" },
              { step: "04", label: "Save", desc: "Confirm results" },
              { step: "05", label: "Standings", desc: "Auto-update" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "var(--surface)",
                padding: "14px 16px",
              }}>
                <div style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.7rem",
                  color: "var(--gold)",
                  marginBottom: "6px",
                }}>{item.step}</div>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  color: "var(--white)",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}>{item.label}</div>
                <div style={{
                  fontSize: "0.7rem",
                  color: "var(--white-40)",
                }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CLIENT COMPONENT — Upload + Review */}
      <div className="container-ops" style={{ padding: "32px 24px" }}>
        <AIImportClient tournamentId={tournament.id} matches={tournament.matches as any} />
      </div>
    </div>
  );
}