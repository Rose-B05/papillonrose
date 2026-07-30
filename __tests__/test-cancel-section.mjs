#!/usr/bin/env node

/**
 * Test script for cancel section logic in app/compte/devis/[id]/page.tsx
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Ne jamais écrire un jour de semaine en dur dans les logs de test.  ║
 * ║ Toujours le calculer depuis l'objet Date utilisé, pour éviter     ║
 * ║ toute incohérence non détectée.                                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * This script tests the date validation and days-until-event logic
 * used in the cancel section of the devis detail page.
 *
 * Run: node __tests__/test-cancel-section.mjs
 */

// ─── Reimplemented functions from page.tsx ───────────────────────────────────

function getDaysUntilEvent(dateEvenement) {
  if (!dateEvenement) return NaN
  const now = new Date()
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const eventDate = new Date(dateEvenement)
  if (isNaN(eventDate.getTime())) return NaN
  const eventUtc = new Date(Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate()))
  const diffMs = eventUtc.getTime() - todayUtc.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function isValidDate(dateStr) {
  if (!dateStr) return false
  return !isNaN(new Date(dateStr).getTime())
}

const CANCELLABLE_STATUSES = ["pending-quote", "quote-sent", "deposit-pending", "confirmed"]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function assert(condition, label) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${label}`)
    process.exitCode = 1
  } else {
    console.log(`  ✓ ${label}`)
  }
}

function localDateStr(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
}

const DAY_NAMES_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const now = new Date()
console.log(`Real now: ${DAY_NAMES_FR[now.getDay()]} ${localDateStr(now)}`)

// ─── SCENARIO 1: getDaysUntilEvent with valid ISO dates ─────────────────────
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 1: getDaysUntilEvent with valid ISO dates")
console.log("═══════════════════════════════════════════════════════════")

const today = new Date()
const todayStr = localDateStr(today)
const futureDate = new Date(today)
futureDate.setDate(futureDate.getDate() + 10)
const futureStr = localDateStr(futureDate)
const pastDate = new Date(today)
pastDate.setDate(pastDate.getDate() - 3)
const pastStr = localDateStr(pastDate)

const daysUntilFuture = getDaysUntilEvent(futureStr)
const daysUntilPast = getDaysUntilEvent(pastStr)
const daysUntilToday = getDaysUntilEvent(todayStr)

console.log(`  Today: ${todayStr}, Future: ${futureStr} (+10), Past: ${pastStr} (-3)`)
console.log(`  daysUntilFuture = ${daysUntilFuture}`)
console.log(`  daysUntilPast = ${daysUntilPast}`)
console.log(`  daysUntilToday = ${daysUntilToday}`)

assert(daysUntilFuture === 10, `future date: daysUntil === 10 (got ${daysUntilFuture})`)
assert(daysUntilPast < 0, `past date: daysUntil < 0 (got ${daysUntilPast})`)
assert(daysUntilToday === 0, `today: daysUntil === 0 (got ${daysUntilToday})`)
assert(!isNaN(daysUntilFuture), "future: not NaN")
assert(!isNaN(daysUntilPast), "past: not NaN")
assert(!isNaN(daysUntilToday), "today: not NaN")

// ─── SCENARIO 2: getDaysUntilEvent with invalid/empty dates ─────────────────
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 2: getDaysUntilEvent with invalid/empty dates")
console.log("═══════════════════════════════════════════════════════════")

const emptyResult = getDaysUntilEvent("")
const undefinedResult = getDaysUntilEvent(undefined)
const garbageResult = getDaysUntilEvent("not-a-date")
const frenchFormatResult = getDaysUntilEvent("29 juillet 2026")
const slashFormatResult = getDaysUntilEvent("29/07/2026")

console.log(`  getDaysUntilEvent("") = ${emptyResult}`)
console.log(`  getDaysUntilEvent(undefined) = ${undefinedResult}`)
console.log(`  getDaysUntilEvent("not-a-date") = ${garbageResult}`)
console.log(`  getDaysUntilEvent("29 juillet 2026") = ${frenchFormatResult}`)
console.log(`  getDaysUntilEvent("29/07/2026") = ${slashFormatResult}`)

assert(isNaN(emptyResult), "empty string → NaN")
assert(isNaN(undefinedResult), "undefined → NaN")
assert(isNaN(garbageResult), "garbage string → NaN")
assert(isNaN(frenchFormatResult), "french format '29 juillet 2026' → NaN")
assert(isNaN(slashFormatResult), "slash format '29/07/2026' → NaN")

// ─── SCENARIO 3: isValidDate ────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 3: isValidDate")
console.log("═══════════════════════════════════════════════════════════")

assert(isValidDate("2026-07-29") === true, "ISO date → true")
assert(isValidDate("") === false, "empty string → false")
assert(isValidDate(undefined) === false, "undefined → false")
assert(isValidDate("not-a-date") === false, "garbage → false")
assert(isValidDate("29 juillet 2026") === false, "french format → false")
assert(isValidDate("29/07/2026") === false, "slash format → false")

// ─── SCENARIO 4: Cancel section rendering logic ─────────────────────────────
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 4: Cancel section rendering logic")
console.log("═══════════════════════════════════════════════════════════")

function getCancelSectionAction(status, dateEvenement) {
  if (!CANCELLABLE_STATUSES.includes(status)) return "no-cancel-section"
  const hasValidDate = isValidDate(dateEvenement)
  const daysLeft = hasValidDate ? getDaysUntilEvent(dateEvenement) : NaN
  if (!hasValidDate || isNaN(daysLeft) || daysLeft > 7) return "show-cancel-button"
  if (daysLeft <= 0) return "show-event-passed"
  return "show-deadline-warning"
}

// deposit-pending + valid future date (>7 days)
const futureDateStr = localDateStr((() => { const d = new Date(); d.setDate(d.getDate() + 10); return d })())
assert(getCancelSectionAction("deposit-pending", futureDateStr) === "show-cancel-button",
  `deposit-pending + future >7d → show-cancel-button (got ${getCancelSectionAction("deposit-pending", futureDateStr)})`)

// deposit-pending + valid future date (<=7 days)
const nearFutureStr = localDateStr((() => { const d = new Date(); d.setDate(d.getDate() + 3); return d })())
assert(getCancelSectionAction("deposit-pending", nearFutureStr) === "show-deadline-warning",
  `deposit-pending + future <=7d → show-deadline-warning (got ${getCancelSectionAction("deposit-pending", nearFutureStr)})`)

// deposit-pending + past date
const pastDateStr = localDateStr((() => { const d = new Date(); d.setDate(d.getDate() - 3); return d })())
assert(getCancelSectionAction("deposit-pending", pastDateStr) === "show-event-passed",
  `deposit-pending + past → show-event-passed (got ${getCancelSectionAction("deposit-pending", pastDateStr)})`)

// deposit-pending + today
assert(getCancelSectionAction("deposit-pending", todayStr) === "show-event-passed",
  `deposit-pending + today → show-event-passed (got ${getCancelSectionAction("deposit-pending", todayStr)})`)

// deposit-pending + invalid date (french format — the original bug)
assert(getCancelSectionAction("deposit-pending", "29 juillet 2026") === "show-cancel-button",
  `deposit-pending + "29 juillet 2026" → show-cancel-button (got ${getCancelSectionAction("deposit-pending", "29 juillet 2026")})`)

// deposit-pending + empty date
assert(getCancelSectionAction("deposit-pending", "") === "show-cancel-button",
  `deposit-pending + "" → show-cancel-button (got ${getCancelSectionAction("deposit-pending", "")})`)

// cancelled status → no cancel section
assert(getCancelSectionAction("cancelled", futureDateStr) === "no-cancel-section",
  `cancelled + future → no-cancel-section (got ${getCancelSectionAction("cancelled", futureDateStr)})`)

// expired status → no cancel section
assert(getCancelSectionAction("expired", futureDateStr) === "no-cancel-section",
  `expired + future → no-cancel-section (got ${getCancelSectionAction("expired", futureDateStr)})`)

// confirmed + valid date
assert(getCancelSectionAction("confirmed", nearFutureStr) === "show-deadline-warning",
  `confirmed + near future → show-deadline-warning (got ${getCancelSectionAction("confirmed", nearFutureStr)})`)

// ─── SUMMARY ─────────────────────────────────────────────────────────────────

console.log("\n═══════════════════════════════════════════════════════════")
const passed = process.exitCode !== 1
console.log(passed ? "ALL TESTS PASSED ✓" : "SOME TESTS FAILED ✗")
console.log("═══════════════════════════════════════════════════════════")
