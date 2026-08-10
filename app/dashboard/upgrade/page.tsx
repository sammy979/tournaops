// app/dashboard/upgrade/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import PaymentForm from "@/components/payment/PaymentForm"
import PaymentHistory from "@/components/payment/PaymentHistory"
import { Crown, Check } from "lucide-react"

const PRO_FEATURES = [
  "Unlimited tournaments",
  "Unlimited teams per tournament",
  "Advanced bracket types",
  "Discord integration",
  "Broadcast Studio / OBS overlay",
  "CSV import & export",
  "Custom scoring rules",
  "Priority support",
  "Analytics & reports",
  "Advanced group stages",
]

export default async function UpgradePage() {
  const session = await getSession()
  if (!session?.userId) redirect("/login")

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 mb-4">
          <Crown className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-semibold text-yellow-700">TournaOps Pro</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Upgrade to Pro</h1>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">
          Run professional esports tournaments with the full TournaOps suite.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-bold mb-4">What you get with Pro</h2>
          <ul className="space-y-2.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Submit Payment</h2>
          <p className="text-sm text-gray-500 mb-4">
            Send payment via eSewa, Khalti, or bank transfer then submit your details below.
          </p>
          <PaymentForm />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Payment History</h2>
        <PaymentHistory />
      </div>
    </div>
  )
}