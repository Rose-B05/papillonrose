export function formatPrix(prix: number | string): string {
  if (typeof prix === "number") return prix.toFixed(2).replace(".", ",")
  return prix.replace(/\./g, ",")
}

export function formatDecimalFr(val: string): string {
  return val.replace(/\./g, ",")
}

export function parsePrix(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = prix.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

/** Get price for a product, optionally picking a specific variant */
export function getPrixForProduct(
  product: { prix: number | string; dimension?: string; variants?: { label: string; prix: number | string }[] },
  variantLabel?: string
): number | string {
  // Explicit variants array
  if (variantLabel && product.variants) {
    const v = product.variants.find((v) => v.label === variantLabel)
    if (v) return v.prix
  }
  // String prix with " - " separator → parse into virtual variants
  if (variantLabel && typeof product.prix === "string" && product.prix.includes(" - ")) {
    const prices = product.prix.split(" - ").map((s) => s.trim())
    const dims = product.dimension?.includes(" - ")
      ? product.dimension.split(" - ").map((s) => s.trim())
      : undefined
    const idx = dims?.indexOf(variantLabel) ?? -1
    if (idx >= 0 && idx < prices.length) {
      const p = prices[idx]
      return isNaN(Number(p)) ? p : Number(p)
    }
  }
  return product.prix
}

/** Get "à partir de" price for products with variants */
export function getStartingPrix(product: { prix: number | string; variants?: { label: string; prix: number | string }[] }): number | string {
  if (product.variants && product.variants.length > 0) {
    const min = Math.min(...product.variants.map((v) => parsePrix(v.prix)))
    return min
  }
  return product.prix
}

export function calcTotalHt(items: { prix: number | string; qty: number; dateStart: string; dateEnd: string }[]): number {
  return items.reduce((sum, item) => {
    if (!item.dateStart || !item.dateEnd) return sum + parsePrix(item.prix) * item.qty * 1
    const ms = new Date(item.dateEnd).getTime() - new Date(item.dateStart).getTime()
    const days = Number.isNaN(ms) ? 1 : Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)))
    return sum + parsePrix(item.prix) * item.qty * days
  }, 0)
}

export function calcTtc(ht: number): number {
  return Math.round(ht * 1.2 * 100) / 100
}

export function calcDeposit(ttc: number): number {
  return Math.round(ttc * 0.3 * 100) / 100
}

export function formatDateFr(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export const TVA_RATE = 0.2
export const DEPOSIT_RATE = 0.3
