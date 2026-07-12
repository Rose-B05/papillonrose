import { kv } from "@vercel/kv"
import type { Booking, BlockedDate, QuoteRequest, PaymentRecord, LateAlert, EmailLog, ProductView, NewsletterSubscriber } from "./types"

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

// ─── Email Logs ───
const EMAIL_LOGS_INDEX = "email_logs:index"

export async function saveEmailLog(log: EmailLog) {
  await kv.set(`email_logs:${log.id}`, log)
  const ids = (await kv.get<string[]>(EMAIL_LOGS_INDEX)) || []
  if (!ids.includes(log.id)) {
    ids.push(log.id)
    await kv.set(EMAIL_LOGS_INDEX, ids)
  }
}

export async function getEmailLogs(): Promise<EmailLog[]> {
  const ids = await kv.get<string[]>(EMAIL_LOGS_INDEX)
  if (!ids || ids.length === 0) return []
  const values = await kv.mget<EmailLog[]>(...ids.map((id) => `email_logs:${id}`))
  return values.filter((v): v is EmailLog => v !== null)
}

export async function getEmailLogsForBooking(bookingId: string): Promise<EmailLog[]> {
  const all = await getEmailLogs()
  return all.filter((l) => l.bookingId === bookingId)
}

// ─── Product Views ───
const PRODUCT_VIEWS_INDEX = "product_views:index"

export async function saveProductView(view: ProductView) {
  await kv.set(`product_views:${view.id}`, view)
  const ids = (await kv.get<string[]>(PRODUCT_VIEWS_INDEX)) || []
  if (!ids.includes(view.id)) {
    ids.push(view.id)
    await kv.set(PRODUCT_VIEWS_INDEX, ids)
  }
}

export async function getProductViews(): Promise<ProductView[]> {
  const ids = await kv.get<string[]>(PRODUCT_VIEWS_INDEX)
  if (!ids || ids.length === 0) return []
  const values = await kv.mget<ProductView[]>(...ids.map((id) => `product_views:${id}`))
  return values.filter((v): v is ProductView => v !== null)
}

export async function hasRecentProductView(customerEmail: string, productId: number, withinHours = 24): Promise<boolean> {
  const dedupKey = `product_view_dedup:${customerEmail.toLowerCase()}:${productId}`
  const existing = await kv.get<string>(dedupKey)
  return !!existing
}

export async function setProductViewDedup(customerEmail: string, productId: number, ttlSeconds = 86400) {
  const dedupKey = `product_view_dedup:${customerEmail.toLowerCase()}:${productId}`
  await kv.set(dedupKey, "1", { ex: ttlSeconds })
}

export async function markReminderSent(viewId: string) {
  const view = await kv.get<ProductView>(`product_views:${viewId}`)
  if (!view) return
  view.reminderSent = true
  view.reminderSentAt = new Date().toISOString()
  await kv.set(`product_views:${viewId}`, view)
}

export async function cleanupOldProductViews(maxAgeDays = 90) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - maxAgeDays)
  const views = await getProductViews()
  const ids = await kv.get<string[]>(PRODUCT_VIEWS_INDEX)
  if (!ids) return 0

  let removed = 0
  const remaining: string[] = []

  for (const id of ids) {
    const view = views.find((v) => v.id === id)
    if (view && new Date(view.viewedAt) < cutoff) {
      await kv.del(`product_views:${id}`)
      removed++
    } else {
      remaining.push(id)
    }
  }

  await kv.set(PRODUCT_VIEWS_INDEX, remaining)
  return removed
}

// ─── Newsletter Subscribers ───
const NEWSLETTER_INDEX = "newsletter:index"

export async function getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined> {
  const s = await kv.get<NewsletterSubscriber>(`newsletter:${email.toLowerCase()}`)
  return s ?? undefined
}

export async function saveNewsletterSubscriber(subscriber: NewsletterSubscriber) {
  await kv.set(`newsletter:${subscriber.email.toLowerCase()}`, subscriber)
  const ids = (await kv.get<string[]>(NEWSLETTER_INDEX)) || []
  if (!ids.includes(subscriber.email.toLowerCase())) {
    ids.push(subscriber.email.toLowerCase())
    await kv.set(NEWSLETTER_INDEX, ids)
  }
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const ids = await kv.get<string[]>(NEWSLETTER_INDEX)
  if (!ids || ids.length === 0) return []
  const values = await kv.mget<NewsletterSubscriber[]>(...ids.map((id) => `newsletter:${id}`))
  return values.filter((v): v is NewsletterSubscriber => v !== null)
}

export async function getConfirmedNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const all = await getNewsletterSubscribers()
  return all.filter((s) => s.status === "confirmed")
}

// ─── Site Mode ─────────────────────────────────────────────────────────────
// "development" = noindex, sitemap vide, robots disallow
// "production" = indexation activée, sitemap complet, robots allow
export type SiteMode = "development" | "production"

const SITE_MODE_KEY = "site_mode"

export async function getSiteMode(): Promise<SiteMode> {
  try {
    const mode = await kv.get<SiteMode>(SITE_MODE_KEY)
    return mode || "development"
  } catch {
    return "development"
  }
}

export async function setSiteMode(mode: SiteMode): Promise<void> {
  await kv.set(SITE_MODE_KEY, mode)
}
