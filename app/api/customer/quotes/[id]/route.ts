import { NextRequest, NextResponse } from "next/server"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"
import { getQuote } from "@/lib/db"

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

  const quote = await getQuote(id)
  if (!quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
  }

  if (quote.customerEmail !== customer.email) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  return NextResponse.json({ quote })
}
