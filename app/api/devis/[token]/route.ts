import { NextRequest, NextResponse } from "next/server"
import { getDecorationDevisByToken } from "@/lib/devis-decoration/db"

export const runtime = "nodejs"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token invalide" }, { status: 400 })
  }

  try {
    const devis = await getDecorationDevisByToken(token)
    if (!devis) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
    }

    return NextResponse.json({ devis })
  } catch (err: any) {
    console.error("Erreur lecture devis public:", err?.message || err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
