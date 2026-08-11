// lib/system-health/error-sanitizer.ts

const SENSITIVE_PATTERNS = [
  /password["\s]*[:=]["\s]*[^\s,}]+/gi,
  /authorization["\s]*[:=]["\s]*[^\s,}]+/gi,
  /bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,
  /jwt\s+[a-zA-Z0-9\-._~+/]+=*/gi,
  /api[_-]?key["\s]*[:=]["\s]*[^\s,}]+/gi,
  /secret["\s]*[:=]["\s]*[^\s,}]+/gi,
  /database_url["\s]*[:=]["\s]*[^\s,}]+/gi,
  /postgres:\/\/[^\s]+/gi,
  /mysql:\/\/[^\s]+/gi,
  /mongodb:\/\/[^\s]+/gi,
  /set-cookie["\s]*[:=]["\s]*[^\s,}]+/gi,
  /cookie["\s]*[:=]["\s]*[^\s,}]+/gi,
]

export function sanitizeErrorMessage(message: string): string {
  if (!message) return "Unknown error"
  let sanitized = message
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]")
  }
  return sanitized.slice(0, 2000)
}

export function sanitizeErrorMetadata(obj: Record<string, unknown>): Record<string, unknown> {
  const BLOCKED_KEYS = [
    "password", "token", "secret", "authorization", "cookie",
    "jwt", "apiKey", "api_key", "databaseUrl", "database_url",
    "connectionString", "privateKey", "clientSecret",
  ]
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()
    if (BLOCKED_KEYS.some((blocked) => lowerKey.includes(blocked))) {
      result[key] = "[REDACTED]"
    } else if (typeof value === "string") {
      result[key] = sanitizeErrorMessage(value)
    } else {
      result[key] = value
    }
  }
  return result
}
