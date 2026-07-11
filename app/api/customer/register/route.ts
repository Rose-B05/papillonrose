import { NextRequest, NextResponse } from "next/server"
import { createCustomer, getCustomer, CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE } from "@/lib/customer-auth"
import { getCustomerFavorites } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, prenom, nom, marketingConsent } = body as {
      email: string
      password: string
      prenom: string
      nom: string
      marketingConsent?: boolean
    }

    if (!email || !password || !prenom || !nom) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 })
    }

    const existing = await getCustomer(normalizedEmail)
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 })
    }

    const customer = await createCustomer(normalizedEmail, prenom, nom, password, marketingConsent === true)

    const favorites = await getCustomerFavorites(customer.email)

    const response = NextResponse.json({
      success: true,
      customer: { email: customer.email, prenom: customer.prenom, nom: customer.nom, telephone: "", adresse: "" },
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
