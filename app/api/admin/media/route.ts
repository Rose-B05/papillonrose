import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getMediaLibrary } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const media = await getMediaLibrary()
    const sorted = [...media].sort(
      (a, b) => new Date(b.dateUpload).getTime() - new Date(a.dateUpload).getTime()
    )
    return NextResponse.json({ media: sorted })
  } catch (error: any) {
    console.error("Erreur media library:", error?.message || error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
