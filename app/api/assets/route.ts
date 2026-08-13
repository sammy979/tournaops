import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const assets = await prisma.asset.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ assets });
  } catch (error) {
    console.error("[GET /api/assets]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") return NextResponse.json({ error: "Empty body" }, { status: 400 });
      body = JSON.parse(text);
    } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { name, url, type } = body as Record<string, unknown>;
    if (!name || typeof name !== "string" || name.trim() === "") return NextResponse.json({ error: "name required" }, { status: 400 });
    if (!url || typeof url !== "string" || url.trim() === "") return NextResponse.json({ error: "url required" }, { status: 400 });

    const VALID_TYPES = ["IMAGE", "LOGO", "BANNER", "PHOTO", "OTHER"];
    const assetType = type && VALID_TYPES.includes(String(type)) ? String(type) : "IMAGE";

    const asset = await prisma.asset.create({
      data: { userId: user.id, name: name.trim(), url: url.trim(), type: assetType },
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/assets]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}