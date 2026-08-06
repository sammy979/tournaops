import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

// Try to import Vercel Blob, fall back if not configured
let blobPut: any = null;
try {
  const blob = require("@vercel/blob");
  blobPut = blob.put;
} catch (e) {}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "misc";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Size limit — 2MB max
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ 
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 2MB.` 
      }, { status: 400 });
    }

    // Type validation
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use PNG, JPG, WebP, or SVG" }, { status: 400 });
    }

    // Try Vercel Blob first (if token exists)
    if (blobPut && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const timestamp = Date.now();
        const ext = file.name.split(".").pop() || "png";
        const filename = `${type}/${session.userId}/${timestamp}.${ext}`;

        const blob = await blobPut(filename, file, {
          access: "public",
          addRandomSuffix: false,
        });

        return NextResponse.json({
          url: blob.url,
          method: "vercel-blob",
          size: file.size,
        });
      } catch (blobError: any) {
        console.error("Vercel Blob failed, using base64:", blobError.message);
      }
    }

    // Fallback: base64 (only for small files)
    if (file.size > 500 * 1024) {
      return NextResponse.json({ 
        error: "File too large for base64 storage. Configure Vercel Blob for larger files (max 500KB currently)." 
      }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    return NextResponse.json({
      url: dataUrl,
      method: "base64",
      size: file.size,
      warning: "Using base64 fallback - configure BLOB_READ_WRITE_TOKEN in Vercel for better performance",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: error?.message || "Upload failed",
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};