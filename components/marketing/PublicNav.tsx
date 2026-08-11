"use client";
import SiteHeader from "@/components/ui/SiteHeader";

export default function PublicNav({ session }: { session?: any }) {
  return <SiteHeader session={session} />;
}