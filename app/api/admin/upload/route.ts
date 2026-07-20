import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { COOKIE_NAME } from "@/lib/auth"
import { saveMediaItem } from "@/lib/db"

export const runtime = "nodejs"
export const maxDuration = 60

async function verifyBlobUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" })
    return res.ok
  } catch {
    return false
  }
}

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

    const isVideo = file.type.startsWith("video/")
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const label = isVideo ? "50 Mo" : "10 Mo"
      return NextResponse.json({ error: `Fichier trop volumineux (max ${label})` }, { status: 400 })
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska",
    ]
    if (!allowedTypes.includes(file.type)) {
      const supported = "JPEG, PNG, WebP, GIF · MP4, WebM, MOV, AVI, MKV"
      return NextResponse.json(
        { error: `Type de fichier non supporté (${supported})` },
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

    const reachable = await verifyBlobUrl(blob.url)
    if (!reachable) {
      return NextResponse.json(
        { error: "Upload terminé mais l'image n'est pas accessible publiquement. Réessayez." },
        { status: 500 }
      )
    }

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
