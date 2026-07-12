import { NextRequest, NextResponse } from "next/server"
import { verifyCustomer, CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE } from "@/lib/customer-auth"
import { getCustomerFavorites } from "@/lib/db"
import { checkRateLimit, resetRateLimit, isValidEmail } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Rate limiting per email
    const rateCheck = await checkRateLimit(`customer:login:${normalizedEmail}`)
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.retryAfterMs || 0) / 60000)
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` },
        { status: 429 }
      )
    }

    const customer = await verifyCustomer(normalizedEmail, password)
    if (!customer) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
    }

    // Successful login — reset rate limit
    resetRateLimit(`customer:login:${normalizedEmail}`)

    const favorites = await getCustomerFavorites(customer.email)

    const response = NextResponse.json({
      success: true,
      customer: { email: customer.email, prenom: customer.prenom, nom: customer.nom, telephone: customer.telephone || "", adresse: customer.adresse || "" },
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
