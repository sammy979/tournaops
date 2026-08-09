import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, getRateLimitHeaders } from "@/lib/rate-limit";

// Try to import Vercel Blob, fall back if not configured
let blobPut: any = null;
try {
  const blob = require("@vercel/blob");
  blobPut = blob.put;
} catch (e) {}

// Allowed MIME types only — SVG excluded (stored XSS via embedded <script>)
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Allowed type prefixes — prevent path traversal via type parameter
const ALLOWED_PREFIXES = new Set(["logo", "banner", "avatar", "branding", "team", "misc", "trophy", "sponsor"]);

const UPLOAD_RATE = { windowMs: 60 * 1000, maxRequests: 20 };

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit per user+IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(`upload:${session.userId}:${ip}`, UPLOAD_RATE);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait before trying again." },
      { status: 429, headers: getRateLimitHeaders(rl, UPLOAD_RATE) }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const rawType = String(formData.get("type") || "misc").toLowerCase().trim();

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate and sanitize type prefix — never trust client input for path construction
    const safePrefix = ALLOWED_PREFIXES.has(rawType) ? rawType : "misc";

    // Validate MIME type against allowlist — never trust file.name extension
    const ext = ALLOWED_MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // Size limit — 2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum 2MB.` },
        { status: 400 }
      );
    }

    // Build safe filename — never use user-supplied filename or extension
    const timestamp = Date.now();
    const safeUserId = session.userId.replace(/[^a-zA-Z0-9-]/g, "").substring(0, 40);
    const filename = `${safePrefix}/${safeUserId}/${timestamp}.${ext}`;

    // Try Vercel Blob
    if (blobPut && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await blobPut(filename, file, { access: "public", addRandomSuffix: false });
        return NextResponse.json({ url: blob.url, method: "vercel-blob", size: file.size });
      } catch (blobError: any) {
        console.error("[UPLOAD] Vercel Blob failed:", blobError?.message);
      }
    }

    // Fallback: base64 (small files only)
    if (file.size > 500 * 1024) {
      return NextResponse.json(
        { error: "File too large for fallback storage (max 500KB). Configure BLOB_READ_WRITE_TOKEN in Vercel." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return NextResponse.json({
      url: `data:${file.type};base64,${base64}`,
      method: "base64",
      size: file.size,
      warning: "Using base64 fallback. Configure BLOB_READ_WRITE_TOKEN for production use.",
    });
  } catch (error: any) {
    console.error("[UPLOAD] Error:", error?.message);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}