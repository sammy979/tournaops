"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchCurrentUser, logoutUser, type User } from "@/lib/auth/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const u = await fetchCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = "/";
  };

  return { user, loading, logout, refresh, isLoggedIn: !!user };
}