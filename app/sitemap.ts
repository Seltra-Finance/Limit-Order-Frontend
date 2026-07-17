import type { MetadataRoute } from "next";
import { allDocPages, routeForSlug } from "@/docs/navigation";
import { defaultTradePath } from "@/config/seltra.config";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const appRoutes = ["/", defaultTradePath, "/orders", "/stats"].map((route) => ({
    url: `${appUrl}${route}`,
    changeFrequency: "daily" as const,
    priority: route === "/" ? 1 : 0.8,
  }));
  const docsRoutes = allDocPages.map((page) => ({
    url: `${appUrl}${routeForSlug(page.slug)}`,
    changeFrequency: "weekly" as const,
    priority: page.slug === "" ? 0.7 : 0.5,
  }));
  return [...appRoutes, ...docsRoutes];
}
