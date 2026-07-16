import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import {
  getAdminProducts,
  getAdminProduct,
  saveAdminProduct,
  deleteAdminProduct,
  getNextAdminProductId,
  type AdminProduct,
  type AdminProductStatus,
} from "@/lib/db"

export const runtime = "nodejs"

function validateProduct(data: any): string[] {
  const errors: string[] = []
  if (!data.nom || typeof data.nom !== "string" || data.nom.trim().length === 0) {
    errors.push("Le nom du produit est requis")
  }
  if (data.prix === undefined || data.prix === null || data.prix === "") {
    errors.push("Le prix est requis")
  }
  if (!data.categorie || typeof data.categorie !== "string" || data.categorie.trim().length === 0) {
    errors.push("La catégorie est requise")
  }
  if (data.nom && data.nom.length > 200) {
    errors.push("Le nom ne doit pas dépasser 200 caractères")
  }
  return errors
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get("id")
  if (id) {
    const product = await getAdminProduct(Number(id))
    if (!product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
    }
    return NextResponse.json({ product })
  }

  const products = await getAdminProducts()
  const sorted = [...products].sort(
    (a, b) => new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime()
  )
  return NextResponse.json({ products: sorted })
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const errors = validateProduct(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation échouée", details: errors }, { status: 400 })
    }

    const id = body.id || await getNextAdminProductId()
    const now = new Date().toISOString()

    const product: AdminProduct = {
      id,
      nom: body.nom.trim(),
      categorie: body.categorie,
      stock: body.pieceUnique ? 1 : (body.stock || 1),
      dimension: body.dimension || undefined,
      prix: body.prix,
      image: body.image || "",
      gallerie: body.gallerie || [],
      description: body.description || undefined,
      pieceUnique: body.pieceUnique || false,
      tagsThemes: body.tagsThemes || [],
      tagsCouleurs: body.tagsCouleurs || [],
      status: body.status || "brouillon",
      dateCreation: body.dateCreation || now,
      dateModification: now,
    }

    await saveAdminProduct(product)

    return NextResponse.json({ product, message: "Produit enregistré" })
  } catch (error: any) {
    console.error("Erreur sauvegarde produit:", error?.message || error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ error: "ID produit requis" }, { status: 400 })
    }

    const existing = await getAdminProduct(body.id)
    if (!existing) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
    }

    const errors = validateProduct(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation échouée", details: errors }, { status: 400 })
    }

    const now = new Date().toISOString()
    const product: AdminProduct = {
      ...existing,
      nom: body.nom.trim(),
      categorie: body.categorie,
      stock: body.pieceUnique ? 1 : (body.stock || 1),
      dimension: body.dimension || undefined,
      prix: body.prix,
      image: body.image || existing.image,
      gallerie: body.gallerie || existing.gallerie,
      description: body.description || undefined,
      pieceUnique: body.pieceUnique || false,
      tagsThemes: body.tagsThemes || [],
      tagsCouleurs: body.tagsCouleurs || [],
      status: body.status || existing.status,
      dateModification: now,
    }

    await saveAdminProduct(product)

    return NextResponse.json({ product, message: "Produit mis à jour" })
  } catch (error: any) {
    console.error("Erreur mise à jour produit:", error?.message || error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID produit requis" }, { status: 400 })
  }

  await deleteAdminProduct(Number(id))
  return NextResponse.json({ message: "Produit supprimé" })
}
