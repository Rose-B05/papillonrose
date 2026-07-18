import { NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { checkRateLimit, sanitizeError } from "@/lib/security"

const RATE_LIMIT_KEY = "admin:otp:verify"

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
    const { code, email } = body as { code?: string; email?: string }

    if (!code || !email) {
      return NextResponse.json({ error: "Code et email requis" }, { status: 400 })
    }

    const storedOtp = await kv.get<string>("admin:otp:code")
    const storedExpires = await kv.get<number>("admin:otp:expires")
    const storedEmail = await kv.get<string>("admin:otp:email")

    if (!storedOtp || !storedExpires || !storedEmail) {
      return NextResponse.json({ error: "Aucun code en cours. Demandez un nouveau code." }, { status: 400 })
    }

    if (Date.now() > storedExpires) {
      await kv.del("admin:otp:code", "admin:otp:expires", "admin:otp:email")
      return NextResponse.json({ error: "Le code a expiré. Demandez un nouveau code." }, { status: 400 })
    }

    if (email.toLowerCase().trim() !== storedEmail) {
      return NextResponse.json({ error: "Email incorrect" }, { status: 400 })
    }

    if (code.trim() !== storedOtp) {
      return NextResponse.json({ error: "Code incorrect" }, { status: 400 })
    }

    const resetToken = crypto.randomUUID()
    await kv.set("admin:reset_token", resetToken, { ex: 900 })
    await kv.set("admin:reset_email", email.toLowerCase().trim(), { ex: 900 })

    await kv.del("admin:otp:code", "admin:otp:expires", "admin:otp:email")

    return NextResponse.json({ success: true, resetToken })
  } catch (err) {
    console.error("OTP verify error:", err)
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 })
  }
}
