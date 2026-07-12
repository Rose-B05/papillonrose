import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth"
import { checkRateLimit, resetRateLimit, sanitizeError, isValidEmail } from "@/lib/security"

const RATE_LIMIT_KEY = "admin:login"

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

    // Rate limiting
    const rateCheck = await checkRateLimit(RATE_LIMIT_KEY)
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.retryAfterMs || 0) / 60000)
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` },
        { status: 429 }
      )
    }

    const valid = await verifyAdmin(email, password)
    if (!valid) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
    }

    // Successful login — reset rate limit
    resetRateLimit(RATE_LIMIT_KEY)

    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
