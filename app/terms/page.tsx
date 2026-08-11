import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Terms of Service — TournaOps" };

export default async function TermsPage() {
  const session = await getSession();
  return (
    <>
      <SiteHeader session={session} />
      <main style={{ minHeight: "80vh", background: "var(--black)" }}>
        <div className="container-ops" style={{ padding: "60px 24px", maxWidth: "720px" }}>
          <div className="section-label">Legal</div>
          <h1 className="text-display" style={{ marginBottom: "24px" }}>Terms of Service</h1>
          <div style={{ color: "var(--white-70)", fontSize: "0.9rem", lineHeight: 1.8 }}>
            <p style={{ marginBottom: "16px" }}>
              By using TournaOps, you agree to these terms.
            </p>
            <h2 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--white)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginTop: "32px",
              marginBottom: "12px",
            }}>Use of Service</h2>
            <p style={{ marginBottom: "16px" }}>
              TournaOps provides tournament operations software for PUBG Mobile esports.
              You may not use the service for illegal or unauthorized purposes.
            </p>
            <h2 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--white)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginTop: "32px",
              marginBottom: "12px",
            }}>Payments</h2>
            <p style={{ marginBottom: "16px" }}>
              Pro subscriptions are billed monthly at Rs 299. Payments are manually reviewed and Pro is activated within 24 hours.
            </p>
            <h2 style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--white)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginTop: "32px",
              marginBottom: "12px",
            }}>Contact</h2>
            <p>
              <a href="mailto:support@tournaops.com" style={{ color: "var(--gold)" }}>support@tournaops.com</a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}