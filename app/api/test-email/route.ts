import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  if (!to) return NextResponse.json({ error: "Add ?to=your@email.com" }, { status: 400 });
  const ok = await sendWelcomeEmail(to, "TestUser");
  return NextResponse.json({ sent: ok, to, resendKeyPresent: !!process.env.RESEND_API_KEY });
}