"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, logoutUser, type User } from "@/lib/auth/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);

    // Listen for storage changes (multi-tab)
    const handleStorage = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
    window.location.href = "/";
  };

  const refresh = () => {
    setUser(getCurrentUser());
  };

  return { user, loading, logout, refresh, isLoggedIn: !!user };
}