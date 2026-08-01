import { getQuotes, getBookings, saveBooking, saveEmailLog, unblockDates, logActivity } from "./db"
import { sendQuoteExpiryReminder } from "./email"
import type { QuoteRequest, Booking, EmailLog } from "./types"
import { v4 as uuidv4 } from "uuid"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

// ─── QuoteRequest config (legacy, 15-day window) ───────────────────────────
const QUOTE_EXPIRY_DAYS = Number(process.env.QUOTE_EXPIRY_DAYS) || 15
const REMINDER_BEFORE_DAYS = Number(process.env.QUOTE_REMINDER_BEFORE_DAYS) || 2

// ─── Booking config (48h from quoteSentAt / 1h deposit-pending) ──────────────
const BOOKING_QUOTE_VALIDITY_HOURS = 48
const BOOKING_REMINDER_WINDOW_HOURS = 3
const DEPOSIT_PENDING_EXPIRY_HOURS = 60

// ─── Shared helpers ─────────────────────────────────────────────────────────

function hoursSince(dateStr: string): number {
  const then = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - then.getTime()
  return diff / (1000 * 60 * 60)
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - then.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// ─── QuoteRequest logic (unchanged) ────────────────────────────────────────

export async function findExpiringQuotes(): Promise<QuoteRequest[]> {
  const quotes = await getQuotes()
  const expiring: QuoteRequest[] = []

  for (const quote of quotes) {
    if (quote.statut !== "envoye" && quote.statut !== "acompte_paye") continue

    const age = daysSince(quote.createdAt)
    const daysUntilExpiry = QUOTE_EXPIRY_DAYS - age

    if (daysUntilExpiry > 0 && daysUntilExpiry <= REMINDER_BEFORE_DAYS) {
      expiring.push(quote)
    }
  }

  return expiring
}

async function hasReminderBeenSentToday(quoteId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0]
  const logs = await import("./db").then((m) => m.getEmailLogs())
  return logs.some(
    (l) => l.bookingId === quoteId && l.type === "quote-expiry-reminder" && l.sentAt.split("T")[0] === today
  )
}

// ─── Booking logic (48h validity from quoteSentAt) ─────────────────────────

export async function processBookingExpiry(): Promise<{
  processed: number
  remindersSent: number
  expired: number
  errors: string[]
  details: { quoteNumber: string; client: string; hoursRemaining: number; action: "reminder" | "expired" }[]
}> {
  const bookings = await getBookings()
  const errors: string[] = []
  const details: { quoteNumber: string; client: string; hoursRemaining: number; action: "reminder" | "expired" }[] = []
  let remindersSent = 0
  let expired = 0

  for (const booking of bookings) {
    // ─── deposit-pending: expire after 1 hour without payment ───
    if (booking.status === "deposit-pending") {
      const hoursElapsed = hoursSince(booking.createdAt)
      if (hoursElapsed >= DEPOSIT_PENDING_EXPIRY_HOURS) {
        try {
          booking.status = "expired"
          booking.updatedAt = new Date().toISOString()
          await saveBooking(booking)
          await unblockDates(booking.id)

          await logActivity({
            type: "booking_expired",
            description: `Réservation #${booking.id} expirée automatiquement (paiement non reçu après ${DEPOSIT_PENDING_EXPIRY_HOURS}h). Dates libérées.`,
            reference: booking.id,
          })

          expired++
          details.push({ quoteNumber: booking.id, client: `${booking.client.prenom} ${booking.client.nom}`, hoursRemaining: 0, action: "expired" })
        } catch (err: any) {
          errors.push(`Erreur expiration réservation #${booking.id}: ${err.message}`)
        }
      }
      continue
    }

    if (booking.status !== "quote-sent") continue
    if (!booking.quoteSentAt) continue

    const hoursElapsed = hoursSince(booking.quoteSentAt)
    const hoursRemaining = BOOKING_QUOTE_VALIDITY_HOURS - hoursElapsed
    const quoteNumber = booking.quoteNumber || booking.id
    const clientName = `${booking.client.prenom} ${booking.client.nom}`

    // Expired: >= 48h since quoteSentAt
    if (hoursElapsed >= BOOKING_QUOTE_VALIDITY_HOURS) {
      try {
        booking.status = "expired"
        booking.updatedAt = new Date().toISOString()
        await saveBooking(booking)
        await unblockDates(booking.id)

        await logActivity({
          type: "booking_expired",
          description: `Devis ${quoteNumber} expiré automatiquement (48h dépassées). Dates libérées.`,
          reference: booking.id,
        })

        expired++
        details.push({ quoteNumber, client: clientName, hoursRemaining: 0, action: "expired" })
      } catch (err: any) {
        errors.push(`Erreur expiration devis #${quoteNumber}: ${err.message}`)
      }
      continue
    }

    // Reminder window: 45h <= elapsed < 48h (i.e. 0 < hoursRemaining <= 3)
    if (hoursElapsed >= BOOKING_QUOTE_VALIDITY_HOURS - BOOKING_REMINDER_WINDOW_HOURS && hoursElapsed < BOOKING_QUOTE_VALIDITY_HOURS) {
      if (booking.quoteReminderSentAt) continue

      try {
        const lienDevis = `${SITE_URL}/compte/devis/${booking.id}`
        const joursRestants = Math.max(1, Math.ceil(hoursRemaining / 24))

        await sendQuoteExpiryReminder(
          booking.customerEmail || booking.client.email,
          quoteNumber,
          booking.client.prenom,
          lienDevis,
          joursRestants,
        )

        const log: EmailLog = {
          id: uuidv4().slice(0, 8),
          to: booking.customerEmail || booking.client.email,
          type: "quote-expiry-reminder",
          subject: `Votre devis n°${quoteNumber} expire bientôt`,
          status: "sent",
          bookingId: booking.id,
          sentAt: new Date().toISOString(),
        }
        await saveEmailLog(log)

        booking.quoteReminderSentAt = new Date().toISOString()
        booking.updatedAt = new Date().toISOString()
        await saveBooking(booking)

        remindersSent++
        details.push({ quoteNumber, client: clientName, hoursRemaining, action: "reminder" })
      } catch (err: any) {
        errors.push(`Erreur rappel devis #${quoteNumber}: ${err.message}`)
      }
    }
  }

  return { processed: 0, remindersSent, expired, errors, details }
}

// ─── Combined processor (called by cron) ───────────────────────────────────

export async function processQuoteExpiry(): Promise<{
  processed: number
  remindersSent: number
  errors: string[]
  details: { quoteNumber: string; client: string; joursRestants: number }[]
}> {
  const expiring = await findExpiringQuotes()
  const details: { quoteNumber: string; client: string; joursRestants: number }[] = []
  const errors: string[] = []
  let remindersSent = 0

  // ── QuoteRequest processing (unchanged) ──
  for (const quote of expiring) {
    const age = daysSince(quote.createdAt)
    const daysUntilExpiry = QUOTE_EXPIRY_DAYS - age

    if (await hasReminderBeenSentToday(quote.id)) continue

    try {
      const lienDevis = `${SITE_URL}/client/devis/${quote.id}`
      await sendQuoteExpiryReminder(
        quote.client.email,
        quote.quoteNumber,
        quote.client.prenom,
        lienDevis,
        daysUntilExpiry,
      )

      const log: EmailLog = {
        id: uuidv4().slice(0, 8),
        to: quote.client.email,
        type: "quote-expiry-reminder",
        subject: `Votre devis n°${quote.quoteNumber} expire bientôt`,
        status: "sent",
        bookingId: quote.id,
        sentAt: new Date().toISOString(),
      }
      await saveEmailLog(log)

      remindersSent++
      details.push({
        quoteNumber: quote.quoteNumber,
        client: `${quote.client.prenom} ${quote.client.nom}`,
        joursRestants: daysUntilExpiry,
      })
    } catch (err: any) {
      errors.push(`Erreur devis #${quote.quoteNumber}: ${err.message}`)
    }
  }

  // ── Booking processing (48h from quoteSentAt) ──
  const bookingResult = await processBookingExpiry()
  errors.push(...bookingResult.errors)
  for (const d of bookingResult.details) {
    details.push({
      quoteNumber: d.quoteNumber,
      client: d.client,
      joursRestants: Math.ceil(d.hoursRemaining / 24),
    })
  }
  remindersSent += bookingResult.remindersSent

  return { processed: expiring.length + bookingResult.expired, remindersSent, errors, details }
}
