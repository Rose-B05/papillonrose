#!/usr/bin/env node

/**
 * Test script for processBookingExpiry() logic from lib/quote-expiry.ts
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Ne jamais écrire un jour de semaine en dur dans les logs de test.  ║
 * ║ Toujours le calculer depuis l'objet Date utilisé, pour éviter     ║
 * ║ toute incohérence non détectée.                                    ║
 * ║                                                                    ║
 * ║ Ne jamais utiliser toISOString() pour afficher une date locale :   ║
 * ║ toISOString() renvoie UTC, donc setHours(0,0,0,0) sur un Date     ║
 * ║ local produit "la veille" en UTC (décalage horaire).              ║
 * ║ Utiliser plutôt :                                                  ║
 * ║   d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()           ║
 * ║ ou toLocaleDateString('fr-FR').                                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * This script reimplements the exact same algorithm with in-memory state to
 * prove the logic works without needing @vercel/kv or any external dependency.
 *
 * Scenarios tested:
 *   A) Booking with quoteSentAt = 49h ago → must expire, unblockDates called
 *   B) Booking with quoteSentAt = 46h ago → must send reminder once, no double-send
 *
 * Run: node __tests__/test-quote-expiry.mjs
 */

import { randomUUID } from "node:crypto"

// ─── Constants (mirroring lib/quote-expiry.ts) ──────────────────────────────
const BOOKING_QUOTE_VALIDITY_HOURS = 48
const BOOKING_REMINDER_WINDOW_HOURS = 3

// ─── In-memory state ────────────────────────────────────────────────────────
const bookings = []
const blockedDates = new Map()
const emailLogs = []
const activityLogs = []
let emailSendCount = 0

// ─── Helpers (exact copy from lib/quote-expiry.ts) ─────────────────────────
function hoursSince(dateStr) {
  const then = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - then.getTime()
  return diff / (1000 * 60 * 60)
}

// ─── Mock db functions ─────────────────────────────────────────────────────
async function getBookings() {
  return bookings
}

async function saveBooking(booking) {
  const idx = bookings.findIndex((b) => b.id === booking.id)
  if (idx >= 0) bookings[idx] = { ...booking }
  else bookings.push({ ...booking })
}

async function unblockDates(bookingId) {
  let unblocked = 0
  for (const [key, map] of blockedDates.entries()) {
    const toDelete = []
    for (const [date, bid] of Object.entries(map)) {
      if (bid === bookingId) toDelete.push(date)
    }
    for (const d of toDelete) {
      delete map[d]
      unblocked++
    }
    if (Object.keys(map).length === 0) blockedDates.delete(key)
  }
  return unblocked
}

async function saveEmailLog(log) {
  emailLogs.push({ ...log })
}

async function logActivity(event) {
  activityLogs.push({ ...event, id: randomUUID(), createdAt: new Date().toISOString() })
}

async function sendQuoteExpiryReminder(to, quoteNumber, prenom, lienDevis, joursRestants) {
  emailSendCount++
  return { to, quoteNumber, prenom, lienDevis, joursRestants }
}

// ─── processBookingExpiry (exact copy from lib/quote-expiry.ts) ─────────────
async function processBookingExpiry() {
  const allBookings = await getBookings()
  const errors = []
  const details = []
  let remindersSent = 0
  let expired = 0

  for (const booking of allBookings) {
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
      } catch (err) {
        errors.push(`Erreur expiration devis #${quoteNumber}: ${err.message}`)
      }
      continue
    }

    // Reminder window: 45h <= elapsed < 48h (i.e. 0 < hoursRemaining <= 3)
    if (hoursElapsed >= BOOKING_QUOTE_VALIDITY_HOURS - BOOKING_REMINDER_WINDOW_HOURS && hoursElapsed < BOOKING_QUOTE_VALIDITY_HOURS) {
      if (booking.quoteReminderSentAt) continue

      try {
        const SITE_URL = "https://www.papillonrose.fr"
        const lienDevis = `${SITE_URL}/compte/devis/${booking.id}`
        const joursRestants = Math.max(1, Math.ceil(hoursRemaining / 24))

        await sendQuoteExpiryReminder(
          booking.customerEmail || booking.client.email,
          quoteNumber,
          booking.client.prenom,
          lienDevis,
          joursRestants,
        )

        const log = {
          id: randomUUID().slice(0, 8),
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
      } catch (err) {
        errors.push(`Erreur rappel devis #${quoteNumber}: ${err.message}`)
      }
    }
  }

  return { processed: 0, remindersSent, expired, errors, details }
}

// ─── Test helpers ────────────────────────────────────────────────────────────
function makeBooking(id, hoursAgo, status = "quote-sent") {
  return {
    id,
    items: [{ productId: 1, qty: 1, dateStart: "2026-08-01", dateEnd: "2026-08-03", variantLabel: "Standard", prix: 50 }],
    client: { nom: "Dupont", prenom: "Marie", email: "marie@test.fr", telephone: "0600000000", typeEvenement: "mariage", dateEvenement: "2026-08-10", lieuEvenement: "Paris", nbInvites: 50, besoinLivraison: false },
    customerEmail: "marie@test.fr",
    totalHt: 100,
    totalTtc: 120,
    depositAmount: 36,
    status,
    quoteNumber: `DEV-${id}`,
    createdAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    quoteSentAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
  }
}

function assert(condition, label) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${label}`)
    process.exitCode = 1
  } else {
    console.log(`  ✓ ${label}`)
  }
}

// ─── Display real now (for reference) ─────────────────────────────────────
const DAY_NAMES_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const now = new Date()
console.log(`Real now: ${DAY_NAMES_FR[now.getDay()]} ${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR")}`)

// ─── SCENARIO A: 49h → must expire ─────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO A: Booking with quoteSentAt = 49h ago")
console.log("Expected: status → expired, unblockDates called, dates freed")
console.log("═══════════════════════════════════════════════════════════")

const testBookingA = makeBooking("booking-a", 49)
bookings.push(testBookingA)
blockedDates.set("blocked:product:1", { "2026-08-01": "booking-a", "2026-08-02": "booking-a", "2026-08-03": "booking-a" })

const beforeBlockedA = JSON.stringify(Object.keys(blockedDates.get("blocked:product:1") || {}))
console.log(`\n  Before: blocked dates = ${beforeBlockedA}`)
console.log(`  Before: booking status = "${testBookingA.status}"`)

emailSendCount = 0
const resultA = await processBookingExpiry()

console.log(`\n  After processBookingExpiry():`)
console.log(`    result.expired = ${resultA.expired}`)
console.log(`    result.remindersSent = ${resultA.remindersSent}`)
console.log(`    result.errors = ${JSON.stringify(resultA.errors)}`)
console.log(`    result.details = ${JSON.stringify(resultA.details)}`)

const bookingAfterA = bookings.find((b) => b.id === "booking-a")
console.log(`    booking.status = "${bookingAfterA.status}"`)
console.log(`    emailSendCount = ${emailSendCount}`)
console.log(`    activityLogs = ${JSON.stringify(activityLogs.map((l) => ({ type: l.type, description: l.description })))}`)

const blockedAfterA = blockedDates.get("blocked:product:1")
console.log(`    blocked dates = ${JSON.stringify(Object.keys(blockedAfterA || {}))}`)

assert(resultA.expired === 1, "result.expired === 1")
assert(resultA.remindersSent === 0, "result.remindersSent === 0")
assert(resultA.errors.length === 0, "no errors")
assert(bookingAfterA.status === "expired", 'booking.status === "expired"')
assert(emailSendCount === 0, "no email sent (expiry, not reminder)")
assert(activityLogs.length === 1, "one activity logged")
assert(activityLogs[0].type === "booking_expired", 'activity type === "booking_expired"')
assert(!blockedAfterA || Object.keys(blockedAfterA).length === 0, "dates unblocked")

// Run again — should be a no-op (already expired)
console.log("\n  Running again (idempotency check)...")
emailSendCount = 0
const resultA2 = await processBookingExpiry()
assert(resultA2.expired === 0, "second run: no new expiry (already expired)")
assert(emailSendCount === 0, "second run: no email sent")

// ─── SCENARIO B: 46h → must send reminder, no double-send ──────────────────
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO B: Booking with quoteSentAt = 46h ago")
console.log("Expected: reminder sent once, quoteReminderSentAt set")
console.log("Expected: second run sends nothing (no double-send)")
console.log("═══════════════════════════════════════════════════════════")

const testBookingB = makeBooking("booking-b", 46)
bookings.push(testBookingB)

console.log(`\n  Before: booking status = "${testBookingB.status}"`)
console.log(`  Before: quoteReminderSentAt = ${testBookingB.quoteReminderSentAt || "undefined"}`)

emailSendCount = 0
const emailCountBefore = emailLogs.length
const resultB = await processBookingExpiry()

console.log(`\n  After first processBookingExpiry():`)
console.log(`    result.expired = ${resultB.expired}`)
console.log(`    result.remindersSent = ${resultB.remindersSent}`)
console.log(`    result.errors = ${JSON.stringify(resultB.errors)}`)
console.log(`    result.details = ${JSON.stringify(resultB.details)}`)

const bookingAfterB = bookings.find((b) => b.id === "booking-b")
console.log(`    booking.status = "${bookingAfterB.status}"`)
console.log(`    booking.quoteReminderSentAt = ${bookingAfterB.quoteReminderSentAt}`)
console.log(`    emailSendCount = ${emailSendCount}`)
console.log(`    new emailLogs = ${JSON.stringify(emailLogs.slice(emailCountBefore))}`)

assert(resultB.expired === 0, "result.expired === 0")
assert(resultB.remindersSent === 1, "result.remindersSent === 1")
assert(resultB.errors.length === 0, "no errors")
assert(bookingAfterB.status === "quote-sent", 'booking.status still "quote-sent"')
assert(bookingAfterB.quoteReminderSentAt !== undefined, "quoteReminderSentAt is set")
assert(emailSendCount === 1, "exactly 1 email sent")
assert(resultB.details[0].action === "reminder", 'details[0].action === "reminder"')
assert(resultB.details[0].hoursRemaining > 0 && resultB.details[0].hoursRemaining <= 3, "hoursRemaining in 1..3")

// Run again — must NOT send a second email
console.log("\n  Running again (no double-send check)...")
emailSendCount = 0
const emailCountBefore2 = emailLogs.length
const resultB2 = await processBookingExpiry()

console.log(`  After second processBookingExpiry():`)
console.log(`    result.remindersSent = ${resultB2.remindersSent}`)
console.log(`    emailSendCount = ${emailSendCount}`)
console.log(`    new emailLogs = ${JSON.stringify(emailLogs.slice(emailCountBefore2))}`)

assert(resultB2.remindersSent === 0, "second run: no new reminder sent")
assert(emailSendCount === 0, "second run: emailSendCount === 0 (no double-send)")

// ─── SUMMARY ────────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════════")
const passed = process.exitCode !== 1
console.log(passed ? "ALL TESTS PASSED ✓" : "SOME TESTS FAILED ✗")
console.log("═══════════════════════════════════════════════════════════")
