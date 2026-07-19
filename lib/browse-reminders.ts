import nodemailer from "nodemailer"
import { v4 as uuidv4 } from "uuid"
import { produits } from "@/data/produits"
import { getProductViews, markReminderSent, getBookings, saveEmailLog, cleanupOldProductViews } from "./db"
import { getCustomer } from "./customer-auth"
import { formatPrix } from "./utils"
import type { ProductView, EmailLog } from "./types"

const FROM = process.env.SMTP_FROM || "papillonrosebertha@gmail.com"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

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

function parsePrix(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = String(prix).match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

function getSuggestedProducts(productId: number, count = 3) {
  const viewed = produits.find((p) => p.id === productId)
  if (!viewed) return []

  return produits
    .filter(
      (p) =>
        p.id !== productId &&
        p.categorie === viewed.categorie &&
        p.actif !== false &&
        p.image &&
        !p.image.includes("placeholder")
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}

function buildReminderEmail(
  customerPrenom: string,
  product: { nom: string; image: string; prix: number | string; id: number },
  suggestions: { nom: string; image: string; prix: number | string; id: number }[]
) {
  const imageUrl = `${SITE_URL}${product.image.startsWith("/") ? "" : "/"}${product.image}`
  const productUrl = `${SITE_URL}/catalogue?produit=${product.id}`

  let suggestionsHtml = ""
  if (suggestions.length > 0) {
    const items = suggestions
      .map((s) => {
        const img = `${SITE_URL}${s.image.startsWith("/") ? "" : "/"}${s.image}`
        return `
          <td style="width:33%;padding:8px;text-align:center;vertical-align:top">
            <a href="${SITE_URL}/catalogue?produit=${s.id}" style="text-decoration:none;color:inherit">
              <img src="${img}" alt="${s.nom}" style="width:100%;max-width:120px;height:auto;border-radius:8px;object-fit:cover;margin-bottom:6px" />
              <p style="font-size:12px;font-weight:600;color:#2E2E2E;margin:0">${s.nom}</p>
              <p style="font-size:11px;color:#C9948E;margin:2px 0 0">${formatPrix(parsePrix(s.prix))} € / jour</p>
            </a>
          </td>`
      })
      .join("")

    suggestionsHtml = `
      <div style="background:#fdf8f0;border-radius:12px;padding:20px;margin:24px 0">
        <h3 style="color:#2E2E2E;font-size:15px;margin:0 0 12px;text-align:center">✨ Autres produits qui pourraient vous plaire</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr>${items}</tr>
        </table>
      </div>`
  }

  const greeting = customerPrenom ? `${customerPrenom}, vous avez` : "Vous avez"

  return `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:650px;margin:auto;padding:20px;background:#fff;color:#2E2E2E">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #C9948E">
    <h1 style="color:#C9948E;font-size:24px;margin:0"><img src="https://www.papillonrose.fr/papillon-rose-logo.png" alt="Papillon Rose" height="40" style="vertical-align:middle;margin-right:8px"> Papillon Rose</h1>
    <p style="color:#999;font-size:12px;margin:4px 0 0">Location mobilier & décoration événements</p>
  </div>

  <div style="background:#fdf8f0;border-radius:12px;padding:24px;margin:20px 0;text-align:center">
    <h2 style="color:#2E2E2E;font-size:20px;margin:0 0 8px">
      ${greeting} consulté
    </h2>
    <p style="color:#555;font-size:14px;margin:0">un produit qui vous a intéressé(e)…</p>
  </div>

  <div style="text-align:center;margin:20px 0">
    <a href="${productUrl}">
      <img src="${imageUrl}" alt="${product.nom}" style="max-width:280px;width:100%;border-radius:12px;object-fit:cover" />
    </a>
  </div>

  <div style="background:#f8f5f0;border-radius:12px;padding:20px;margin:20px 0">
    <h3 style="color:#2E2E2E;font-size:18px;margin:0 0 4px;text-align:center">${product.nom}</h3>
    <p style="color:#C9948E;font-size:16px;font-weight:700;text-align:center;margin:8px 0 16px">
      ${formatPrix(parsePrix(product.prix))} € / jour
    </p>
    <p style="text-align:center;margin:0">
      <a href="${productUrl}" style="display:inline-block;background:#C9948E;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">
        Voir la fiche produit →
      </a>
    </p>
  </div>

  <p style="color:#555;font-size:14px;line-height:1.6;text-align:center;margin:20px 0">
    Ce produit est toujours disponible à la location pour votre événement.<br />
    N'hésitez pas à nous contacter pour réserver ou poser vos questions.
  </p>

  ${suggestionsHtml}

  <div style="text-align:center;padding:16px;margin:16px 0;background:#fdf8f0;border-radius:8px">
    <a href="mailto:papillonrosebertha@gmail.com" style="display:inline-block;background:#C9948E;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px">
      ✉️ Nous contacter
    </a>
  </div>

  <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;margin-top:20px">
    <p style="color:#999;font-size:11px;margin:0">Cet email a été envoyé automatiquement.</p>
    <p style="color:#C9948E;font-size:12px;margin:4px 0 0">papillonrosebertha@gmail.com · Île-de-France</p>
  </div>
</div>`
}

export async function processBrowseReminders() {
  const now = new Date()
  const targetDate = new Date(now)
  targetDate.setDate(targetDate.getDate() - 15)
  const targetStr = targetDate.toISOString().split("T")[0]

  const allViews = await getProductViews()

  const eligibleViews = allViews.filter((view) => {
    if (view.reminderSent) return false
    const viewDate = view.viewedAt.split("T")[0]
    return viewDate === targetStr
  })

  const bookings = await getBookings()

  const results: { sent: number; skipped: number; errors: string[] } = {
    sent: 0,
    skipped: 0,
    errors: [],
  }

  const logs: EmailLog[] = []
  const transport = eligibleViews.length > 0 ? getTransport() : null

  for (const view of eligibleViews) {
    try {
      const customer = await getCustomer(view.customerEmail)
      if (!customer) {
        results.skipped++
        continue
      }

      if (customer.marketingConsent === false) {
        results.skipped++
        continue
      }

      const hasBooked = bookings.some(
        (b) =>
          b.client?.email?.toLowerCase() === view.customerEmail.toLowerCase() &&
          b.items.some((item) => item.productId === view.productId) &&
          b.status !== "cancelled" &&
          new Date(b.createdAt) > new Date(view.viewedAt)
      )

      if (hasBooked) {
        results.skipped++
        continue
      }

      const product = produits.find((p) => p.id === view.productId)
      if (!product) {
        results.skipped++
        continue
      }

      if (!transport) continue

      const suggestions = getSuggestedProducts(view.productId, 3)
      const html = buildReminderEmail(customer.prenom, product, suggestions)
      const subject = `${customer.prenom || "Vous"} — ${product.nom} est toujours disponible !`

      await transport.sendMail({
        from: `"Papillon Rose" <${FROM}>`,
        to: view.customerEmail,
        subject,
        html,
      })

      await markReminderSent(view.id)
      results.sent++

      logs.push({
        id: uuidv4().slice(0, 8).toUpperCase(),
        to: view.customerEmail,
        type: "browse_reminder",
        subject,
        status: "sent",
        sentAt: now.toISOString(),
      })
    } catch (err: any) {
      results.errors.push(`View ${view.id}: ${err.message}`)
      logs.push({
        id: uuidv4().slice(0, 8).toUpperCase(),
        to: view.customerEmail,
        type: "browse_reminder",
        subject: "Browse reminder failed",
        status: "failed",
        error: err?.message,
        sentAt: now.toISOString(),
      })
    }
  }

  for (const log of logs) {
    try {
      await saveEmailLog(log)
    } catch {
      // silent
    }
  }

  try {
    await cleanupOldProductViews(90)
  } catch {
    // silent
  }

  return results
}
