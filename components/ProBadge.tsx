"use client";
import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import Link from "next/link";

export default function ProBadge() {
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/payments/status")
      .then((r) => {
        if (!r.ok) return { isPro: false };
        return r.json();
      })
      .then((d) => setIsPro(d?.isPro || false))
      .catch(() => setIsPro(false));
  }, []);

  if (isPro === null) return null;

  if (isPro) {
    return (
      <div className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-bold">
        <Crown className="w-3 h-3" />
        PRO
      </div>
    );
  }

  return (
    <Link
      href="/dashboard/upgrade"
      className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
    >
      <Crown className="w-3 h-3" />
      Upgrade
    </Link>
  );
}