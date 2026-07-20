// @deprecated — Cette route est obsolète. Les devis sont désormais gérés via Booking.
// Conservée temporairement pour l'ancien système Devis (lib/devis/db.ts).
// Le nouvel envoi utilise sendBookingConfirmation depuis lib/order-confirmation.ts.

import { NextRequest, NextResponse } from "next/server"
import { getBooking, saveBooking, logActivity } from "@/lib/db"
import { sendBookingConfirmation } from "@/lib/order-confirmation"
import { COOKIE_NAME } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    const booking = await getBooking(id)
    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
    }

    // Send confirmation email
    const emailResult = await sendBookingConfirmation(booking)

    // Update status to quote-sent
    booking.status = "quote-sent"
    booking.updatedAt = new Date().toISOString()
    await saveBooking(booking)

    await logActivity({
      type: "devis_sent",
      description: `Devis ${booking.quoteNumber || booking.id} envoyé à ${booking.client.email}`,
      reference: booking.id,
    })

    return NextResponse.json({
      ok: true,
      message: "Devis envoyé",
      email: emailResult,
    })
  } catch (err) {
    console.error("Error sending devis:", err)
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}
