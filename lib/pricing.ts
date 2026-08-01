import { TVA_RATE } from "./utils"
import { parsePrix } from "./utils"

export function prixTtc(prix: number | string): number {
  const numeric = parsePrix(prix)
  return isNaN(numeric) ? 0 : Math.round(numeric * (1 + TVA_RATE) * 100) / 100
}

export function formatPrixTTC(prix: number | string): string {
  return `${prixTtc(prix).toFixed(2)} €`
}

// ─── Seuils de commande ──────────────────────────────────────────────────────
export const MONTANT_MINIMUM = 20
export const SEUIL_LIVRAISON = 50
export const TAUX_ACOMPTE = 0.30

export function isMontantMinimumAtteint(total: number): boolean {
  return total >= MONTANT_MINIMUM
}

export function getMontantManquant(total: number): number {
  if (total >= MONTANT_MINIMUM) return 0
  return Math.round((MONTANT_MINIMUM - total) * 100) / 100
}

export type ModeReglement = "retrait-integral" | "acompte-30"

export function getModeReglement(total: number): ModeReglement {
  return total >= SEUIL_LIVRAISON ? "acompte-30" : "retrait-integral"
}

export function calculerAcompte(total: number): { acompte: number; solde: number } | null {
  if (total < SEUIL_LIVRAISON) return null
  const acompte = Math.round(total * TAUX_ACOMPTE * 100) / 100
  const solde = Math.round((total - acompte) * 100) / 100
  return { acompte, solde }
}

export function isLivraisonDisponible(total: number): boolean {
  return total >= SEUIL_LIVRAISON
}
