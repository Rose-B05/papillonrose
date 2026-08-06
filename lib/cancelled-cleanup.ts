import nodemailer from "nodemailer"
import { getBookings, saveEmailLog } from "./db"
import type { Booking, EmailLog } from "./types"
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

/**
 * Trouve les réservations annulées dont la date d'événement est passée
 * et pour lesquelles aucun règlement n'a été effectué.
 */
export async function findUnpaidCancelledBookings(): Promise<Booking[]> {
  const bookings = await getBookings()
  const now = new Date()
  const todayStr = now.toISOString().split("T")[0]

  return bookings.filter((b) => {
    if (b.status !== "cancelled") return false
    if (b.depositPaidAt || b.balancePaidAt) return false

    const eventDate = b.client?.dateEvenement
    if (!eventDate) return false

    return eventDate < todayStr
  })
}

/**
 * Envoie un email d'annulation à un client dont le devis annulé
 * concerne un événement déjà passé sans règlement.
 */
async function sendCancelledAfterEventEmail(
  booking: Booking,
): Promise<boolean> {
  const transport = getTransport()
  const quoteNumber = booking.quoteNumber || booking.id.slice(0, 8)
  const clientName = `${booking.client.prenom} ${booking.client.nom}`
  const eventDate = booking.client.dateEvenement

  const html = `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
    <h2 style="color:#C9948E">Devis annulé — information</h2>
    <p>Bonjour ${clientName},</p>
    <p>Nous vous informons que votre devis <strong>n°${quoteNumber}</strong> a été annulé.</p>
    <p>La date de votre événement (${eventDate}) étant désormais passée et aucun règlement n'ayant été reçu, nous avons clôturé ce dossier.</p>
    <p>Si vous souhaitez organiser un nouvel événement, nous reste disponible pour vous accompagné.</p>
    <p>Nous vous souhaitons une excellente journée.</p>
    <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
  </div>`

  try {
    await transport.sendMail({
      from: `"Papillon Rose" <${FROM}>`,
      to: booking.client.email,
      subject: `Devis n°${quoteNumber} annulé — Papillon Rose`,
      html,
    })

    await saveEmailLog({
      id: uuidv4().slice(0, 8),
      to: booking.client.email,
      type: "cancelled_after_event",
      subject: `Devis n°${quoteNumber} annulé — Papillon Rose`,
      status: "sent",
      bookingId: booking.id,
      sentAt: new Date().toISOString(),
    })

    // Copie admin
    await transport.sendMail({
      from: `"Papillon Rose" <${FROM}>`,
      to: TO_ADMIN,
      subject: `[Admin] Devis n°${quoteNumber} annulé — ${clientName}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
        <h2 style="color:#C9948E">Devis annulé — copie admin</h2>
        <p>Le devis <strong>n°${quoteNumber}</strong> de <strong>${clientName}</strong> (${booking.client.email}) a été annulé.</p>
        <p>Date d'événement : ${eventDate} (passée)</p>
        <p>Aucun règlement reçu (acompte ni solde).</p>
        <p>Dossier clôturé automatiquement par le cron.</p>
      </div>`,
    })

    await saveEmailLog({
      id: uuidv4().slice(0, 8),
      to: TO_ADMIN,
      type: "cancelled_after_event",
      subject: `[Admin] Devis n°${quoteNumber} annulé — ${clientName}`,
      status: "sent",
      bookingId: booking.id,
      sentAt: new Date().toISOString(),
    })

    return true
  } catch (err) {
    console.error(`[cancelled-emails] Erreur envoi ${booking.id}:`, err)
    return false
  }
}

/**
 * Traite toutes les réservations annulées impayées dont l'événement est passé.
 */
export async function processCancelledEmails(): Promise<{
  processed: number
  emailsSent: number
  errors: string[]
}> {
  const bookings = await findUnpaidCancelledBookings()
  const errors: string[] = []
  let emailsSent = 0

  for (const booking of bookings) {
    const sent = await sendCancelledAfterEventEmail(booking)
    if (sent) {
      emailsSent++
    } else {
      errors.push(`Échec envoi email pour ${booking.id}`)
    }
  }

  return { processed: bookings.length, emailsSent, errors }
}
