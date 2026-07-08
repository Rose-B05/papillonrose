import { NextRequest, NextResponse } from "next/server"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session || !session.value) {
    return NextResponse.json({ customer: null })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ customer: null })
  }

  return NextResponse.json({
    customer: { email: customer.email, prenom: customer.prenom, nom: customer.nom, telephone: customer.telephone || "", adresse: customer.adresse || "" },
  })
}
