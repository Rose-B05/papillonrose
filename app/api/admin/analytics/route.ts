import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getVercelAnalytics } from "@/lib/vercel-analytics"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const period = request.nextUrl.searchParams.get("period") || "30"

  try {
    const data = await getVercelAnalytics(period)

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, max-age=0, s-maxage=3600, stale-while-revalidate=3600",
      },
    })
  } catch (error: any) {
    console.error("Erreur Vercel Analytics:", error?.message || error)
    return NextResponse.json(
      {
        error: "Impossible de récupérer les données analytics.",
        details: error?.message || "Erreur inconnue",
      },
      { status: 502 }
    )
  }
}
