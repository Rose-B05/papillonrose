import { NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import bcrypt from "bcryptjs"
import { getCustomer } from "@/lib/customer-auth"
import { checkRateLimit } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 })
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json({ error: "Le mot de passe doit contenir entre 6 et 128 caractères" }, { status: 400 })
    }

    const rateCheck = await checkRateLimit("customer:reset-password", {
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

    const raw = await kv.get(`reset:customer:${token}`)
    if (!raw) {
      return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 })
    }

    const data = JSON.parse(raw as string)
    if (Date.now() > data.expires) {
      await kv.del(`reset:customer:${token}`)
      return NextResponse.json({ error: "Lien expiré" }, { status: 400 })
    }

    const customer = await getCustomer(data.email)
    if (!customer) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    customer.passwordHash = passwordHash
    await kv.set(`customer:${data.email}`, customer)

    await kv.del(`reset:customer:${token}`)

    return NextResponse.json({ success: true, message: "Mot de passe mis à jour avec succès." })
  } catch (err) {
    console.error("Reset password error:", err)
    return NextResponse.json({ error: "Erreur lors de la réinitialisation" }, { status: 500 })
  }
}
