import { NextRequest, NextResponse } from "next/server"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"
import { getQuotes } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ quotes: [] })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ quotes: [] })
  }

  const allQuotes = await getQuotes()
  const customerQuotes = allQuotes
    .filter((q) => q.customerEmail === customer.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((q) => ({
      id: q.id,
      quoteNumber: q.quoteNumber,
      statut: q.statut,
      totalTtc: q.totalTtc,
      createdAt: q.createdAt,
      itemCount: q.items.length,
    }))

  return NextResponse.json({ quotes: customerQuotes })
}
