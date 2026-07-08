import { NextResponse } from "next/server"
import { getBookings } from "@/lib/db"
import { produits } from "@/data/produits"
import type { Booking } from "@/lib/types"

interface ProductStat {
  productId: number
  nom: string
  categorie: string
  stock: number
  nbLocations: number
  revenuTotal: number
}

export async function GET() {
  const bookings = await getBookings()

  // Count rentals per product across confirmed/returned bookings
  const statsMap = new Map<number, { nbLocations: number; revenuTotal: number }>()

  for (const booking of bookings) {
    if (booking.status === "cancelled" || booking.status === "pending-quote") continue

    for (const item of booking.items) {
      const product = produits.find((p) => p.id === item.productId)
      if (!product) continue

      const prixUnitaire =
        typeof product.prix === "number"
          ? product.prix
          : parseFloat(String(product.prix).replace(/[^\d.]/g, "")) || 0

      const existing = statsMap.get(item.productId) || { nbLocations: 0, revenuTotal: 0 }
      existing.nbLocations += item.qty
      existing.revenuTotal += prixUnitaire * item.qty
      statsMap.set(item.productId, existing)
    }
  }

  const stats: ProductStat[] = produits
    .filter((p) => p.actif !== false)
    .map((p) => {
      const s = statsMap.get(p.id) || { nbLocations: 0, revenuTotal: 0 }
      return {
        productId: p.id,
        nom: p.nom,
        categorie: p.categorie,
        stock: p.stock,
        nbLocations: s.nbLocations,
        revenuTotal: Math.round(s.revenuTotal * 100) / 100,
      }
    })
    .sort((a, b) => b.nbLocations - a.nbLocations)

  return NextResponse.json({ stats })
}
