import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BrandingClient from "./BrandingClient";

export const metadata = { title: "Branding — TournaOps" };

export default async function BrandingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const tournaments = await prisma.tournament.findMany({
    where: { organizerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      game: true,
      status: true,
      logoUrl: true,
      bannerUrl: true,
      primaryColor: true,
      overlayTheme: true,
    },
  });

  return <BrandingClient tournaments={tournaments} />;
}