// lib/team-import-parser.ts
// ============================================================
// Server-safe team import parser for TournaOps
// Handles all common paste formats from Discord, spreadsheets,
// and plain text. Never silently imports bad data.
// ============================================================

export interface ParsedTeam {
  name: string;
  tag?: string;
  seed?: number;
  raw: string;
  lineNumber: number;
}

export interface ImportIssue {
  line: string;
  lineNumber: number;
  reason: string;
}

export interface DuplicateTeam {
  parsed: ParsedTeam;
  existingName: string;
  type: "exact" | "fuzzy";
}

export interface TeamImportPreview {
  valid: ParsedTeam[];
  duplicatesWithinImport: ParsedTeam[];
  duplicatesWithExisting: DuplicateTeam[];
  invalid: ImportIssue[];
  totalDetected: number;
  totalValid: number;
  capacity: {
    current: number;
    max: number;
    willExceed: boolean;
    canImport: number;
  };
  summary: string;
}

// ============================================================
// NOISE LINES — skip these silently
// ============================================================

const NOISE_PATTERNS = [
  /^\s*$/,
  /^-{3,}/,
  /^={3,}/,
  /^\*{3,}/,
  /^#{1,6}\s/,
  /^slot\s*list/i,
  /^teams?\s*$/i,
  /^registered/i,
  /^participants?$/i,
  /^lineup$/i,
  /^@here/i,
  /^@everyone/i,
  /^https?:\/\//,
  /^discord\.gg/i,
  /^\|\s*[-:]+\s*\|/,
  /^\|\s*#\s*\|/i,
  /^\|\s*slot\s*\|/i,
  /^\|\s*team\s*\|/i,
  /^\|\s*sr\.?\s*no/i,
  /^room\s*(id|code|password|pass)/i,
  /^scrim/i,
];

function isNoiseLine(line: string): boolean {
  const t = line.trim();
  if (t.length < 2) return true;
  return NOISE_PATTERNS.some((p) => p.test(t));
}

// ============================================================
// CLEAN TEAM NAME
// ============================================================

function cleanName(raw: string): string {
  let s = raw.trim();
  // Remove Discord formatting
  s = s.replace(/<[@#][!&]?\d+>/g, "");
  s = s.replace(/<a?:[a-zA-Z0-9_]+:\d+>/g, "");
  // Remove markdown bold/italic/code
  s = s.replace(/\*\*(.+?)\*\*/g, "$1");
  s = s.replace(/\*(.+?)\*/g, "$1");
  s = s.replace(/__(.+?)__/g, "$1");
  s = s.replace(/_(.+?)_/g, "$1");
  s = s.replace(/`(.+?)`/g, "$1");
  // Remove surrounding quotes
  s = s.replace(/^["'`](.+)["'`]$/, "$1");
  // Remove trailing punctuation that leaked from separators
  s = s.replace(/[,;|]+$/, "");
  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

// ============================================================
// PARSE PATTERNS
// Priority order matters — most specific first
// ============================================================

interface PatternResult {
  seed?: number;
  name: string;
  tag?: string;
}

const PATTERNS: Array<{
  name: string;
  regex: RegExp;
  extract: (m: RegExpMatchArray) => PatternResult;
}> = [
  // "Slot 01 - Team Alpha" / "SLOT 1: Team Alpha"
  {
    name: "SLOT_LABEL",
    regex: /^[\s>*_~`]*slot[\s#:.\-–—>]*(\d{1,3})[\s.:\-–—>|]+(.+?)[\s*_~`]*$/i,
    extract: (m) => ({ seed: parseInt(m[1], 10), name: m[2] }),
  },
  // "#1 Team Alpha" / "No.1 Team Alpha"
  {
    name: "HASH_NUMBER",
    regex: /^[\s>*_~`]*(?:#|No\.?|Rank)\s*(\d{1,3})[\s.:\-–—>]+(.+?)[\s*_~`]*$/i,
    extract: (m) => ({ seed: parseInt(m[1], 10), name: m[2] }),
  },
  // "1. Team Alpha" / "1) Team Alpha" / "1 - Team Alpha" / "1: Team Alpha"
  {
    name: "NUMBER_SEPARATOR",
    regex: /^[\s>*_~`]*(\d{1,3})[\s.:\-–—>)|\]}]+(.+?)[\s*_~`]*$/,
    extract: (m) => ({ seed: parseInt(m[1], 10), name: m[2] }),
  },
  // Table format "| 1 | Team Alpha |"
  {
    name: "TABLE_FORMAT",
    regex: /^\|?\s*(\d{1,3})\s*\|\s*([^|]+?)\s*\|/,
    extract: (m) => ({ seed: parseInt(m[1], 10), name: m[2] }),
  },
  // Bullet "• Team Alpha" / "- Team Alpha" / "* Team Alpha"
  {
    name: "BULLET",
    regex: /^[\s]*[•\-*►▶→]\s+(.+?)[\s*_~`]*$/,
    extract: (m) => ({ name: m[1] }),
  },
  // Plain line — just a team name
  {
    name: "PLAIN",
    regex: /^[\s>*_~`]*([A-Za-z0-9].{1,48})[\s*_~`]*$/,
    extract: (m) => ({ name: m[1] }),
  },
];

function parseLine(
  line: string,
  lineNumber: number
): ParsedTeam | ImportIssue | null {
  const trimmed = line.trim();
  if (isNoiseLine(trimmed)) return null;

  for (const pattern of PATTERNS) {
    const m = trimmed.match(pattern.regex);
    if (!m) continue;

    const extracted = pattern.extract(m);
    const name = cleanName(extracted.name);

    if (!name || name.length < 2) continue;
    if (name.length > 80) {
      return {
        line: trimmed,
        lineNumber,
        reason: "Team name too long (max 80 characters)",
      };
    }

    // Extract [TAG] if present at start
    let finalName = name;
    let tag: string | undefined;
    const tagMatch = name.match(/^\[([A-Za-z0-9]{1,6})\]\s*(.+)$/);
    if (tagMatch) {
      tag = tagMatch[1];
      finalName = tagMatch[2].trim();
    }

    // Validate seed
    const seed = extracted.seed;
    if (seed !== undefined && (seed < 1 || seed > 500)) {
      return {
        line: trimmed,
        lineNumber,
        reason: `Invalid slot number: ${seed}`,
      };
    }

    return {
      name: finalName,
      tag,
      seed,
      raw: trimmed,
      lineNumber,
    };
  }

  // Line had content but matched nothing
  return {
    line: trimmed,
    lineNumber,
    reason: "Could not parse team name from this line",
  };
}

// ============================================================
// NORMALIZE — for duplicate detection
// ============================================================

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function fuzzyMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return true;
  if (na.length < 3 || nb.length < 3) return false;
  // One contains the other
  if (na.includes(nb) || nb.includes(na)) {
    const shorter = Math.min(na.length, nb.length);
    const longer = Math.max(na.length, nb.length);
    return shorter / longer >= 0.8;
  }
  return false;
}

// ============================================================
// MAIN PARSER
// ============================================================

export function parseTeamImport(
  rawText: string,
  existingTeamNames: string[] = [],
  currentTeamCount: number = 0,
  maxTeams: number = 64
): TeamImportPreview {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.replace(/\u200B|\u200C|\u200D|\uFEFF/g, ""));

  const valid: ParsedTeam[] = [];
  const duplicatesWithinImport: ParsedTeam[] = [];
  const duplicatesWithExisting: DuplicateTeam[] = [];
  const invalid: ImportIssue[] = [];

  const seenNormalized = new Set<string>();

  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    const result = parseLine(line, lineNumber);

    if (result === null) {
      // Noise line — skip silently
      return;
    }

    if ("reason" in result) {
      // Import issue
      invalid.push(result);
      return;
    }

    // Valid parse — check duplicates
    const normalized = normalizeName(result.name);

    // Check duplicate within this import
    if (seenNormalized.has(normalized)) {
      duplicatesWithinImport.push(result);
      return;
    }

    // Check against existing teams
    const existingMatch = existingTeamNames.find(
      (existing) =>
        normalizeName(existing) === normalized ||
        fuzzyMatch(existing, result.name)
    );

    if (existingMatch) {
      duplicatesWithExisting.push({
        parsed: result,
        existingName: existingMatch,
        type:
          normalizeName(existingMatch) === normalized ? "exact" : "fuzzy",
      });
      seenNormalized.add(normalized);
      return;
    }

    seenNormalized.add(normalized);
    valid.push(result);
  });

  const totalDetected =
    valid.length +
    duplicatesWithinImport.length +
    duplicatesWithExisting.length +
    invalid.length;

  const canImport = Math.max(0, maxTeams - currentTeamCount);
  const willExceed = valid.length > canImport;

  const summary = buildSummary(
    valid.length,
    duplicatesWithinImport.length,
    duplicatesWithExisting.length,
    invalid.length,
    currentTeamCount,
    maxTeams,
    canImport
  );

  return {
    valid,
    duplicatesWithinImport,
    duplicatesWithExisting,
    invalid,
    totalDetected,
    totalValid: valid.length,
    capacity: {
      current: currentTeamCount,
      max: maxTeams,
      willExceed,
      canImport,
    },
    summary,
  };
}

function buildSummary(
  valid: number,
  dupInternal: number,
  dupExisting: number,
  invalidCount: number,
  current: number,
  max: number,
  canImport: number
): string {
  const parts: string[] = [];
  parts.push(`${valid} valid`);
  if (dupInternal > 0) parts.push(`${dupInternal} duplicate within import`);
  if (dupExisting > 0) parts.push(`${dupExisting} already registered`);
  if (invalidCount > 0) parts.push(`${invalidCount} invalid`);
  if (valid > canImport) {
    parts.push(`only ${canImport} slots remaining (${current}/${max})`);
  }
  return parts.join(" · ");
}

// ============================================================
// SERVER-SIDE VALIDATION FOR BULK IMPORT API
// ============================================================

export interface BulkImportValidation {
  valid: boolean;
  teams: Array<{ name: string; tag?: string; seed?: number }>;
  errors: string[];
  warnings: string[];
}

export function validateBulkImport(
  teams: unknown[],
  existingNames: string[],
  currentCount: number,
  maxTeams: number
): BulkImportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validTeams: Array<{ name: string; tag?: string; seed?: number }> = [];

  if (!Array.isArray(teams)) {
    return { valid: false, teams: [], errors: ["Invalid input"], warnings: [] };
  }

  if (teams.length === 0) {
    return {
      valid: false,
      teams: [],
      errors: ["No teams provided"],
      warnings: [],
    };
  }

  if (teams.length > 400) {
    return {
      valid: false,
      teams: [],
      errors: ["Maximum 400 teams per import"],
      warnings: [],
    };
  }

  const remaining = maxTeams - currentCount;
  if (teams.length > remaining) {
    errors.push(
      `Import would exceed capacity. ${remaining} slots remaining (${currentCount}/${maxTeams}).`
    );
  }

  const seenNormalized = new Set<string>();

  for (let i = 0; i < teams.length; i++) {
    const t = teams[i] as any;
    const rawName =
      typeof t?.name === "string" ? t.name.trim() : null;

    if (!rawName || rawName.length < 2) {
      warnings.push(`Row ${i + 1}: skipped (empty or too short name)`);
      continue;
    }

    if (rawName.length > 80) {
      warnings.push(`Row ${i + 1}: "${rawName.slice(0, 20)}..." skipped (name too long)`);
      continue;
    }

    const normalized = normalizeName(rawName);

    if (seenNormalized.has(normalized)) {
      warnings.push(`Row ${i + 1}: "${rawName}" skipped (duplicate in this import)`);
      continue;
    }

    const existingMatch = existingNames.find(
      (e) =>
        normalizeName(e) === normalized || fuzzyMatch(e, rawName)
    );
    if (existingMatch) {
      warnings.push(
        `Row ${i + 1}: "${rawName}" skipped (matches existing team "${existingMatch}")`
      );
      seenNormalized.add(normalized);
      continue;
    }

    seenNormalized.add(normalized);

    validTeams.push({
      name: rawName.slice(0, 80),
      tag: t?.tag
        ? String(t.tag).trim().slice(0, 6) || undefined
        : undefined,
      seed: t?.seed ? Number(t.seed) || undefined : undefined,
    });
  }

  if (errors.length === 0 && validTeams.length === 0) {
    errors.push("No valid teams to import after validation");
  }

  return {
    valid: errors.length === 0 && validTeams.length > 0,
    teams: validTeams,
    errors,
    warnings,
  };
}