import { NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import crypto from "crypto"
import { getCustomer } from "@/lib/customer-auth"
import { sendPasswordResetEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/security"

const RATE_LIMIT_KEY = "customer:forgot-password"

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await checkRateLimit(RATE_LIMIT_KEY, {
      maxAttempts: 3,
      windowMs: 15 * 60 * 1000,
      lockoutMs: 15 * 60 * 1000,
    })
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.retryAfterMs || 0) / 60000)
      return NextResponse.json(
        { error: `Trop de demandes. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` },
        { status: 429 }
      )
    }

    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const customer = await getCustomer(normalizedEmail)

    const token = crypto.randomUUID()
    const expiresAt = Date.now() + 15 * 60 * 1000
    await kv.set(`reset:customer:${token}`, JSON.stringify({ email: normalizedEmail, expires: expiresAt }), { ex: 900 })

    if (customer) {
      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/compte/reinitialiser-mot-de-passe?token=${token}`
      await sendPasswordResetEmail(normalizedEmail, resetUrl)
    }

    return NextResponse.json({
      success: true,
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    })
  } catch (err) {
    console.error("Forgot password error:", err)
    return NextResponse.json({ error: "Erreur lors de la demande" }, { status: 500 })
  }
}
