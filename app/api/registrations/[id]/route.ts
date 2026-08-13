import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params?.id;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    const regId = id.trim();

    const registration = await prisma.registration.findUnique({
      where: { id: regId },
      include: {
        tournament: { select: { organizerId: true } },
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.tournament.organizerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { status } = body as Record<string, unknown>;

    const VALID_STATUSES = ["APPROVED", "REJECTED", "WAITLISTED", "PENDING"];
    if (!status || !VALID_STATUSES.includes(String(status))) {
      return NextResponse.json(
        { error: "status must be one of: APPROVED, REJECTED, WAITLISTED, PENDING" },
        { status: 400 }
      );
    }

    const updated = await prisma.registration.update({
      where: { id: regId },
      data: { status: String(status) as "APPROVED" | "REJECTED" | "WAITLISTED" | "PENDING" },
    });

    return NextResponse.json({ success: true, registration: updated });
  } catch (error) {
    console.error("[PATCH /api/registrations/[id]] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}