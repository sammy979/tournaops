// app/admin/settings/payments/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Save, Loader2, CheckCircle } from "lucide-react"

interface Settings {
  esewaEnabled: boolean
  esewaQrUrl?: string
  esewaAccountName?: string
  esewaAccountId?: string
  esewaInstructions?: string
  khaltiEnabled: boolean
  khaltiQrUrl?: string
  khaltiAccountName?: string
  khaltiAccountId?: string
  khaltiInstructions?: string
  bankEnabled: boolean
  bankName?: string
  bankAccountHolder?: string
  bankAccountNumber?: string
  bankBranch?: string
  bankInstructions?: string
  bankQrUrl?: string
  internationalEnabled: boolean
}

const defaultSettings: Settings = {
  esewaEnabled: false, khaltiEnabled: false, bankEnabled: false, internationalEnabled: false,
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/payment-settings")
      .then((r) => r.json())
      .then((d) => { if (d.settings) setSettings({ ...defaultSettings, ...d.settings }) })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    const res = await fetch("/api/admin/payment-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Save failed") }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  const updateField = (key: keyof Settings, value: unknown) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure payment methods for Pro plan upgrades</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

      {/* eSewa */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">eSewa</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-colors ${settings.esewaEnabled ? "bg-green-500" : "bg-gray-300"}`}
              onClick={() => updateField("esewaEnabled", !settings.esewaEnabled)}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 mx-0.5 ${settings.esewaEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm text-gray-600">{settings.esewaEnabled ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
        {settings.esewaEnabled && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Account Name", key: "esewaAccountName" as keyof Settings },
              { label: "Account ID / Phone", key: "esewaAccountId" as keyof Settings },
              { label: "QR Image URL", key: "esewaQrUrl" as keyof Settings },
            ].map(({ label, key }) => (
              <div key={key} className={key === "esewaQrUrl" ? "col-span-2" : ""}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input value={(settings[key] as string) || ""} onChange={(e) => updateField(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Instructions</label>
              <textarea value={settings.esewaInstructions || ""} onChange={(e) => updateField("esewaInstructions", e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Instructions shown to the user..." />
            </div>
          </div>
        )}
      </div>

      {/* Khalti */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Khalti</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-colors ${settings.khaltiEnabled ? "bg-purple-500" : "bg-gray-300"}`}
              onClick={() => updateField("khaltiEnabled", !settings.khaltiEnabled)}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 mx-0.5 ${settings.khaltiEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm text-gray-600">{settings.khaltiEnabled ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
        {settings.khaltiEnabled && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Account Name", key: "khaltiAccountName" as keyof Settings },
              { label: "Account ID / Phone", key: "khaltiAccountId" as keyof Settings },
              { label: "QR Image URL", key: "khaltiQrUrl" as keyof Settings },
            ].map(({ label, key }) => (
              <div key={key} className={key === "khaltiQrUrl" ? "col-span-2" : ""}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input value={(settings[key] as string) || ""} onChange={(e) => updateField(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Instructions</label>
              <textarea value={settings.khaltiInstructions || ""} onChange={(e) => updateField("khaltiInstructions", e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        )}
      </div>

      {/* Bank */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Bank Transfer</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-colors ${settings.bankEnabled ? "bg-blue-500" : "bg-gray-300"}`}
              onClick={() => updateField("bankEnabled", !settings.bankEnabled)}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 mx-0.5 ${settings.bankEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm text-gray-600">{settings.bankEnabled ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
        {settings.bankEnabled && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Bank Name", key: "bankName" as keyof Settings },
              { label: "Account Holder", key: "bankAccountHolder" as keyof Settings },
              { label: "Account Number", key: "bankAccountNumber" as keyof Settings },
              { label: "Branch", key: "bankBranch" as keyof Settings },
              { label: "QR Image URL", key: "bankQrUrl" as keyof Settings },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input value={(settings[key] as string) || ""} onChange={(e) => updateField(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Instructions</label>
              <textarea value={settings.bankInstructions || ""} onChange={(e) => updateField("bankInstructions", e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        )}
      </div>

      {/* International (disabled notice) */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-500">International Payments</h2>
            <p className="text-xs text-gray-400 mt-1">Reserved for future integration. Not shown to users.</p>
          </div>
          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded font-semibold">Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
