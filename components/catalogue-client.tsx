"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Search } from "lucide-react"
import { produits, type Produit, hasRealPhoto } from "@/data/produits"
import { useCart } from "@/components/cart-context"
import { useFavorites } from "@/components/favorites-context"
import CatalogGallery from "@/components/catalog-gallery"
import CatalogFilters from "@/components/catalog-filters"
import { getTagsForProduct, type FilterState } from "@/lib/product-tags"

interface AdminProductStatus {
  id: number
  status: "brouillon" | "publie" | "masque"
}

const STATIC_VISIBLE = produits.filter((p) => hasRealPhoto(p) && p.actif !== false)

const CATEGORIES = [
  "Tous",
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
]

function CategoryPills({
  active,
  onChange,
}: {
  active: string
  onChange: (c: string) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            active === cat
              ? "bg-[#C8A97E] dark:bg-amber-600 text-white shadow-sm"
              : "bg-[#F0EBE3] dark:bg-neutral-800 text-[#2E2E2E]/60 dark:text-neutral-400 hover:bg-[#C8A97E]/20 dark:hover:bg-amber-600/20 hover:text-[#C8A97E] dark:hover:text-amber-400"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

export default function CatalogueClient() {
  const { items: cartItems, addItem: addCartItem } = useCart()
  const { favorites, toggleFavorite } = useFavorites()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Tous")
  const [modalProduct, setModalProduct] = useState<Produit | null>(null)
  const [maskedIds, setMaskedIds] = useState<Set<number>>(new Set())
  const [tagFilters, setTagFilters] = useState<FilterState>({
    occasions: [],
    styles: [],
    ambiances: [],
    budgetMin: 0,
    budgetMax: Infinity,
    dateDebut: "",
    dateFin: "",
    inStockOnly: false,
  })

  useEffect(() => {
    fetch("/api/catalogue-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.maskedIds) {
          setMaskedIds(new Set(data.maskedIds))
        }
      })
      .catch(() => {})
  }, [])

  const parsePrix = (p: string | number): number => {
    const val = typeof p === "number" ? p : parseFloat(String(p).replace(/[^\d.,]/g, "").replace(",", "."))
    return isNaN(val) ? 0 : val
  }

  const addToCartWithToast = useCallback(
    (productId: number, qty: number = 1, variantLabel?: string) => {
      addCartItem({ productId, qty, dateStart: "", dateEnd: "", variantLabel })
    },
    [addCartItem]
  )

  const addToQuote = useCallback((p: Produit) => {
    // Quote functionality handled by parent or separate flow
  }, [])

  const resetFilters = () => {
    setSearch("")
    setCategory("Tous")
    setTagFilters({
      occasions: [],
      styles: [],
      ambiances: [],
      budgetMin: 0,
      budgetMax: Infinity,
      dateDebut: "",
      dateFin: "",
      inStockOnly: false,
    })
  }

  const VISIBLE_PRODUCTS = useMemo(
    () => STATIC_VISIBLE.filter((p) => !maskedIds.has(p.id)),
    [maskedIds]
  )

  const filtered = useMemo(
    () =>
      VISIBLE_PRODUCTS.filter((p) => {
        if (search) {
          const q = search.toLowerCase()
          if (
            !p.nom.toLowerCase().includes(q) &&
            !p.categorie.toLowerCase().includes(q) &&
            !(p.dimension || "").toLowerCase().includes(q)
          )
            return false
        }
        if (category !== "Tous" && p.categorie !== category) return false
        const prix = parsePrix(p.prix)
        if (prix < tagFilters.budgetMin || prix > tagFilters.budgetMax) return false
        if (tagFilters.inStockOnly && p.stock <= 0) return false
        if (tagFilters.occasions.length > 0 || tagFilters.styles.length > 0 || tagFilters.ambiances.length > 0) {
          const tags = getTagsForProduct(p.id)
          if (tagFilters.occasions.length > 0 && !tagFilters.occasions.some((t) => tags.occasions.includes(t))) return false
          if (tagFilters.styles.length > 0 && !tagFilters.styles.some((s) => tags.styles.includes(s))) return false
          if (tagFilters.ambiances.length > 0 && !tagFilters.ambiances.some((a) => tags.ambiances.includes(a))) return false
        }
        return true
      }),
    [search, category, tagFilters]
  )

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 pt-20 md:pt-24 pb-8">
      <div className="mb-5 md:mb-7">
        <p className="text-[#C8A97E] dark:text-amber-400 text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
          Explorer
        </p>
        <h1
          style={{ fontFamily: "var(--font-playfair), serif" }}
          className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] dark:text-neutral-100"
        >
          Catalogue de Location
        </h1>
      </div>

      <div className="flex gap-3 mb-4 md:mb-5">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500"
          />
          <input
            type="text"
            placeholder="Rechercher un article…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-neutral-800 pl-11 pr-4 py-3 rounded-2xl text-sm outline-none border border-black/[0.07] dark:border-white/[0.08] focus:border-[#C8A97E]/50 transition-colors placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      <div className="mb-5 md:mb-7">
        <CategoryPills active={category} onChange={setCategory} />
      </div>

      <div className="md:flex md:gap-6 md:items-start">
        <div className="md:w-64 md:flex-shrink-0">
          <CatalogFilters
            filters={tagFilters}
            onChange={setTagFilters}
            resultCount={filtered.length}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 mt-2 md:mb-5 md:mt-3">
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              <span className="text-[#2E2E2E] dark:text-neutral-100 font-semibold">
                {filtered.length}
              </span>{" "}
              résultat{filtered.length > 1 ? "s" : ""}
              {category !== "Tous" && (
                <span>
                  {" "}
                  — <span className="text-[#C8A97E] dark:text-amber-400">{category}</span>
                </span>
              )}
            </p>
            {(search ||
              category !== "Tous" ||
              tagFilters.inStockOnly ||
              tagFilters.occasions.length > 0 ||
              tagFilters.styles.length > 0 ||
              tagFilters.ambiances.length > 0 ||
              tagFilters.budgetMin > 0 ||
              tagFilters.dateDebut) && (
              <button
                onClick={resetFilters}
                className="text-xs text-gray-400 dark:text-neutral-500 hover:text-[#C8A97E] dark:hover:text-amber-400 transition-colors underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            <CatalogGallery
              produits={filtered}
              favorites={favorites}
              cartItems={cartItems}
              onFav={toggleFavorite}
              onAddCart={(id) => addToCartWithToast(id)}
              onAddQuote={addToQuote}
              onView={(p) => setModalProduct(p)}
            />
          ) : (
            <div className="py-24 text-center">
              <p className="text-gray-400 dark:text-neutral-500 text-base mb-5">
                Aucun produit ne correspond à votre sélection.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#C8A97E] dark:bg-amber-600 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#B8926E] dark:hover:bg-amber-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {modalProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setModalProduct(null)}
        >
          <div
            className="bg-white dark:bg-neutral-800 rounded-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">
              {modalProduct.nom}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-1">{modalProduct.categorie}</p>
            {modalProduct.dimension && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 mb-3">{modalProduct.dimension}</p>
            )}
            <p className="text-xl font-bold text-[#2E2E2E] dark:text-neutral-100 mb-4">
              {parsePrix(modalProduct.prix)} €<span className="text-xs font-normal text-gray-400 ml-1">/jour</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  addToCartWithToast(modalProduct.id)
                  setModalProduct(null)
                }}
                className="flex-1 bg-[#C8A97E] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#B8926E] transition-colors"
              >
                Ajouter au panier
              </button>
              <button
                onClick={() => toggleFavorite(modalProduct.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  favorites.has(modalProduct.id)
                    ? "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                    : "border-gray-200 text-gray-400 hover:border-[#C8A97E]/30"
                }`}
              >
                {favorites.has(modalProduct.id) ? "♥" : "♡"}
              </button>
            </div>
            <button
              onClick={() => setModalProduct(null)}
              className="mt-3 w-full text-center text-xs text-gray-400 hover:text-[#C8A97E] transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
