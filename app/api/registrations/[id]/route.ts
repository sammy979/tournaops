import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    const VALID = ["PENDING", "APPROVED", "REJECTED", "WAITLIST"];
    if (!VALID.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!registration) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    if (registration.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await prisma.registration.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
    return NextResponse.json({ registration: updated });
  } catch (error) {
    console.error("PATCH /api/registrations/[id]:", error);
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!registration) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    if (registration.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.registration.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/registrations/[id]:", error);
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 });
  }
}