import type { Metadata } from "next"

export const dynamic = "force-dynamic"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CATEGORIES,
  getProductBySlug,
  getProductSlug,
  getCategorySlug,
  formatPrix,
  getProductImage,
  getAllProductImages,
  mergeAdminProduct,
  slugify,
} from "@/lib/product-helpers"
import { getRobotsMeta } from "@/lib/site-mode"
import { getAdminProducts, getBlockedDatesForProduct, type AdminProduct } from "@/lib/db"
import { prixTtc } from "@/lib/pricing"
import ProductImage from "@/components/product-image"
import ProductGallery from "./ProductGallery"
import { isNouveauProduit } from "@/lib/utils"
import ProductInfo from "./ProductInfo"
import FavoriteButton from "./FavoriteButton"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export function generateStaticParams() {
  const { produits } = require("@/data/produits")
  return produits
    .filter((p: { actif?: boolean }) => p.actif !== false)
    .map((p: { id: number; nom: string; categorie: string }) => ({
      slug: getProductSlug({ id: p.id, nom: p.nom, categorie: p.categorie } as any),
    }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return { title: "Produit introuvable" }

  const robots = await getRobotsMeta()
  const image = getProductImage(product)
  const priceTTC = prixTtc(product.prix)

  return {
    title: `${product.nom} — Location ${product.categorie}`,
    description: `${product.nom} disponible à la location en Île-de-France. ${product.dimension ? `${product.dimension}. ` : ''}${priceTTC.toFixed(2)} € TTC/jour. Livraison inclusion dans les départements 94, 93, 95, 77, 91.`,
    alternates: { canonical: `${SITE_URL}/produit/${slug}` },
    openGraph: {
      title: `${product.nom} — Papillon Rose`,
      description: `${product.nom} disponible à la location. ${priceTTC.toFixed(2)} € TTC/jour.`,
      url: `${SITE_URL}/produit/${slug}`,
      images: [{ url: image, width: 800, height: 800, alt: product.nom }],
      type: "website",
    },
    robots: { index: robots.index, follow: robots.follow },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  let adminProducts: AdminProduct[] = []
  try {
    adminProducts = await getAdminProducts()
  } catch {}

  // 1. Chercher dans les produits statiques
  let staticProduct = getProductBySlug(slug)

  // 2. Si pas trouvé, chercher dans les produits admin (produits créés via l'admin panel)
  if (!staticProduct) {
    const adminOnly = adminProducts.find((ap) => slugify(ap.nom) === slug)
    if (adminOnly && adminOnly.status !== "masque") {
      // Créer un produit virtuel à partir des données admin
      staticProduct = {
        id: adminOnly.id,
        nom: adminOnly.nom,
        categorie: adminOnly.categorie,
        stock: adminOnly.stock,
        dimension: adminOnly.dimension || "",
        prix: adminOnly.prix,
        image: adminOnly.image || "",
        gallerie: adminOnly.gallerie || [],
        description: adminOnly.description || "",
        dateAjout: adminOnly.dateCreation || "",
        actif: true,
      }
    }
  }

  if (!staticProduct) notFound()

  // 3. Appliquer les overrides admin (si le produit existe en statique avec un override)
  let product = staticProduct
  const adminOverride = adminProducts.find((p) => p.id === staticProduct!.id)
  if (adminOverride) {
    if (adminOverride.status === "masque") {
      notFound()
    }
    if (adminOverride.status === "publie") {
      product = mergeAdminProduct(staticProduct, adminOverride)
    }
  }

  let isBlocked = false
  if (product.stock === 1) {
    try {
      const blocked = await getBlockedDatesForProduct(product.id)
      const today = new Date().toISOString().split("T")[0]
      isBlocked = blocked.some((d) => d >= today)
    } catch {}
  }

  const categorySlug = getCategorySlug(product.categorie)
  const images = getAllProductImages(product)
  const priceTTC = prixTtc(product.prix)

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 pt-16 md:pt-20">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-5 md:px-10 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-xs text-secondary-text dark:text-white/60 flex-wrap">
          <li><Link href="/" className="hover:text-[#c27a72] transition-colors">Accueil</Link></li>
          <li>/</li>
          <li><Link href="/catalogue" className="hover:text-[#c27a72] transition-colors">Catalogue</Link></li>
          <li>/</li>
          <li><Link href={`/categorie/${categorySlug}`} className="hover:text-[#c27a72] transition-colors">{product.categorie}</Link></li>
          <li>/</li>
          <li className="text-[#2E2E2E] dark:text-neutral-100 font-medium truncate max-w-[200px]">{product.nom}</li>
        </ol>
      </nav>

      {/* Product */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 pt-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Images */}
          <div className="flex-1">
            <ProductGallery images={images} />
          </div>

          {/* Info */}
          <ProductInfo product={product} isBlocked={isBlocked} />
        </div>
      </section>
    </div>
  )
}
