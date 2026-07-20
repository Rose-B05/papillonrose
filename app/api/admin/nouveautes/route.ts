import { NextResponse, type NextRequest } from "next/server"
import { getNouveautes, getNouveaute, saveNouveaute, deleteNouveaute } from "@/lib/db"
import { COOKIE_NAME } from "@/lib/auth"
import type { Nouveaute } from "@/lib/types"

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)
  if (!cookie?.value) {
    console.error(`[nouveautes] Auth failed — cookie "${COOKIE_NAME}" value:`, cookie?.value ?? "(absent)")
  }
  return !!cookie?.value
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = req.nextUrl.searchParams.get("id")
  if (id) {
    const item = await getNouveaute(id)
    return NextResponse.json({ item })
  }
  const items = await getNouveautes()
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const now = new Date().toISOString()
    const item: Nouveaute = {
      id: crypto.randomUUID(),
      titre: body.titre || "",
      description: body.description || "",
      type: body.type || "image",
      statut: body.statut || "brouillon",
      mediaUrl: body.mediaUrl || "",
      mediaThumbnail: body.mediaThumbnail || "",
      lienAction: body.lienAction || "",
      labelAction: body.labelAction || "",
      ordre: body.ordre ?? 0,
      dateCreation: now,
      dateModification: now,
    }
    await saveNouveaute(item)
    return NextResponse.json({ item })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const existing = await getNouveaute(body.id)
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const updated: Nouveaute = {
      ...existing,
      titre: body.titre ?? existing.titre,
      description: body.description ?? existing.description,
      type: body.type ?? existing.type,
      statut: body.statut ?? existing.statut,
      mediaUrl: body.mediaUrl ?? existing.mediaUrl,
      mediaThumbnail: body.mediaThumbnail ?? existing.mediaThumbnail,
      lienAction: body.lienAction ?? existing.lienAction,
      labelAction: body.labelAction ?? existing.labelAction,
      ordre: body.ordre ?? existing.ordre,
      dateModification: new Date().toISOString(),
    }
    await saveNouveaute(updated)
    return NextResponse.json({ item: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  await deleteNouveaute(id)
  return NextResponse.json({ ok: true })
}
