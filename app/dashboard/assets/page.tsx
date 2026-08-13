import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AssetsClient from "./AssetsClient";

export const metadata = { title: "Assets — TournaOps" };

export default async function AssetsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const assets = await prisma.asset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      url: true,
      type: true,
      size: true,
      createdAt: true,
    },
  });

  return <AssetsClient assets={assets} />;
}