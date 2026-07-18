import { NextResponse } from "next/server"
import { produits, type Produit } from "@/data/produits"
import { getAdminProducts, type AdminProduct } from "@/lib/db"

export const runtime = "nodejs"

function adminToProduit(admin: AdminProduct): Produit {
  return {
    id: admin.id,
    nom: admin.nom,
    categorie: admin.categorie,
    stock: admin.stock,
    dimension: admin.dimension || "",
    prix: admin.prix,
    image: admin.image || "",
    gallerie: admin.gallerie || [],
    description: admin.description || "",
    dateAjout: admin.dateCreation || "",
    actif: true,
  } as Produit
}

export async function GET() {
  try {
    const adminProducts = await getAdminProducts()
    const adminMap = new Map<number, AdminProduct>()
    for (const ap of adminProducts) {
      if (ap.status === "publie") {
        adminMap.set(ap.id, ap)
      }
    }

    const merged: Produit[] = []

    for (const sp of produits) {
      if (sp.actif === false) continue
      const adminOverride = adminMap.get(sp.id)
      if (adminOverride) {
        if (adminOverride.status === "masque") continue
        merged.push(adminToProduit(adminOverride))
        adminMap.delete(sp.id)
      } else {
        merged.push(sp)
      }
    }

    for (const ap of adminMap.values()) {
      if (ap.status === "publie") {
        merged.push(adminToProduit(ap))
      }
    }

    return NextResponse.json({ products: merged })
  } catch (error) {
    console.error("Erreur /api/products:", error)
    return NextResponse.json(
      { products: produits.filter((p) => p.actif !== false) }
    )
  }
}
