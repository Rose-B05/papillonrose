import { NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import bcrypt from "bcryptjs"
import { checkRateLimit, sanitizeError } from "@/lib/security"
import { getAdminPasswordHash } from "@/lib/auth"

const RATE_LIMIT_KEY = "admin:reset-password"

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
    const { resetToken, newPassword, confirmPassword } = body as {
      resetToken?: string
      newPassword?: string
      confirmPassword?: string
    }

    if (!resetToken || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const storedToken = await kv.get<string>("admin:reset_token")
    if (!storedToken || storedToken !== resetToken) {
      return NextResponse.json({ error: "Token invalide ou expiré. Recommencez la procédure." }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Les mots de passe ne correspondent pas" }, { status: 400 })
    }

    const strengthError = validatePasswordStrength(newPassword)
    if (strengthError) {
      return NextResponse.json({ error: strengthError }, { status: 400 })
    }

    const currentHash = await getAdminPasswordHash()
    const samePassword = await bcrypt.compare(newPassword, currentHash)
    if (samePassword) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit être différent de l'ancien" }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    try {
      await kv.set("admin_password_hash", newHash)
    } catch (kvErr) {
      console.error("KV write failed for admin_password_hash:", kvErr)
      return NextResponse.json({ error: "Erreur de sauvegarde. Réessayez." }, { status: 500 })
    }

    const verifyHash = await getAdminPasswordHash()
    const verifyOk = await bcrypt.compare(newPassword, verifyHash)
    if (!verifyOk) {
      return NextResponse.json({ error: "Erreur de sauvegarde — le mot de passe n'a pas été enregistré." }, { status: 500 })
    }

    await kv.del("admin:reset_token", "admin:reset_email")

    return NextResponse.json({ success: true, message: "Mot de passe réinitialisé. Vous pouvez vous connecter." })
  } catch (err) {
    console.error("Reset password error:", err)
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 })
  }
}
