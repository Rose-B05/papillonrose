import { kv } from "@vercel/kv"
import type { Booking, BlockedDate, QuoteRequest, PaymentRecord, LateAlert } from "./types"

// ─── Bookings ───
export async function getBookings(): Promise<Booking[]> {
  const keys = await kv.keys("bookings:*")
  if (keys.length === 0) return []
  const values = await kv.mget<Booking[]>(...keys)
  return values.filter((v): v is Booking => v !== null)
}

export async function getBooking(id: string): Promise<Booking | undefined> {
  const b = await kv.get<Booking>(`bookings:${id}`)
  return b ?? undefined
}

export async function saveBooking(booking: Booking) {
  await kv.set(`bookings:${booking.id}`, booking)
}

// ─── Blocked Dates ───
export async function getBlockedDates(): Promise<BlockedDate[]> {
  const keys = await kv.keys("blocked:*")
  if (keys.length === 0) return []
  const values = await kv.mget<BlockedDate[]>(...keys)
  return values.filter((v): v is BlockedDate => v !== null)
}

export async function getBlockedDatesForProduct(productId: number): Promise<string[]> {
  const keys = await kv.keys(`blocked:${productId}:*`)
  if (keys.length === 0) return []
  const values = await kv.mget<BlockedDate[]>(...keys)
  return values.filter((v): v is BlockedDate => v !== null).map((bd) => bd.date)
}

export async function blockDates(productId: number, dates: string[], bookingId: string) {
  const existing = await getBlockedDatesForProduct(productId)
  const toAdd = dates.filter((d) => !existing.includes(d))
  if (toAdd.length === 0) return
  await Promise.all(
    toAdd.map((date) =>
      kv.set(`blocked:${productId}:${date}`, { productId, date, bookingId } satisfies BlockedDate)
    )
  )
}

export async function unblockDates(bookingId: string) {
  const keys = await kv.keys("blocked:*")
  if (keys.length === 0) return
  const values = await kv.mget<BlockedDate[]>(...keys)
  const toDelete = values
    .filter((v): v is BlockedDate => v !== null && v.bookingId === bookingId)
    .map((bd) => `blocked:${bd.productId}:${bd.date}`)
  if (toDelete.length > 0) {
    await Promise.all(toDelete.map((k) => kv.del(k)))
  }
}

export async function areDatesAvailable(productId: number, dates: string[]): Promise<boolean> {
  const blocked = await getBlockedDatesForProduct(productId)
  return !dates.some((d) => blocked.includes(d))
}

export function getDatesBetween(start: string, end: string): string[] {
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
export async function getQuotes(): Promise<QuoteRequest[]> {
  const keys = await kv.keys("quotes:*")
  if (keys.length === 0) return []
  const values = await kv.mget<QuoteRequest[]>(...keys)
  return values.filter((v): v is QuoteRequest => v !== null)
}

export async function getQuote(id: string): Promise<QuoteRequest | undefined> {
  const q = await kv.get<QuoteRequest>(`quotes:${id}`)
  return q ?? undefined
}

export async function saveQuote(quote: QuoteRequest) {
  await kv.set(`quotes:${quote.id}`, quote)
}

// ─── Payments ───
export async function getPayments(): Promise<PaymentRecord[]> {
  const keys = await kv.keys("payments:*")
  if (keys.length === 0) return []
  const values = await kv.mget<PaymentRecord[]>(...keys)
  return values.filter((v): v is PaymentRecord => v !== null)
}

export async function savePayment(payment: PaymentRecord) {
  await kv.set(`payments:${payment.id}`, payment)
}

export async function getPaymentByBookingId(bookingId: string): Promise<PaymentRecord | undefined> {
  const payments = await getPayments()
  return payments.find((p) => p.bookingId === bookingId)
}

// ─── Late Alerts ───
export async function getLateAlerts(): Promise<LateAlert[]> {
  const keys = await kv.keys("alerts:*")
  if (keys.length === 0) return []
  const values = await kv.mget<LateAlert[]>(...keys)
  return values.filter((v): v is LateAlert => v !== null)
}

export async function getLateAlertsForBooking(bookingId: string): Promise<LateAlert[]> {
  const all = await getLateAlerts()
  return all.filter((a) => a.bookingId === bookingId)
}

export async function saveLateAlert(alert: LateAlert) {
  await kv.set(`alerts:${alert.id}`, alert)
}

export async function hasAlertForBookingOnDate(bookingId: string, productId: number, date: string): Promise<boolean> {
  const alerts = await getLateAlerts()
  return alerts.some(
    (a) => a.bookingId === bookingId && a.productId === productId && a.sentAt.split("T")[0] === date
  )
}
