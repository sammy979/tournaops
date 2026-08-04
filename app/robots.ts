import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tournaments/", "/register", "/login"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/overlay/"],
      },
    ],
    sitemap: "https://www.tournaops.com/sitemap.xml",
  };
}