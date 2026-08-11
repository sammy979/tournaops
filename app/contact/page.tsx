import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = { title: "Contact — TournaOps" };

export default async function ContactPage() {
  const session = await getSession();
  return (
    <>
      <SiteHeader session={session} />
      <main style={{ minHeight: "80vh", background: "var(--black)" }}>
        <div className="container-ops" style={{ padding: "60px 24px", maxWidth: "720px" }}>
          <div className="section-label">Get In Touch</div>
          <h1 className="text-display" style={{ marginBottom: "16px" }}>Contact TournaOps</h1>
          <p style={{ color: "var(--white-70)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "32px" }}>
            Have a question about running tournaments? Need help with your organizer account? We&apos;re here.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "24px",
            }}>
              <div className="section-label" style={{ marginBottom: "8px" }}>Email</div>
              <a href="mailto:support@tournaops.com" style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "1rem",
                color: "var(--gold)",
                textDecoration: "none",
              }}>support@tournaops.com</a>
            </div>

            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "24px",
            }}>
              <div className="section-label" style={{ marginBottom: "8px" }}>Discord</div>
              <a href="#" style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "1rem",
                color: "var(--gold)",
                textDecoration: "none",
              }}>Join Discord</a>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}