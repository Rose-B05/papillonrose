import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getSiteMode } from "@/lib/db"
import { generateRobotsContent, addSeoHistoryEntry } from "@/lib/seo-center"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const mode = await getSiteMode()
    const info = generateRobotsContent(mode)
    return NextResponse.json(info)
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
      const info = generateRobotsContent(mode)
      await addSeoHistoryEntry({
        user: session.value.split("@")[0] || "admin",
        action: "Régénération robots.txt",
        result: "robots.txt régénéré",
        rollbackAvailable: false,
      })
      return NextResponse.json({ success: true, content: info.content })
    }

    if (action === "restore") {
      const info = generateRobotsContent(mode)
      await addSeoHistoryEntry({
        user: session.value.split("@")[0] || "admin",
        action: "Restauration robots.txt",
        result: "robots.txt restauré",
        rollbackAvailable: false,
      })
      return NextResponse.json({ success: true, content: info.content })
    }

    if (action === "download") {
      const info = generateRobotsContent(mode)
      return new NextResponse(info.content, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": 'attachment; filename="robots.txt"',
        },
      })
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
