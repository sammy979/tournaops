import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DiscordPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/dashboard/discord");

  const imports = await prisma.discordImport.findMany({
    where: { tournament: { userId: session.userId } },
    orderBy: { receivedAt: "desc" },
    take: 50,
    select: {
      id: true, discordUsername: true, discordGuildName: true,
      messageContent: true, status: true, receivedAt: true, importedAt: true,
      tournament: { select: { name: true } },
    },
  });

  const statusColor = (s: string) => {
    if (s === "imported") return "#22c55e";
    if (s === "failed") return "#ef4444";
    return "#D4AF37";
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 900, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>DISCORD IMPORTS</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Match results imported from Discord bot</p>
        </div>
      </div>

      <div style={{ background: "rgba(88,101,242,0.08)", border: "1px solid rgba(88,101,242,0.2)", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
          <strong style={{ color: "#fff" }}>Webhook URL:</strong>{" "}
          <code style={{ color: "#D4AF37", fontSize: "0.8rem", wordBreak: "break-all" }}>
            https://www.tournaops.com/api/discord/incoming
          </code>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", overflow: "hidden" }}>
        {imports.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🤖</div>
            <div style={{ color: "#6b7280" }}>No Discord imports yet</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["User", "Guild", "Tournament", "Status", "Received"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {imports.map((imp, i) => (
                  <tr key={imp.id} style={{ borderBottom: i < imports.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "0.875rem 1rem", color: "#fff", fontSize: "0.875rem" }}>{imp.discordUsername}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.8rem" }}>{imp.discordGuildName}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.8rem" }}>{imp.tournament?.name || "—"}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ background: `${statusColor(imp.status)}20`, color: statusColor(imp.status), border: `1px solid ${statusColor(imp.status)}40`, borderRadius: "0.25rem", padding: "0.2rem 0.5rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>
                        {imp.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280", fontSize: "0.75rem" }}>{new Date(imp.receivedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}