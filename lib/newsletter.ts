import crypto from "crypto"
import { getNewsletterSubscriber, getNewsletterSubscribers, saveNewsletterSubscriber } from "./db"
import type { NewsletterSubscriber } from "./types"
import nodemailer from "nodemailer"

const TOKEN_EXPIRY_HOURS = 48

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

const FROM = process.env.SMTP_FROM || "papillonrosebertha@gmail.com"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

function isTokenExpired(subscribedAt: string): boolean {
  const elapsed = Date.now() - new Date(subscribedAt).getTime()
  return elapsed > TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
}

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; error?: string; alreadyConfirmed?: boolean }> {
  const normalized = email.toLowerCase().trim()

  const existing = await getNewsletterSubscriber(normalized)

  if (existing?.status === "confirmed") {
    return { success: true, alreadyConfirmed: true }
  }

  if (existing?.status === "pending" && !isTokenExpired(existing.subscribedAt)) {
    return { success: true }
  }

  const token = generateToken()
  const subscriber: NewsletterSubscriber = {
    email: normalized,
    status: "pending",
    confirmToken: token,
    subscribedAt: new Date().toISOString(),
    confirmedAt: undefined,
    unsubscribedAt: undefined,
  }

  if (existing) {
    subscriber.subscribedAt = existing.subscribedAt
  }

  await saveNewsletterSubscriber(subscriber)

  try {
    const transport = getTransport()
    await transport.sendMail({
      from: `"Papillon Rose" <${FROM}>`,
      to: normalized,
      subject: "Confirmez votre inscription à la newsletter — Papillon Rose",
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
        <h2 style="color:#C9948E">Confirmez votre inscription</h2>
        <p>Bonjour,</p>
        <p>Merci pour votre intérêt pour la newsletter Papillon Rose.</p>
        <p>Pour valider votre inscription, cliquez sur le bouton ci-dessous :</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${SITE_URL}/api/newsletter/confirm?token=${token}" style="background:#C9948E;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Confirmer mon inscription</a>
        </p>
        <p style="color:#888;font-size:12px">Ce lien est valable 48h. Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.</p>
        <p style="margin-top:16px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
      </div>`,
    })
  } catch {
    // Email failure shouldn't block subscription
  }

  return { success: true }
}

export async function confirmNewsletter(token: string): Promise<{ success: boolean; error?: string }> {
  const allSubscribers = await getNewsletterSubscribers()

  for (const sub of allSubscribers) {
    if (sub.confirmToken === token) {
      if (sub.status === "confirmed") {
        return { success: true }
      }
      if (isTokenExpired(sub.subscribedAt)) {
        return { success: false, error: "Ce lien a expiré. Veuillez vous réinscrire." }
      }
      sub.status = "confirmed"
      sub.confirmedAt = new Date().toISOString()
      await saveNewsletterSubscriber(sub)
      return { success: true }
    }
  }

  return { success: false, error: "Token invalide" }
}

export async function unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
  const normalized = email.toLowerCase().trim()
  const existing = await getNewsletterSubscriber(normalized)

  if (!existing) {
    return { success: false, error: "Aucune inscription trouvée pour cet email." }
  }

  if (existing.status === "unsubscribed") {
    return { success: true }
  }

  existing.status = "unsubscribed"
  existing.unsubscribedAt = new Date().toISOString()
  await saveNewsletterSubscriber(existing)

  return { success: true }
}
