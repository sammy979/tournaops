import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const { name, description, killPoints, placementPoints } = body as Record<string, unknown>;
    if (!name || typeof name !== "string" || name.trim() === "") return NextResponse.json({ error: "name required" }, { status: 400 });

    const scoringRule = {
      killPoints: killPoints !== undefined ? Number(killPoints) : 1,
      placementPoints: placementPoints || [],
    };

    const preset = await prisma.userScoringPreset.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description ? String(description).trim() : null,
        scoringRule,
      },
    });

    return NextResponse.json({ success: true, preset }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/scoring-presets]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}