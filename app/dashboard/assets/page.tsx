import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import AssetsClient from "./AssetsClient";

export const metadata = { title: "Assets — TournaOps" };

export default async function AssetsPage() {
  const user = await requireServerUser();

  const assets = await prisma.asset.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, url: true, type: true, size: true, createdAt: true },
  });

  return <AssetsClient assets={assets} />;
}