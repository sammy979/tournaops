import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";
import { logError } from "@/lib/logger";

export async function POST() {
  try {
    await clearSession();
  } catch (err) {
    logError(err, "AUTH_LOGOUT");
    // Still return success — client should clear local state
  }
  return NextResponse.json({ success: true });
}
