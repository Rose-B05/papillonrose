import { NextResponse } from "next/server"
import { getSiteMode } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const mode = await getSiteMode()

  if (mode === "production") {
    const body = `User-agent: *
Allow: /

Sitemap: https://www.papillonrose.fr/sitemap.xml
`
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  }

  // Development / préproduction — block all crawling
  const body = `User-agent: *
Disallow: /
`
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  })
}
