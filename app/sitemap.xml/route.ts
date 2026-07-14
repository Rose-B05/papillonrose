import { NextResponse } from "next/server"
import { getSiteMode } from "@/lib/db"
import { produits } from "@/data/produits"
import {
  CATEGORIES,
  getCategorySlug,
  getProductSlug,
  getActiveProducts,
} from "@/lib/product-helpers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export async function GET() {
  const mode = await getSiteMode()

  if (mode === "development") {
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

  // production + seo_audit → sitemap complet

  const staticPages = [
    "",
    "/a-propos",
    "/conditions-location",
    "/faq",
    "/mentions-legales",
    "/reservation",
    "/catalogue",
    "/contact",
  ]

  const staticUrls = staticPages
    .map(
      (path) => `  <url>
    <loc>${SITE_URL}${path}/</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === "" ? "1.0" : "0.7"}</priority>
  </url>`
    )
    .join("\n")

  const categoryUrls = CATEGORIES.map((cat) => {
    const slug = getCategorySlug(cat)
    return `  <url>
    <loc>${SITE_URL}/categorie/${slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }).join("\n")

  const productUrls = getActiveProducts()
    .map((p) => {
      const slug = getProductSlug(p)
      return `  <url>
    <loc>${SITE_URL}/produit/${slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${categoryUrls}
${productUrls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
