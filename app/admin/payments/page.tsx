import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import AdminPaymentsClient from "./AdminPaymentsClient";

export const dynamic = "force-dynamic";

async function getPayments() {
  try {
    return await prisma.payment.findMany({
      orderBy: { submittedAt: "desc" },
      take: 200,
      include: {
        user:     { select: { id: true, username: true, email: true } },
        reviewer: { select: { username: true, email: true } },
      },
    });
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [approved, pending, rejected] = await Promise.all([
      prisma.payment.aggregate({ where: { status: "APPROVED" }, _sum: { amount: true }, _count: true }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "REJECTED" } }),
    ]);
    return {
      totalRevenue:   approved._sum.amount ?? 0,
      approvedCount:  approved._count,
      pendingCount:   pending,
      rejectedCount:  rejected,
    };
  } catch {
    return { totalRevenue: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 };
  }
}

export default async function AdminPaymentsPage() {
  const [payments, stats] = await Promise.all([getPayments(), getStats()]);

  const serialised = payments.map((p: any) => ({
    id:                   p.id,
    userId:               p.userId,
    userName:             p.user?.username ?? p.user?.email ?? "Unknown",
    userEmail:            p.user?.email ?? "",
    amount:               p.amount,
    currency:             p.currency,
    method:               p.method,
    transactionReference: p.transactionReference,
    proofUrl:             p.proofUrl,
    note:                 p.note,
    status:               p.status,
    submittedAt:          p.submittedAt?.toISOString?.() ?? "",
    reviewedAt:           p.reviewedAt?.toISOString?.() ?? null,
    reviewerName:         p.reviewer?.username ?? p.reviewer?.email ?? null,
    rejectionReason:      p.rejectionReason,
    adminNote:            p.adminNote,
  }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", color: "var(--white)" }}>
      {/* Header */}
      <header style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Image src="/logo.png" alt="TournaOps" width={28} height={28} />
            <div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.14em", color: "var(--red)", textTransform: "uppercase" }}>Super Admin</div>
              <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: "1.5rem", textTransform: "uppercase", lineHeight: 1 }}>Payments</h1>
            </div>
          </div>
          <nav style={{ display: "flex", gap: "6px" }}>
            {[
              { href: "/admin",                    label: "Overview" },
              { href: "/admin/users",              label: "Users" },
              { href: "/admin/payments",           label: "Payments", active: true },
              { href: "/admin/system-health",      label: "Health" },
              { href: "/admin/settings/payments",  label: "Settings" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: "8px 14px",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color:      l.active ? "var(--gold)" : "var(--white-70)",
                background: l.active ? "var(--gold-dim)" : "transparent",
                textDecoration: "none",
              }}>{l.label}</Link>
            ))}
            <Link href="/dashboard" style={{
              padding: "8px 14px",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--white-40)",
              textDecoration: "none",
              marginLeft: "8px",
            }}>← Exit</Link>
          </nav>
        </div>
      </header>

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Page title */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}>Transaction History</div>
          <h2 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "1.6rem",
            textTransform: "uppercase",
            lineHeight: 1,
          }}>Payment Review Queue</h2>
          <p style={{ color: "var(--white-40)", fontSize: "0.9rem", marginTop: "6px" }}>
            All payments submitted by organizers. Approve to activate Pro instantly.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}>
          {[
            { label: "Total Revenue",   value: `Rs ${stats.totalRevenue.toLocaleString()}`, accent: "var(--green)" },
            { label: "Approved",        value: stats.approvedCount,                          accent: "var(--white)" },
            { label: "Pending Review",  value: stats.pendingCount,                           accent: "var(--amber)" },
            { label: "Rejected",        value: stats.rejectedCount,                          accent: "var(--red)"   },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderTop: `3px solid ${s.accent}`,
              padding: "20px",
            }}>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                color: "var(--white-40)",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}>{s.label}</div>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "1.8rem",
                color: s.accent,
                lineHeight: 1,
              }}>{s.value}</div>
            </div>
          ))}
        </div>

        <AdminPaymentsClient initialPayments={serialised} />
      </main>
    </div>
  );
}