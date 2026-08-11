// TournaOps AI Provider Abstraction
// Keeps all AI calls server-side via API routes
// Supports graceful fallback when no API key is set

export interface AIExtractionResult {
  teams: Array<{
    teamName: string;
    placement: number;
    kills: number;
    placementPoints?: number;
    killPoints?: number;
    totalPoints?: number;
    confidence: number;
  }>;
  mapDetected?: string;
  matchDetected?: string;
  method: "ai" | "manual";
  confidence: number;
}

export interface AITextParseResult {
  teams: Array<{
    teamName: string;
    placement: number;
    kills: number;
    confidence: number;
  }>;
  format: string;
  confidence: number;
}

export interface AIScoringExtraction {
  placementPoints: number[];
  killPoints: number;
  wwcdBonus?: number;
  confidence: number;
}

export interface AIValidationResult {
  errors: Array<{
    type: "DUPLICATE_TEAM" | "DUPLICATE_PLACEMENT" | "MISSING_TEAM" | "INVALID_PLACEMENT" | "NEGATIVE_KILLS" | "INCORRECT_TOTAL" | "TEAM_MISMATCH" | "SUSPICIOUS_SCORE";
    severity: "error" | "warning" | "info";
    message: string;
    teamName?: string;
    field?: string;
    expected?: any;
    actual?: any;
    suggestion?: string;
  }>;
  isValid: boolean;
  confidence: number;
}

export interface AITeamMatch {
  inputName: string;
  matchedName: string;
  confidence: number;
  isExactMatch: boolean;
}

export interface AISummary {
  text: string;
  highlights: Array<{
    type: "WINNER" | "TOP_FRAGGER" | "BIGGEST_MOVER" | "COMEBACK" | "CLOSE_RACE";
    text: string;
    teamName: string;
  }>;
}

export interface AICommentary {
  text: string;
  tone: "professional" | "hype" | "short" | "caster";
}

export interface AISocialPost {
  text: string;
  platform: "discord" | "twitter" | "instagram" | "facebook";
  hashtags: string[];
}

export interface AIWhatIfResult {
  newStandings: Array<{
    teamName: string;
    oldRank: number;
    newRank: number;
    oldPoints: number;
    newPoints: number;
    change: number;
  }>;
  summary: string;
}

// Check if AI is available (API key set)
export function isAIAvailable(): boolean {
  return typeof window === "undefined"
    ? !!(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)
    : true; // Client always assumes available, server checks
}

// Confidence levels
export function getConfidenceLevel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 85) return "high";
  if (confidence >= 60) return "medium";
  return "low";
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 85) return "text-green-400";
  if (confidence >= 60) return "text-yellow-400";
  return "text-red-400";
}

export function getConfidenceBg(confidence: number): string {
  if (confidence >= 85) return "bg-green-500/10 border-green-500/20";
  if (confidence >= 60) return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-red-500/10 border-red-500/20";
}
