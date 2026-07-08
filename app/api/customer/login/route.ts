import { NextRequest, NextResponse } from "next/server"
import { verifyCustomer, CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE } from "@/lib/customer-auth"
import { getCustomerFavorites } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    const customer = await verifyCustomer(email.toLowerCase().trim(), password)
    if (!customer) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
    }

    const favorites = await getCustomerFavorites(customer.email)

    const response = NextResponse.json({
      success: true,
      customer: { email: customer.email, prenom: customer.prenom, nom: customer.nom },
      favorites,
    })
    response.cookies.set(CUSTOMER_COOKIE, customer.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CUSTOMER_SESSION_MAX_AGE,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
