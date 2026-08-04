// ============================================================
// lib/storage.ts — DEPRECATED
// This file previously used localStorage for tournament storage.
// All tournament data now lives in PostgreSQL via Prisma.
// Use /api/tournaments endpoints instead.
// This file is kept only for backwards compatibility.
// ============================================================

import type { Tournament } from "@/types/tournament";

// These functions are no-ops — data is now in the database
export function saveTournament(_t: Tournament): void {
  if (process.env.NODE_ENV === "development") {
    console.warn("[storage.ts] saveTournament is deprecated. Use /api/tournaments instead.");
  }
}

export function getTournament(_id: string): Tournament | null {
  if (process.env.NODE_ENV === "development") {
    console.warn("[storage.ts] getTournament is deprecated. Use /api/tournaments/[id] instead.");
  }
  return null;
}

export function getAllTournaments(): Tournament[] {
  if (process.env.NODE_ENV === "development") {
    console.warn("[storage.ts] getAllTournaments is deprecated. Use /api/tournaments instead.");
  }
  return [];
}

export function deleteTournament(_id: string): void {
  if (process.env.NODE_ENV === "development") {
    console.warn("[storage.ts] deleteTournament is deprecated. Use DELETE /api/tournaments/[id] instead.");
  }
}