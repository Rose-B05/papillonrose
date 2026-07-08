import fs from "fs"
import path from "path"
import type { Booking, BlockedDate, QuoteRequest, PaymentRecord, LateAlert } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function read<T>(name: string, fallback: T): T {
  ensureDir()
  const fp = path.join(DATA_DIR, `${name}.json`)
  if (!fs.existsSync(fp)) return fallback
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"))
  } catch {
    return fallback
  }
}

function write<T>(name: string, data: T) {
  ensureDir()
  const fp = path.join(DATA_DIR, `${name}.json`)
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8")
}

// ─── Bookings ───
export function getBookings(): Booking[] {
  return read<Booking[]>("bookings", [])
}

export function getBooking(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id)
}

export function saveBooking(booking: Booking) {
  const all = getBookings()
  const idx = all.findIndex((b) => b.id === booking.id)
  if (idx >= 0) all[idx] = booking
  else all.push(booking)
  write("bookings", all)
}

// ─── Blocked Dates ───
export function getBlockedDates(): BlockedDate[] {
  return read<BlockedDate[]>("blocked-dates", [])
}

export function getBlockedDatesForProduct(productId: number): string[] {
  return getBlockedDates()
    .filter((bd) => bd.productId === productId)
    .map((bd) => bd.date)
}

export function blockDates(productId: number, dates: string[], bookingId: string) {
  const all = getBlockedDates()
  const newBlocks = dates
    .filter((d) => !all.some((b) => b.productId === productId && b.date === d))
    .map((date) => ({ productId, date, bookingId }))
  write("blocked-dates", [...all, ...newBlocks])
}

export function unblockDates(bookingId: string) {
  const all = getBlockedDates()
  write("blocked-dates", all.filter((b) => b.bookingId !== bookingId))
}

export function areDatesAvailable(productId: number, dates: string[]): boolean {
  const blocked = getBlockedDatesForProduct(productId)
  return !dates.some((d) => blocked.includes(d))
}

function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start)
  const endDate = new Date(end)
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

// ─── Quotes ───
export function getQuotes(): QuoteRequest[] {
  return read<QuoteRequest[]>("quotes", [])
}

export function getQuote(id: string): QuoteRequest | undefined {
  return getQuotes().find((q) => q.id === id)
}

export function saveQuote(quote: QuoteRequest) {
  const all = getQuotes()
  const idx = all.findIndex((q) => q.id === quote.id)
  if (idx >= 0) all[idx] = quote
  else all.push(quote)
  write("quotes", all)
}

// ─── Payments ───
export function getPayments(): PaymentRecord[] {
  return read<PaymentRecord[]>("payments", [])
}

export function savePayment(payment: PaymentRecord) {
  const all = getPayments()
  all.push(payment)
  write("payments", all)
}

export function getPaymentByBookingId(bookingId: string): PaymentRecord | undefined {
  return getPayments().find((p) => p.bookingId === bookingId)
}

// ─── Helpers ───
export { getDatesBetween }

// ─── Late Alerts ───
export function getLateAlerts(): LateAlert[] {
  return read<LateAlert[]>("late-alerts", [])
}

export function getLateAlertsForBooking(bookingId: string): LateAlert[] {
  return getLateAlerts().filter((a) => a.bookingId === bookingId)
}

export function saveLateAlert(alert: LateAlert) {
  const all = getLateAlerts()
  all.push(alert)
  write("late-alerts", all)
}

export function hasAlertForBookingOnDate(bookingId: string, productId: number, date: string): boolean {
  return getLateAlerts().some(
    (a) => a.bookingId === bookingId && a.productId === productId && a.sentAt.split("T")[0] === date
  )
}
