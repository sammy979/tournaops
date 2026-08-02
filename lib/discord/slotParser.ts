// TournaOps Discord Slot List Parser
// Supports 8+ formats used by real PUBG Mobile / BGMI organizers

export interface ParsedSlot {
  slotNumber: number;
  teamName: string;
  players?: string[];
  captain?: string;
}

export interface ParseResult {
  slots: ParsedSlot[];
  totalDetected: number;
  confidence: number;
  warnings: ParseWarning[];
  format: string;
  rawLineCount: number;
  matchedLineCount: number;
}

export interface ParseWarning {
  type: "duplicate_slot" | "duplicate_name" | "missing_slot" | "invalid_slot" | "empty_name" | "low_confidence";
  message: string;
  slotNumber?: number;
  teamName?: string;
}

// ─────────────────────────────────────────────────────────────
// REGEX PATTERNS — Ordered by strictness (most specific first)
// ─────────────────────────────────────────────────────────────

const PATTERNS: Array<{ name: string; regex: RegExp; slotGroup: number; nameGroup: number }> = [
  // "SLOT 1 - Team Alpha" | "Slot 1: Team Alpha" | "SLOT #1 → Team Alpha"
  {
    name: "SLOT_LABEL",
    regex: /^[\s>*_~`]*(?:🎮|📌|🎯|▶️|➡️|👉)?\s*(?:S|SLOT|SLOTS?)[\s#:.\-–—>]*(\d{1,3})[\s.:\-–—>|>*_~`]+(.+?)[\s*_~`]*$/i,
    slotGroup: 1,
    nameGroup: 2,
  },
  // "1. Team Alpha" | "1) Team Alpha" | "1 - Team Alpha" | "1: Team Alpha"
  {
    name: "NUMBER_SEPARATOR",
    regex: /^[\s>*_~`]*(?:🎮|📌|🎯|▶️|➡️|👉)?\s*(\d{1,3})[\s.:\-–—>)|\]}]+(.+?)[\s*_~`]*$/,
    slotGroup: 1,
    nameGroup: 2,
  },
  // "#1 Team Alpha" | "No.1 Team Alpha"
  {
    name: "HASH_NUMBER",
    regex: /^[\s>*_~`]*(?:#|No\.?|Rank)\s*(\d{1,3})[\s.:\-–—>]+(.+?)[\s*_~`]*$/i,
    slotGroup: 1,
    nameGroup: 2,
  },
  // "Team Alpha - 1" (reverse format)
  {
    name: "NAME_NUMBER_REVERSE",
    regex: /^[\s>*_~`]*(.+?)\s+[\-–—]\s+(?:S|SLOT|#)?\s*(\d{1,3})[\s*_~`]*$/i,
    slotGroup: 2,
    nameGroup: 1,
  },
];

// ─────────────────────────────────────────────────────────────
// CLEANERS
// ─────────────────────────────────────────────────────────────

/** Strip Discord markdown, mentions, emojis at edges */
function cleanTeamName(name: string): string {
  let cleaned = name.trim();

  // Remove Discord mentions <@123>, <@!123>, <#123>, <@&123>
  cleaned = cleaned.replace(/<[@#][!&]?\d+>/g, "").trim();

  // Remove Discord emoji <:name:123> or <a:name:123>
  cleaned = cleaned.replace(/<a?:[a-zA-Z0-9_]+:\d+>/g, "").trim();

  // Remove markdown: ** __ ~~ ` (wrapping only)
  cleaned = cleaned.replace(/^[*_~`]+|[*_~`]+$/g, "").trim();

  // Remove trailing brackets like "Team Alpha (India)" → keep as-is (informative)
  // Remove ": stuff after" if it looks like extra metadata
  // cleaned = cleaned.replace(/[\s:|]+.*$/, ""); // too aggressive, skip

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Remove wrapping quotes
  cleaned = cleaned.replace(/^["'`](.+)["'`]$/, "$1").trim();

  return cleaned;
}

/** Check if a line is likely noise (not a slot entry) */
function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.length < 3) return true;

  // Common headers/footers to skip
  const noisePatterns = [
    /^={2,}/,
    /^-{3,}/,
    /^\*{3,}/,
    /^#+\s/,                         // markdown headers
    /^slot\s*list$/i,
    /^teams?$/i,
    /^registered\s*teams?$/i,
    /^participants?$/i,
    /^lineup$/i,
    /^tournament/i,
    /^scrim/i,
    /^match\s*\d/i,
    /^room\s*(id|code|password|pass)/i,
    /^password/i,
    /^@here|@everyone/i,
    /^https?:\/\//,
    /^discord\.gg/i,
  ];

  return noisePatterns.some(p => p.test(trimmed));
}

// ─────────────────────────────────────────────────────────────
// MAIN PARSER
// ─────────────────────────────────────────────────────────────

export function parseSlotList(rawText: string): ParseResult {
  const warnings: ParseWarning[] = [];

  if (!rawText || !rawText.trim()) {
    return {
      slots: [],
      totalDetected: 0,
      confidence: 0,
      warnings: [{ type: "empty_name", message: "Empty input" }],
      format: "NONE",
      rawLineCount: 0,
      matchedLineCount: 0,
    };
  }

  // Split into lines
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.replace(/\u200B|\u200C|\u200D/g, "")) // zero-width chars
    .filter(l => l.trim().length > 0);

  const rawLineCount = lines.length;

  // Try each pattern; pick the one that matches the most lines
  const attempts = PATTERNS.map(pattern => {
    const matched: ParsedSlot[] = [];
    for (const line of lines) {
      if (isNoiseLine(line)) continue;
      const m = line.match(pattern.regex);
      if (!m) continue;

      const slotNum = parseInt(m[pattern.slotGroup], 10);
      const rawName = m[pattern.nameGroup];
      if (isNaN(slotNum) || !rawName) continue;

      const cleanedName = cleanTeamName(rawName);
      if (!cleanedName || cleanedName.length < 2) continue;
      if (slotNum < 1 || slotNum > 500) continue;

      matched.push({ slotNumber: slotNum, teamName: cleanedName });
    }
    return { pattern: pattern.name, slots: matched };
  });

  // Winner = attempt with most matches
  attempts.sort((a, b) => b.slots.length - a.slots.length);
  const winner = attempts[0];

  if (winner.slots.length === 0) {
    return {
      slots: [],
      totalDetected: 0,
      confidence: 0,
      warnings: [{ type: "low_confidence", message: "No slot pattern detected. Check the message format." }],
      format: "UNKNOWN",
      rawLineCount,
      matchedLineCount: 0,
    };
  }

  const slots = winner.slots;

  // ─── VALIDATION ──────────────────────────────────────────

  // Duplicate slot numbers
  const slotCounts = new Map<number, number>();
  slots.forEach(s => slotCounts.set(s.slotNumber, (slotCounts.get(s.slotNumber) || 0) + 1));
  for (const [num, count] of slotCounts.entries()) {
    if (count > 1) {
      warnings.push({
        type: "duplicate_slot",
        message: `Slot ${num} appears ${count} times`,
        slotNumber: num,
      });
    }
  }

  // Duplicate team names (case-insensitive)
  const nameCounts = new Map<string, string[]>();
  slots.forEach(s => {
    const key = s.teamName.toLowerCase();
    if (!nameCounts.has(key)) nameCounts.set(key, []);
    nameCounts.get(key)!.push(s.teamName);
  });
  for (const [key, names] of nameCounts.entries()) {
    if (names.length > 1) {
      warnings.push({
        type: "duplicate_name",
        message: `Team "${names[0]}" appears ${names.length} times`,
        teamName: names[0],
      });
    }
  }

  // Missing slots (gaps in sequence)
  const slotNumbers = [...new Set(slots.map(s => s.slotNumber))].sort((a, b) => a - b);
  if (slotNumbers.length > 0) {
    const min = slotNumbers[0];
    const max = slotNumbers[slotNumbers.length - 1];
    const expected = new Set(Array.from({ length: max - min + 1 }, (_, i) => i + min));
    slotNumbers.forEach(n => expected.delete(n));
    for (const missing of expected) {
      warnings.push({
        type: "missing_slot",
        message: `Slot ${missing} is missing`,
        slotNumber: missing,
      });
    }
  }

  // Sort by slot number
  slots.sort((a, b) => a.slotNumber - b.slotNumber);

  // ─── CONFIDENCE SCORE ────────────────────────────────────

  const matchRatio = slots.length / lines.filter(l => !isNoiseLine(l)).length;
  const dupPenalty = warnings.filter(w => w.type === "duplicate_slot" || w.type === "duplicate_name").length * 0.1;
  const confidence = Math.max(0, Math.min(1, matchRatio - dupPenalty));

  if (confidence < 0.4) {
    warnings.push({
      type: "low_confidence",
      message: `Only ${Math.round(confidence * 100)}% of lines matched. Review carefully before importing.`,
    });
  }

  return {
    slots,
    totalDetected: slots.length,
    confidence,
    warnings,
    format: winner.pattern,
    rawLineCount,
    matchedLineCount: slots.length,
  };
}

// ─────────────────────────────────────────────────────────────
// DUPLICATE DETECTION vs EXISTING TOURNAMENT TEAMS
// ─────────────────────────────────────────────────────────────

export interface ExistingTeam {
  id: string;
  name: string;
  seed?: number;
}

export interface DuplicateCheckResult {
  newTeams: ParsedSlot[];
  existingMatches: Array<{
    parsed: ParsedSlot;
    existing: ExistingTeam;
    matchType: "exact_name" | "similar_name" | "same_slot";
  }>;
}

/** Levenshtein-lite similarity check */
function similarity(a: string, b: string): number {
  const s1 = a.toLowerCase().replace(/[^a-z0-9]/g, "");
  const s2 = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  // Simple substring similarity
  if (longer.includes(shorter)) return shorter.length / longer.length;
  return 0;
}

export function checkDuplicates(
  parsedSlots: ParsedSlot[],
  existingTeams: ExistingTeam[]
): DuplicateCheckResult {
  const newTeams: ParsedSlot[] = [];
  const existingMatches: DuplicateCheckResult["existingMatches"] = [];

  for (const slot of parsedSlots) {
    let matched: DuplicateCheckResult["existingMatches"][number] | null = null;

    for (const existing of existingTeams) {
      // Exact name match
      if (existing.name.toLowerCase().trim() === slot.teamName.toLowerCase().trim()) {
        matched = { parsed: slot, existing, matchType: "exact_name" };
        break;
      }
      // Same seed/slot number
      if (existing.seed === slot.slotNumber) {
        matched = { parsed: slot, existing, matchType: "same_slot" };
        break;
      }
      // Similar name (>85%)
      const sim = similarity(existing.name, slot.teamName);
      if (sim >= 0.85) {
        matched = { parsed: slot, existing, matchType: "similar_name" };
        break;
      }
    }

    if (matched) {
      existingMatches.push(matched);
    } else {
      newTeams.push(slot);
    }
  }

  return { newTeams, existingMatches };
}

// ─────────────────────────────────────────────────────────────
// AI PARSER INTERFACE (Optional, future)
// ─────────────────────────────────────────────────────────────

export interface AIParser {
  parse(rawText: string): Promise<ParseResult>;
}

/** Placeholder for future AI parser integration */
export async function parseWithAIFallback(
  rawText: string,
  aiParser?: AIParser
): Promise<ParseResult> {
  const deterministic = parseSlotList(rawText);
  if (deterministic.confidence >= 0.7 || !aiParser) {
    return deterministic;
  }
  // Fallback to AI if confidence is low
  try {
    return await aiParser.parse(rawText);
  } catch {
    return deterministic;
  }
}