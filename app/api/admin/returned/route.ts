import { NextRequest, NextResponse } from "next/server"
import { getBooking, saveBooking, unblockDates, getLateAlertsForBooking } from "@/lib/db"

/**
 * POST /api/admin/returned
 * Marque une réservation comme rendue et libère les dates bloquées.
 * Body: { bookingId: string }
 */
export async function POST(request: NextRequest) {
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

    // Mettre à jour le statut
    booking.status = "returned"
    booking.returnedAt = new Date().toISOString()
    booking.updatedAt = new Date().toISOString()
    await saveBooking(booking)

    // Libérer les dates bloquées
    await unblockDates(bookingId)

    return NextResponse.json({ success: true, booking })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * GET /api/admin/returned?bookingId=XXX
 * Récupère l'historique des alertes de retard pour une réservation.
 */
export async function GET(request: NextRequest) {
  const bookingId = request.nextUrl.searchParams.get("bookingId")
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId requis" }, { status: 400 })
  }

  const alerts = await getLateAlertsForBooking(bookingId)
  return NextResponse.json({ alerts })
}
