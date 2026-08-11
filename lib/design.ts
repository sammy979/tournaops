// ─── TournaOps Unified Design Tokens ─────────────────────────────────────────
// Import these anywhere to maintain visual consistency

export const colors = {
  // Backgrounds
  bgBase:     "#07090f",   // Public pages base
  bgSurface:  "#0d0f18",   // Cards, panels
  bgElevated: "#111320",   // Hover states, elevated elements
  bgDash:     "#080a0e",   // Dashboard base
  bgDashCard: "#0f1117",   // Dashboard cards

  // Borders
  border:      "border-white/[0.07]",
  borderHover: "border-white/[0.14]",
  borderStrong:"border-white/[0.12]",

  // Text
  textPrimary:  "text-white",
  textSecondary:"text-white/60",
  textMuted:    "text-white/30",
  textDisabled: "text-white/20",

  // Brand
  violet: "#7C3AED",
  indigo: "#4F46E5",
  amber:  "#D97706",
} as const;

export const radius = {
  sm:  "rounded-lg",
  md:  "rounded-xl",
  lg:  "rounded-2xl",
  xl:  "rounded-3xl",
} as const;

// Shared card class
export const card = "bg-[#0d0f18] border border-white/[0.07] rounded-2xl";

// Shared input class
export const input = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all";

// Primary button
export const btnPrimary = "bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/25";

// Secondary button
export const btnSecondary = "bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] text-white font-medium rounded-xl transition-colors";