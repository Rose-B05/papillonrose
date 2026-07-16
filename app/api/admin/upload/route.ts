import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { COOKIE_NAME } from "@/lib/auth"
import { saveMediaItem } from "@/lib/db"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté (JPEG, PNG, WebP, GIF uniquement)" },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const blobPath = `media/${timestamp}-${safeName}`

    const blob = await put(blobPath, file, {
      access: "public",
      addRandomSuffix: false,
    })

    const mediaId = `media_${timestamp}_${Math.random().toString(36).slice(2, 8)}`
    const mediaItem = {
      id: mediaId,
      url: blob.url,
      nomFichier: file.name,
      dateUpload: new Date().toISOString(),
      utilisePar: [],
    }

    await saveMediaItem(mediaItem)

    return NextResponse.json({
      url: blob.url,
      mediaId,
      nomFichier: file.name,
    })
  } catch (error: any) {
    console.error("Erreur upload:", error?.message || error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload: " + (error?.message || "Erreur inconnue") },
      { status: 500 }
    )
  }
}
