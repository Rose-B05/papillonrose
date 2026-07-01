import { produits } from "@/data/produits"
import { getBlockedDates } from "@/lib/db"

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

export function getAvailableStock(productId: number, dateStart: string, dateEnd: string): number {
  const product = produits.find((p) => p.id === productId)
  if (!product) return 0

  const dates = getDatesBetween(dateStart, dateEnd)
  const allBlocked = getBlockedDates().filter((b) => b.productId === productId)

  let minAvailable = product.stock

  for (const date of dates) {
    const bookingsOnDate = new Set(
      allBlocked.filter((b) => b.date === date).map((b) => b.bookingId)
    )
    const available = product.stock - bookingsOnDate.size
    minAvailable = Math.min(minAvailable, available)
  }

  return Math.max(0, minAvailable)
}

export function getMaxQtyForProduct(productId: number, dateStart?: string, dateEnd?: string): number {
  const product = produits.find((p) => p.id === productId)
  if (!product) return 0

  if (!dateStart || !dateEnd) return product.stock

  return getAvailableStock(productId, dateStart, dateEnd)
}
