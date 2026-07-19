import type { Metadata } from "next"
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
} from "@/lib/product-helpers"
import { getRobotsMeta } from "@/lib/site-mode"
import { getAdminProducts } from "@/lib/db"
import ProductImage from "@/components/product-image"
import AddToCartButton from "./AddToCartButton"
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
  const price = formatPrix(product.prix)

  return {
    title: `${product.nom} — Location ${product.categorie}`,
    description: `${product.nom} disponible à la location en Île-de-France. ${product.dimension ? `${product.dimension}. ` : ''}${price}/jour. Livraison inclusion dans les départements 94, 93, 95, 77, 91.`,
    alternates: { canonical: `${SITE_URL}/produit/${slug}` },
    openGraph: {
      title: `${product.nom} — Papillon Rose`,
      description: `${product.nom} disponible à la location. ${price}/jour.`,
      url: `${SITE_URL}/produit/${slug}`,
      images: [{ url: image, width: 800, height: 800, alt: product.nom }],
      type: "website",
    },
    robots: { index: robots.index, follow: robots.follow },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const staticProduct = getProductBySlug(slug)
  if (!staticProduct) notFound()

  let product = staticProduct
  let isMasked = false
  try {
    const adminProducts = await getAdminProducts()
    const adminOverride = adminProducts.find((p) => p.id === staticProduct.id)
    if (adminOverride) {
      if (adminOverride.status === "masque") {
        notFound()
      }
      if (adminOverride.status === "publie") {
        product = mergeAdminProduct(staticProduct, adminOverride)
      }
    }
  } catch {}

  const categorySlug = getCategorySlug(product.categorie)
  const images = getAllProductImages(product)
  const price = formatPrix(product.prix)

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 pt-16 md:pt-20">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-5 md:px-10 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/60 flex-wrap">
          <li><Link href="/" className="hover:text-[#C9948E] transition-colors">Accueil</Link></li>
          <li>/</li>
          <li><Link href="/catalogue" className="hover:text-[#C9948E] transition-colors">Catalogue</Link></li>
          <li>/</li>
          <li><Link href={`/categorie/${categorySlug}`} className="hover:text-[#C9948E] transition-colors">{product.categorie}</Link></li>
          <li>/</li>
          <li className="text-[#2E2E2E] dark:text-neutral-100 font-medium truncate max-w-[200px]">{product.nom}</li>
        </ol>
      </nav>

      {/* Product */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 pt-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Images */}
          <div className="flex-1">
            <div className="relative aspect-square bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
              <ProductImage
                src={images[0]?.src || "/placeholder.svg"}
                alt={product.nom}
                className="w-full h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img, i) => (
                  <div key={i} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
                    <ProductImage src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:w-[400px] flex flex-col">
            <p className="text-[#C9948E] dark:text-[#E8B4AE] text-xs tracking-[0.3em] uppercase font-medium mb-2">
              {product.categorie}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {product.nom}
            </h1>

            {product.dimension && (
              <p className="text-sm text-gray-500 dark:text-white/70 mt-2">
                {product.dimension}
              </p>
            )}

            <p className="text-2xl font-bold text-[#2E2E2E] dark:text-neutral-100 mt-4">
              {price}
              <span className="text-sm font-normal text-gray-400 dark:text-white/60 ml-1">/jour</span>
            </p>

            {/* Stock */}
            <div className="mt-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-gray-500 dark:text-white/70">
                {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
              </span>
            </div>

            {/* Badges */}
            {product.badge && (
              <div className="mt-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  product.badge === "stock-limite" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                }`}>
                  {product.badge === "stock-limite" ? "Stock limité" : "Épuisé"}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3">
              <AddToCartButton productId={product.id} stock={product.stock} productName={product.nom} />
              <FavoriteButton productId={product.id} />
            </div>

            {/* Description */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
              <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">Détails</h2>
              <ul className="text-sm text-gray-500 dark:text-white/70 space-y-1.5">
                <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Catégorie :</span> {product.categorie}</li>
                {product.dimension && <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Dimensions :</span> {product.dimension}</li>}
                <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Tarif :</span> {price}/jour</li>
                <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Disponibilité :</span> {product.stock > 0 ? "Disponible" : "Indisponible"}</li>
              </ul>
            </div>

            {/* CTA */}
            <Link
              href="/reservation"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-[#C9948E] text-[#1C1A17] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#D4A09A] transition-colors"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
