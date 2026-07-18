import { produits, type Produit } from "@/data/produits"
import { type AdminProduct } from "@/lib/db"

// ─── Slug Generation ────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Stable slugs — generated once from product names, never change
const slugCache = new Map<number, string>()
const reverseSlugCache = new Map<string, number>()

for (const p of produits) {
  const slug = slugify(p.nom)
  slugCache.set(p.id, slug)
  reverseSlugCache.set(slug, p.id)
}

export function getProductSlug(product: Produit): string {
  return slugCache.get(product.id) ?? slugify(product.nom)
}

export function getProductBySlug(slug: string): Produit | undefined {
  const id = reverseSlugCache.get(slug)
  if (id !== undefined) return produits.find((p) => p.id === id)
  // Fallback: search by slugified name
  return produits.find((p) => slugify(p.nom) === slug)
}

// ─── Category Helpers ───────────────────────────────────────────────────────

export const CATEGORIES = [
  "Mobilier",
  "Figurines & Jeux",
  "Bougeoirs & Lustres",
  "Verreries",
  "Cadres",
  "Présentoirs & Plateaux",
  "Urnes & Accessoires",
  "Art de la Table",
  "Vases & Pots",
  "Décoration",
  "Fleurs & Feuillages",
] as const

export type CategorySlug = string

const categorySlugCache = new Map<string, string>()
const reverseCategorySlugCache = new Map<string, string>()

for (const cat of CATEGORIES) {
  const slug = slugify(cat)
  categorySlugCache.set(cat, slug)
  reverseCategorySlugCache.set(slug, cat)
}

export function getCategorySlug(category: string): string {
  return categorySlugCache.get(category) ?? slugify(category)
}

export function getCategoryBySlug(slug: string): string | undefined {
  return reverseCategorySlugCache.get(slug)
}

export function getProductsByCategory(category: string): Produit[] {
  return produits.filter((p) => p.categorie === category && p.actif !== false)
}

export function getActiveProducts(): Produit[] {
  return produits.filter((p) => p.actif !== false)
}

// ─── Price Helpers ──────────────────────────────────────────────────────────

export function parsePrix(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = String(prix).match(/[\d.]+/)
  return m ? Number(m[0]) : 0
}

export function formatPrix(prix: number | string): string {
  const val = parsePrix(prix)
  return val % 1 === 0 ? `${val} €` : `${val.toFixed(2)} €`
}

// ─── Image Helpers ──────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""

export function getProductImage(product: Produit): string {
  if (product.image && !product.image.includes("placeholder")) {
    return BASE + product.image
  }
  // Fallback: try PROD{id}.png if image is placeholder
  const fallbackPath = `/images/PROD${String(product.id).padStart(3, "0")}.png`
  return BASE + fallbackPath
}

export function getAllProductImages(product: Produit): { src: string; alt: string }[] {
  const images: { src: string; alt: string }[] = []
  if (product.image && !product.image.includes("placeholder")) {
    images.push({ src: BASE + product.image, alt: product.nom })
  }
  if (product.gallerie) {
    for (const g of product.gallerie) {
      images.push({ src: BASE + g, alt: product.nom })
    }
  }
  if (images.length === 0) {
    images.push({ src: BASE + "/placeholder.svg", alt: product.nom })
  }
  return images
}

// ─── Category Image (first product with real photo) ─────────────────────────

export function getCategoryImage(category: string): string {
  const products = getProductsByCategory(category)
  for (const p of products) {
    if (p.image && !p.image.includes("placeholder")) {
      return BASE + p.image
    }
  }
  return BASE + "/placeholder.svg"
}

// ─── Category Description ──────────────────────────────────────────────────

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Mobilier: "Chaises, tables, arches et mobilier pour vos événements en Île-de-France.",
  "Figurines & Jeux": "Figurines, totems et jeux pour personnaliser votre décoration.",
  "Bougeoirs & Lustres": "Bougeoirs, lanternes et lustres pour une ambiance chaleureuse.",
  Verreries: "Photophores, verres et accessoires en verre pour votre table.",
  Cadres: "Cadres photo et moulures pour sublimer vos souvenirs.",
  "Présentoirs & Plateaux": "Présentoires et plateaux pour mettre en valeur vos creations.",
  "Urnes & Accessoires": "Urnes et accessoires pour décorer votre événement.",
  "Art de la Table": "Serviettes, nappes, couverts et art de la table complet.",
  "Vases & Pots": "Vases et pots en laiton, porcelaine et terre cuite.",
  Décoration: "Horloges, boas, parasols et objets déco originaux.",
  "Fleurs & Feuillages": "Guirlandes, bouquets et feuillages artificiels.",
}

// ─── Admin Product Merge ─────────────────────────────────────────────────────

export function mergeAdminProduct(staticProduct: Produit, adminOverride: AdminProduct): Produit {
  return {
    ...staticProduct,
    nom: adminOverride.nom || staticProduct.nom,
    categorie: adminOverride.categorie || staticProduct.categorie,
    stock: adminOverride.stock ?? staticProduct.stock,
    dimension: adminOverride.dimension || staticProduct.dimension,
    prix: adminOverride.prix ?? staticProduct.prix,
    image: adminOverride.image || staticProduct.image,
    gallerie: adminOverride.gallerie?.length ? adminOverride.gallerie : staticProduct.gallerie,
    description: adminOverride.description || staticProduct.description,
  }
}

export function getMergedProducts(adminProducts: AdminProduct[]): Produit[] {
  const adminMap = new Map<number, AdminProduct>()
  for (const ap of adminProducts) {
    if (ap.status === "publie") {
      adminMap.set(ap.id, ap)
    }
  }

  const merged: Produit[] = []
  for (const sp of produits) {
    if (sp.actif === false) continue
    const adminOverride = adminMap.get(sp.id)
    if (adminOverride) {
      merged.push(mergeAdminProduct(sp, adminOverride))
      adminMap.delete(sp.id)
    } else {
      merged.push(sp)
    }
  }

  for (const ap of adminMap.values()) {
    if (ap.status === "publie") {
      merged.push({
        id: ap.id,
        nom: ap.nom,
        categorie: ap.categorie,
        stock: ap.stock,
        dimension: ap.dimension || "",
        prix: ap.prix,
        image: ap.image || "",
        gallerie: ap.gallerie || [],
        description: ap.description || "",
        dateAjout: ap.dateCreation || "",
        actif: true,
      } as Produit)
    }
  }

  return merged
}
