import { NextRequest, NextResponse } from "next/server"
import { getBooking, saveBooking, unblockDates } from "@/lib/db"
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
  const { statut, balancePaidAt, items, quoteSentAt } = body

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

  if (quoteSentAt !== undefined) {
    booking.quoteSentAt = quoteSentAt
  }

  if (items !== undefined && Array.isArray(items)) {
    booking.items = items.map((item: any) => ({
      productId: item.productId,
      qty: item.qty || 1,
      dateStart: item.dateStart || "",
      dateEnd: item.dateEnd || "",
      variantLabel: item.variantLabel,
      prix: item.prix || 0,
    }))

    const totalHt = booking.items.reduce((sum: number, item: any) => {
      const prix = Number(item.prix) || 0
      const dates = item.dateStart && item.dateEnd
        ? Math.max(1, Math.ceil((new Date(item.dateEnd).getTime() - new Date(item.dateStart).getTime()) / (1000 * 60 * 60 * 24)))
        : 1
      return sum + (prix * (item.qty || 1) * dates)
    }, 0)
    booking.totalHt = Math.round(totalHt * 100) / 100
    booking.totalTtc = Math.round(totalHt * 1.2 * 100) / 100
    booking.depositAmount = Math.round(booking.totalTtc * 0.3 * 100) / 100
  }

  booking.updatedAt = new Date().toISOString()

  if (booking.status === "cancelled") {
    await unblockDates(id)
  }

  await saveBooking(booking)

  return NextResponse.json({ devis: booking })
}
