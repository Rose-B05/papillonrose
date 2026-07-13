import type { Metadata } from "next"
import Link from "next/link"
import { getActiveProducts, CATEGORIES, getCategorySlug, getCategoryImage, CATEGORY_DESCRIPTIONS } from "@/lib/product-helpers"
import { getRobotsMeta } from "@/lib/site-mode"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export async function generateMetadata(): Promise<Metadata> {
  const robots = await getRobotsMeta()
  return {
    title: "Catalogue — Location mobilier & décoration événements",
    description: "Découvrez notre catalogue de mobilier et décoration pour mariages, réceptions et événements en Île-de-France. Plus de 80 références disponibles.",
    alternates: { canonical: `${SITE_URL}/catalogue` },
    openGraph: {
      title: "Catalogue — Papillon Rose",
      description: "Découvrez notre catalogue de mobilier et décoration pour événements en Île-de-France.",
      url: `${SITE_URL}/catalogue`,
      type: "website",
    },
    robots: { index: robots.index, follow: robots.follow },
  }
}

export default function CataloguePage() {
  const products = getActiveProducts()

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 pt-10 pb-6">
        <p className="text-[#C8A97E] dark:text-amber-400 text-xs tracking-[0.4em] uppercase font-medium mb-2">
          Explorer par thème
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Nos Catégories
        </h1>
        <p className="text-gray-500 dark:text-neutral-400 mt-2 text-sm">
          {products.length} références disponibles
        </p>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const slug = getCategorySlug(cat)
            const image = getCategoryImage(cat)
            const description = CATEGORY_DESCRIPTIONS[cat] || ""
            const count = products.filter((p) => p.categorie === cat).length

            return (
              <Link
                key={cat}
                href={`/categorie/${slug}`}
                className="group bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="relative overflow-hidden aspect-[4/3] bg-[#F8F5F0] dark:bg-neutral-900">
                  <img
                    src={image}
                    alt={cat}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-4">
                  <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">{cat}</h2>
                  <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1 line-clamp-2">{description}</p>
                  <p className="text-xs text-[#C8A97E] dark:text-amber-400 mt-2 font-medium">{count} produit{count !== 1 ? "s" : ""}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 pb-16">
        <h2 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Tous les produits
        </h2>
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
