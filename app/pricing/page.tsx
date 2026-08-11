import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing — TournaOps",
  description: "Simple pricing for professional tournament operations. Free forever plan available.",
};

export default async function PricingPage() {
  const session = await getSession();

  const plans = [
    {
      name: "Free",
      price: "Rs 0",
      period: "forever",
      desc: "Get started with tournament operations.",
      features: [
        "Up to 2 tournaments",
        "Up to 16 teams per tournament",
        "Basic bracket & standings",
        "Public tournament pages",
        "Community support",
      ],
      cta:      session ? "Current Plan" : "Get Started",
      ctaHref:  session ? "/dashboard"   : "/register",
      accent:   "var(--white)",
      featured: false,
    },
    {
      name: "Pro",
      price: "Rs 299",
      period: "per month",
      desc: "For serious tournament organizers.",
      features: [
        "Unlimited tournaments",
        "Unlimited teams",
        "AI screenshot import",
        "OBS broadcast overlays",
        "Discord bot integration",
        "Priority support",
        "Custom branding",
        "Advanced analytics",
      ],
      cta:      "Upgrade to Pro",
      ctaHref:  session ? "/dashboard/upgrade" : "/register",
      accent:   "var(--gold)",
      featured: true,
    },
  ];

  return (
    <>
      <SiteHeader session={session} />
      <main style={{ background: "var(--black)", minHeight: "80vh" }}>

        {/* Hero */}
        <section style={{ padding: "72px 24px 48px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
          <div className="container-ops">
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              color: "var(--gold)",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>Pricing</div>
            <h1 className="text-hero" style={{ marginBottom: "16px" }}>Simple.<br />Transparent.</h1>
            <p style={{ color: "var(--white-70)", fontSize: "1.1rem", maxWidth: "560px", margin: "0 auto" }}>
              No hidden fees. No credit card required to start. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section style={{ padding: "56px 24px" }}>
          <div className="container-ops" style={{ maxWidth: "980px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
              {plans.map(p => (
                <div key={p.name} style={{
                  background: p.featured ? "var(--surface)" : "var(--charcoal)",
                  border: p.featured ? "2px solid var(--gold)" : "1px solid var(--border)",
                  padding: "40px 32px",
                  position: "relative",
                }}>
                  {p.featured && (
                    <div style={{
                      position: "absolute",
                      top: "-11px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--gold)",
                      color: "var(--black)",
                      padding: "3px 14px",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 800,
                      fontSize: "0.7rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}>Most Popular</div>
                  )}

                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 800,
                    fontSize: "1rem",
                    letterSpacing: "0.14em",
                    color: p.accent,
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}>{p.name}</div>

                  <p style={{ color: "var(--white-40)", fontSize: "0.85rem", marginBottom: "24px" }}>{p.desc}</p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "32px" }}>
                    <span style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 900,
                      fontSize: "3rem",
                      color: "var(--white)",
                      lineHeight: 1,
                    }}>{p.price}</span>
                    <span style={{ color: "var(--white-40)", fontSize: "0.9rem" }}>/ {p.period}</span>
                  </div>

                  <Link href={p.ctaHref} style={{
                    display: "block",
                    padding: "13px",
                    textAlign: "center",
                    background: p.featured ? "var(--gold)" : "transparent",
                    color: p.featured ? "var(--black)" : "var(--white)",
                    border: p.featured ? "none" : "1px solid var(--border)",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    marginBottom: "28px",
                  }}>{p.cta}</Link>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--white-70)" }}>
                        <span style={{ color: p.accent, fontWeight: 800 }}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "40px", color: "var(--white-40)", fontSize: "0.85rem" }}>
              Payment methods: eSewa · Khalti · Bank Transfer
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}