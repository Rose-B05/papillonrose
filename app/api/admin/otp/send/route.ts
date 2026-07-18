import { NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import nodemailer from "nodemailer"
import { checkRateLimit, sanitizeError } from "@/lib/security"

const RATE_LIMIT_KEY = "admin:otp:send"

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  } as nodemailer.TransportOptions)
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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

    const body = await request.json()
    const { email } = body as { email?: string }

    const adminEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER || "papillonrosebertha@gmail.com"
    if (!email || email.toLowerCase().trim() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ success: true })
    }

    const otp = generateOtp()
    const expiresAt = Date.now() + 10 * 60 * 1000
    const emailNorm = email.toLowerCase().trim()

    const otpData = JSON.stringify({ code: otp, email: emailNorm, expires: expiresAt })
    await kv.set("admin:otp", otpData, { ex: 600 })

    const transport = getTransport()
    await transport.sendMail({
      from: `"Papillon Rose" <${process.env.SMTP_FROM || "papillonrosebertha@gmail.com"}>`,
      to: email,
      subject: "Code de vérification — Administration Papillon Rose",
      html: `<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:20px;text-align:center">
        <h2 style="color:#C8A97E;margin-bottom:8px">Code de vérification</h2>
        <p style="color:#555;font-size:14px">Voici votre code de connexion :</p>
        <div style="background:#f8f5f0;border-radius:12px;padding:20px;margin:20px 0">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2E2E2E">${otp}</span>
        </div>
        <p style="color:#888;font-size:12px">Ce code expire dans <strong>10 minutes</strong>.</p>
        <p style="color:#888;font-size:12px">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("OTP send error:", err)
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 })
  }
}
