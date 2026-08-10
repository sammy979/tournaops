// lib/pricing.ts
// Central pricing configuration - update here to change price everywhere

export const PRO_PRICE = {
  amount: 299,
  currency: "NPR",
  currencySymbol: "Rs",
  display: "Rs 299",
  displayFull: "NPR 299",
  duration: "1 month",
  durationDays: 30,
} as const

export const PRO_FEATURES = [
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
] as const

export function formatPrice(amount: number, currency: string = "NPR"): string {
  if (currency === "NPR") return `Rs ${amount.toLocaleString()}`
  return `${currency} ${amount.toLocaleString()}`
}