import type { Produit } from "@/data/produits"
import { OCCASIONS, STYLES, AMBIANCES, getTagsForProduct } from "@/lib/product-themes"

// Re-export for convenience
export { OCCASIONS, STYLES, AMBIANCES, getTagsForProduct }

export function getThemes(p: Produit): string[] {
  const tags = getTagsForProduct(p.id)
  return tags.occasions
}

export function getCouleurs(p: Produit): string[] {
  const tags = getTagsForProduct(p.id)
  return tags.ambiances
}

export function parsePrixVal(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = prix.match(/[\d.]+/)
  return m ? Number(m[0]) : 0
}

export const BUDGET_RANGES = [
  { label: "- de 50€", min: 0, max: 50 },
  { label: "50 – 150€", min: 50, max: 150 },
  { label: "150 – 300€", min: 150, max: 300 },
  { label: "+ de 300€", min: 300, max: Infinity },
] as const

export type FilterState = {
  occasions: string[]
  styles: string[]
  ambiances: string[]
  budgetMin: number
  budgetMax: number
  dateDebut: string
  dateFin: string
  inStockOnly: boolean
}
