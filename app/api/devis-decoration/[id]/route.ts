import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getDecorationDevis } from "@/lib/devis-decoration/db"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params

  try {
    const devis = await getDecorationDevis(id)
    if (!devis) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
    }
    return NextResponse.json({ devis })
  } catch (err: any) {
    console.error("Erreur lecture devis:", err?.message || err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
