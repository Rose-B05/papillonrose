import { getQuotes, saveEmailLog } from "./db"
import { sendQuoteExpiryReminder } from "./email"
import type { QuoteRequest, EmailLog } from "./types"
import { v4 as uuidv4 } from "uuid"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"
const QUOTE_EXPIRY_DAYS = Number(process.env.QUOTE_EXPIRY_DAYS) || 15
const REMINDER_BEFORE_DAYS = Number(process.env.QUOTE_REMINDER_BEFORE_DAYS) || 2

function daysSince(dateStr: string): number {
  const then = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - then.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Trouve les devis qui approchent de l'expiration et qui n'ont pas encore eu de relance.
 * Cible les statuts : "envoye" (en attente client) ou "acompte_paye" (solde pas encore réglé).
 */
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

/**
 * Vérifie si un email de relance a déjà été envoyé pour ce devis aujourd'hui.
 */
async function hasReminderBeenSentToday(quoteId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0]
  const logs = await import("./db").then((m) => m.getEmailLogs())
  return logs.some(
    (l) => l.bookingId === quoteId && l.type === "quote-expiry-reminder" && l.sentAt.split("T")[0] === today
  )
}

/**
 * Traite tous les devis en voie d'expiration et envoie les relances.
 */
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

  return { processed: expiring.length, remindersSent, errors, details }
}
