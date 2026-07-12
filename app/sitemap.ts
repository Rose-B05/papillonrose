import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/a-propos",
    "/conditions-location",
    "/faq",
    "/mentions-legales",
    "/reservation",
  ]

  return staticPages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }))
}
