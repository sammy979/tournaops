// TournaOps Enhanced Discord Slot List Parser
// Supports: 12+ formats, captain names, Discord IDs, PUBG UIDs, table formats

export interface ParsedSlot {
  slotNumber: number;
  teamName: string;
  captain?: string;
  discordId?: string;
  pubgUid?: string;
  players?: string[];
  raw: string;
}

export interface ExistingMatch {
  slotNumber: number;
  teamName: string;
  existingTeamName: string;
  existingTeamId: string;
  reason: string;
  // Extended fields used by DiscordSlotImporter
  parsed?: ParsedSlot;
  existing?: ExistingTeam;
  message?: string;
}

export interface ValidationResult {
  valid: ParsedSlot[];
  duplicates: Array<{ slot: ParsedSlot; existingTeamName?: string; reason: string }>;
  invalid: Array<{ line: string; reason: string }>;
  // Extended fields used by DiscordSlotImporter
  newTeams: ParsedSlot[];
  existingMatches: ExistingMatch[];
  message: string | string[];
}

export interface ParseResult {
  slots: ParsedSlot[];
  totalDetected: number;
  confidence: number;
  format: string;
  warnings: string[];
  rawLineCount: number;
  matchedLineCount: number;
}

// â”€â”€â”€ REGEX PATTERNS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PATTERNS: Array<{
  name: string;
  regex: RegExp;
  slotGroup: number;
  nameGroup: number;
  captainGroup?: number;
}> = [
  // "SLOT 1 - Team Alpha" | "Slot 1: Team Alpha"
  {
    name: "SLOT_LABEL",
    regex: /^[\s>*_~`]*(?:ðŸŽ®|ðŸ“Œ|ðŸŽ¯|â–¶ï¸|âž¡ï¸|ðŸ‘‰)?\s*(?:S|SLOT|SLOTS?)[\s#:.\-â€“â€”>]*(\d{1,3})[\s.:\-â€“â€”>|>*_~`]+(.+?)[\s*_~`]*$/i,
    slotGroup: 1,
    nameGroup: 2,
  },
  // "1. Team Alpha" | "1) Team Alpha" | "1 - Team Alpha"
  {
    name: "NUMBER_SEPARATOR",
    regex: /^[\s>*_~`]*(?:ðŸŽ®|ðŸ“Œ|ðŸŽ¯|â–¶ï¸|âž¡ï¸|ðŸ‘‰)?\s*(\d{1,3})[\s.:\-â€“â€”>)|\]}]+(.+?)[\s*_~`]*$/,
    slotGroup: 1,
    nameGroup: 2,
  },
  // "#1 Team Alpha" | "No.1 Team Alpha"
  {
    name: "HASH_NUMBER",
    regex: /^[\s>*_~`]*(?:#|No\.?|Rank)\s*(\d{1,3})[\s.:\-â€“â€”>]+(.+?)[\s*_~`]*$/i,
    slotGroup: 1,
    nameGroup: 2,
  },
  // "1. Team Alpha - Captain: Sammy" or "1. Team Alpha | Captain: Sammy"
  {
    name: "WITH_CAPTAIN",
    regex: /^[\s>*_~`]*(\d{1,3})[\s.:\-â€“â€”>)]+(.+?)[\s\-â€“â€”|]+(?:captain|cap|leader|igl|c)[\s:]+(.+?)[\s*_~`]*$/i,
    slotGroup: 1,
    nameGroup: 2,
    captainGroup: 3,
  },
  // Table format: "| 1 | Team Alpha | Sammy | 5xxxxxxxxx |"
  {
    name: "TABLE_FORMAT",
    regex: /^\|?\s*(\d{1,3})\s*\|?\s*([^|]+?)\s*\|?\s*([^|]*?)\s*\|?\s*([^|]*?)\s*\|?\s*$/,
    slotGroup: 1,
    nameGroup: 2,
    captainGroup: 3,
  },
];

// â”€â”€â”€ CLEANERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function cleanTeamName(name: string): string {
  let c = name.trim();
  c = c.replace(/<[@#][!&]?\d+>/g, "").trim();
  c = c.replace(/<a?:[a-zA-Z0-9_]+:\d+>/g, "").trim();
  c = c.replace(/^[*_~`]+|[*_~`]+$/g, "").trim();
  c = c.replace(/\s+/g, " ").trim();
  c = c.replace(/^["'`](.+)["'`]$/, "$1").trim();
  // Remove trailing captain info if it leaked through
  c = c.replace(/[\s\-â€“â€”|]+(?:captain|cap|leader|igl|c)[\s:]+.*$/i, "").trim();
  return c;
}

function extractCaptain(text: string): string | undefined {
  const captainMatch = text.match(/(?:captain|cap|leader|igl|c)[\s:]+([^|,\n]+)/i);
  if (captainMatch) return captainMatch[1].trim().replace(/^[*_~`]+|[*_~`]+$/g, "").trim();
  return undefined;
}

function extractDiscordId(text: string): string | undefined {
  const discordMatch = text.match(/<@!?(\d{17,20})>/);
  if (discordMatch) return discordMatch[1];
  const rawMatch = text.match(/\b(\d{17,20})\b/);
  if (rawMatch && rawMatch[1].length >= 17) return rawMatch[1];
  return undefined;
}

function extractPubgUid(text: string): string | undefined {
  const uidMatch = text.match(/(?:uid|pubg[\s-]*id|game[\s-]*id)[\s:]+(\d{8,12})/i);
  if (uidMatch) return uidMatch[1];
  // Standalone 10-digit number that looks like a PUBG UID
  const standaloneMatch = text.match(/\b(5\d{9,11})\b/);
  if (standaloneMatch) return standaloneMatch[1];
  return undefined;
}

function extractPlayers(text: string): string[] | undefined {
  // Try to find comma-separated player names after team name
  const playersMatch = text.match(/(?:players?|members?|roster)[\s:]+([^|]+)/i);
  if (playersMatch) {
    return playersMatch[1].split(/[,;]/).map(p => p.trim()).filter(p => p.length > 0 && p.length < 30);
  }
  return undefined;
}

function isNoiseLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.length < 3) return true;
  const noise = [
    /^={2,}/, /^-{3,}/, /^\*{3,}/, /^#+\s/,
    /^slot\s*list$/i, /^teams?$/i, /^registered/i,
    /^participants?$/i, /^lineup$/i, /^tournament/i,
    /^scrim/i, /^match\s*\d/i, /^room\s*(id|code|password|pass)/i,
    /^@here|@everyone/i, /^https?:\/\//,
    /^discord\.gg/i, /^\|\s*-+\s*\|/, // Table separator lines
    /^[\s|]+$/, // Empty table rows
    /^#\s*\|\s*team/i, // Table headers
    /^slot\s*\|\s*team/i,
    /^sr\.?\s*no/i,
  ];
  return noise.some(p => p.test(t));
}

// â”€â”€â”€ MAIN PARSER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function parseSlotList(rawText: string): ParseResult {
  const warnings: string[] = [];

  if (!rawText?.trim()) {
    return { slots: [], totalDetected: 0, confidence: 0, format: "NONE", warnings: ["Empty input"], rawLineCount: 0, matchedLineCount: 0 };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.replace(/\u200B|\u200C|\u200D/g, ""))
    .filter(l => l.trim().length > 0);

  const rawLineCount = lines.length;

  // Try each pattern
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

      const slot: ParsedSlot = {
        slotNumber: slotNum,
        teamName: cleanedName,
        raw: line.trim(),
      };

      // Extract extra info from the line
      const captain = pattern.captainGroup ? m[pattern.captainGroup]?.trim() : extractCaptain(line);
      if (captain && captain.length > 1 && captain.length < 40) slot.captain = captain;

      const discordId = extractDiscordId(line);
      if (discordId) slot.discordId = discordId;

      const pubgUid = extractPubgUid(line);
      if (pubgUid) slot.pubgUid = pubgUid;

      const players = extractPlayers(line);
      if (players && players.length > 0) slot.players = players;

      matched.push(slot);
    }
    return { pattern: pattern.name, slots: matched };
  });

  attempts.sort((a, b) => b.slots.length - a.slots.length);
  const winner = attempts[0];

  if (winner.slots.length === 0) {
    return { slots: [], totalDetected: 0, confidence: 0, format: "UNKNOWN", warnings: ["No slot pattern detected"], rawLineCount, matchedLineCount: 0 };
  }

  const slots = winner.slots;

  // Duplicate slot numbers
  const slotCounts = new Map<number, number>();
  slots.forEach(s => slotCounts.set(s.slotNumber, (slotCounts.get(s.slotNumber) || 0) + 1));
  slotCounts.forEach((count, num) => {
    if (count > 1) warnings.push(`Slot ${num} appears ${count} times`);
  });

  // Duplicate team names
  const nameCounts = new Map<string, number>();
  slots.forEach(s => {
    const key = s.teamName.toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
  });
  nameCounts.forEach((count, name) => {
    if (count > 1) warnings.push(`Team "${name}" appears ${count} times`);
  });

  // Missing slots
  const slotNumbers = [...new Set(slots.map(s => s.slotNumber))].sort((a, b) => a - b);
  if (slotNumbers.length > 0) {
    const min = slotNumbers[0];
    const max = slotNumbers[slotNumbers.length - 1];
    const expected = new Set(Array.from({ length: max - min + 1 }, (_, i) => i + min));
    slotNumbers.forEach(n => expected.delete(n));
    expected.forEach(missing => warnings.push(`Slot ${missing} is missing`));
  }

  slots.sort((a, b) => a.slotNumber - b.slotNumber);

  const matchRatio = slots.length / lines.filter(l => !isNoiseLine(l)).length;
  const confidence = Math.max(0, Math.min(1, matchRatio));

  if (confidence < 0.4) {
    warnings.push(`Low confidence (${Math.round(confidence * 100)}%) - review carefully`);
  }

  return {
    slots,
    totalDetected: slots.length,
    confidence,
    format: winner.pattern,
    warnings,
    rawLineCount,
    matchedLineCount: slots.length,
  };
}

// â”€â”€â”€ VALIDATION AGAINST EXISTING TEAMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ExistingTeam {
  id: string;
  name: string;
  seed?: number;
}

export function validateImport(
  parsed: ParsedSlot[],
  existingTeams: ExistingTeam[]
): ValidationResult {
  const valid: ParsedSlot[] = [];
  const duplicates: ValidationResult["duplicates"] = [];
  const invalid: ValidationResult["invalid"] = [];

  const seenNames = new Set<string>();

  for (const slot of parsed) {
    // Check for empty/too short names
    if (!slot.teamName || slot.teamName.length < 2) {
      invalid.push({ line: slot.raw, reason: "Team name too short" });
      continue;
    }

    // Check for invalid slot numbers
    if (slot.slotNumber < 1 || slot.slotNumber > 500) {
      invalid.push({ line: slot.raw, reason: `Invalid slot number: ${slot.slotNumber}` });
      continue;
    }

    const nameLower = slot.teamName.toLowerCase();

    // Check for duplicate within THIS import
    if (seenNames.has(nameLower)) {
      duplicates.push({ slot, reason: "Duplicate within this import" });
      continue;
    }

    // Check against existing teams
    const existingMatch = existingTeams.find(t =>
      t.name.toLowerCase() === nameLower || similarity(t.name, slot.teamName) > 0.85
    );
    if (existingMatch) {
      duplicates.push({
        slot,
        existingTeamName: existingMatch.name,
        reason: existingMatch.name.toLowerCase() === nameLower
          ? "Exact name match with existing team"
          : `Similar to existing team: "${existingMatch.name}"`,
      });
      continue;
    }

    seenNames.add(nameLower);
    valid.push(slot);
  }

  return { valid, duplicates, invalid };
}

function similarity(a: string, b: string): number {
  const s1 = a.toLowerCase().replace(/[^a-z0-9]/g, "");
  const s2 = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (s1 === s2) return 1;
  if (!s1 || !s2) return 0;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.includes(shorter)) return shorter.length / longer.length;
  return 0;
}

// â”€â”€â”€ DETECT IF TEXT IS A SLOT LIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function isLikelySlotList(rawText: string): boolean {
  if (!rawText || rawText.length < 15) return false;
  const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 3);
  if (lines.length < 3) return false;
  const patterns = [/^\s*(?:s|slot|slots?)\s*[#:.\-â€“â€”>]*\s*\d/i, /^\s*\d{1,3}\s*[.:\-â€“â€”>)]/, /^\s*#\s*\d/, /^\|\s*\d/];
  const matches = lines.filter(l => patterns.some(p => p.test(l)));
  return matches.length >= 3 && matches.length / lines.length >= 0.4;
}

// Backwards compatibility
export const checkDuplicates = validateImport;

// -- Missing exports that components reference ------------------
export type ExistingTeamTypeType = "exact" | "fuzzy" | "new";

export interface ExistingTeam {
  id: string;
  name: string;
  tag?: string;
}