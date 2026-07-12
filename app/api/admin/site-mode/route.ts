import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getSiteMode, setSiteMode } from "@/lib/db"
import type { SiteMode } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const mode = await getSiteMode()
  return NextResponse.json({ mode })
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { mode } = (await request.json()) as { mode: SiteMode }

    if (mode !== "development" && mode !== "production") {
      return NextResponse.json({ error: "Mode invalide. Utilisez 'development' ou 'production'." }, { status: 400 })
    }

    await setSiteMode(mode)

    return NextResponse.json({ success: true, mode })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
