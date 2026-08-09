// lib/env-validation.ts
// Reports presence/absence of env vars — NEVER prints actual values

interface EnvCheck {
  key: string;
  required: boolean;
  description: string;
}

const ENV_CHECKS: EnvCheck[] = [
  { key: "DATABASE_URL",          required: true,  description: "PostgreSQL connection string" },
  { key: "JWT_SECRET",            required: true,  description: "JWT signing secret" },
  { key: "RESEND_API_KEY",        required: false, description: "Email delivery (Resend)" },
  { key: "BLOB_READ_WRITE_TOKEN", required: false, description: "Vercel Blob storage" },
  { key: "GROQ_API_KEY",          required: false, description: "Groq AI API" },
  { key: "TOURNAOPS_API_SECRET",  required: false, description: "Discord bot incoming webhook auth" },
  { key: "DODO_API_KEY",          required: false, description: "Dodo Payments" },
];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  configured: string[];
  report: Record<string, "configured" | "missing" | "optional-missing">;
}

export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const configured: string[] = [];
  const report: Record<string, "configured" | "missing" | "optional-missing"> = {};

  for (const check of ENV_CHECKS) {
    const value = process.env[check.key];
    const isPresent = !!value && value.length > 0;

    if (isPresent) {
      configured.push(check.key);
      report[check.key] = "configured";
    } else if (check.required) {
      missing.push(check.key);
      report[check.key] = "missing";
    } else {
      report[check.key] = "optional-missing";
    }
  }

  return { valid: missing.length === 0, missing, configured, report };
}

export function logEnvironmentStatus(): void {
  const result = validateEnvironment();

  if (result.missing.length > 0) {
    console.error(
      "[ENV] MISSING REQUIRED ENVIRONMENT VARIABLES:",
      result.missing.join(", ")
    );
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required environment variables: ${result.missing.join(", ")}`
      );
    }
  }

  const optionalMissing = Object.entries(result.report)
    .filter(([, v]) => v === "optional-missing")
    .map(([k]) => k);

  if (optionalMissing.length > 0) {
    console.warn("[ENV] Optional features not configured:", optionalMissing.join(", "));
  }

  if (result.configured.length > 0) {
    console.info("[ENV] Configured:", result.configured.join(", "));
  }
}