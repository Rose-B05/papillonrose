"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  ShoppingBag,
  Heart,
  X,
  Plus,
  Minus,
  Menu,
  SlidersHorizontal,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Trash2,
} from "lucide-react"
import { produits, type Produit } from "@/data/produits"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path
const PLACEHOLDER = img("/placeholder.svg")
const LOGO = img("/papillon-rose-logo.png")

function formatPrix(prix: number | string): string {
  if (typeof prix === "number") return `${prix}`
  return prix
}
function parsePrix(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = prix.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "home" | "catalogue" | "favorites" | "contact"
interface QuoteItem {
  product: Produit
  qty: number
}
// ─── Data ─────────────────────────────────────────────────────────────────────
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

const PRODUCTS = produits

let CATEGORY_IMAGES: Record<string, string> = {
  Mobilier: "/images/prod/prod005.png",
  "Figurines & Jeux": "/images/prod/prod009.png",
  "Bougeoirs & Lustres": "/images/prod/lustre-12-branches.png",
  Verreries: "/images/prod/photophore-transparent.png",
  Cadres: "/images/prod/prod39.png",
  "Présentoirs & Plateaux": "/images/prod/presentoir-gateau-1.png",
  "Urnes & Accessoires": "/images/prod/urne-cage.png",
  "Art de la Table": "/images/prod/sous-assiettes-or.png",
  "Vases & Pots": "/images/prod/vase-geometrique-blanc.png",
  Décoration: "/images/prod/horloge.png",
  "Fleurs & Feuillages": "/images/prod/gazon-artificiel.png",
}

// Images will be prefixed at render time

const DP = { fontFamily: "var(--font-playfair), serif" } as const
const GOLD = "#C8A97E"

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  isFav,
  onFav,
  onView,
  onAdd,
}: {
  product: Produit
  isFav: boolean
  onFav: () => void
  onView: () => void
  onAdd: () => void
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
      <div
        className="relative m-2.5 overflow-hidden rounded-lg bg-[#F8F5F0] cursor-pointer"
        style={{ aspectRatio: "1 / 1" }}
        onClick={onView}
      >
        <img
          src={product.image ? img(product.image) : PLACEHOLDER}
          alt={product.nom}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
        />
        {(product.stock === 0 || product.badge === "epuise") && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              Indisponible
            </span>
          </div>
        )}
        {(product.badge === "stock-limite" || (product.stock <= 2 && product.stock > 0)) && product.badge !== "epuise" && product.stock !== 0 && (
          <span className="absolute top-2.5 left-2.5 bg-amber-400 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
            {product.stock > 0 ? `Dernière${product.stock > 1 ? "s" : ""}` : "Stock limité"}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFav()
          }}
          aria-label="Ajouter aux favoris"
          className={`absolute top-2.5 right-2.5 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${
            isFav ? "text-[#C8A97E]" : "text-gray-300 hover:text-[#C8A97E]"
          }`}
        >
          <Heart size={13} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="px-3.5 pb-4 pt-0.5 flex flex-col flex-1">
        <p className="text-[10px] font-medium text-[#C8A97E] uppercase tracking-wider truncate">
          {product.categorie}
        </p>
        <h3
          style={DP}
          className="text-[13px] font-semibold text-[#2E2E2E] mt-0.5 leading-snug line-clamp-2 cursor-pointer hover:text-[#C8A97E] transition-colors"
          onClick={onView}
        >
          {product.nom}
        </h3>
        {product.dimension && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">
            {product.dimension}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span style={DP} className="text-base font-bold text-[#2E2E2E]">
            {formatPrix(product.prix)}{" "}
            <span className="text-sm font-normal text-gray-400">€<span className="text-xs">/jour</span></span>
          </span>
          <button
            onClick={onAdd}
            disabled={product.stock === 0}
            aria-label="Ajouter au devis"
            className="w-8 h-8 rounded-full bg-[#C8A97E] text-white flex items-center justify-center hover:bg-[#B8926E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CategoryPills ─────────────────────────────────────────────────────────────
function CategoryPills({
  active,
  onChange,
}: {
  active: string
  onChange: (c: string) => void
}) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" } as React.CSSProperties}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            active === cat
              ? "bg-[#C8A97E] text-white shadow-sm"
              : "bg-[#F0EBE3] text-[#2E2E2E]/60 hover:bg-[#C8A97E]/20 hover:text-[#C8A97E]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({
  onNav,
  onCatalogue,
}: {
  onNav: (p: Page) => void
  onCatalogue: (cat?: string) => void
}) {
  return (
    <footer className="bg-[#2E2E2E] text-white pt-14 pb-8 mt-16 rounded-t-[2.5rem]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-2 md:col-span-1">
          <p className="text-[#C8A97E] text-[10px] tracking-[0.35em] uppercase font-light">
            Location décoration
          </p>
          <p style={DP} className="text-white text-2xl font-semibold mt-1 mb-4">
            Papillon Rose
          </p>
          <p className="text-white/45 text-sm leading-relaxed">
            Location de mobilier et décoration pour événements, mariages et
            réceptions.
          </p>
        </div>
        <div>
          <p className="text-[#C8A97E] text-[10px] tracking-[0.3em] uppercase mb-5">
            Navigation
          </p>
          <ul className="space-y-3 text-sm text-white/55">
            {(["home", "catalogue", "favorites", "contact"] as Page[]).map(
              (p) => (
                <li key={p}>
                  <button
                    onClick={() => onNav(p)}
                    className="hover:text-[#C8A97E] transition-colors"
                  >
                    {p === "home"
                      ? "Accueil"
                      : p === "catalogue"
                        ? "Catalogue"
                        : p === "favorites"
                          ? "Favoris"
                          : "Contact"}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <p className="text-[#C8A97E] text-[10px] tracking-[0.3em] uppercase mb-5">
            Catégories
          </p>
          <ul className="space-y-3 text-sm text-white/55">
            {CATEGORIES.slice(1, 7).map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => onCatalogue(cat)}
                  className="hover:text-[#C8A97E] transition-colors"
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[#C8A97E] text-[10px] tracking-[0.3em] uppercase mb-5">
            Contact
          </p>
          <ul className="space-y-3.5 text-sm text-white/55">
            <li className="flex items-center gap-2.5">
              <Phone size={13} className="text-[#C8A97E]" />
              06 12 34 56 78
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={13} className="text-[#C8A97E]" />
              contact@papillonrose.fr
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={13} className="text-[#C8A97E] mt-0.5" />
              <span>
                Île-de-France
                <br />
                Livraison nationale
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-6 border-t border-white/10">
        <p className="text-white/25 text-xs text-center">
          © 2025 Papillon Rose — Location décoration événements · Tous droits
          réservés
        </p>
      </div>
    </footer>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function PapillonRoseSite() {
  const [page, setPage] = useState<Page>("home")
  const [category, setCategory] = useState("Tous")
  const [search, setSearch] = useState("")
  const [modalProduct, setModalProduct] = useState<Produit | null>(null)
  const [quote, setQuote] = useState<QuoteItem[]>([])
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [showQuote, setShowQuote] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [priceMax, setPriceMax] = useState(200)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [scrolled, setScrolled] = useState(page !== "home")
  const [showQuoteSent, setShowQuoteSent] = useState(false)

  useEffect(() => {
    const check = () => setScrolled(page !== "home" || window.scrollY > window.innerHeight)
    check()
    window.addEventListener("scroll", check)
    window.addEventListener("resize", check)
    return () => {
      window.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [page])

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (category === "Tous" || p.categorie === category) &&
          (!search ||
            p.nom.toLowerCase().includes(search.toLowerCase()) ||
            p.categorie.toLowerCase().includes(search.toLowerCase())) &&
          parsePrix(p.prix) <= priceMax &&
          (!inStockOnly || p.stock > 0),
      ),
    [category, search, priceMax, inStockOnly],
  )

  const addToQuote = (p: Produit) => {
    setQuote((prev) => {
      const ex = prev.find((i) => i.product.id === p.id)
      return ex
        ? prev.map((i) =>
            i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i,
          )
        : [...prev, { product: p, qty: 1 }]
    })
    setShowQuote(true)
  }

  const updateQty = (id: number, delta: number) => {
    setQuote((prev) =>
      prev
        .map((i) =>
          i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    )
  }

  const toggleFav = (id: number) => {
    setFavorites((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const quoteTotal = quote.reduce((s, i) => s + parsePrix(i.product.prix) * i.qty, 0)
  const quoteCount = quote.reduce((s, i) => s + i.qty, 0)
  const navTo = (p: Page) => {
    setPage(p)
    setShowMenu(false)
    window.scrollTo(0, 0)
  }
  const goToCatalogue = (cat?: string) => {
    setPage("catalogue")
    if (cat) setCategory(cat)
    window.scrollTo(0, 0)
  }
  const resetFilters = () => {
    setSearch("")
    setCategory("Tous")
    setPriceMax(200)
    setInStockOnly(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans text-[#2E2E2E]">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm" : "opacity-0 pointer-events-none"}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16">
          <button onClick={() => navTo("home")} aria-label="Accueil Papillon Rose">
            <img
              src={LOGO || PLACEHOLDER}
              alt="Papillon Rose"
              className="h-10 w-auto"
            />
          </button>

          <div className="hidden md:flex items-center gap-8 mr-8">
            {(["home", "catalogue", "favorites", "contact"] as Page[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() =>
                      p === "catalogue" ? goToCatalogue() : navTo(p)
                    }
                    className={`text-sm transition-colors ${
                      page === p || p === "home"
                        ? scrolled
                          ? "text-[#C8A97E] font-bold"
                          : "text-white"
                        : scrolled
                          ? "text-[#2E2E2E]/60 hover:text-[#C8A97E]"
                          : "text-white/70 hover:text-white"
                    }`}
                  >
                  {p === "home"
                    ? "Accueil"
                    : p === "catalogue"
                      ? "Catalogue"
                      : p === "favorites"
                        ? "Favoris"
                        : "Contact"}
                </button>
              ),
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navTo("favorites")}
              aria-label="Favoris"
              className="relative p-2 hover:text-[#C8A97E] transition-colors"
            >
              <Heart
                size={19}
                fill={favorites.size > 0 ? GOLD : "none"}
                className={
                  favorites.size > 0
                    ? "text-[#C8A97E]"
                    : scrolled
                      ? "text-[#2E2E2E]/40"
                      : "text-white/70"
                }
              />
              {favorites.size > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C8A97E] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {favorites.size}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowQuote(true)}
              className="relative flex items-center gap-2 bg-[#C8A97E] text-white px-4 py-2 rounded-full text-sm hover:bg-[#B8926E] transition-colors"
            >
              <ShoppingBag size={15} />
              <span className="hidden md:inline font-medium">Devis</span>
              {quoteCount > 0 && (
                <span className="w-5 h-5 bg-white text-[#C8A97E] text-[10px] rounded-full flex items-center justify-center font-bold">
                  {quoteCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowMenu(true)}
              aria-label="Menu"
              className={`md:hidden p-2 ${scrolled ? "text-[#2E2E2E]/60" : "text-white/70"}`}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white rounded-l-3xl shadow-2xl p-8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-10">
              <img
                src={LOGO || PLACEHOLDER}
                alt="Papillon Rose"
                className="h-9 w-auto"
              />
              <button
                onClick={() => setShowMenu(false)}
                aria-label="Fermer le menu"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {(["home", "catalogue", "favorites", "contact"] as Page[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() =>
                      p === "catalogue" ? goToCatalogue() : navTo(p)
                    }
                    className="text-left text-[#2E2E2E]/70 hover:text-[#C8A97E] transition-colors text-lg"
                    style={DP}
                  >
                    {p === "home"
                      ? "Accueil"
                      : p === "catalogue"
                        ? "Catalogue"
                        : p === "favorites"
                          ? "Favoris"
                          : "Contact"}
                  </button>
                ),
              )}
            </div>
            <div className="mt-auto text-sm text-[#2E2E2E]/35 space-y-1">
              <p>contact@papillonrose.fr</p>
              <p>06 12 34 56 78</p>
            </div>
          </div>
        </div>
      )}

      <div>
        {/* ─── HOME ─── */}
        {page === "home" && (
          <div>
            {/* Hero */}
            <section className="relative" style={{ height: "100vh", maxHeight: "100vh" }}>
              <video
                src="https://raw.githubusercontent.com/Rose-B05/papillonrose/master/public/products/hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </section>

            {/* Hero text */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
              <p className="text-[#C8A97E] text-xs tracking-[0.5em] uppercase mb-3 font-medium">
                LOCATION DÉCORATION ÉVÉNEMENT
              </p>
              <h1 style={DP} className="text-[#2E2E2E] text-5xl md:text-7xl font-semibold leading-[1.1] mb-6">
                Papillon
                <br />
                <em className="font-normal italic">Rose</em>
              </h1>
            </section>

            {/* Stats strip */}
            <section className="max-w-5xl mx-auto px-6 py-10 md:py-14 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { val: "+200", label: "références" },
                { val: "11", label: "catégories" },
                { val: "Stock", label: "mis à jour" },
                { val: "Devis", label: "en 24h" },
              ].map((s) => (
                <div key={s.val} className="text-center">
                  <p style={DP} className="text-2xl font-bold text-[#C8A97E]">
                    {s.val}
                  </p>
                  <p className="text-xs text-[#2E2E2E]/45 uppercase tracking-wider mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </section>

            {/* Featured products */}
            <section className="max-w-7xl mx-auto px-5 md:px-10">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                    Sélection du moment
                  </p>
                  <h2
                    style={DP}
                    className="text-2xl md:text-3xl font-semibold text-[#2E2E2E]"
                  >
                    Articles en vedette
                  </h2>
                </div>
                <button
                  onClick={() => goToCatalogue()}
                  className="hidden md:flex items-center gap-1.5 text-sm text-[#C8A97E] font-medium hover:gap-2.5 transition-all"
                >
                  Tout voir <ArrowRight size={14} />
                </button>
              </div>

              <div className="mb-6">
                <CategoryPills active={category} onChange={setCategory} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {PRODUCTS.filter(
                  (p) => category === "Tous" || p.categorie === category,
                )
                  .slice(0, 10)
                  .map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isFav={favorites.has(p.id)}
                      onFav={() => toggleFav(p.id)}
                      onView={() => setModalProduct(p)}
                      onAdd={() => addToQuote(p)}
                    />
                  ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => goToCatalogue()}
                  className="inline-flex items-center gap-2 bg-[#2E2E2E] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#C8A97E] transition-colors"
                >
                  Voir tout le catalogue <ArrowRight size={15} />
                </button>
              </div>
            </section>

            {/* Category showcase */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                    Explorer par thème
                  </p>
                  <h2
                    style={DP}
                    className="text-2xl md:text-3xl font-semibold text-[#2E2E2E]"
                  >
                    Nos Catégories
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {CATEGORIES.slice(1).map((cat) => {
                  const count = PRODUCTS.filter(
                    (p) => p.categorie === cat,
                  ).length
                  return (
                    <button
                      key={cat}
                      onClick={() => goToCatalogue(cat)}
                      className="group relative overflow-hidden rounded-3xl bg-[#EDE8DF]"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <img
                        src={img(CATEGORY_IMAGES[cat] || "/placeholder.svg")}
                        alt={cat}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2E2E2E]/80 via-[#2E2E2E]/10 to-transparent rounded-3xl" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                        <p
                          style={DP}
                          className="text-white text-sm font-semibold leading-tight"
                        >
                          {cat}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[#C8A97E] text-[11px]">
                            {count} article{count > 1 ? "s" : ""}
                          </span>
                          <ArrowRight
                            size={11}
                            className="text-[#C8A97E] group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16">
              <div className="relative overflow-hidden rounded-3xl bg-[#2E2E2E] px-10 py-16 text-center">
                <div className="absolute inset-0">
                  <img
                    src={img("/products/prod005.png")}
                    alt=""
                    aria-hidden
                    className="w-full h-full object-cover opacity-15 rounded-3xl"
                  />
                </div>
                <div className="relative z-10 max-w-xl mx-auto">
                  <p className="text-[#C8A97E] text-[10px] tracking-[0.5em] uppercase mb-4 font-medium">
                    Votre événement, notre passion
                  </p>
                  <h2
                    style={DP}
                    className="text-3xl md:text-4xl text-white font-semibold mb-5 leading-snug"
                  >
                    Un projet en tête&nbsp;?
                  </h2>
                  <p className="text-white/55 text-base mb-8 leading-relaxed">
                    Constituez votre sélection et envoyez-nous votre demande de
                    devis.
                    <br />
                    Réponse sous 24h.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => goToCatalogue()}
                      className="bg-[#C8A97E] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#B8926E] transition-colors"
                    >
                      Parcourir le catalogue
                    </button>
                    <button
                      onClick={() => navTo("contact")}
                      className="border border-white/30 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
                    >
                      Nous contacter
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}

        {/* ─── CATALOGUE ─── */}
        {page === "catalogue" && (
          <div className="max-w-7xl mx-auto px-5 md:px-10 pt-24 pb-8">
            <div className="mb-7">
              <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                Explorer
              </p>
              <h1
                style={DP}
                className="text-3xl md:text-4xl font-semibold text-[#2E2E2E]"
              >
                Catalogue de Location
              </h1>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Rechercher un article…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl text-sm outline-none border border-black/[0.07] focus:border-[#C8A97E]/50 transition-colors placeholder:text-gray-400 shadow-sm"
                />
              </div>
              <label className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl text-sm cursor-pointer border border-black/[0.07] shadow-sm hover:border-[#C8A97E]/40 transition-colors select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[#C8A97E] w-3.5 h-3.5"
                />
                <SlidersHorizontal size={14} className="text-[#C8A97E]" />
                En stock
              </label>
            </div>

            <div className="flex items-center gap-4 mb-5 bg-white rounded-2xl px-5 py-3.5 border border-black/[0.07] shadow-sm">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Prix max
              </span>
              <input
                type="range"
                min={0}
                max={200}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="flex-1 accent-[#C8A97E] h-1"
              />
              <span
                style={DP}
                className="text-[#C8A97E] font-bold text-base w-16 text-right"
              >
                {priceMax} €
              </span>
            </div>

            <div className="mb-7">
              <CategoryPills active={category} onChange={setCategory} />
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-400">
                <span className="text-[#2E2E2E] font-semibold">
                  {filtered.length}
                </span>{" "}
                résultat{filtered.length > 1 ? "s" : ""}
                {category !== "Tous" && (
                  <span>
                    {" "}
                    — <span className="text-[#C8A97E]">{category}</span>
                  </span>
                )}
              </p>
              {(search ||
                category !== "Tous" ||
                priceMax < 200 ||
                inStockOnly) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-gray-400 hover:text-[#C8A97E] transition-colors underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFav={favorites.has(p.id)}
                    onFav={() => toggleFav(p.id)}
                    onView={() => setModalProduct(p)}
                    onAdd={() => addToQuote(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-gray-400 text-base mb-5">
                  Aucun produit ne correspond à votre sélection.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-[#C8A97E] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}

        {/* ─── FAVORITES ─── */}
        {page === "favorites" && (
          <div className="max-w-7xl mx-auto px-5 md:px-10 pt-24 pb-8 min-h-[60vh]">
            <div className="mb-8">
              <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                Mes préférences
              </p>
              <h1
                style={DP}
                className="text-3xl md:text-4xl font-semibold text-[#2E2E2E]"
              >
                Favoris
              </h1>
            </div>
            {favorites.size === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Heart size={32} className="text-[#C8A97E]/40" />
                </div>
                <p className="text-gray-400 text-base mb-6">
                  Vous n&apos;avez pas encore de favoris.
                </p>
                <button
                  onClick={() => goToCatalogue()}
                  className="bg-[#C8A97E] text-white px-10 py-3.5 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors"
                >
                  Parcourir le catalogue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {PRODUCTS.filter((p) => favorites.has(p.id)).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFav
                    onFav={() => toggleFav(p.id)}
                    onView={() => setModalProduct(p)}
                    onAdd={() => addToQuote(p)}
                  />
                ))}
              </div>
            )}
            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}

        {/* ─── CONTACT ─── */}
        {page === "contact" && (
          <div>
            <div className="max-w-4xl mx-auto px-5 md:px-10 pt-24 pb-12">
              <div className="text-center mb-14">
                <p className="text-[#C8A97E] text-[10px] tracking-[0.5em] uppercase font-medium mb-3">
                  Parlons de votre projet
                </p>
                <h1
                  style={DP}
                  className="text-4xl md:text-5xl font-semibold text-[#2E2E2E]"
                >
                  Contactez-nous
                </h1>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <div className="space-y-7">
                    {[
                      {
                        Icon: Phone,
                        label: "Téléphone",
                        val: "06 12 34 56 78",
                      },
                      {
                        Icon: Mail,
                        label: "Email",
                        val: "contact@papillonrose.fr",
                      },
                      {
                        Icon: MapPin,
                        label: "Zone",
                        val: "Île-de-France\nLivraison nationale",
                      },
                    ].map(({ Icon, label, val }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-[#C8A97E]/12 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Icon size={17} className="text-[#C8A97E]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                            {label}
                          </p>
                          <p className="font-medium text-sm whitespace-pre-line text-[#2E2E2E]">
                            {val}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 p-6 bg-[#2E2E2E] rounded-3xl text-white">
                    <p style={DP} className="text-lg font-semibold mb-3">
                      Horaires
                    </p>
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex justify-between">
                        <span>Lundi – Vendredi</span>
                        <span className="text-white/90">9h – 18h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samedi</span>
                        <span className="text-white/90">10h – 16h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimanche</span>
                        <span className="text-white/35">Fermé</span>
                      </div>
                    </div>
                  </div>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  {[
                    {
                      label: "Nom complet",
                      type: "text",
                      placeholder: "Marie Dupont",
                    },
                    {
                      label: "Adresse email",
                      type: "email",
                      placeholder: "marie@exemple.fr",
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                      Date de l&apos;événement
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                      Votre message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Décrivez votre projet, nombre d'invités, lieu…"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors resize-none shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#C8A97E] text-white py-4 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors shadow-md"
                  >
                    Envoyer ma demande
                  </button>
                </form>
              </div>
            </div>
            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}
      </div>

      {/* ── Product Modal ── */}
      {modalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModalProduct(null)}
        >
          <div
            className="bg-white w-full md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl rounded-t-3xl md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              <div
                className="relative bg-white rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden"
                style={{ aspectRatio: "1 / 1" }}
              >
                <img
                  src={modalProduct.image ? img(modalProduct.image) : PLACEHOLDER}
                  alt={modalProduct.nom}
                  className="w-full h-full object-contain p-4"
                />
                <button
                  onClick={() => setModalProduct(null)}
                  aria-label="Fermer"
                  className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-7 flex flex-col">
                <span className="text-[#C8A97E] text-[10px] tracking-[0.35em] uppercase font-medium mb-2">
                  {modalProduct.categorie}
                </span>
                <h2
                  style={DP}
                  className="text-2xl font-semibold text-[#2E2E2E] mb-3 leading-snug"
                >
                  {modalProduct.nom}
                </h2>
                <div className="space-y-2.5 bg-[#F8F5F0] rounded-2xl p-4 mb-5">
                  {modalProduct.dimension && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 text-[11px] uppercase tracking-wider">
                        Dimensions
                      </span>
                      <span className="font-medium text-[#2E2E2E] text-right max-w-[55%] text-sm">
                        {modalProduct.dimension}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 text-[11px] uppercase tracking-wider">
                      Stock
                    </span>
                    <span
                      className={`font-semibold ${
                        modalProduct.stock === 0
                          ? "text-red-400"
                          : modalProduct.stock <= 2
                            ? "text-amber-500"
                            : "text-green-500"
                      }`}
                    >
                      {modalProduct.stock === 0
                        ? "Indisponible"
                        : `${modalProduct.stock} disponible${
                            modalProduct.stock > 1 ? "s" : ""
                          }`}
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <p
                    style={DP}
                    className="text-3xl font-bold text-[#2E2E2E] mb-5"
                  >
                    {formatPrix(modalProduct.prix)} €
                    <span className="text-sm font-normal text-gray-400 ml-1">
                      / jour
                    </span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        addToQuote(modalProduct)
                        setModalProduct(null)
                      }}
                      disabled={modalProduct.stock === 0}
                      className="flex-1 bg-[#2E2E2E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#C8A97E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Ajouter au devis
                    </button>
                    <button
                      onClick={() => toggleFav(modalProduct.id)}
                      aria-label="Ajouter aux favoris"
                      className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-colors ${
                        favorites.has(modalProduct.id)
                          ? "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                          : "border-gray-200 hover:border-[#C8A97E] hover:text-[#C8A97E]"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={
                          favorites.has(modalProduct.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quote sidebar ── */}
      {showQuote && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
          onClick={() => setShowQuote(false)}
        >
          <div
            className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl rounded-l-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.07]">
              <div>
                <h3
                  style={DP}
                  className="text-xl font-semibold text-[#2E2E2E]"
                >
                  Demande de devis
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {quoteCount} article{quoteCount > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowQuote(false)}
                aria-label="Fermer"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {quote.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={24} className="text-[#C8A97E]/50" />
                </div>
                <p className="text-gray-400 mb-5 text-sm">
                  Votre sélection est vide.
                </p>
                <button
                  onClick={() => {
                    setShowQuote(false)
                    goToCatalogue()
                  }}
                  className="bg-[#C8A97E] text-white px-7 py-2.5 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors"
                >
                  Parcourir le catalogue
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                  {quote.map(({ product: p, qty }) => (
                    <div
                      key={p.id}
                      className="flex gap-3.5 items-start bg-[#F8F5F0] rounded-2xl p-3"
                    >
                      <img
                        src={p.image ? img(p.image) : PLACEHOLDER}
                        alt={p.nom}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-[#2E2E2E] leading-tight line-clamp-2">
                          {p.nom}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {formatPrix(p.prix)} € / jour
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(p.id, -1)}
                            aria-label="Diminuer"
                            className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-[#C8A97E] hover:text-white transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(p.id, 1)}
                            aria-label="Augmenter"
                            className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-[#C8A97E] hover:text-white transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm text-[#2E2E2E]">
                          {parsePrix(p.prix) * qty} €
                        </p>
                        <button
                          onClick={() => updateQty(p.id, -qty)}
                          aria-label="Supprimer"
                          className="text-gray-300 hover:text-red-400 transition-colors mt-1.5"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-black/[0.07] px-5 py-5">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider">
                      Total estimé
                    </span>
                    <span
                      style={DP}
                      className="text-2xl font-bold text-[#2E2E2E]"
                    >
                      {quoteTotal} €
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowQuote(false)
                      setShowQuoteSent(true)
                      setTimeout(() => setShowQuoteSent(false), 3000)
                      navTo("contact")
                    }}
                    className="w-full bg-[#C8A97E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors mb-2.5"
                  >
                    Envoyer ma demande
                  </button>
                  <button
                    onClick={() => {
                      setShowQuote(false)
                      goToCatalogue()
                    }}
                    className="w-full bg-[#F0EBE3] text-[#2E2E2E]/70 py-3 rounded-2xl text-sm font-medium hover:bg-[#E8E0D5] transition-colors"
                  >
                    Continuer mes choix
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showQuoteSent && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#2E2E2E] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-[fade-in-up_0.3s_ease-out]">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm font-medium">Demande de devis envoyée avec succès</span>
        </div>
      )}
    </div>
  )
}
