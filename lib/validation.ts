// ============================================================
// lib/validation.ts
// Input validation utilities for TournaOps API routes
// ============================================================

// ============================================================
// TYPES
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================
// STRING VALIDATORS
// ============================================================

export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function validatePassword(password: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof password !== "string") {
    return { valid: false, errors: ["Password must be a string"] };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  return { valid: errors.length === 0, errors };
}

export function validateUsername(username: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof username !== "string") {
    return { valid: false, errors: ["Username must be a string"] };
  }

  if (username.length < 3) {
    errors.push("Username must be at least 3 characters");
  }
  if (username.length > 30) {
    errors.push("Username must be less than 30 characters");
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, underscores, and hyphens");
  }

  return { valid: errors.length === 0, errors };
}

export function validateString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): ValidationResult {
  const errors: string[] = [];
  const { minLength = 1, maxLength = 1000, required = true } = options;

  if (value === null || value === undefined || value === "") {
    if (required) {
      errors.push(`${fieldName} is required`);
    }
    return { valid: !required, errors };
  }

  if (typeof value !== "string") {
    return { valid: false, errors: [`${fieldName} must be a string`] };
  }

  if (value.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters`);
  }
  if (value.length > maxLength) {
    errors.push(`${fieldName} must be less than ${maxLength} characters`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// NUMBER VALIDATORS
// ============================================================

export function validateNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; integer?: boolean } = {}
): ValidationResult {
  const errors: string[] = [];
  const { min, max, integer = false } = options;

  if (value === null || value === undefined) {
    return { valid: false, errors: [`${fieldName} is required`] };
  }

  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, errors: [`${fieldName} must be a number`] };
  }

  if (integer && !Number.isInteger(num)) {
    errors.push(`${fieldName} must be a whole number`);
  }
  if (min !== undefined && num < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }
  if (max !== undefined && num > max) {
    errors.push(`${fieldName} must be at most ${max}`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// TOURNAMENT VALIDATORS
// ============================================================

export function validateTournamentInput(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Name
  const nameResult = validateString(data.name, "Tournament name", { maxLength: 100 });
  errors.push(...nameResult.errors);

  // Description
  if (data.description !== undefined) {
    const descResult = validateString(data.description, "Description", {
      required: false,
      maxLength: 2000,
    });
    errors.push(...descResult.errors);
  }

  // Max teams
  if (data.maxTeams !== undefined) {
    const teamsResult = validateNumber(data.maxTeams, "Max teams", {
      min: 2,
      max: 400,
      integer: true,
    });
    errors.push(...teamsResult.errors);
  }

  // Squad size
  if (data.squadSize !== undefined) {
    const validSizes = [1, 2, 4];
    if (!validSizes.includes(Number(data.squadSize))) {
      errors.push("Squad size must be 1 (Solo), 2 (Duo), or 4 (Squad)");
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// TEAM VALIDATORS
// ============================================================

export function validateTeamInput(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  const nameResult = validateString(data.name, "Team name", { maxLength: 50 });
  errors.push(...nameResult.errors);

  if (data.tag !== undefined && data.tag !== "") {
    const tagResult = validateString(data.tag, "Team tag", {
      required: false,
      maxLength: 5,
    });
    errors.push(...tagResult.errors);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// MATCH RESULT VALIDATORS
// ============================================================

export function validateMatchResult(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!data.teamId) {
    errors.push("Team ID is required");
  }

  const placementResult = validateNumber(data.placement, "Placement", {
    min: 1,
    max: 100,
    integer: true,
  });
  errors.push(...placementResult.errors);

  const killsResult = validateNumber(data.kills, "Kills", {
    min: 0,
    max: 99,
    integer: true,
  });
  errors.push(...killsResult.errors);

  return { valid: errors.length === 0, errors };
}

// ============================================================
// SANITIZE — Strip dangerous HTML
// ============================================================

export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

// ============================================================
// SLUG VALIDATOR
// ============================================================

export function validateSlug(slug: unknown): boolean {
  if (typeof slug !== "string") return false;
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 100;
}

// ============================================================
// ID VALIDATOR — Prevent IDOR via malformed IDs
// ============================================================

export function validateId(id: unknown): boolean {
  if (typeof id !== "string") return false;
  // Cuid2 or UUID format
  return /^[a-zA-Z0-9_-]{8,}$/.test(id);
}

// ============================================================
// COLLECT ALL ERRORS INTO RESPONSE FORMAT
// ============================================================

export function combineValidationResults(results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap((r) => r.errors);
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}
