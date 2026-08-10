// components/payment/PaymentForm.tsx
"use client"
import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface PaymentSettings {
  esewaEnabled: boolean
  esewaAccountName?: string
  esewaAccountId?: string
  esewaInstructions?: string
  esewaQrUrl?: string
  khaltiEnabled: boolean
  khaltiAccountName?: string
  khaltiAccountId?: string
  khaltiInstructions?: string
  khaltiQrUrl?: string
  bankEnabled: boolean
  bankName?: string
  bankAccountHolder?: string
  bankAccountNumber?: string
  bankBranch?: string
  bankInstructions?: string
}

export default function PaymentForm() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [method, setMethod] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [transactionReference, setTransactionReference] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [proofUrl, setProofUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    fetch("/api/payment-settings/public")
      .then((r) => r.json())
      .then((d) => { if (d.settings) setSettings(d.settings) })
      .catch(() => {})
  }, [])

  const enabledMethods = settings
    ? ([
        settings.esewaEnabled ? "ESEWA" : null,
        settings.khaltiEnabled ? "KHALTI" : null,
        settings.bankEnabled ? "BANK" : null,
      ].filter(Boolean) as string[])
    : []

  const getMethodInfo = () => {
    if (!settings || !method) return null
    if (method === "ESEWA") return {
      name: "eSewa",
      accountName: settings.esewaAccountName,
      accountId: settings.esewaAccountId,
      qrUrl: settings.esewaQrUrl,
      instructions: settings.esewaInstructions,
    }
    if (method === "KHALTI") return {
      name: "Khalti",
      accountName: settings.khaltiAccountName,
      accountId: settings.khaltiAccountId,
      qrUrl: settings.khaltiQrUrl,
      instructions: settings.khaltiInstructions,
    }
    if (method === "BANK") return {
      name: settings.bankName || "Bank Transfer",
      accountName: settings.bankAccountHolder,
      accountId: settings.bankAccountNumber,
      qrUrl: undefined,
      instructions: settings.bankInstructions,
      branch: settings.bankBranch,
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!method) { setError("Please select a payment method"); return }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount"); return
    }
    if (!transactionReference.trim()) {
      setError("Please enter the transaction reference"); return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          amount: Number(amount),
          transactionReference: transactionReference.trim(),
          proofUrl: proofUrl.trim() || undefined,
          note: note.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Submission failed"); return }
      setSuccess(true)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-green-800 mb-2">Payment Submitted!</h3>
        <p className="text-green-700 text-sm">
          Your payment is under review. Pro will be activated once approved by our team.
        </p>
      </div>
    )
  }

  if (settings && enabledMethods.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-700 text-sm font-medium">
          No payment methods are currently available. Please contact support.
        </p>
      </div>
    )
  }

  const methodInfo = getMethodInfo()

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Method Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Payment Method
        </label>
        {!settings ? (
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <div className="flex gap-2 flex-wrap">
            {enabledMethods.includes("ESEWA") && (
              <button
                type="button"
                onClick={() => setMethod("ESEWA")}
                className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                  method === "ESEWA"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                eSewa
              </button>
            )}
            {enabledMethods.includes("KHALTI") && (
              <button
                type="button"
                onClick={() => setMethod("KHALTI")}
                className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                  method === "KHALTI"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                Khalti
              </button>
            )}
            {enabledMethods.includes("BANK") && (
              <button
                type="button"
                onClick={() => setMethod("BANK")}
                className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                  method === "BANK"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                Bank Transfer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payment Info Card */}
      {methodInfo && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
          {methodInfo.qrUrl && (
            <div className="flex justify-center mb-3">
              <img
                src={methodInfo.qrUrl}
                alt="Payment QR Code"
                className="w-32 h-32 rounded-lg border border-gray-200 object-contain"
              />
            </div>
          )}
          {methodInfo.accountName && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Account Name</span>
              <span className="font-semibold text-gray-900">{methodInfo.accountName}</span>
            </div>
          )}
          {methodInfo.accountId && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Account ID</span>
              <span className="font-semibold font-mono text-gray-900">{methodInfo.accountId}</span>
            </div>
          )}
          {"branch" in methodInfo && methodInfo.branch && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Branch</span>
              <span className="font-semibold text-gray-900">{methodInfo.branch}</span>
            </div>
          )}
          {methodInfo.instructions && (
            <p className="text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
              {methodInfo.instructions}
            </p>
          )}
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Amount (NPR)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 999"
          min="1"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Transaction Reference */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Transaction Reference / ID
        </label>
        <input
          type="text"
          value={transactionReference}
          onChange={(e) => setTransactionReference(e.target.value)}
          placeholder="Transaction ID from your payment app"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Screenshot URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Screenshot URL <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">
          Upload your payment screenshot to Imgur or similar and paste the URL here.
        </p>
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Note <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Any additional information..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !method}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Payment for Review"
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Your payment will be reviewed manually. Pro access will be activated within 24 hours of approval.
      </p>
    </form>
  )
}
