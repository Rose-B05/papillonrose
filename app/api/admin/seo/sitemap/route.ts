import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getSiteMode } from "@/lib/db"
import { generateSitemapInfo, addSeoHistoryEntry } from "@/lib/seo-center"

export const runtime = "nodejs"

export async function GET() {
  try {
    const mode = await getSiteMode()
    const info = generateSitemapInfo(mode)
    return NextResponse.json({
      urlCount: info.urlCount,
      lastGenerated: info.lastGenerated,
      sizeBytes: info.sizeBytes,
      status: info.status,
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { action } = (await request.json()) as { action: string }
    const mode = await getSiteMode()

    if (action === "regenerate") {
      const info = generateSitemapInfo(mode)
      await addSeoHistoryEntry({
        user: session.value.split("@")[0] || "admin",
        action: "Régénération sitemap.xml",
        result: `${info.urlCount} URLs générées`,
        rollbackAvailable: false,
      })
      return NextResponse.json({ success: true, ...info })
    }

    if (action === "download") {
      const info = generateSitemapInfo(mode)
      return new NextResponse(info.content, {
        headers: {
          "Content-Type": "application/xml",
          "Content-Disposition": 'attachment; filename="sitemap.xml"',
        },
      })
    }

    if (action === "validate") {
      const info = generateSitemapInfo(mode)
      const isValid = info.status === "valid" && info.urlCount > 0
      return NextResponse.json({
        success: true,
        valid: isValid,
        message: isValid ? "Sitemap valide" : "Sitemap invalide ou vide",
      })
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
