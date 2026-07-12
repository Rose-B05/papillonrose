import { NextRequest, NextResponse } from "next/server"
import { getBooking, saveBooking, unblockDates, getLateAlertsForBooking, getStockOverride, setStockOverride } from "@/lib/db"
import { produits } from "@/data/produits"
import { COOKIE_NAME } from "@/lib/auth"

/**
 * POST /api/admin/returned
 * Marque une réservation comme rendue, incrémente le stock, et libère les dates bloquées.
 * Body: { bookingId: string }
 */
export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { bookingId } = (await request.json()) as { bookingId: string }

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId requis" }, { status: 400 })
    }

    const booking = await getBooking(bookingId)
    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
    }

    if (booking.status === "returned") {
      return NextResponse.json({ error: "Déjà marquée comme rendue" }, { status: 400 })
    }

    // Incrémenter le stock pour chaque produit restitué
    for (const item of booking.items) {
      const product = produits.find((p) => p.id === item.productId)
      const baseStock = product?.stock ?? 0
      const currentOverride = await getStockOverride(item.productId)
      const currentStock = currentOverride ?? baseStock
      await setStockOverride(item.productId, currentStock + item.qty)
    }

    // Mettre à jour le statut
    booking.status = "returned"
    booking.returnedAt = new Date().toISOString()
    booking.updatedAt = new Date().toISOString()
    await saveBooking(booking)

    // Libérer les dates bloquées
    await unblockDates(bookingId)

    return NextResponse.json({ success: true, booking })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * GET /api/admin/returned?bookingId=XXX
 * Récupère l'historique des alertes de retard pour une réservation.
 */
export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const bookingId = request.nextUrl.searchParams.get("bookingId")
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId requis" }, { status: 400 })
  }

  const alerts = await getLateAlertsForBooking(bookingId)
  return NextResponse.json({ alerts })
}
