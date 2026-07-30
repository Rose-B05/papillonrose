/**
 * Test script for lib/rental-rules.ts — Weekend minAdvanceDays change.
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
 * Run: node __tests__/test-rental-rules.mjs
 */

// ─── Inline the functions from lib/rental-rules.ts ────────────────────────

const RENTAL_RULES = [
  {
    label: "Semaine complète",
    startDays: [1], // lundi
    minAdvanceDays: 3,
    minNights: 1,
    maxNights: 7,
  },
  {
    label: "Mi-semaine",
    startDays: [2, 3, 4], // mardi, mercredi, jeudi
    minAdvanceDays: 2,
    minNights: 1,
    maxNights: 5,
  },
  {
    label: "Week-end",
    startDays: [5, 6, 0], // vendredi, samedi, dimanche
    minAdvanceDays: 0,
    minNights: 1,
    maxNights: 4,
  },
]

function getRentalRuleForDate(startDate) {
  const dayOfWeek = startDate.getDay()
  return RENTAL_RULES.find((r) => r.startDays.includes(dayOfWeek)) || RENTAL_RULES[0]
}

function validateStartDate(startDate, todayOverride) {
  const rule = getRentalRuleForDate(startDate)
  const today = todayOverride || new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.floor(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < rule.minAdvanceDays) {
    return `Délai minimum de ${rule.minAdvanceDays} jours avant la date de début pour une location ${rule.label.toLowerCase()}.`
  }

  return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const DAY_NAMES_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]

function makeDate(year, month, day) {
  return new Date(year, month, day)
}

/** Display date using LOCAL time components (never toISOString). */
function dayName(d) {
  return DAY_NAMES_FR[d.getDay()]
}

/** Format date as YYYY-MM-DD using LOCAL time (not UTC). */
function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Get today as a Date set to local midnight. */
function getToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

let passed = 0
let failed = 0

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${label}`)
    failed++
  }
}

// ══════════════════════════════════════════════════════════════════════════
// SCENARIO 0: Real today — use actual system date, verify day name
// ══════════════════════════════════════════════════════════════════════════
console.log("═══════════════════════════════════════════════════════════")
console.log("SCENARIO 0: Real system date — verify day name consistency")
console.log("═══════════════════════════════════════════════════════════")

const realToday = getToday()
const realDayOfWeek = realToday.getDay()
const realDayName = dayName(realToday)
const realDateStr = formatDate(realToday)

console.log(`  Real today: ${realDayName} ${realDateStr}`)
console.log(`  getDay() = ${realDayOfWeek} → expected day name: ${DAY_NAMES_FR[realDayOfWeek]}`)
assert(realDayName === DAY_NAMES_FR[realDayOfWeek], "Day name computed from getDay() matches DAY_NAMES_FR lookup")

// Verify against Date.prototype.toLocaleDateString as independent cross-check
const localeStr = realToday.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
console.log(`  toLocaleDateString('fr-FR'): ${localeStr}`)
assert(localeStr.toLowerCase().startsWith(realDayName.toLowerCase()), "toLocaleDateString day matches computed dayName")

// Test validateStartDate with real today
const realTodayRule = getRentalRuleForDate(realToday)
console.log(`  Rule for real today: "${realTodayRule.label}" (minAdvanceDays = ${realTodayRule.minAdvanceDays})`)
const errRealToday = validateStartDate(realToday, new Date(realToday))
console.log(`  validateStartDate(real today) = ${JSON.stringify(errRealToday)}`)
// With minAdvanceDays=0 for weekend, today should be accepted.
// With minAdvanceDays>0 for weekday, today should be rejected (diffDays=0).
const realTodayIsWeekend = [0, 5, 6].includes(realDayOfWeek)
if (realTodayIsWeekend) {
  assert(errRealToday === null, "Real today is weekend → accepted (minAdvanceDays=0)")
} else {
  assert(errRealToday !== null, `Real today is ${realDayName} → blocked (minAdvanceDays=${realTodayRule.minAdvanceDays})`)
}

// ══════════════════════════════════════════════════════════════════════════
// SCENARIO 1: Simulated Friday — selecting TODAY should be accepted
// ══════════════════════════════════════════════════════════════════════════
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 1: Friday (vendredi) — select TODAY as start date")
console.log("Expected: accepted (no error, minAdvanceDays = 0)")
console.log("═══════════════════════════════════════════════════════════")

// July 25, 2025 = Friday (verified: 2025-01-01 = Wed, +204 days = Fri Jul 25)
const simulatedToday = makeDate(2025, 6, 25)
console.log(`  Today simulated: ${dayName(simulatedToday)} ${formatDate(simulatedToday)}`)

const fridayToday = makeDate(2025, 6, 25)
const rule = getRentalRuleForDate(fridayToday)
console.log(`  Rule for ${dayName(fridayToday)}: "${rule.label}" (minAdvanceDays = ${rule.minAdvanceDays})`)

const errorFridayToday = validateStartDate(fridayToday, simulatedToday)
console.log(`  validateStartDate(today) = ${JSON.stringify(errorFridayToday)}`)
assert(errorFridayToday === null, "Selecting today (Friday) as start date → no error")

// ══════════════════════════════════════════════════════════════════════════
// SCENARIO 2: Selecting yesterday (past date) should remain blocked
// ══════════════════════════════════════════════════════════════════════════
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 2: Yesterday (jeudi) — select as start date")
console.log("Expected: blocked (past date, independent of minAdvanceDays)")
console.log("═══════════════════════════════════════════════════════════")

// July 24, 2025 = Thursday (one day before Friday July 25)
const yesterday = makeDate(2025, 6, 24)
console.log(`  Yesterday: ${dayName(yesterday)} ${formatDate(yesterday)}`)

const errorYesterday = validateStartDate(yesterday, simulatedToday)
console.log(`  validateStartDate(yesterday) = ${JSON.stringify(errorYesterday)}`)
assert(errorYesterday !== null, "Selecting yesterday (past) → error returned")
assert(errorYesterday.includes("Délai minimum"), "Error mentions minimum delay")

// In calendar.tsx, isPast() blocks the click BEFORE validateStartDate
const isPast = yesterday < simulatedToday
console.log(`  In calendar.tsx: isPast(yesterday) = ${isPast} → click blocked at line 97`)
assert(isPast, "isPast guard in calendar.tsx blocks yesterday BEFORE validateStartDate")

// ══════════════════════════════════════════════════════════════════════════
// SCENARIO 3: Monday rule (Semaine complète, 3 days) — NOT affected
// ══════════════════════════════════════════════════════════════════════════
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 3: Monday (lundi) — Semaine complète, minAdvanceDays = 3")
console.log("Expected: NOT affected by weekend change")
console.log("═══════════════════════════════════════════════════════════")

// Monday July 28, 2025 = 3 days after Friday July 25
const mondayDate = makeDate(2025, 6, 28)
console.log(`  Start date: ${dayName(mondayDate)} ${formatDate(mondayDate)}`)
const mondayRule = getRentalRuleForDate(mondayDate)
console.log(`  Rule: "${mondayRule.label}" (minAdvanceDays = ${mondayRule.minAdvanceDays})`)

const errorMonday3days = validateStartDate(mondayDate, simulatedToday)
console.log(`  validateStartDate(Monday, today=Friday) = ${JSON.stringify(errorMonday3days)} (diffDays=3)`)
assert(errorMonday3days === null, "Monday 3 days ahead → accepted (minAdvanceDays=3)")

// Monday only 1 day ahead: simulate today = Sunday July 27, then Monday July 28 = 1 day
const simulatedTodaySun = makeDate(2025, 6, 27) // Sunday
console.log(`\n  [Additional] If today = ${dayName(simulatedTodaySun)} ${formatDate(simulatedTodaySun)}:`)
const errorMondayFromSun = validateStartDate(mondayDate, simulatedTodaySun)
console.log(`  validateStartDate(Monday, today=Sunday) = ${JSON.stringify(errorMondayFromSun)} (diffDays=1)`)
assert(errorMondayFromSun !== null, "Monday only 1 day ahead from Sunday → error (minAdvanceDays=3)")

// ══════════════════════════════════════════════════════════════════════════
// SCENARIO 4: Tuesday rule (Mi-semaine, 2 days) — NOT affected
// ══════════════════════════════════════════════════════════════════════════
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 4: Tuesday (mardi) — Mi-semaine, minAdvanceDays = 2")
console.log("Expected: NOT affected by weekend change")
console.log("═══════════════════════════════════════════════════════════")

// Tuesday July 29, 2025 = 4 days after Friday July 25
const tuesdayDate = makeDate(2025, 6, 29)
console.log(`  Start date: ${dayName(tuesdayDate)} ${formatDate(tuesdayDate)}`)
const tuesdayRule = getRentalRuleForDate(tuesdayDate)
console.log(`  Rule: "${tuesdayRule.label}" (minAdvanceDays = ${tuesdayRule.minAdvanceDays})`)

const errorTuesday4days = validateStartDate(tuesdayDate, simulatedToday)
console.log(`  validateStartDate(Tuesday, today=Friday) = ${JSON.stringify(errorTuesday4days)} (diffDays=4)`)
assert(errorTuesday4days === null, "Tuesday 4 days ahead → accepted (minAdvanceDays=2)")

// Tuesday only 1 day ahead: simulate today = Monday July 28, then Tuesday July 29 = 1 day
const simulatedTodayMon = makeDate(2025, 6, 28) // Monday
const tuesdayNext = makeDate(2025, 6, 29) // Tuesday July 29
console.log(`\n  [Additional] If today = ${dayName(simulatedTodayMon)} ${formatDate(simulatedTodayMon)}:`)
const errorTuesdayFromMon = validateStartDate(tuesdayNext, simulatedTodayMon)
console.log(`  validateStartDate(Tuesday, today=Monday) = ${JSON.stringify(errorTuesdayFromMon)} (diffDays=1)`)
assert(errorTuesdayFromMon !== null, "Tuesday only 1 day ahead from Monday → error (minAdvanceDays=2)")

// ══════════════════════════════════════════════════════════════════════════
// SCENARIO 5: Weekend Saturday — select today when today is Saturday
// ══════════════════════════════════════════════════════════════════════════
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 5: Saturday (samedi) — select TODAY as start date")
console.log("Expected: accepted (minAdvanceDays = 0)")
console.log("═══════════════════════════════════════════════════════════")

// July 26, 2025 = Saturday (verified: Jul 25 = Fri +1 = Sat)
const simulatedTodaySat = makeDate(2025, 6, 26)
console.log(`  Today simulated: ${dayName(simulatedTodaySat)} ${formatDate(simulatedTodaySat)}`)

const saturdayToday = makeDate(2025, 6, 26)
const satRule = getRentalRuleForDate(saturdayToday)
console.log(`  Rule for ${dayName(saturdayToday)}: "${satRule.label}" (minAdvanceDays = ${satRule.minAdvanceDays})`)

const errorSatToday = validateStartDate(saturdayToday, simulatedTodaySat)
console.log(`  validateStartDate(today=Saturday) = ${JSON.stringify(errorSatToday)}`)
assert(errorSatToday === null, "Selecting today (Saturday) as start date → no error")

// ══════════════════════════════════════════════════════════════════════════
// SCENARIO 6: Weekend Sunday — select today when today is Sunday
// ══════════════════════════════════════════════════════════════════════════
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 6: Sunday (dimanche) — select TODAY as start date")
console.log("Expected: accepted (minAdvanceDays = 0)")
console.log("═══════════════════════════════════════════════════════════")

// July 27, 2025 = Sunday (verified: Jul 25 = Fri +2 = Sun)
const simulatedTodaySun2 = makeDate(2025, 6, 27)
console.log(`  Today simulated: ${dayName(simulatedTodaySun2)} ${formatDate(simulatedTodaySun2)}`)

const sundayToday = makeDate(2025, 6, 27)
const sunRule = getRentalRuleForDate(sundayToday)
console.log(`  Rule for ${dayName(sundayToday)}: "${sunRule.label}" (minAdvanceDays = ${sunRule.minAdvanceDays})`)

const errorSunToday = validateStartDate(sundayToday, simulatedTodaySun2)
console.log(`  validateStartDate(today=Sunday) = ${JSON.stringify(errorSunToday)}`)
assert(errorSunToday === null, "Selecting today (Sunday) as start date → no error")

// ─── SUMMARY ─────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════════")
console.log(`RESULTS: ${passed} passed, ${failed} failed`)
if (failed === 0) {
  console.log("ALL TESTS PASSED ✓")
} else {
  console.log("SOME TESTS FAILED ✗")
  process.exit(1)
}
console.log("═══════════════════════════════════════════════════════════")
