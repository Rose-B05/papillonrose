import { produits } from "@/data/produits"
import { getBlockedDates, getStockOverride } from "@/lib/db"

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

/**
 * Returns the effective stock for a product: static stock + any runtime override.
 * This is the single source of truth for current stock availability.
 */
export async function getStock(productId: number): Promise<number> {
  const product = produits.find((p) => p.id === productId)
  const baseStock = product?.stock ?? 0
  const override = await getStockOverride(productId)
  return override ?? baseStock
}

export async function getAvailableStock(productId: number, dateStart: string, dateEnd: string): Promise<number> {
  const totalStock = await getStock(productId)
  if (!totalStock) return 0

  const dates = getDatesBetween(dateStart, dateEnd)
  const allBlocked = (await getBlockedDates()).filter((b) => b.productId === productId)

  let minAvailable = totalStock

  for (const date of dates) {
    const bookingsOnDate = new Set(
      allBlocked.filter((b) => b.date === date).map((b) => b.bookingId)
    )
    const available = totalStock - bookingsOnDate.size
    minAvailable = Math.min(minAvailable, available)
  }

  return Math.max(0, minAvailable)
}

export async function getMaxQtyForProduct(productId: number, dateStart?: string, dateEnd?: string): Promise<number> {
  const totalStock = await getStock(productId)
  if (!totalStock) return 0

  if (!dateStart || !dateEnd) return totalStock

  return getAvailableStock(productId, dateStart, dateEnd)
}
