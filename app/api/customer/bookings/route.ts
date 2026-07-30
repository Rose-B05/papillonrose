import { NextRequest, NextResponse } from "next/server"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"
import { getBookings } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ bookings: [] })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ bookings: [] })
  }

  const allBookings = await getBookings()
  const customerBookings = allBookings
    .filter((b) => b.customerEmail === customer.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((b) => ({
      id: b.id,
      quoteNumber: b.quoteNumber || b.id,
      status: b.status,
      totalTtc: b.totalTtc,
      createdAt: b.createdAt,
      itemCount: b.items.length,
      quoteSentAt: b.quoteSentAt,
    }))

  return NextResponse.json({ bookings: customerBookings })
}
