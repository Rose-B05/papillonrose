import { NextRequest, NextResponse } from "next/server"
import { getBooking, saveBooking } from "@/lib/db"
import { COOKIE_NAME } from "@/lib/auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = _request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params
  const booking = await getBooking(id)
  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
  }
  return NextResponse.json({ devis: booking })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { statut, balancePaidAt } = body

  const booking = await getBooking(id)
  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
  }

  if (statut !== undefined) {
    const validStatuses = ["pending-quote", "quote-sent", "deposit-pending", "confirmed", "cancelled", "returned"]
    if (!validStatuses.includes(statut)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }
    booking.status = statut
  }

  if (balancePaidAt !== undefined) {
    booking.balancePaidAt = balancePaidAt
  }

  booking.updatedAt = new Date().toISOString()

  await saveBooking(booking)
  return NextResponse.json({ devis: booking })
}
