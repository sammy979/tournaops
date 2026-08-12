"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/ui/AdminShell";

interface PaymentSettings {
  esewaEnabled?:         boolean;
  esewaQrUrl?:           string;
  esewaAccountName?:     string;
  esewaAccountId?:       string;
  esewaInstructions?:    string;

  khaltiEnabled?:        boolean;
  khaltiQrUrl?:          string;
  khaltiAccountName?:    string;
  khaltiAccountId?:      string;
  khaltiInstructions?:   string;

  bankEnabled?:          boolean;
  bankName?:             string;
  bankQrUrl?:            string;
  bankAccountHolder?:    string;
  bankAccountNumber?:    string;
  bankBranch?:           string;
  bankInstructions?:     string;

  internationalEnabled?: boolean;
}

const EMPTY_SETTINGS: PaymentSettings = {
  esewaEnabled: false,       esewaQrUrl: "",       esewaAccountName: "",       esewaAccountId: "",     esewaInstructions: "",
  khaltiEnabled: false,      khaltiQrUrl: "",      khaltiAccountName: "",      khaltiAccountId: "",    khaltiInstructions: "",
  bankEnabled: false,        bankName: "",         bankQrUrl: "",              bankAccountHolder: "",  bankAccountNumber: "",  bankBranch: "",  bankInstructions: "",
  internationalEnabled: false,
};

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>(EMPTY_SETTINGS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [message, setMessage]   = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/payment-settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (mounted && data?.settings) {
            setSettings({ ...EMPTY_SETTINGS, ...data.settings });
          }
        }
      } catch {
        // ignore, keep defaults
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const update = <K extends keyof PaymentSettings>(key: K, val: PaymentSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Payment settings saved." });
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: err?.error || "Failed to save." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error while saving." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div style={{ padding: "48px", textAlign: "center", color: "var(--white-40)" }}>
          Loading payment settings...
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="section-label">Admin</div>
            <h1 className="text-display" style={{ marginBottom: "6px" }}>Payment Settings</h1>
            <p style={{ color: "var(--white-40)", fontSize: "0.85rem" }}>
              Manage manual payment methods (eSewa, Khalti, Bank Transfer). Pro plan is Rs 299/month.
            </p>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="btn-gold"
            style={{ opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {message && (
          <div style={{
            padding: "12px 16px",
            marginBottom: "16px",
            background: message.type === "success" ? "var(--green-dim)" : "var(--red-dim)",
            border: `1px solid ${message.type === "success" ? "var(--green)" : "var(--red)"}`,
            color: message.type === "success" ? "var(--green)" : "var(--red)",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.82rem",
            letterSpacing: "0.05em",
          }}>{message.text}</div>
        )}

        {/* PRICING NOTE */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: "3px solid var(--gold)",
          padding: "16px 20px",
          marginBottom: "24px",
        }}>
          <div className="section-label" style={{ marginBottom: "6px" }}>Pro Plan Pricing</div>
          <p style={{ color: "var(--white-70)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            Fixed at <strong style={{ color: "var(--gold)" }}>Rs 299 NPR / month</strong>.
            To change pricing, update the pricing constants in the codebase.
          </p>
        </div>

        {/* ESEWA */}
        <SettingsCard
          title="eSewa"
          enabled={!!settings.esewaEnabled}
          onToggle={() => update("esewaEnabled", !settings.esewaEnabled)}
        >
          <Field label="Account Name" value={settings.esewaAccountName || ""} onChange={(v) => update("esewaAccountName", v)} placeholder="e.g. Bhupen Pun" />
          <Field label="Account ID / Number" value={settings.esewaAccountId || ""} onChange={(v) => update("esewaAccountId", v)} placeholder="98XXXXXXXX" />
          <Field label="QR Code Image URL" value={settings.esewaQrUrl || ""} onChange={(v) => update("esewaQrUrl", v)} placeholder="https://.../qr.png" />
          <TextArea label="Instructions" value={settings.esewaInstructions || ""} onChange={(v) => update("esewaInstructions", v)} placeholder="Payment instructions for the user" />
        </SettingsCard>

        {/* KHALTI */}
        <SettingsCard
          title="Khalti"
          enabled={!!settings.khaltiEnabled}
          onToggle={() => update("khaltiEnabled", !settings.khaltiEnabled)}
        >
          <Field label="Account Name" value={settings.khaltiAccountName || ""} onChange={(v) => update("khaltiAccountName", v)} placeholder="e.g. Bhupen Pun" />
          <Field label="Account ID / Number" value={settings.khaltiAccountId || ""} onChange={(v) => update("khaltiAccountId", v)} placeholder="98XXXXXXXX" />
          <Field label="QR Code Image URL" value={settings.khaltiQrUrl || ""} onChange={(v) => update("khaltiQrUrl", v)} placeholder="https://.../qr.png" />
          <TextArea label="Instructions" value={settings.khaltiInstructions || ""} onChange={(v) => update("khaltiInstructions", v)} placeholder="Payment instructions for the user" />
        </SettingsCard>

        {/* BANK */}
        <SettingsCard
          title="Bank Transfer"
          enabled={!!settings.bankEnabled}
          onToggle={() => update("bankEnabled", !settings.bankEnabled)}
        >
          <Field label="Bank Name" value={settings.bankName || ""} onChange={(v) => update("bankName", v)} placeholder="e.g. Nabil Bank" />
          <Field label="Account Holder" value={settings.bankAccountHolder || ""} onChange={(v) => update("bankAccountHolder", v)} placeholder="Full name" />
          <Field label="Account Number" value={settings.bankAccountNumber || ""} onChange={(v) => update("bankAccountNumber", v)} placeholder="XXXXXXXXXX" />
          <Field label="Branch" value={settings.bankBranch || ""} onChange={(v) => update("bankBranch", v)} placeholder="Kathmandu" />
          <Field label="QR Code Image URL (optional)" value={settings.bankQrUrl || ""} onChange={(v) => update("bankQrUrl", v)} placeholder="https://.../qr.png" />
          <TextArea label="Instructions" value={settings.bankInstructions || ""} onChange={(v) => update("bankInstructions", v)} placeholder="Transfer instructions for the user" />
        </SettingsCard>

        {/* INTERNATIONAL */}
        <SettingsCard
          title="International Payments"
          enabled={!!settings.internationalEnabled}
          onToggle={() => update("internationalEnabled", !settings.internationalEnabled)}
          hideBody
        >
          <p style={{ color: "var(--white-40)", fontSize: "0.82rem", padding: "12px 0" }}>
            When enabled, non-Nepal users will see an option to contact support for international payment methods.
          </p>
        </SettingsCard>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={save}
            disabled={saving}
            className="btn-gold"
            style={{ opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

function SettingsCard({
  title,
  enabled,
  onToggle,
  hideBody,
  children,
}: {
  title:    string;
  enabled:  boolean;
  onToggle: () => void;
  hideBody?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      marginBottom: "16px",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: enabled && !hideBody ? "1px solid var(--border)" : "none",
        background: "var(--surface-2)",
      }}>
        <h2 style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "1rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--white)",
          margin: 0,
        }}>{title}</h2>

        <button
          onClick={onToggle}
          style={{
            padding: "5px 14px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            background: enabled ? "var(--gold)" : "transparent",
            color: enabled ? "var(--black)" : "var(--white-40)",
            border: `1px solid ${enabled ? "var(--gold)" : "var(--border-2)"}`,
            cursor: "pointer",
          }}
        >
          {enabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      {enabled && (
        <div style={{ padding: "16px 20px", display: "grid", gap: "12px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{
        display: "block",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 600,
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--white-40)",
        marginBottom: "6px",
      }}>{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "var(--black)",
          border: "1px solid var(--border)",
          color: "var(--white)",
          padding: "9px 12px",
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.85rem",
          outline: "none",
        }}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{
        display: "block",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 600,
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--white-40)",
        marginBottom: "6px",
      }}>{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "var(--black)",
          border: "1px solid var(--border)",
          color: "var(--white)",
          padding: "9px 12px",
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.85rem",
          outline: "none",
          resize: "vertical",
        }}
      />
    </div>
  );
}