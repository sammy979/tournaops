import { NextRequest, NextResponse } from "next/server";

const pendingImports: Map<string, any> = (globalThis as any).__pendingImports || new Map();
(globalThis as any).__pendingImports = pendingImports;

export async function GET() {
  const list = Array.from(pendingImports.values())
    .filter(i => i.status === "pending")
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, 50);

  return NextResponse.json({
    pendingImports: list,
    count: list.length,
  });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const imp = pendingImports.get(id);
  if (!imp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  pendingImports.delete(id);
  return NextResponse.json({ success: true, deletedId: id });
}