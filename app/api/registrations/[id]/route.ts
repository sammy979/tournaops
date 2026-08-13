import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || id.trim() === "") return NextResponse.json({ error: "Registration ID required" }, { status: 400 });

    const regId = id.trim();

    const registration = await prisma.registration.findUnique({
      where: { id: regId },
      include: { tournament: { select: { userId: true } } },
    });

    if (!registration) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    if (registration.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") return NextResponse.json({ error: "Empty body" }, { status: 400 });
      body = JSON.parse(text);
    } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { status } = body as Record<string, unknown>;
    const VALID = ["APPROVED", "REJECTED", "WAITLISTED", "PENDING"];
    if (!status || !VALID.includes(String(status))) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.registration.update({ where: { id: regId }, data: { status: String(status) } });
    return NextResponse.json({ success: true, registration: updated });
  } catch (error) {
    console.error("[PATCH /api/registrations/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}