import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getSiteMode } from "@/lib/db"
import {
  PAGE_DEFINITIONS,
  calculateSeoScore,
  generateAlerts,
  generateRobotsContent,
  generateSitemapInfo,
  runSecurityChecks,
  generateReport,
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
    const url = new URL(request.url)
    const format = url.searchParams.get("format") || "json"

    const mode = await getSiteMode()
    const pages = PAGE_DEFINITIONS.map((p) => ({
      ...p,
      statusCode: 200,
      lastCrawl: new Date().toISOString(),
    }))
    const alerts = generateAlerts(mode, pages, SITE_URL)
    const score = calculateSeoScore(mode, pages, alerts, SITE_URL)
    const robotsInfo = generateRobotsContent(mode)
    const sitemapInfo = generateSitemapInfo(mode)
    const securityChecks = await runSecurityChecks()

    const report = generateReport(mode, pages, alerts, score, robotsInfo, sitemapInfo, securityChecks)

    await addSeoHistoryEntry({
      user: session.value.split("@")[0] || "admin",
      action: `Export rapport SEO (${format})`,
      result: "Rapport généré",
      rollbackAvailable: false,
    })

    if (format === "csv") {
      const rows = [
        ["Catégorie", "Type", "Message", "Page"],
        ...alerts.map((a) => [a.category, a.type, a.message, a.page || "—"]),
      ]
      const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="rapport-seo-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    if (format === "json") {
      return NextResponse.json(report, {
        headers: {
          "Content-Disposition": `attachment; filename="rapport-seo-${new Date().toISOString().split("T")[0]}.json"`,
        },
      })
    }

    return NextResponse.json(report)
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
