import { NextRequest, NextResponse } from "next/server"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"
import { getBooking } from "@/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = _request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const booking = await getBooking(id)
  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
  }

  if (booking.customerEmail !== customer.email) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  return NextResponse.json({ booking })
}
