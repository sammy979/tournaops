import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { logError } from "@/lib/logger";

// GET pending imports — requires auth
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const pendingImports = await prisma.discordImport.findMany({
      where: { status: "pending" },
      orderBy: { receivedAt: "desc" },
      select: {
        id: true,
        discordMessageId: true,
        discordChannelName: true,
        discordGuildName: true,
        discordUsername: true,
        messageContent: true,
        parseResult: true,
        status: true,
        receivedAt: true,
        tournamentId: true,
      },
      take: 50,
    });

    return NextResponse.json({
      pendingImports,
      count: pendingImports.length,
    });
  } catch (err) {
    logError(err, "DISCORD_PENDING_GET");
    return NextResponse.json({ error: "Failed to load pending imports" }, { status: 500 });
  }
}

// DELETE pending import — requires auth
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id || typeof id !== "string" || id.length < 8) {
      return NextResponse.json({ error: "Valid import ID required" }, { status: 400 });
    }

    // Verify import exists before deleting
    const existing = await prisma.discordImport.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Import not found" }, { status: 404 });
    }

    await prisma.discordImport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "DISCORD_PENDING_DELETE");
    return NextResponse.json({ error: "Failed to delete import" }, { status: 500 });
  }
}
