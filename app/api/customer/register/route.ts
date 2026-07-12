import { NextRequest, NextResponse } from "next/server"
import { createCustomer, getCustomer, CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE } from "@/lib/customer-auth"
import { getCustomerFavorites } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"
import { subscribeToNewsletter } from "@/lib/newsletter"
import { isValidEmail, sanitizeString } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, prenom, nom, marketingConsent, newsletterConsent } = body as {
      email: string
      password: string
      prenom: string
      nom: string
      marketingConsent?: boolean
      newsletterConsent?: boolean
    }

    if (!email || !password || !prenom || !nom) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 })
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json({ error: "Le mot de passe doit contenir entre 6 et 128 caractères" }, { status: 400 })
    }

    // Sanitize names
    const cleanPrenom = sanitizeString(prenom, 50)
    const cleanNom = sanitizeString(nom, 50)
    if (!cleanPrenom || !cleanNom) {
      return NextResponse.json({ error: "Prénom et nom requis" }, { status: 400 })
    }

    const existing = await getCustomer(normalizedEmail)
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 })
    }

    const customer = await createCustomer(normalizedEmail, cleanPrenom, cleanNom, password, marketingConsent === true)

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

    // Fire-and-forget: welcome email + newsletter subscription
    sendWelcomeEmail(normalizedEmail, prenom).catch(() => {})
    if (newsletterConsent === true) {
      subscribeToNewsletter(normalizedEmail).catch(() => {})
    }

    return response
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
