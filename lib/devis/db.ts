// @deprecated — Ce module est obsolète et non utilisé.
// Les devis/réservations sont désormais gérés via Booking dans lib/db.ts.
// Conservé temporairement pour référence avant suppression définitive.

import { kv } from "@vercel/kv"
import type { Devis } from "./types"
import type { Produit } from "@/data/produits"

// ─── Devis CRUD (KV) ─────────────────────────────────────────────────────────
const DEVIS_INDEX = "devis:index"

export async function getDevis(): Promise<Devis[]> {
  const ids = await kv.get<string[]>(DEVIS_INDEX)
  if (!ids || ids.length === 0) return []
  const values = await kv.mget<Devis[]>(...ids.map((id) => `devis:${id}`))
  return values.filter((v): v is Devis => v !== null)
}

export async function getDevisById(id: string): Promise<Devis | undefined> {
  const d = await kv.get<Devis>(`devis:${id}`)
  return d ?? undefined
}

export async function saveDevis(devis: Devis): Promise<void> {
  await kv.set(`devis:${devis.id}`, devis)
  const ids = (await kv.get<string[]>(DEVIS_INDEX)) || []
  if (!ids.includes(devis.id)) {
    ids.push(devis.id)
    await kv.set(DEVIS_INDEX, ids)
  }
}

export async function deleteDevis(id: string): Promise<void> {
  await kv.del(`devis:${id}`)
  const ids = (await kv.get<string[]>(DEVIS_INDEX)) || []
  await kv.set(
    DEVIS_INDEX,
    ids.filter((i) => i !== id)
  )
}

// ─── Auto-increment counter ──────────────────────────────────────────────────
export async function getNextDevisNumber(): Promise<string> {
  const counter = (await kv.get<number>("devis_counter")) || 0
  const next = counter + 1
  await kv.set("devis_counter", next)
  const year = new Date().getFullYear()
  return `DEV-${year}-${String(next).padStart(4, "0")}`
}

// ─── Build devis lignes from cart items + products ────────────────────────────
export function buildDevisLignes(
  cartItems: Array<{ productId: number; qty: number; variantLabel?: string }>,
  products: Produit[]
): Array<{
  productId: number
  nom: string
  quantite: number
  prixUnitaire: number
  sousTotal: number
  dimension?: string
}> {
  const productMap = new Map<number, Produit>()
  for (const p of products) productMap.set(p.id, p)

  return cartItems.map((item) => {
    const product = productMap.get(item.productId)
    const prixUnitaire = product
      ? typeof product.prix === "number"
        ? product.prix
        : Number(String(product.prix).match(/[\d.]+/)?.[0]) || 0
      : 0
    return {
      productId: item.productId,
      nom: product?.nom || `Produit #${item.productId}`,
      quantite: item.qty,
      prixUnitaire,
      sousTotal: prixUnitaire * item.qty,
      dimension: product?.dimension,
    }
  })
}

// ─── Calculate totals ────────────────────────────────────────────────────────
export interface DevisCalculation {
  totalHt: number
  tva: number
  totalTtc: number
  remiseMontant: number
  totalAfterRemise: number
  fraisLivraison: number
  grandTotal: number
}

export function calculateDevis(
  lignes: Array<{ sousTotal: number }>,
  remisePercent: number = 0,
  fraisLivraison: number = 0
): DevisCalculation {
  const totalHt = lignes.reduce((sum, l) => sum + l.sousTotal, 0)
  const tva = Math.round(totalHt * 0.2 * 100) / 100
  const totalTtc = Math.round((totalHt + tva) * 100) / 100
  const remiseMontant = Math.round(totalHt * remisePercent / 100 * 100) / 100
  const totalAfterRemise = Math.round((totalHt - remiseMontant) * 100) / 100
  const tvaAfterRemise = Math.round(totalAfterRemise * 0.2 * 100) / 100
  const grandTotal = Math.round((totalAfterRemise + tvaAfterRemise + fraisLivraison) * 100) / 100

  return {
    totalHt,
    tva,
    totalTtc,
    remiseMontant,
    totalAfterRemise,
    fraisLivraison,
    grandTotal,
  }
}

// ─── Generate PDF (server-side via @react-pdf/renderer) ───────────────────────
export async function generateDevisPdf(devis: Devis): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer")
  const { devisPdfTemplate } = await import("./pdf-template")
  const pdfElement = devisPdfTemplate(devis)
  const buffer = await renderToBuffer(pdfElement)
  return buffer as unknown as Buffer
}
