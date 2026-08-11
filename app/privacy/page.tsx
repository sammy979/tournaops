import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy Policy — TournaOps" };

export default async function PrivacyPage() {
  const session = await getSession();
  return (
    <>
      <SiteHeader session={session} />
      <main style={{ minHeight: "80vh", background: "var(--black)" }}>
        <div className="container-ops" style={{ padding: "60px 24px", maxWidth: "720px" }}>
          <div className="section-label">Legal</div>
          <h1 className="text-display" style={{ marginBottom: "24px" }}>Privacy Policy</h1>
          <div style={{ color: "var(--white-70)", fontSize: "0.9rem", lineHeight: 1.8 }}>
            <p style={{ marginBottom: "16px" }}>
              TournaOps respects your privacy. This policy explains how we collect, use, and protect your data.
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
            }}>Data We Collect</h2>
            <p style={{ marginBottom: "16px" }}>
              Email, username, tournament data you create, and payment information for Pro subscriptions.
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
            }}>How We Use It</h2>
            <p style={{ marginBottom: "16px" }}>
              To provide tournament operations services, process payments, and improve the platform.
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
              Questions? Email <a href="mailto:support@tournaops.com" style={{ color: "var(--gold)" }}>support@tournaops.com</a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}