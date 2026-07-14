import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CATEGORIES,
  getCategoryBySlug,
  getCategorySlug,
  getProductsByCategory,
  getCategoryImage,
  CATEGORY_DESCRIPTIONS,
} from "@/lib/product-helpers"
import { getRobotsMeta } from "@/lib/site-mode"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    slug: getCategorySlug(cat),
  }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return { title: "Catégorie introuvable" }

  const robots = await getRobotsMeta()
  const description = CATEGORY_DESCRIPTIONS[category] || `Découvrez nos produits de la catégorie ${category}.`

  return {
    title: `${category} — Location mobilier & décoration`,
    description,
    alternates: { canonical: `${SITE_URL}/categorie/${slug}` },
    openGraph: {
      title: `${category} — Papillon Rose`,
      description,
      url: `${SITE_URL}/categorie/${slug}`,
      type: "website",
    },
    robots: { index: robots.index, follow: robots.follow },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const products = getProductsByCategory(category)
  const categoryImage = getCategoryImage(category)
  const description = CATEGORY_DESCRIPTIONS[category] || ""

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 pt-16 md:pt-20">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-5 md:px-10 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-xs text-gray-400 dark:text-neutral-500">
          <li><Link href="/" className="hover:text-[#C8A97E] transition-colors">Accueil</Link></li>
          <li>/</li>
          <li><Link href="/catalogue" className="hover:text-[#C8A97E] transition-colors">Catalogue</Link></li>
          <li>/</li>
          <li className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{category}</li>
        </ol>
      </nav>

      {/* Header */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 pt-4 pb-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          <div className="relative w-full md:w-64 h-48 md:h-64 rounded-2xl overflow-hidden flex-shrink-0">
            <img src={categoryImage} alt={category} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[#C8A97E] dark:text-amber-400 text-xs tracking-[0.4em] uppercase font-medium mb-2">
              Catégorie
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {category}
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 mt-3 text-sm max-w-lg">{description}</p>
            <p className="text-xs text-[#C8A97E] dark:text-amber-400 mt-3 font-medium">
              {products.length} produit{products.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/produit/${getCategorySlug(p.categorie)}`}
              className="group bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
            >
              <div className="relative overflow-hidden aspect-square bg-[#F8F5F0] dark:bg-neutral-900">
                <img
                  src={p.image && !p.image.includes("placeholder") ? p.image : "/placeholder.svg"}
                  alt={p.nom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-3.5 flex flex-col flex-1">
                <p className="text-[10px] font-medium text-[#C8A97E] dark:text-amber-400 uppercase tracking-wider truncate">{p.categorie}</p>
                <h3 className="text-[13px] font-semibold text-[#2E2E2E] dark:text-neutral-100 leading-snug truncate">{p.nom}</h3>
                {p.dimension && <p className="text-[10px] text-gray-400 dark:text-neutral-500 truncate">{p.dimension}</p>}
                <p className="text-lg font-bold text-[#2E2E2E] dark:text-neutral-100 mt-0.5">
                  {typeof p.prix === "number" ? `${p.prix} €` : `${p.prix} €`}
                  <span className="text-xs font-normal text-gray-400 dark:text-neutral-500 ml-0.5">/jour</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
