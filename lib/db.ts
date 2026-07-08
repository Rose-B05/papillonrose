import { kv } from "@vercel/kv"
import type { Booking, BlockedDate, QuoteRequest, PaymentRecord, LateAlert } from "./types"

// ─── Bookings ───
const BOOKINGS_INDEX = "bookings:index"

export async function getBookings(): Promise<Booking[]> {
  const ids = await kv.get<string[]>(BOOKINGS_INDEX)
  if (!ids || ids.length === 0) return []
  const values = await kv.mget<Booking[]>(...ids.map((id) => `bookings:${id}`))
  return values.filter((v): v is Booking => v !== null)
}

export async function getBooking(id: string): Promise<Booking | undefined> {
  const b = await kv.get<Booking>(`bookings:${id}`)
  return b ?? undefined
}

export async function saveBooking(booking: Booking) {
  await kv.set(`bookings:${booking.id}`, booking)
  // Maintain index
  const ids = (await kv.get<string[]>(BOOKINGS_INDEX)) || []
  if (!ids.includes(booking.id)) {
    ids.push(booking.id)
    await kv.set(BOOKINGS_INDEX, ids)
  }
}

// ─── Blocked Dates ───
// Stored as: blocked:product:{productId} = { [date]: bookingId }
export async function getBlockedDates(): Promise<BlockedDate[]> {
  const keys = await kv.keys("blocked:product:*")
  if (keys.length === 0) return []
  const values = await kv.mget<Record<string, string>[]>(...keys)
  const result: BlockedDate[] = []
  for (let i = 0; i < keys.length; i++) {
    const m = values[i]
    if (!m) continue
    const productId = Number(keys[i].split(":")[2])
    for (const [date, bookingId] of Object.entries(m)) {
      result.push({ productId, date, bookingId })
    }
  }
  return result
}

export async function getBlockedDatesForProduct(productId: number): Promise<string[]> {
  const map = await kv.get<Record<string, string>>(`blocked:product:${productId}`)
  if (!map) return []
  return Object.keys(map)
}

export async function blockDates(productId: number, dates: string[], bookingId: string) {
  const key = `blocked:product:${productId}`
  const map = (await kv.get<Record<string, string>>(key)) || {}
  let changed = false
  for (const d of dates) {
    if (!map[d]) {
      map[d] = bookingId
      changed = true
    }
  }
  if (changed) await kv.set(key, map)
}

export async function unblockDates(bookingId: string) {
  const keys = await kv.keys("blocked:product:*")
  for (const key of keys) {
    const map = await kv.get<Record<string, string>>(key)
    if (!map) continue
    let changed = false
    for (const [d, bid] of Object.entries(map)) {
      if (bid === bookingId) {
        delete map[d]
        changed = true
      }
    }
    if (changed) await kv.set(key, map)
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
const QUOTES_INDEX = "quotes:index"

export async function getQuotes(): Promise<QuoteRequest[]> {
  const ids = await kv.get<string[]>(QUOTES_INDEX)
  if (!ids || ids.length === 0) return []
  const values = await kv.mget<QuoteRequest[]>(...ids.map((id) => `quotes:${id}`))
  return values.filter((v): v is QuoteRequest => v !== null)
}

export async function getQuote(id: string): Promise<QuoteRequest | undefined> {
  const q = await kv.get<QuoteRequest>(`quotes:${id}`)
  return q ?? undefined
}

export async function saveQuote(quote: QuoteRequest) {
  await kv.set(`quotes:${quote.id}`, quote)
  // Maintain index
  const ids = (await kv.get<string[]>(QUOTES_INDEX)) || []
  if (!ids.includes(quote.id)) {
    ids.push(quote.id)
    await kv.set(QUOTES_INDEX, ids)
  }
}

// ─── Payments ───
const PAYMENTS_INDEX = "payments:index"

export async function getPayments(): Promise<PaymentRecord[]> {
  const ids = await kv.get<string[]>(PAYMENTS_INDEX)
  if (!ids || ids.length === 0) return []
  const values = await kv.mget<PaymentRecord[]>(...ids.map((id) => `payments:${id}`))
  return values.filter((v): v is PaymentRecord => v !== null)
}

export async function savePayment(payment: PaymentRecord) {
  await kv.set(`payments:${payment.id}`, payment)
  // Maintain index
  const ids = (await kv.get<string[]>(PAYMENTS_INDEX)) || []
  if (!ids.includes(payment.id)) {
    ids.push(payment.id)
    await kv.set(PAYMENTS_INDEX, ids)
  }
}

export async function getPaymentByBookingId(bookingId: string): Promise<PaymentRecord | undefined> {
  const payments = await getPayments()
  return payments.find((p) => p.bookingId === bookingId)
}

// ─── Late Alerts ───
const ALERTS_INDEX = "alerts:index"

export async function getLateAlerts(): Promise<LateAlert[]> {
  const ids = await kv.get<string[]>(ALERTS_INDEX)
  if (!ids || ids.length === 0) return []
  const values = await kv.mget<LateAlert[]>(...ids.map((id) => `alerts:${id}`))
  return values.filter((v): v is LateAlert => v !== null)
}

export async function getLateAlertsForBooking(bookingId: string): Promise<LateAlert[]> {
  const all = await getLateAlerts()
  return all.filter((a) => a.bookingId === bookingId)
}

export async function saveLateAlert(alert: LateAlert) {
  await kv.set(`alerts:${alert.id}`, alert)
  // Maintain index
  const ids = (await kv.get<string[]>(ALERTS_INDEX)) || []
  if (!ids.includes(alert.id)) {
    ids.push(alert.id)
    await kv.set(ALERTS_INDEX, ids)
  }
}

export async function hasAlertForBookingOnDate(bookingId: string, productId: number, date: string): Promise<boolean> {
  const alerts = await getLateAlerts()
  return alerts.some(
    (a) => a.bookingId === bookingId && a.productId === productId && a.sentAt.split("T")[0] === date
  )
}

// ─── Stock Overrides ───
// Allows runtime stock changes (e.g. when items are returned)
// Stored as: stock:{productId} = number
export async function getStockOverride(productId: number): Promise<number | null> {
  return kv.get<number>(`stock:${productId}`)
}

export async function setStockOverride(productId: number, stock: number) {
  await kv.set(`stock:${productId}`, stock)
}

// ─── Customer Favorites ───
// Stored as: favorites:{email} = number[] (product IDs)
export async function getCustomerFavorites(email: string): Promise<number[]> {
  const favs = await kv.get<number[]>(`favorites:${email.toLowerCase()}`)
  return favs || []
}

export async function saveCustomerFavorites(email: string, favorites: number[]) {
  await kv.set(`favorites:${email.toLowerCase()}`, favorites)
}
