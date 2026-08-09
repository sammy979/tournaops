// lib/plan-limits.ts
// Central definition of Free vs Pro plan limits.
// Change values here to adjust plan restrictions across the app.

export const PLAN_LIMITS = {
  FREE: {
    maxTournaments: 3,
    maxTeamsPerTournament: 32,
    maxMatchesPerTournament: 20,
    maxBulkImportTeams: 10,
  },
  PRO: {
    maxTournaments: Infinity,
    maxTeamsPerTournament: 400,
    maxMatchesPerTournament: Infinity,
    maxBulkImportTeams: 400,
  },
} as const;

// Features locked behind Pro plan
export const PRO_FEATURES = {
  DISCORD_INTEGRATION: "Discord bot integration and auto-announcements",
  AI_INSIGHTS: "AI-powered tournament insights",
  AI_IMAGE_GENERATION: "AI image and poster generation",
  SCREENSHOT_IMPORT: "Screenshot result extraction",
  CUSTOM_BRANDING: "Custom branding, logos, and sponsors",
  OBS_OVERLAYS: "Broadcast studio and OBS overlays",
  PLAYER_STATISTICS: "Advanced player statistics",
  BULK_IMPORT: "Bulk team import (>10 teams)",
  EXCEL_PDF_EXPORT: "Excel and PDF exports",
} as const;

export type ProFeature = keyof typeof PRO_FEATURES;

// Get the limit for a user
export function getUserLimits(isPro: boolean) {
  return isPro ? PLAN_LIMITS.PRO : PLAN_LIMITS.FREE;
}
