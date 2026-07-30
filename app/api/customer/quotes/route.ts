import { NextRequest, NextResponse } from "next/server"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"
import { getBookingsByEmail } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ quotes: [] })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ quotes: [] })
  }

  const customerBookings = await getBookingsByEmail(customer.email)
  const sorted = customerBookings.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return NextResponse.json({
    quotes: sorted.map((b) => ({
      id: b.id,
      quoteNumber: b.quoteNumber || b.id,
      statut: b.status,
      totalTtc: b.totalTtc,
      createdAt: b.createdAt,
      itemCount: b.items.length,
    })),
  })
}
