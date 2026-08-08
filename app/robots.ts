import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/overlay/",
        ],
      },
    ],
    sitemap: "https://www.tournaops.com/sitemap.xml",
    host: "https://www.tournaops.com",
  };
}