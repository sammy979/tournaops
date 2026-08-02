import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pendingImports = await prisma.discordImport.findMany({
    where: { status: "pending" },
    orderBy: { receivedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    pendingImports,
    count: pendingImports.length,
  });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await prisma.discordImport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}