import { NextResponse } from "next/server"
import { getSiteMode } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export async function GET() {
  const mode = await getSiteMode()

  if (mode !== "production") {
    // Empty sitemap in development mode
    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`
    return new NextResponse(empty, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    })
  }

  const staticPages = [
    "",
    "/a-propos",
    "/conditions-location",
    "/faq",
    "/mentions-legales",
    "/reservation",
  ]

  const urls = staticPages
    .map(
      (path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === "" ? "1.0" : "0.7"}</priority>
  </url>`
    )
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
