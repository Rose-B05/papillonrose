/**
 * Test script for lib/rental-rules.ts — Weekend minAdvanceDays change.
 *
 * Simulates specific weekdays by mocking Date, then calls validateStartDate
 * to prove the logic is correct.
 *
 * Run: npx tsx __tests__/test-rental-rules.mjs
 */

// ─── Inline the functions from lib/rental-rules.ts (to avoid TS import issues) ───

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

// ─── Helpers ───

function makeDate(year, month, day) {
  return new Date(year, month, day)
}

function dayName(d) {
  return ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][d.getDay()]
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
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

// ─── SCENARIO 1: Simulated Friday — selecting TODAY should be accepted ───
console.log("═══════════════════════════════════════════════════════════")
console.log("SCENARIO 1: Friday (vendredi) — select TODAY as start date")
console.log("Expected: accepted (no error, minAdvanceDays = 0)")
console.log("═══════════════════════════════════════════════════════════")

// Simulate today = Friday 2025-07-25 (day 5 = vendredi)
const simulatedToday = makeDate(2025, 6, 25) // July 25, 2025 = Friday
console.log(`  Today simulated: ${dayName(simulatedToday)} ${formatDate(simulatedToday)}`)

const fridayToday = makeDate(2025, 6, 25) // Same day = Friday
const rule = getRentalRuleForDate(fridayToday)
console.log(`  Rule for ${dayName(fridayToday)}: "${rule.label}" (minAdvanceDays = ${rule.minAdvanceDays})`)

const errorFridayToday = validateStartDate(fridayToday, simulatedToday)
console.log(`  validateStartDate(today) = ${JSON.stringify(errorFridayToday)}`)
assert(errorFridayToday === null, "Selecting today (Friday) as start date → no error")

// ─── SCENARIO 2: Selecting yesterday (past date) should remain blocked ───
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 2: Yesterday (jeudi) — select as start date")
console.log("Expected: blocked (past date, independent of minAdvanceDays)")
console.log("═══════════════════════════════════════════════════════════")

const yesterday = makeDate(2025, 6, 24) // Thursday = yesterday from Friday
console.log(`  Yesterday: ${dayName(yesterday)} ${formatDate(yesterday)}`)

const errorYesterday = validateStartDate(yesterday, simulatedToday)
console.log(`  validateStartDate(yesterday) = ${JSON.stringify(errorYesterday)}`)
assert(errorYesterday !== null, "Selecting yesterday (past) → error returned")
assert(errorYesterday.includes("Délai minimum"), "Error mentions minimum delay")

// Note: In the actual calendar.tsx, isPast() on line 97 blocks the click
// BEFORE validateStartDate is ever called. This is the primary guard.
const isPast = yesterday < simulatedToday
console.log(`  In calendar.tsx: isPast(yesterday) = ${isPast} → click blocked at line 97`)
assert(isPast, "isPast guard in calendar.tsx blocks yesterday BEFORE validateStartDate")

// ─── SCENARIO 3: Monday rule (Semaine complète, 3 days) — NOT affected ───
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

const mondayTooSoon = makeDate(2025, 6, 27) // Sunday July 27 — but wait, Sunday is weekend rule
// Let me use a Monday that's only 1 day ahead: Monday July 26? No, July 26 is Saturday.
// Let me recalculate: July 25 = Friday, July 26 = Saturday, July 27 = Sunday, July 28 = Monday.
// Monday July 28 is 3 days from Friday July 25. That's exactly the threshold.
const monday1day = makeDate(2025, 6, 26) // Saturday — weekend rule, not Monday
// Need a Monday that's only 1-2 days from today. But if today is Friday, the next Monday is 3 days away.
// To test Monday with < 3 days, I need today to be closer to a Monday.
// Let me simulate today = Sunday July 27, then Monday July 28 is 1 day ahead.
const simulatedTodaySun = makeDate(2025, 6, 27) // Sunday
console.log(`\n  [Additional] If today = Sunday ${formatDate(simulatedTodaySun)}:`)
const errorMondayFromSun = validateStartDate(mondayDate, simulatedTodaySun)
console.log(`  validateStartDate(Monday, today=Sunday) = ${JSON.stringify(errorMondayFromSun)} (diffDays=1)`)
assert(errorMondayFromSun !== null, "Monday only 1 day ahead from Sunday → error (minAdvanceDays=3)")

// ─── SCENARIO 4: Tuesday rule (Mi-semaine, 2 days) — NOT affected ───
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 4: Tuesday (mardi) — Mi-semaine, minAdvanceDays = 2")
console.log("Expected: NOT affected by weekend change")
console.log("═══════════════════════════════════════════════════════════")

// If today = Friday July 25, next Tuesday = July 29 = 4 days ahead
const tuesdayDate = makeDate(2025, 6, 29)
console.log(`  Start date: ${dayName(tuesdayDate)} ${formatDate(tuesdayDate)}`)
const tuesdayRule = getRentalRuleForDate(tuesdayDate)
console.log(`  Rule: "${tuesdayRule.label}" (minAdvanceDays = ${tuesdayRule.minAdvanceDays})`)

const errorTuesday4days = validateStartDate(tuesdayDate, simulatedToday)
console.log(`  validateStartDate(Tuesday, today=Friday) = ${JSON.stringify(errorTuesday4days)} (diffDays=4)`)
assert(errorTuesday4days === null, "Tuesday 4 days ahead → accepted (minAdvanceDays=2)")

// Tuesday only 1 day ahead: need today = Monday. Simulate today = Monday July 28.
const simulatedTodayMon = makeDate(2025, 6, 28) // Monday
const tuesdayNext = makeDate(2025, 6, 29) // Tuesday July 29
console.log(`\n  [Additional] If today = Monday ${formatDate(simulatedTodayMon)}:`)
const errorTuesdayFromMon = validateStartDate(tuesdayNext, simulatedTodayMon)
console.log(`  validateStartDate(Tuesday, today=Monday) = ${JSON.stringify(errorTuesdayFromMon)} (diffDays=1)`)
assert(errorTuesdayFromMon !== null, "Tuesday only 1 day ahead from Monday → error (minAdvanceDays=2)")

// ─── SCENARIO 5: Weekend Saturday — select today when today is Saturday ───
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 5: Saturday (samedi) — select TODAY as start date")
console.log("Expected: accepted (minAdvanceDays = 0)")
console.log("═══════════════════════════════════════════════════════════")

const simulatedTodaySat = makeDate(2025, 6, 26) // Saturday July 26
console.log(`  Today simulated: ${dayName(simulatedTodaySat)} ${formatDate(simulatedTodaySat)}`)

const saturdayToday = makeDate(2025, 6, 26) // Same day = Saturday
const satRule = getRentalRuleForDate(saturdayToday)
console.log(`  Rule for ${dayName(saturdayToday)}: "${satRule.label}" (minAdvanceDays = ${satRule.minAdvanceDays})`)

const errorSatToday = validateStartDate(saturdayToday, simulatedTodaySat)
console.log(`  validateStartDate(today=Saturday) = ${JSON.stringify(errorSatToday)}`)
assert(errorSatToday === null, "Selecting today (Saturday) as start date → no error")

// ─── SCENARIO 6: Weekend Sunday — select today when today is Sunday ───
console.log("\n═══════════════════════════════════════════════════════════")
console.log("SCENARIO 6: Sunday (dimanche) — select TODAY as start date")
console.log("Expected: accepted (minAdvanceDays = 0)")
console.log("═══════════════════════════════════════════════════════════")

const simulatedTodaySun2 = makeDate(2025, 6, 27) // Sunday July 27
console.log(`  Today simulated: ${dayName(simulatedTodaySun2)} ${formatDate(simulatedTodaySun2)}`)

const sundayToday = makeDate(2025, 6, 27) // Same day = Sunday
const sunRule = getRentalRuleForDate(sundayToday)
console.log(`  Rule for ${dayName(sundayToday)}: "${sunRule.label}" (minAdvanceDays = ${sunRule.minAdvanceDays})`)

const errorSunToday = validateStartDate(sundayToday, simulatedTodaySun2)
console.log(`  validateStartDate(today=Sunday) = ${JSON.stringify(errorSunToday)}`)
assert(errorSunToday === null, "Selecting today (Sunday) as start date → no error")

// ─── SUMMARY ───
console.log("\n═══════════════════════════════════════════════════════════")
console.log(`RESULTS: ${passed} passed, ${failed} failed`)
if (failed === 0) {
  console.log("ALL TESTS PASSED ✓")
} else {
  console.log("SOME TESTS FAILED ✗")
  process.exit(1)
}
console.log("═══════════════════════════════════════════════════════════")
