// components/payment/PaymentMethodCard.tsx
"use client"

interface PaymentMethodCardProps {
  method: "ESEWA" | "KHALTI" | "BANK"
  selected: boolean
  onSelect: () => void
  accountName?: string
  accountId?: string
  qrUrl?: string
  bankName?: string
}

const METHOD_LABELS: Record<string, string> = {
  ESEWA: "eSewa",
  KHALTI: "Khalti",
  BANK: "Bank Transfer",
}

const METHOD_COLORS: Record<string, string> = {
  ESEWA: "border-green-400 bg-green-50",
  KHALTI: "border-purple-400 bg-purple-50",
  BANK: "border-blue-400 bg-blue-50",
}

export default function PaymentMethodCard({
  method, selected, onSelect, accountName, accountId, qrUrl, bankName,
}: PaymentMethodCardProps) {
  const label = method === "BANK" ? (bankName || "Bank Transfer") : METHOD_LABELS[method]
  const colorClass = selected ? METHOD_COLORS[method] : "border-gray-200 bg-white"

  return (
    <button type="button" onClick={onSelect}
      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${colorClass} hover:shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{label}</span>
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected ? "border-purple-500" : "border-gray-300"}`}>
          {selected && <div className="w-2 h-2 rounded-full bg-purple-500" />}
        </div>
      </div>
      {selected && accountName && (
        <div className="mt-3 space-y-1">
          {qrUrl && <img src={qrUrl} alt="QR" className="w-24 h-24 rounded border mb-2" />}
          <div className="text-xs text-gray-600">Account: <span className="font-semibold">{accountName}</span></div>
          {accountId && <div className="text-xs text-gray-600 font-mono">ID: {accountId}</div>}
        </div>
      )}
    </button>
  )
}
