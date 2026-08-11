import Link from "next/link";

interface PaymentSettings {
  esewaEnabled?: boolean;
  esewaQrUrl?: string | null;
  esewaAccountName?: string | null;
  esewaAccountId?: string | null;
  khaltiEnabled?: boolean;
  khaltiQrUrl?: string | null;
  khaltiAccountName?: string | null;
  khaltiAccountId?: string | null;
  bankEnabled?: boolean;
  bankQrUrl?: string | null;
  bankName?: string | null;
  bankAccountHolder?: string | null;
  bankAccountNumber?: string | null;
  bankBranch?: string | null;
}

interface Props {
  settings: PaymentSettings | null;
  variant?: "landing" | "dashboard";
}

export default function NepalPaymentSection({ settings, variant = "landing" }: Props) {
  const methods = [];
  if (settings?.esewaEnabled)  methods.push({
    key: "esewa", name: "eSewa", brand: "#60BB46",
    qrUrl: settings.esewaQrUrl, accountName: settings.esewaAccountName, accountId: settings.esewaAccountId,
  });
  if (settings?.khaltiEnabled) methods.push({
    key: "khalti", name: "Khalti", brand: "#5C2D91",
    qrUrl: settings.khaltiQrUrl, accountName: settings.khaltiAccountName, accountId: settings.khaltiAccountId,
  });
  if (settings?.bankEnabled)   methods.push({
    key: "bank", name: settings.bankName ?? "Bank Transfer", brand: "#c9a84c",
    qrUrl: settings.bankQrUrl, accountName: settings.bankAccountHolder, accountId: settings.bankAccountNumber,
    branch: settings.bankBranch,
  });

  if (methods.length === 0) return null;

  return (
    <section style={{
      padding: variant === "landing" ? "80px 0" : "48px 0",
      background: "var(--black)",
      borderTop: "1px solid var(--border)",
      borderBottom: variant === "landing" ? "1px solid var(--border)" : "none",
    }}>
      <div className="container-ops">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.14em",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}>Nepal Payment Methods</div>
          <h2 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: variant === "landing" ? "2.5rem" : "1.8rem",
            color: "var(--white)",
            textTransform: "uppercase",
            lineHeight: 1,
            marginBottom: "8px",
          }}>Pay Locally.<br />Get Pro Instantly.</h2>
          <p style={{ color: "var(--white-70)", fontSize: "0.95rem", maxWidth: "520px", margin: "0 auto" }}>
            Scan a QR code with your preferred Nepali payment app. Fast, secure, and no international fees.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${methods.length}, minmax(0, 1fr))`,
          gap: "16px",
          maxWidth: methods.length === 1 ? "380px" : methods.length === 2 ? "760px" : "1140px",
          margin: "0 auto",
        }}>
          {methods.map(m => (
            <div key={m.key} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderTop: `3px solid ${m.brand}`,
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "1.3rem",
                color: m.brand,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}>{m.name}</div>

              {m.qrUrl ? (
                <div style={{
                  background: "var(--white)",
                  padding: "12px",
                  display: "inline-block",
                  marginBottom: "16px",
                }}>
                  <img src={m.qrUrl} alt={`${m.name} QR`}
                    style={{ display: "block", width: "160px", height: "160px", objectFit: "contain" }} />
                </div>
              ) : (
                <div style={{
                  width: "184px", height: "184px",
                  margin: "0 auto 16px",
                  background: "var(--charcoal)",
                  border: "1px dashed var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--white-40)", fontSize: "0.8rem",
                }}>QR Not Set</div>
              )}

              {m.accountName && (
                <div style={{ color: "var(--white)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "4px" }}>
                  {m.accountName}
                </div>
              )}
              {m.accountId && (
                <div style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: "var(--gold)",
                  fontSize: "0.85rem",
                  marginBottom: "4px",
                }}>{m.accountId}</div>
              )}
              {(m as any).branch && (
                <div style={{ color: "var(--white-40)", fontSize: "0.75rem" }}>{(m as any).branch}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link href={variant === "landing" ? "/register" : "/dashboard/upgrade"} style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "var(--gold)",
            color: "var(--black)",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 800,
            fontSize: "0.9rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}>
            {variant === "landing" ? "Get Started — Rs 299/mo" : "Upgrade to Pro"}
          </Link>
        </div>
      </div>
    </section>
  );
}