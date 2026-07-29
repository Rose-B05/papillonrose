import { TVA_RATE } from "./utils"
import { parsePrix } from "./utils"

export function prixTtc(prix: number | string): number {
  const numeric = parsePrix(prix)
  return isNaN(numeric) ? 0 : Math.round(numeric * (1 + TVA_RATE) * 100) / 100
}

export function formatPrixTTC(prix: number | string): string {
  return `${prixTtc(prix).toFixed(2)} €`
}
