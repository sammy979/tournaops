import type { Tournament } from "@/types/tournament";

const STORAGE_KEY = "twp_tournaments";

export function saveTournament(t: Tournament): void {
  if (typeof window === "undefined") return;
  const all = getAllTournaments();
  const idx = all.findIndex(x => x.id === t.id);
  if (idx >= 0) {
    all[idx] = { ...t, updatedAt: new Date().toISOString() };
  } else {
    all.push(t);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getTournament(id: string): Tournament | null {
  if (typeof window === "undefined") return null;
  const all = getAllTournaments();
  return all.find(t => t.id === id) || null;
}

export function getAllTournaments(): Tournament[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteTournament(id: string): void {
  if (typeof window === "undefined") return;
  const all = getAllTournaments().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}