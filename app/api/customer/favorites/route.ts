import { NextRequest, NextResponse } from "next/server"
import { getCustomerFavorites, saveCustomerFavorites } from "@/lib/db"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ favorites: [] })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ favorites: [] })
  }

  const favorites = await getCustomerFavorites(customer.email)
  return NextResponse.json({ favorites })
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const body = await request.json()
  const { favorites } = body as { favorites: number[] }

  if (!Array.isArray(favorites)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 })
  }

  await saveCustomerFavorites(customer.email, favorites)
  return NextResponse.json({ success: true, favorites })
}
