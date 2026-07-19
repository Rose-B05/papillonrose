import { NextRequest, NextResponse } from "next/server"
import { getDevis, saveDevis, deleteDevis } from "@/lib/devis/db"
import { COOKIE_NAME } from "@/lib/auth"

// GET — single devis
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const all = await getDevis()
  const devis = all.find((d) => d.id === params.id)
  if (!devis) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
  }
  return NextResponse.json({ devis })
}

// DELETE — delete devis
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  await deleteDevis(params.id)
  return NextResponse.json({ ok: true })
}

// PATCH — update status only
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await request.json()
  const { statut } = body

  const all = await getDevis()
  const devis = all.find((d) => d.id === params.id)
  if (!devis) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
  }

  const now = new Date().toISOString()
  devis.statut = statut
  if (statut === "envoye") devis.envoyeLe = now
  if (statut === "accepte") devis.accepteLe = now
  if (statut === "refuse") devis.refuseLe = now

  await saveDevis(devis)
  return NextResponse.json({ devis })
}
