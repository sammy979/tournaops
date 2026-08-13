import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import BrandingClient from "./BrandingClient";

export const metadata = { title: "Branding — TournaOps" };

export default async function BrandingPage() {
  const user = await requireServerUser();

  const tournaments = await prisma.tournament.findMany({
    where: { userId: user.id },
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