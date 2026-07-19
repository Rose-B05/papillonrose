import nodemailer from "nodemailer"
import { v4 as uuidv4 } from "uuid"
import { produits } from "@/data/produits"
import { formatPrix, formatDateFr } from "./utils"
import { calcDeliveryFee } from "./delivery"
import { saveEmailLog } from "./db"
import type { Booking, EmailLog } from "./types"

const FROM = process.env.SMTP_FROM || "papillonrosebertha@gmail.com"
const TO_ADMIN = process.env.CONTACT_EMAIL || "papillonrosebertha@gmail.com"
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

function getSuggestedProducts(booking: Booking, count = 3) {
  const bookedIds = new Set(booking.items.map((i) => i.productId))
  const bookedCategories = new Set(
    booking.items
      .map((i) => produits.find((p) => p.id === i.productId)?.categorie)
      .filter(Boolean)
  )

  return produits
    .filter(
      (p) =>
        p.actif !== false &&
        !bookedIds.has(p.id) &&
        bookedCategories.has(p.categorie) &&
        p.image &&
        !p.image.includes("placeholder")
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}

function buildItemsRows(booking: Booking): string {
  return booking.items
    .map((item) => {
      const product = produits.find((p) => p.id === item.productId)
      const nom = product?.nom || `Produit #${item.productId}`
      const image = product?.image
        ? `${SITE_URL}${product.image.startsWith("/") ? "" : "/"}${product.image}`
        : ""
      const days =
        item.dateStart && item.dateEnd
          ? Math.max(
              1,
              Math.ceil(
                (new Date(item.dateEnd).getTime() - new Date(item.dateStart).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 1
      const lineTotal = parsePrix(product?.prix || 0) * item.qty * days
      const period =
        item.dateStart && item.dateEnd
          ? `${formatDateFr(item.dateStart)} → ${formatDateFr(item.dateEnd)}`
          : "Non défini"

      const imgCell = image
        ? `<td style="padding:10px 12px;border-bottom:1px solid #eee;width:60px">
            <img src="${image}" alt="${nom}" style="width:50px;height:50px;object-fit:cover;border-radius:6px" />
          </td>`
        : ""

      return `
        <tr>
          ${imgCell}
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:600">${nom}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:12px">${period}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;color:#C9948E;font-weight:700">${formatPrix(lineTotal)} €</td>
        </tr>`
    })
    .join("")
}

function buildSuggestionsHtml(booking: Booking): string {
  const suggestions = getSuggestedProducts(booking, 3)
  if (suggestions.length === 0) return ""

  const items = suggestions
    .map((p) => {
      const imageUrl = `${SITE_URL}${p.image.startsWith("/") ? "" : "/"}${p.image}`
      return `
        <td style="width:33%;padding:8px;text-align:center;vertical-align:top">
          <a href="${SITE_URL}/catalogue?produit=${p.id}" style="text-decoration:none;color:inherit">
            <img src="${imageUrl}" alt="${p.nom}" style="width:100%;max-width:120px;height:auto;border-radius:8px;object-fit:cover;margin-bottom:6px" />
            <p style="font-size:12px;font-weight:600;color:#2E2E2E;margin:0">${p.nom}</p>
            <p style="font-size:11px;color:#C9948E;margin:2px 0 0">${formatPrix(parsePrix(p.prix))} € / jour</p>
          </a>
        </td>`
    })
    .join("")

  return `
    <div style="background:#fdf8f0;border-radius:12px;padding:20px;margin:24px 0">
      <h3 style="color:#2E2E2E;font-size:15px;margin:0 0 12px;text-align:center">✨ Cela pourrait aussi vous plaire</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr>${items}</tr>
      </table>
    </div>`
}

function buildDeliverySection(client: any): string {
  if (!client?.nom) return ""

  if (client.besoinLivraison && client.adresseLivraison) {
    return `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin:12px 0">
        <p style="margin:0;font-weight:600;color:#166534">📦 Livraison</p>
        <p style="margin:4px 0 0;font-size:13px;color:#555">${client.adresseLivraison}${client.codePostalLivraison ? ` (${client.codePostalLivraison})` : ""}</p>
      </div>`
  }

  return `
    <div style="background:#f8f5f0;border-radius:8px;padding:12px 16px;margin:12px 0">
      <p style="margin:0;font-weight:600;color:#2E2E2E">📍 Retrait sur place</p>
      <p style="margin:4px 0 0;font-size:13px;color:#555">Retrait à convenir — Île-de-France</p>
    </div>`
}

export async function sendBookingConfirmation(booking: Booking): Promise<{ adminSent: boolean; clientSent: boolean }> {
  const transport = getTransport()
  const prenom = booking.client?.prenom || ""
  const totalItems = booking.totalTtc
  const deposit = booking.depositAmount
  const now = new Date()

  const html = `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:650px;margin:auto;padding:20px;background:#fff;color:#2E2E2E">
  <!-- Header -->
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #C9948E">
    <h1 style="color:#C9948E;font-size:24px;margin:0">🦋 Papillon Rose</h1>
    <p style="color:#999;font-size:12px;margin:4px 0 0">Location mobilier & décoration événements</p>
  </div>

  <!-- Greeting -->
  <div style="background:#fdf8f0;border-radius:12px;padding:24px;margin:20px 0;text-align:center">
    <h2 style="color:#2E2E2E;font-size:20px;margin:0 0 8px">
      ${prenom ? `Merci ${prenom} !` : "Merci pour votre commande !"}
    </h2>
    <p style="color:#C9948E;font-size:14px;margin:0">Réservation #${booking.id}</p>
    <p style="color:#999;font-size:12px;margin:4px 0 0">Reçue le ${formatDateFr(now.toISOString())}</p>
  </div>

  <!-- Items -->
  <h3 style="color:#2E2E2E;font-size:16px;margin:20px 0 8px">🛒 Vos articles réservés</h3>
  <table style="width:100%;border-collapse:collapse;background:#f8f5f0;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:#2E2E2E;color:white">
        <th style="padding:10px 12px;text-align:left;width:60px"></th>
        <th style="padding:10px 12px;text-align:left">Produit</th>
        <th style="padding:10px 12px;text-align:center">Qté</th>
        <th style="padding:10px 12px;text-align:left">Période</th>
        <th style="padding:10px 12px;text-align:right">Sous-total</th>
      </tr>
    </thead>
    <tbody>
      ${buildItemsRows(booking)}
    </tbody>
  </table>

  <!-- Delivery -->
  ${buildDeliverySection(booking.client)}

  <!-- Totals -->
  <div style="background:#2E2E2E;border-radius:12px;padding:20px;margin:20px 0;color:white">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <span style="opacity:0.7">Sous-total HT</span>
      <span style="font-weight:600">${formatPrix(booking.totalHt)} €</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <span style="opacity:0.7">Total TTC (livraison incluse)</span>
      <span style="font-weight:700;font-size:18px;color:#C9948E">${formatPrix(totalItems)} €</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1)">
      <span style="opacity:0.7">Acompte à verser (30%)</span>
      <span style="font-weight:700;color:#C9948E">${formatPrix(deposit)} €</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:8px">
      <span style="opacity:0.7">Caution (remboursable)</span>
      <span style="font-weight:600;color:#C9948E">${formatPrix(deposit)} €</span>
    </div>
  </div>

  <!-- Status -->
  <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:12px 0">
    <p style="margin:0;font-size:13px;color:#92400e">
      <strong>Statut :</strong> ${booking.status === "pending-quote" ? "En attente de devis" : "Acompte en attente de paiement"}
    </p>
  </div>

  <!-- Suggestions -->
  ${buildSuggestionsHtml(booking)}

  <!-- Contact -->
  <div style="text-align:center;padding:16px;margin:16px 0;background:#fdf8f0;border-radius:8px">
    <p style="margin:0;font-size:13px;color:#555">Une question sur votre réservation ?</p>
    <a href="mailto:papillonrosebertha@gmail.com" style="display:inline-block;margin-top:8px;background:#C9948E;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px">
      ✉️ Nous contacter
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;margin-top:20px">
    <p style="color:#999;font-size:11px;margin:0">Cet email a été envoyé automatiquement.</p>
    <p style="color:#C9948E;font-size:12px;margin:4px 0 0">papillonrosebertha@gmail.com · Île-de-France</p>
  </div>
</div>`

  const subject =prenom
    ? `${prenom}, votre réservation Papillon Rose #${booking.id} est enregistrée ✓`
    : `Réservation Papillon Rose #${booking.id} enregistrée ✓`

  let adminSent = false
  let clientSent = false

  const logs: EmailLog[] = []

  // Send to admin
  try {
    await transport.sendMail({
      from: `"Papillon Rose" <${FROM}>`,
      to: TO_ADMIN,
      replyTo: booking.client?.email || FROM,
      subject: `Nouvelle réservation #${booking.id} — ${booking.client?.prenom || ""} ${booking.client?.nom || ""}`.trim(),
      html,
    })
    adminSent = true
    logs.push({
      id: uuidv4().slice(0, 8).toUpperCase(),
      to: TO_ADMIN,
      type: "booking_confirmation_admin",
      subject: `Nouvelle réservation #${booking.id}`,
      status: "sent",
      bookingId: booking.id,
      sentAt: now.toISOString(),
    })
  } catch (err: any) {
    console.error("Failed to send admin confirmation email:", err)
    logs.push({
      id: uuidv4().slice(0, 8).toUpperCase(),
      to: TO_ADMIN,
      type: "booking_confirmation_admin",
      subject: `Nouvelle réservation #${booking.id}`,
      status: "failed",
      bookingId: booking.id,
      error: err?.message || "Unknown error",
      sentAt: now.toISOString(),
    })
  }

  // Send to client if email provided
  if (booking.client?.email) {
    try {
      await transport.sendMail({
        from: `"Papillon Rose" <${FROM}>`,
        to: booking.client.email,
        subject,
        html,
      })
      clientSent = true
      logs.push({
        id: uuidv4().slice(0, 8).toUpperCase(),
        to: booking.client.email,
        type: "booking_confirmation_client",
        subject,
        status: "sent",
        bookingId: booking.id,
        sentAt: now.toISOString(),
      })
    } catch (err: any) {
      console.error("Failed to send client confirmation email:", err)
      logs.push({
        id: uuidv4().slice(0, 8).toUpperCase(),
        to: booking.client.email,
        type: "booking_confirmation_client",
        subject,
        status: "failed",
        bookingId: booking.id,
        error: err?.message || "Unknown error",
        sentAt: now.toISOString(),
      })
    }
  }

  // Persist logs (fire-and-forget, never blocks)
  for (const log of logs) {
    try {
      await saveEmailLog(log)
    } catch {
      // silent — logging failure must not affect the booking
    }
  }

  return { adminSent, clientSent }
}
