"use client";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
}

let cachedUser: User | null = null;
let cacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

export async function registerUser(
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username, displayName }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    cachedUser = data.user;
    cacheTime = Date.now();
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    cachedUser = data.user;
    cacheTime = Date.now();
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {}
  cachedUser = null;
  cacheTime = 0;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const now = Date.now();
  if (cachedUser && now - cacheTime < CACHE_TTL) return cachedUser;

  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json();
    if (data.user) {
      cachedUser = data.user;
      cacheTime = now;
      return data.user;
    }
    cachedUser = null;
    return null;
  } catch {
    return null;
  }
}

// Sync version — uses cache only (for legacy compat)
export function getCurrentUser(): User | null {
  return cachedUser;
}

export function isLoggedIn(): boolean {
  return cachedUser !== null;
}

export async function updateUser(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
  // TODO: Add PUT /api/auth/me endpoint if you want editable profile
  return { success: false, error: "Not implemented yet" };
}