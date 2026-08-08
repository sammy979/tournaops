import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.tournaops.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic tournament pages — only public ones
  let tournamentPages: MetadataRoute.Sitemap = [];
  try {
    const tournaments = await prisma.tournament.findMany({
      where: { isPublic: true },
      select: {
        slug: true,
        updatedAt: true,
        status: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });

    tournamentPages = tournaments.flatMap((t) => {
      const base_url = `${base}/tournaments/${t.slug}`;
      const lastMod = t.updatedAt ?? new Date();
      const isLive = t.status === "live";
      const isCompleted = t.status === "completed";

      const pages: MetadataRoute.Sitemap = [
        {
          url: base_url,
          lastModified: lastMod,
          changeFrequency: isLive ? "always" : isCompleted ? "weekly" : "daily",
          priority: isLive ? 0.9 : isCompleted ? 0.7 : 0.6,
        },
      ];

      if (isLive || isCompleted) {
        pages.push({
          url: `${base_url}/results`,
          lastModified: lastMod,
          changeFrequency: isLive ? "always" : "weekly",
          priority: isLive ? 0.85 : 0.65,
        });
      }

      if (isCompleted) {
        pages.push({
          url: `${base_url}/report`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }

      return pages;
    });
  } catch (err) {
    console.error("[SITEMAP] Failed to load tournaments:", err);
  }

  return [...staticPages, ...tournamentPages];
}