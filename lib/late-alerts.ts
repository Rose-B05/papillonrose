import nodemailer from "nodemailer"
import { getBookings, getLateAlertsForBooking, saveLateAlert, hasAlertForBookingOnDate } from "./db"
import { produits } from "@/data/produits"
import { calculateLateFee } from "./rental-dates"
import type { Booking, LateAlert } from "./types"
import { v4 as uuidv4 } from "uuid"

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

// Re-export de la fonction partagée depuis rental-dates.ts
// La formule est : min(10% + (jours - 1) × 30%, 50%)
export { calculateLateFee } from "./rental-dates"

/**
 * Retourne la date de restitution prévue la plus tardive d'une réservation.
 */
export function getExpectedReturnDate(booking: Booking): string {
  let latest = ""
  for (const item of booking.items) {
    if (item.dateEnd > latest) latest = item.dateEnd
  }
  return latest
}

/**
 * Calcule le nombre de jours de retard par rapport à aujourd'hui.
 */
export function calcDaysLate(expectedReturnDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expected = new Date(expectedReturnDate)
  expected.setHours(0, 0, 0, 0)
  const diff = Math.floor((now.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

/**
 * Trouve toutes les réservations en retard (non rendues, dates dépassées).
 */
export function findOverdueBookings(): { booking: Booking; joursRetard: number; expectedDate: string }[] {
  const bookings = getBookings()
  const overdue: { booking: Booking; joursRetard: number; expectedDate: string }[] = []

  for (const booking of bookings) {
    // Ignorer les réservations annulées ou déjà rendues
    if (booking.status === "cancelled" || booking.status === "returned" || booking.status === "pending-quote") {
      continue
    }

    const expectedDate = getExpectedReturnDate(booking)
    if (!expectedDate) continue

    const joursRetard = calcDaysLate(expectedDate)
    if (joursRetard >= 1) {
      overdue.push({ booking, joursRetard, expectedDate })
    }
  }

  return overdue
}

/**
 * Envoie un email de relance pour un produit en retard.
 */
async function sendLateAlertEmail(
  booking: Booking,
  productId: number,
  productNom: string,
  joursRetard: number,
  penalitePercent: number,
  penaliteAmount: number,
  nextPenalitePercent: number,
  nextPenaliteAmount: number,
  prixLocation: number,
  expectedDate: string,
): Promise<string[]> {
  const transport = getTransport()
  const destinataires = [booking.client.email, TO_ADMIN].filter(Boolean)

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
  <h2 style="color:#C8A97E">Relance : retard de restitution</h2>
  <p>Bonjour ${booking.client.prenom},</p>
  <p>Nous constatons que le matériel loué n'a pas encore été restitué.</p>

  <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8f5f0;border-radius:8px;overflow:hidden">
    <tr><td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #eee">Commande</td><td style="padding:10px 16px;border-bottom:1px solid #eee">#${booking.id}</td></tr>
    <tr><td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #eee">Produit</td><td style="padding:10px 16px;border-bottom:1px solid #eee">${productNom}</td></tr>
    <tr><td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #eee">Date de restitution prévue</td><td style="padding:10px 16px;border-bottom:1px solid #eee">${expectedDate}</td></tr>
    <tr><td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #eee">Jours de retard</td><td style="padding:10px 16px;border-bottom:1px solid #eee;color:#C8A97E;font-weight:700">${joursRetard} jour${joursRetard > 1 ? "s" : ""}</td></tr>
    <tr><td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #eee">Majoration appliquée</td><td style="padding:10px 16px;border-bottom:1px solid #eee;color:#C8A97E;font-weight:700">${(penalitePercent * 100).toFixed(0)}% → ${penaliteAmount.toFixed(2)} €</td></tr>
    <tr><td style="padding:10px 16px;font-weight:600">Si retard continue (jour+1)</td><td style="padding:10px 16px;color:#C8A97E;font-weight:700">${(nextPenalitePercent * 100).toFixed(0)}% → ${nextPenaliteAmount.toFixed(2)} €</td></tr>
  </table>

  <p style="color:#e74c3c;font-weight:600">⚠️ La pénalité augmente de +30% par jour supplémentaire de retard (plafond 50% du montant de la location).</p>
  <p>Merci de restituer le matériel dans les plus brefs délais.</p>

  <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
</div>`

  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to: destinataires.join(", "),
    subject: `⚠️ Retard restitution #${booking.id} — ${joursRetard}j — ${productNom}`,
    html,
  })

  return destinataires
}

/**
 * Traite toutes les réservations en retard et envoie les alertes.
 */
export async function processLateAlerts(): Promise<{
  processed: number
  alerts: LateAlert[]
  errors: string[]
}> {
  const overdue = findOverdueBookings()
  const alerts: LateAlert[] = []
  const errors: string[] = []

  for (const { booking, joursRetard, expectedDate } of overdue) {
    for (const item of booking.items) {
      // Vérifier si une alerte a déjà été envoyée aujourd'hui pour ce produit
      const today = new Date().toISOString().split("T")[0]
      if (hasAlertForBookingOnDate(booking.id, item.productId, today)) {
        continue
      }

      const product = produits.find((p) => p.id === item.productId)
      const productNom = product?.nom || `Produit #${item.productId}`
      const prixLocation = parsePrix(product?.prix || 0) * item.qty

      const fee = calculateLateFee(joursRetard, prixLocation)
      const feeNext = calculateLateFee(joursRetard + 1, prixLocation)

      try {
        const destinataires = await sendLateAlertEmail(
          booking,
          item.productId,
          productNom,
          joursRetard,
          fee.taux,
          fee.montant,
          feeNext.taux,
          feeNext.montant,
          prixLocation,
          expectedDate,
        )

        const alert: LateAlert = {
          id: uuidv4().slice(0, 8),
          bookingId: booking.id,
          productId: item.productId,
          productNom,
          dateRestitutionPrevue: expectedDate,
          joursRetard,
          penaliteCalculee: fee.montant,
          penalitePercent: fee.taux,
          destinataires,
          sentAt: new Date().toISOString(),
        }

        saveLateAlert(alert)
        alerts.push(alert)
      } catch (err: any) {
        errors.push(`Erreur alerte #${booking.id} produit ${item.productId}: ${err.message}`)
      }
    }
  }

  return { processed: overdue.length, alerts, errors }
}

function parsePrix(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = String(prix).match(/[\d.]+/)
  return m ? Number(m[0]) : 0
}
