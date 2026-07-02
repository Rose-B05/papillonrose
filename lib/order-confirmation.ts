import nodemailer from "nodemailer"
import { produits } from "@/data/produits"
import { formatPrix, formatDateFr } from "./utils"
import { calcDeliveryFee } from "./delivery"
import type { Booking } from "./types"

const FROM = process.env.SMTP_FROM || "papillonrosebertha@gmail.com"
const TO_ADMIN = process.env.CONTACT_EMAIL || "papillonrosebertha@gmail.com"

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

function buildItemsRows(booking: Booking): string {
  return booking.items
    .map((item) => {
      const product = produits.find((p) => p.id === item.productId)
      const nom = product?.nom || `Produit #${item.productId}`
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
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:600">${nom}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:12px">${period}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;color:#C8A97E;font-weight:700">${formatPrix(lineTotal)} €</td>
        </tr>`
    })
    .join("")
}

function parsePrix(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = String(prix).match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

function buildClientInfo(client: any): string {
  if (!client?.nom) return "<p style='color:#999;font-style:italic'>Aucune information client fournie (devis)</p>"

  return `
    <table style="width:100%;border-collapse:collapse;margin:12px 0;background:#f8f5f0;border-radius:8px;overflow:hidden">
      <tr><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #eee">Nom</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${client.prenom || ""} ${client.nom || ""}</td></tr>
      ${client.email ? `<tr><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #eee">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${client.email}</td></tr>` : ""}
      ${client.telephone ? `<tr><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #eee">Téléphone</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${client.telephone}</td></tr>` : ""}
      ${client.adresse ? `<tr><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #eee">Adresse</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${client.adresse}</td></tr>` : ""}
      ${client.codePostalLivraison ? `<tr><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #eee">Code postal</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${client.codePostalLivraison}</td></tr>` : ""}
      ${client.besoinLivraison ? `<tr><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #eee">Livraison</td><td style="padding:8px 12px;border-bottom:1px solid #eee">Oui</td></tr>` : ""}
      ${client.message ? `<tr><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #eee">Message</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-style:italic">${client.message}</td></tr>` : ""}
    </table>`
}

function buildDeliveryInfo(client: any, totalTtc: number): string {
  if (!client?.besoinLivraison || !client?.codePostalLivraison) return ""

  const result = calcDeliveryFee(client.codePostalLivraison, totalTtc)
  if (!result.allowed) {
    return `<p style="color:#e74c3c;font-weight:600">⚠️ Livraison impossible pour le code postal ${client.codePostalLivraison}</p>`
  }
  const label = result.totalFee === 0 ? "<span style='color:#27ae60;font-weight:600'>GRATUITE</span>" : `${formatPrix(result.totalFee)} €`
  return `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin:12px 0">
      <p style="margin:0;font-weight:600;color:#166534">📦 Frais de livraison : ${label}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#666">Distance : ${result.km} km · Code postal : ${client.codePostalLivraison}</p>
    </div>`
}

export async function sendBookingConfirmation(booking: Booking): Promise<{ adminSent: boolean; clientSent: boolean }> {
  const transport = getTransport()
  const totalItems = booking.totalTtc
  const deposit = booking.depositAmount

  const html = `
<div style="font-family:sans-serif;max-width:650px;margin:auto;padding:20px;background:#fff">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #C8A97E">
    <h1 style="color:#C8A97E;font-size:24px;margin:0">🦋 Papillon Rose</h1>
    <p style="color:#999;font-size:12px;margin:4px 0 0">Location mobilier & décoration événements</p>
  </div>

  <div style="background:#fdf8f0;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
    <h2 style="color:#2E2E2E;font-size:20px;margin:0 0 8px">Nouvelle réservation #${booking.id}</h2>
    <p style="color:#C8A97E;font-size:14px;margin:0">Reçue le ${formatDateFr(new Date().toISOString())}</p>
  </div>

  ${buildClientInfo(booking.client)}

  <h3 style="color:#2E2E2E;font-size:16px;margin:20px 0 8px">Articles réservés</h3>
  <table style="width:100%;border-collapse:collapse;background:#f8f5f0;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:#2E2E2E;color:white">
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

  ${buildDeliveryInfo(booking.client, totalItems)}

  <div style="background:#2E2E2E;border-radius:12px;padding:20px;margin:20px 0;color:white">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <span style="opacity:0.7">Sous-total HT</span>
      <span style="font-weight:600">${formatPrix(booking.totalHt)} €</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <span style="opacity:0.7">Total TTC (livraison incluse)</span>
      <span style="font-weight:700;font-size:18px;color:#C8A97E">${formatPrix(totalItems)} €</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1)">
      <span style="opacity:0.7">Caution à verser</span>
      <span style="font-weight:700;color:#C8A97E">${formatPrix(deposit)} €</span>
    </div>
  </div>

  <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:12px 0">
    <p style="margin:0;font-size:13px;color:#92400e">
      <strong>Statut :</strong> ${booking.status === "pending-quote" ? "En attente de réponse" : "Caution en attente de paiement"}
    </p>
  </div>

  <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;margin-top:20px">
    <p style="color:#999;font-size:11px;margin:0">Cet email a été envoyé automatiquement.</p>
    <p style="color:#C8A97E;font-size:12px;margin:4px 0 0">papillonrosebertha@gmail.com · Île-de-France</p>
  </div>
</div>`

  const subject = `Nouvelle réservation #${booking.id} — ${booking.client?.prenom || ""} ${booking.client?.nom || ""}`.trim()

  let adminSent = false
  let clientSent = false

  // Send to admin
  try {
    await transport.sendMail({
      from: `"Papillon Rose" <${FROM}>`,
      to: TO_ADMIN,
      replyTo: booking.client?.email || FROM,
      subject,
      html,
    })
    adminSent = true
  } catch (err) {
    console.error("Failed to send admin confirmation email:", err)
  }

  // Send to client if email provided
  if (booking.client?.email) {
    try {
      await transport.sendMail({
        from: `"Papillon Rose" <${FROM}>`,
        to: booking.client.email,
        subject: `Votre réservation Papillon Rose #${booking.id}`,
        html,
      })
      clientSent = true
    } catch (err) {
      console.error("Failed to send client confirmation email:", err)
    }
  }

  return { adminSent, clientSent }
}
