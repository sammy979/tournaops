"use client";

import { useState } from "react";
import AdminShell from "@/components/ui/AdminShell";
import {
  CreditCard,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Percent,
  Shield,
} from "lucide-react";

export default function AdminPaymentSettingsPage() {
  const [saved,     setSaved]     = useState(false);
  const [keyVisible,setKeyVisible]= useState({ secret: false, webhook: false });

  const [settings, setSettings] = useState({
    stripePublishable: "pk_live_51xxx_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    stripeSecret:      "sk_live_51xxx_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    webhookSecret:     "whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    proMonthly:        "19.99",
    proAnnual:         "179.00",
    proPlus:           "49.99",
    proPlusAnnual:     "479.00",
    currency:          "USD",
    taxEnabled:        true,
    taxRate:           "8.5",
    trialDays:         "14",
    refundWindow:      "30",
    liveMode:          true,
  });

  const update = (key: keyof typeof settings, val: unknown) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const MaskedInput = ({ value, field }: { value: string; field: "secret" | "webhook" }) => (
    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5">
      <code className="flex-1 text-sm text-white/60 font-mono truncate text-xs">
        {keyVisible[field] ? value : `${value.slice(0, 12)}${"•".repeat(24)}${value.slice(-4)}`}
      </code>
      <button onClick={() => setKeyVisible(prev => ({ ...prev, [field]: !prev[field] }))} className="text-white/25 hover:text-white/60 transition-colors">
        {keyVisible[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button onClick={() => navigator.clipboard.writeText(value)} className="text-white/25 hover:text-white/60 transition-colors">
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AdminShell>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Payment Settings</h1>
            <p className="text-white/40 text-sm mt-0.5">Configure Stripe keys, pricing, and billing options</p>
          </div>
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${saved ? "bg-emerald-600 text-white" : "bg-rose-600 hover:bg-rose-500 text-white"}`}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>

        {/* Live mode toggle banner */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${settings.liveMode ? "bg-emerald-500/[0.06] border-emerald-500/20" : "bg-amber-500/[0.08] border-amber-500/20"}`}>
          <Shield className={`w-5 h-5 flex-shrink-0 ${settings.liveMode ? "text-emerald-400" : "text-amber-400"}`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${settings.liveMode ? "text-emerald-300" : "text-amber-300"}`}>
              {settings.liveMode ? "Live Mode Active" : "Test Mode Active"}
            </p>
            <p className="text-white/40 text-xs">{settings.liveMode ? "Real payments are being processed" : "No real transactions — safe for testing"}</p>
          </div>
          <button onClick={() => update("liveMode", !settings.liveMode)}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.liveMode ? "bg-emerald-600" : "bg-amber-500"}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.liveMode ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="space-y-5">
          {/* API Keys */}
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-violet-400" />
              <h2 className="text-white font-semibold">Stripe API Keys</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Publishable Key</label>
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5">
                  <code className="text-sm text-white/60 font-mono text-xs truncate block">{settings.stripePublishable}</code>
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Secret Key</label>
                <MaskedInput value={settings.stripeSecret} field="secret" />
              </div>
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Webhook Secret</label>
                <MaskedInput value={settings.webhookSecret} field="webhook" />
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-300/70 text-xs">Never share your secret key publicly. Rotate keys immediately if compromised.</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h2 className="text-white font-semibold">Plan Pricing</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "proMonthly",   label: "Pro (Monthly)"  },
                { key: "proAnnual",    label: "Pro (Annual)"   },
                { key: "proPlus",      label: "Pro+ (Monthly)" },
                { key: "proPlusAnnual",label: "Pro+ (Annual)"  },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-white/40 text-xs font-medium block mb-1.5">{f.label}</label>
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
                    <span className="text-white/30 text-sm">$</span>
                    <input
                      type="number"
                      value={settings[f.key as keyof typeof settings] as string}
                      onChange={e => update(f.key as keyof typeof settings, e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none min-w-0"
                    />
                    <span className="text-white/25 text-xs">USD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Billing */}
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-4 h-4 text-amber-400" />
              <h2 className="text-white font-semibold">Tax & Billing</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-white text-sm font-medium">Collect Sales Tax</p>
                  <p className="text-white/40 text-xs">Automatically calculate and collect applicable taxes</p>
                </div>
                <button onClick={() => update("taxEnabled", !settings.taxEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings.taxEnabled ? "bg-violet-600" : "bg-white/[0.10]"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.taxEnabled ? "left-6" : "left-1"}`} />
                </button>
              </div>
              {settings.taxEnabled && (
                <div>
                  <label className="text-white/40 text-xs font-medium block mb-1.5">Default Tax Rate (%)</label>
                  <input type="number" value={settings.taxRate} onChange={e => update("taxRate", e.target.value)}
                    className="w-32 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs font-medium block mb-1.5">Trial Period (days)</label>
                  <input type="number" value={settings.trialDays} onChange={e => update("trialDays", e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="text-white/40 text-xs font-medium block mb-1.5">Refund Window (days)</label>
                  <input type="number" value={settings.refundWindow} onChange={e => update("refundWindow", e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}