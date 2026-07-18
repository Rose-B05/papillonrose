import { NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { checkRateLimit, sanitizeError } from "@/lib/security"

const RATE_LIMIT_KEY = "admin:otp:verify"

interface OtpData {
  code: string
  email: string
  expires: number
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
    const { code, email } = body as { code?: string; email?: string }

    if (!code || !email) {
      return NextResponse.json({ error: "Code et email requis" }, { status: 400 })
    }

    const raw = await kv.get<string>("admin:otp")
    if (!raw) {
      return NextResponse.json({ error: "Aucun code en cours. Demandez un nouveau code." }, { status: 400 })
    }

    let otpData: OtpData
    try {
      otpData = typeof raw === "string" ? JSON.parse(raw) : raw as unknown as OtpData
    } catch {
      return NextResponse.json({ error: "Données corrompues. Demandez un nouveau code." }, { status: 400 })
    }

    if (Date.now() > otpData.expires) {
      await kv.del("admin:otp")
      return NextResponse.json({ error: "Le code a expiré. Demandez un nouveau code." }, { status: 400 })
    }

    if (email.toLowerCase().trim() !== otpData.email) {
      return NextResponse.json({ error: "Email incorrect" }, { status: 400 })
    }

    if (code.trim() !== otpData.code) {
      return NextResponse.json({ error: "Code incorrect" }, { status: 400 })
    }

    const resetToken = crypto.randomUUID()
    const resetData = JSON.stringify({ token: resetToken, email: otpData.email })
    await kv.set("admin:reset", resetData, { ex: 900 })
    await kv.del("admin:otp")

    return NextResponse.json({ success: true, resetToken })
  } catch (err) {
    console.error("OTP verify error:", err)
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 })
  }
}
