import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getSiteMode, setSiteMode } from "@/lib/db"
import type { SiteMode } from "@/lib/db"
import {
  PAGE_DEFINITIONS,
  calculateSeoScore,
  generateAlerts,
  getIndexationStats,
  generateRobotsContent,
  generateSitemapInfo,
  runSecurityChecks,
  addSeoHistoryEntry,
} from "@/lib/seo-center"

export const runtime = "nodejs"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const mode = await getSiteMode()
    const pages = PAGE_DEFINITIONS.map((p) => ({
      ...p,
      statusCode: 200,
      lastCrawl: new Date().toISOString(),
    }))
    const alerts = generateAlerts(mode, pages, SITE_URL)
    const score = calculateSeoScore(mode, pages, alerts, SITE_URL)
    const indexation = getIndexationStats(mode, pages)
    const robotsInfo = generateRobotsContent(mode)
    const sitemapInfo = generateSitemapInfo(mode)
    const securityChecks = await runSecurityChecks()

    return NextResponse.json({
      mode,
      score,
      alerts,
      indexation,
      robots: robotsInfo,
      sitemap: sitemapInfo,
      security: securityChecks,
      pages,
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { mode } = (await request.json()) as { mode: SiteMode }

    if (mode !== "development" && mode !== "production") {
      return NextResponse.json({ error: "Mode invalide" }, { status: 400 })
    }

    // Security pre-flight before production
    if (mode === "production") {
      const checks = await runSecurityChecks()
      const blocking = checks.filter((c) => !c.passed)
      if (blocking.length > 0) {
        return NextResponse.json(
          {
            error: "Vérifications de sécurité échouées",
            blocking: blocking.map((c) => ({ label: c.label, message: c.message })),
          },
          { status: 400 }
        )
      }
    }

    const oldMode = await getSiteMode()
    await setSiteMode(mode)

    await addSeoHistoryEntry({
      user: session.value.split("@")[0] || "admin",
      action: `Passage en mode ${mode === "production" ? "Production" : "Développement"}`,
      result: mode === "production" ? "Site indexé" : "Site masqué",
      rollbackAvailable: true,
    })

    return NextResponse.json({ success: true, mode })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
