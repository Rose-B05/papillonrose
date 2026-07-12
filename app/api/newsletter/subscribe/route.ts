import { NextRequest, NextResponse } from "next/server"
import { subscribeToNewsletter } from "@/lib/newsletter"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    const normalized = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalized)) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 })
    }

    const result = await subscribeToNewsletter(normalized)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Erreur lors de l'inscription" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: result.alreadyConfirmed
        ? "Vous êtes déjà inscrit à la newsletter."
        : "Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.",
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
