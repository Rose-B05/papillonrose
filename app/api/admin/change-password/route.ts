import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { kv } from "@vercel/kv"
import { verifyAdminSession, checkRateLimit, sanitizeError } from "@/lib/security"
import { getAdminPasswordHash } from "@/lib/auth"

const RATE_LIMIT_KEY = "admin:change-password"

function validatePasswordStrength(pwd: string): string | null {
  if (pwd.length < 12) return "Le mot de passe doit contenir au moins 12 caractères"
  if (!/[A-Z]/.test(pwd)) return "Le mot de passe doit contenir au moins une majuscule"
  if (!/[a-z]/.test(pwd)) return "Le mot de passe doit contenir au moins une minuscule"
  if (!/[0-9]/.test(pwd)) return "Le mot de passe doit contenir au moins un chiffre"
  if (!/[^A-Za-z0-9]/.test(pwd)) return "Le mot de passe doit contenir au moins un caractère spécial"
  return null
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const rateCheck = await checkRateLimit(RATE_LIMIT_KEY, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      lockoutMs: 15 * 60 * 1000,
    })
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.retryAfterMs || 0) / 60000)
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body as {
      currentPassword: string
      newPassword: string
      confirmPassword: string
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Les mots de passe ne correspondent pas" }, { status: 400 })
    }

    const strengthError = validatePasswordStrength(newPassword)
    if (strengthError) {
      return NextResponse.json({ error: strengthError }, { status: 400 })
    }

    const currentHash = await getAdminPasswordHash()
    const validCurrent = await bcrypt.compare(currentPassword, currentHash)
    if (!validCurrent) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 })
    }

    const samePassword = await bcrypt.compare(newPassword, currentHash)
    if (samePassword) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit être différent de l'ancien" }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await kv.set("admin_password_hash", newHash)

    const response = NextResponse.json({ success: true, message: "Mot de passe modifié. Veuillez vous reconnecter." })
    response.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: sanitizeError(null) }, { status: 500 })
  }
}
