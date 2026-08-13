import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ScheduleClient from "./ScheduleClient";

export const metadata = { title: "Schedule — TournaOps" };

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tournaops_session")?.value;
  if (!token) return null;
  try {
    const { validateToken } = await import("@/lib/auth");
    const { user } = validateToken(token);
    return user;
  } catch { return null; }
}

export default async function SchedulePage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const tournaments = await prisma.tournament.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      game: true,
      status: true,
      startDate: true,
      endDate: true,
      stages: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          order: true,
        },
      },
    },
  });

  return <ScheduleClient tournaments={tournaments} userId={user.id} />;
}