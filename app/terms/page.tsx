import Link from "next/link";
import { Trophy, ArrowLeft, FileText, AlertTriangle, Zap, Crown, Shield, DollarSign, Copyright, Mail } from "lucide-react";

const SECTIONS = [
  {
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: "By accessing or using TournaOps, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.",
  },
  {
    icon: AlertTriangle,
    title: "2. Use of the Platform",
    content: "You agree not to:",
    list: [
      "Use the platform for any illegal purpose",
      "Attempt unauthorized access to any account or system",
      "Interfere with or disrupt platform operation",
      "Impersonate any person or organization",
      "Upload malicious code or content",
      "Scrape or automate access without permission",
    ],
  },
  {
    icon: Shield,
    title: "3. Account Responsibilities",
    content: "You are responsible for maintaining account security including your password. Notify us immediately of any unauthorized access. You are liable for all activity under your account.",
  },
  {
    icon: FileText,
    title: "4. Tournament Data",
    content: "You retain full ownership of your tournament data (teams, matches, results). You grant TournaOps a limited license to store, process, and display this data solely to provide the service.",
  },
  {
    icon: Crown,
    title: "5. Free and Pro Plans",
    content: "Key differences between plans:",
    list: [
      "Free: Up to 3 tournaments, 32 teams max, basic features",
      "Pro: Unlimited tournaments, 400 teams max, AI features",
      "Pro is billed monthly at $9.99/month",
      "Cancel anytime with no penalties",
      "7-day free trial included with Pro",
    ],
  },
  {
    icon: Copyright,
    title: "6. Intellectual Property",
    content: "The TournaOps platform, including source code, design, and branding, is owned by TournaOps and protected by intellectual property laws. You may not copy, modify, or redistribute without permission.",
  },
  {
    icon: AlertTriangle,
    title: "7. Disclaimers",
    content: "TournaOps is provided 'as-is' without warranties of any kind. We do not guarantee uninterrupted service availability. We are not responsible for tournament outcomes, disputes, or third-party actions.",
  },
  {
    icon: DollarSign,
    title: "8. Refunds",
    content: "Pro subscriptions are non-refundable after the 7-day trial period. You may cancel anytime and retain access until the end of your billing period.",
  },
  {
    icon: Mail,
    title: "9. Contact",
    content: "Questions about these terms? Contact us at legal@tournaops.com. We respond within 48 hours.",
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>

      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "1rem 1.5rem",
        background: "rgba(10,10,15,0.9)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{
              width: "2rem", height: "2rem",
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              borderRadius: "0.5rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Trophy style={{ width: "1rem", height: "1rem", color: "#000" }} />
            </div>
            <span style={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>TournaOps</span>
          </Link>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            color: "#9ca3af", fontSize: "0.8rem", fontWeight: 500,
            textDecoration: "none",
          }}>
            <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
            Home
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Hero */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(245,158,11,0.1)",
            color: "#f59e0b",
            padding: "0.375rem 0.875rem",
            borderRadius: "9999px",
            fontSize: "0.7rem", fontWeight: 700,
            border: "1px solid rgba(245,158,11,0.25)",
            marginBottom: "1rem",
          }}>
            <FileText style={{ width: "0.75rem", height: "0.75rem" }} />
            LEGAL AGREEMENT
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 800, color: "#fff",
            marginBottom: "0.5rem",
          }}>
            Terms of Service
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            Last updated: January 2025
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <section key={i} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{
                    width: "2rem", height: "2rem",
                    borderRadius: "0.5rem",
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
                  </div>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                    {section.title}
                  </h2>
                </div>
                <p style={{ color: "#9ca3af", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: section.list ? "0.875rem" : 0 }}>
                  {section.content}
                </p>
                {section.list && (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {section.list.map((item, j) => (
                      <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", fontSize: "0.85rem", color: "#d1d5db" }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0, fontWeight: 700 }}>→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer Links */}
        <div style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          fontSize: "0.85rem",
        }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
            Back to Home
          </Link>
          <Link href="/privacy" style={{ color: "#6b7280", textDecoration: "none" }}>Privacy</Link>
          <Link href="/contact" style={{ color: "#6b7280", textDecoration: "none" }}>Contact</Link>
        </div>
      </div>
    </div>
  );
}