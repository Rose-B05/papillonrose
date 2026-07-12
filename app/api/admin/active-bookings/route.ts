import { NextRequest, NextResponse } from "next/server"
import { getBookings } from "@/lib/db"
import { COOKIE_NAME } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const bookings = await getBookings()
  const active = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "deposit-pending"
  )
  const sorted = [...active].sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  )

  return NextResponse.json({ bookings: sorted })
}
