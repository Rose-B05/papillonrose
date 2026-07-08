"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import {
  Search,
  ShoppingBag,
  Heart,
  X,
  Plus,
  Minus,
  Menu,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Trash2,
  FileText,
  Send,
  Clock,
  Package,
  RotateCcw,
  Star,
  User,
} from "lucide-react"
import { produits, type Produit, hasRealPhoto, getActiveProductsCount } from "@/data/produits"
import { useCart } from "@/components/cart-context"
import CatalogGallery from "@/components/catalog-gallery"
import CatalogFilters from "@/components/catalog-filters"
import OverflowCarousel from "@/components/overflow-carousel"

import Chatbot from "@/components/chatbot"
import WhatsAppButton from "@/components/whatsapp-button"
import { getThemes, getCouleurs, type FilterState } from "@/lib/product-tags"
import { FEATURED_IDS } from "@/lib/scenes"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path
const PLACEHOLDER = img("/placeholder.svg")
const LOGO = img("/papillon-rose-logo.png")

function formatPrix(prix: number | string): string {
  if (typeof prix === "number") return prix.toFixed(2).replace(".", ",")
  return prix.replace(/\./g, ",")
}
function formatDecimalFr(val: string): string {
  return val.replace(/\./g, ",")
}
function parsePrix(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = prix.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}
function getStartingPrix(product: { prix: number | string; variants?: { label: string; prix: number | string }[] }): number | string {
  if (product.variants && product.variants.length > 0) {
    const min = Math.min(...product.variants.map((v) => parsePrix(v.prix)))
    return min
  }
  return product.prix
}

/**
 * Resolve variants for a product: use explicit `variants` if present,
 * otherwise parse string prix ("5 - 6 - 7") + dimension ("15 - 20 - 25 cm")
 * into virtual variants. Returns undefined if product has no variants.
 */
function resolveVariants(product: {
  prix: number | string
  dimension?: string
  variants?: { label: string; prix: number | string }[]
}): { label: string; prix: number | string }[] | undefined {
  if (product.variants && product.variants.length > 0) return product.variants
  if (typeof product.prix !== "string" || !product.prix.includes(" - ")) return undefined
  const prices = product.prix.split(" - ").map((s) => s.trim())
  const dims = product.dimension?.includes(" - ")
    ? product.dimension.split(" - ").map((s) => s.trim())
    : undefined
  return prices.map((p, i) => ({
    label: dims?.[i] ?? `Taille ${i + 1}`,
    prix: isNaN(Number(p)) ? p : Number(p),
  }))
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "home" | "catalogue" | "panier" | "favorites" | "contact"
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

/** Produits visibles sur le site (ayant une vraie photo et non archivés) */
const VISIBLE_PRODUCTS = PRODUCTS.filter((p) => hasRealPhoto(p) && p.actif !== false)

let CATEGORY_IMAGES: Record<string, string> = {
  Mobilier: "/images/PROD005.png",
  "Figurines & Jeux": "/images/PROD098.png",
  "Bougeoirs & Lustres": "/images/PROD023.png",
  Verreries: "/images/PROD088.png",
  Cadres: "/images/PROD39.png",
  "Présentoirs & Plateaux": "/images/PROD097.png",
  "Urnes & Accessoires": "/images/PROD093.png",
  "Art de la Table": "/images/PROD053.png",
  "Vases & Pots": "/images/PROD071.png",
  Décoration: "/images/PROD074.png",
  "Fleurs & Feuillages": "/images/PROD089.png",
}

// Images will be prefixed at render time

const DP = { fontFamily: "var(--font-playfair), serif" } as const
const GOLD = "#C8A97E"

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  isFav,
  isInCart,
  onFav,
  onView,
  onAddCart,
  dynamicStock,
}: {
  product: Produit
  isFav: boolean
  isInCart: boolean
  onFav: () => void
  onView: () => void
  onAddCart: () => void
  dynamicStock?: Record<number, number>
}) {
  const getSrc = () => {
    if (product.image && product.image !== "/placeholder.png") return product.image
    if (product.gallerie && product.gallerie.length > 0) return product.gallerie[0]
    return "/placeholder.svg"
  }
  const effectiveStock = dynamicStock?.[product.id] ?? product.stock
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
      <div
        className="relative overflow-hidden cursor-pointer aspect-square bg-[#F8F5F0]"
        onClick={onView}
      >
        <img
          src={img(getSrc())}
          alt={product.nom}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {effectiveStock === 1 && (
          <span className="absolute top-2.5 left-2.5 bg-amber-400 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide z-10">
            Unique
          </span>
        )}
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-[#C8A97E] uppercase tracking-wider truncate">
            {product.categorie}
          </p>
          <h3 className="text-[13px] font-semibold text-[#2E2E2E] leading-snug truncate">
            {product.nom}
          </h3>
          {product.dimension && (
            <p className="text-[10px] text-gray-400 truncate">{formatDecimalFr(product.dimension)}</p>
          )}
          <p className="text-lg font-bold text-[#2E2E2E] mt-0.5">
            {product.variants && product.variants.length > 0 ? (
              <>
                <span className="text-[10px] font-normal text-gray-400 mr-0.5">à partir de</span>
                {formatPrix(getStartingPrix(product))} €
              </>
            ) : (
              <>
                {formatPrix(product.prix)} €
              </>
            )}
            <span className="text-xs font-normal text-gray-400 ml-0.5">/jour</span>
          </p>
        </div>
        <div className="mt-auto pt-2.5 flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAddCart() }}
            disabled={isInCart}
            aria-label={isInCart ? "Déjà dans le panier" : "Ajouter au panier"}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isInCart
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#C8A97E] text-white hover:bg-[#B8926E]"
            }`}
          >
            <ShoppingBag size={13} />
            <span className="hidden sm:inline">{isInCart ? "Déjà dans le panier" : "Ajouter au panier"}</span>
            <span className="sm:hidden">{isInCart ? "Ajouté" : "Ajouter"}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onFav() }}
            aria-label="Favoris"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-sm flex-shrink-0 ${
              isFav
                ? "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                : "border-gray-200 text-gray-300 hover:text-[#C8A97E] hover:border-[#C8A97E]/30"
            }`}
          >
            <Heart size={14} fill={isFav ? "currentColor" : "none"} />
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
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
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

// ─── Breadcrumb ──────────────────────────────────────────────────────────────
function Breadcrumb({
  category,
  productName,
  onNavigate,
}: {
  category?: string
  productName?: string
  onNavigate: (page: Page, cat?: string) => void
}) {
  const items: { label: string; onClick?: () => void }[] = [
    { label: "Accueil", onClick: () => onNavigate("home") },
    { label: "Catalogue", onClick: () => onNavigate("catalogue") },
  ]
  if (category && category !== "Tous") {
    items.push({
      label: category,
      onClick: () => onNavigate("catalogue", category),
    })
  }
  if (productName) {
    items.push({ label: productName })
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.onClick ? { item: "#" } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Fil d'Ariane" className="mb-5">
        <ol className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
          {items.map((item, i) => {
            const isLast = i === items.length - 1
            return (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg
                    className="w-3 h-3 text-gray-300 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {isLast ? (
                  <span className="text-[#2E2E2E] font-medium truncate max-w-[200px]">
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="hover:text-[#C8A97E] transition-colors truncate max-w-[180px]"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

// ─── ProductImages (Carousel) ───────────────────────────────────────────────
function ProductImages({
  images,
  nom,
  onClose,
}: {
  images: string[]
  nom: string
  onClose: () => void
}) {
  const [idx, setIdx] = useState(0)
  const len = images.length
  const prev = useCallback(() => setIdx((i) => (i - 1 + len) % len), [len])
  const next = useCallback(() => setIdx((i) => (i + 1) % len), [len])
  return (
    <div
      className="relative bg-white rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden"
      style={{ aspectRatio: "1 / 1" }}
    >
      {len > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Image précédente"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors text-[#2E2E2E]/60 hover:text-[#C8A97E]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            onClick={next}
            aria-label="Image suivante"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors text-[#2E2E2E]/60 hover:text-[#C8A97E]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}
      <img
        src={img(images[idx])}
        alt={nom}
        className="w-full h-full object-contain p-4 transition-opacity duration-300"
      />
      {len > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Image ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${
                i === idx ? "bg-[#C8A97E] w-4" : "bg-black/20 hover:bg-black/40"
              }`}
            />
          ))}
        </div>
      )}
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors z-10"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// ─── Instagram Icon (official gradient logo) ───────────────────────────────────
function InstagramIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="20%" stopColor="#FA7E1E" />
          <stop offset="45%" stopColor="#D62976" />
          <stop offset="70%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-gradient)" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
    </svg>
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
  const [showCategories, setShowCategories] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  const [showDelivery, setShowDelivery] = useState(false)
  return (
    <footer className="bg-[#1C1A17] text-white pt-16 pb-8 mt-16 relative">
      <div className="max-w-7xl mx-auto px-5 md:px-10 relative z-10 flex flex-col lg:flex-row gap-10 lg:gap-8 mb-12 overflow-visible">
        {/* Colonnes de texte — gauche */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 lg:gap-8">
          {/* Colonne 1 — Identité */}
          <div className="lg:col-span-1">
            <img src={LOGO} alt="Papillon Rose" className="h-10 w-auto brightness-0 invert opacity-90 mb-4" />
            <p className="text-[#A89880] text-sm leading-relaxed mb-6">
              Location de mobilier et décoration pour événements, mariages et réceptions.
            </p>
            <a
              href="/reservation"
              className="inline-flex items-center gap-2 bg-[#C9A96E] text-[#1C1A17] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#d4b87a] transition-colors whitespace-nowrap"
            >
              Demander un devis
            </a>
            <p className="text-[#C9A96E]/70 text-[10px] mt-2 tracking-wide">
              Réponse sous 24h
            </p>
          </div>

          {/* Colonne 2 — Menus empilés : Navigation → Catégories → Contact */}
          <div className="flex flex-col gap-8">
            {/* Navigation (accordion) */}
            <div>
              <button
                onClick={() => setShowNavigation(!showNavigation)}
                className="text-[#F5F0E8] text-xs tracking-[0.3em] uppercase mb-5 font-medium flex items-center gap-2 hover:text-white transition-colors"
              >
                Navigation
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform duration-200 ${showNavigation ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: showNavigation ? "500px" : "0px" }}
              >
                <ul className="space-y-3 text-sm pb-2">
                  {([
                    { label: "Accueil", page: "home" as Page },
                    { label: "Catalogue", page: "catalogue" as Page },
                    { label: "Panier", href: "/reservation" },
                    { label: "Favoris", page: "favorites" as Page },
                    { label: "Contact", page: "contact" as Page },
                  ]).map((item) => (
                    <li key={item.label}>
                      {"href" in item ? (
                        <a href={item.href} className="text-[#D4B896] hover:text-white transition-colors">
                          {item.label}
                        </a>
                      ) : (
                        <button
                          onClick={() => onNav(item.page)}
                          className="text-[#D4B896] hover:text-white transition-colors text-left"
                        >
                          {item.label}
                        </button>
                      )}
                    </li>
                  ))}
                  <li>
                    <a href="/a-propos" className="text-[#D4B896] hover:text-white transition-colors">
                      À propos
                    </a>
                  </li>
                  <li>
                    <a href="/faq" className="text-[#D4B896] hover:text-white transition-colors">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="/conditions-location" className="text-[#D4B896] hover:text-white transition-colors">
                      Conditions de location
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Catégories (accordion) */}
            <div>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="text-[#F5F0E8] text-xs tracking-[0.3em] uppercase mb-5 font-medium flex items-center gap-2 hover:text-white transition-colors"
              >
                Catégories
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform duration-200 ${showCategories ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: showCategories ? "500px" : "0px" }}
              >
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm pb-2">
                  {CATEGORIES.slice(1).map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => onCatalogue(cat)}
                        className="text-[#D4B896] hover:text-white transition-colors text-left"
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-[#F5F0E8] text-xs tracking-[0.3em] uppercase mb-5 font-medium">
                Contact
              </p>
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-start gap-2.5">
                  <Phone size={13} className="text-[#C8A97E]/50 mt-0.5 flex-shrink-0" />
                  <span className="text-[#D4B896]/60 text-xs italic">
                    Téléphone temporairement indisponible
                    <br />
                    <span className="not-italic">Contactez-nous par email ou Instagram</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail size={13} className="text-[#C9A96E] mt-0.5 flex-shrink-0" />
                  <a href="mailto:papillonrosebertha@gmail.com" className="text-[#D4B896] hover:text-white transition-colors">
                    papillonrosebertha@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin size={13} className="text-[#C9A96E] mt-0.5 flex-shrink-0" />
                  <span className="text-[#D4B896]">
                    Île-de-France
                    <br />
                    Créteil (94)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Send size={13} className="text-[#C9A96E] flex-shrink-0" />
                  <a href="https://t.me/PapillonRose" target="_blank" rel="noopener noreferrer" className="text-[#D4B896] hover:text-white transition-colors">
                    @PapillonRose
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <a href="https://www.instagram.com/papillonrose.g" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#D4B896] hover:text-white transition-colors">
                    <InstagramIcon size={18} />
                    @papillonrose.g
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scène femme + cage — droite (desktop) */}
        <div className="hidden lg:block flex-shrink-0">
          <div className="relative w-[580px] h-[700px] -mt-[140px]">
            <img
              src={img("/images/PROD086.png")}
              alt=""
              aria-hidden
              loading="lazy"
              className="w-full h-full object-contain drop-shadow-[0_4px_24px_rgba(201,169,110,0.15)]"
            />
          </div>
        </div>

        {/* Scène mobile — empilée sous les colonnes */}
        <div className="lg:hidden flex justify-center mt-4 overflow-visible">
          <img
            src={img("/images/PROD086.png")}
            alt=""
            aria-hidden
            loading="lazy"
            className="w-[350px] max-w-[90vw] h-auto object-contain opacity-90 -mt-[60px]"
          />
        </div>
      </div>

      {/* Barre copyright */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 relative z-10 pt-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[#A89880]/60 text-xs">
            © 2026 Papillon Rose — Location décoration événements · Tous droits réservés
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a href="/conditions-location" className="text-[#A89880]/60 hover:text-[#D4B896] transition-colors">
              Conditions de location
            </a>
            <a href="/mentions-legales" className="text-[#A89880]/60 hover:text-[#D4B896] transition-colors">
              Mentions légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function PapillonRoseSite() {
  const { items: cartItems, addItem: addCartItem, itemCount: cartCount } = useCart()
  const [page, setPage] = useState<Page>("home")
  const [category, setCategory] = useState("Tous")
  const [search, setSearch] = useState("")
  const [modalProduct, setModalProduct] = useState<Produit | null>(null)
  const [modalQty, setModalQty] = useState(1)
  const [modalVariant, setModalVariant] = useState<string | undefined>(undefined)
  const [modalDateStart, setModalDateStart] = useState("")
  const [modalDateEnd, setModalDateEnd] = useState("")
  const [quote, setQuote] = useState<QuoteItem[]>([])
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [showQuote, setShowQuote] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [priceMax, setPriceMax] = useState(200)
  const [scrolled, setScrolled] = useState(page !== "home")
  const [showQuoteSent, setShowQuoteSent] = useState(false)
  const [cartToast, setCartToast] = useState<string | null>(null)
  const [tagFilters, setTagFilters] = useState<FilterState>({
    themes: [],
    couleurs: [],
    budgetMin: 0,
    budgetMax: Infinity,
    dateDebut: "",
    dateFin: "",
    inStockOnly: false,
  })
  const [dynamicStock, setDynamicStock] = useState<Record<number, number>>({})
  const [customer, setCustomer] = useState<{ email: string; prenom: string; nom: string; telephone: string; adresse: string } | null>(null)

  const modalVariants = modalProduct ? resolveVariants(modalProduct) : undefined
  const prevCustomerRef = useRef<{ email: string; prenom: string; nom: string; telephone: string; adresse: string } | null>(null)

  // Load customer session + favorites on mount
  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.customer) {
          setCustomer(data.customer)
          const favRes = await fetch("/api/customer/favorites")
          const favData = await favRes.json()
          if (favData.favorites) {
            setFavorites(new Set(favData.favorites))
          }
        }
      })
      .catch(() => {})
  }, [])

  // When customer logs in (state changes null → logged in), merge local + server favorites
  useEffect(() => {
    if (customer && !prevCustomerRef.current) {
      // Just logged in — merge local favorites with server favorites
      const localFavs = Array.from(favorites)
      fetch("/api/customer/favorites")
        .then((r) => r.json())
        .then(async (data) => {
          const serverFavs: number[] = data.favorites || []
          const merged = Array.from(new Set([...serverFavs, ...localFavs]))
          setFavorites(new Set(merged))
          // Save merged to server
          await fetch("/api/customer/favorites", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favorites: merged }),
          })
        })
        .catch(() => {})
    }
    prevCustomerRef.current = customer
  }, [customer])

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

  useEffect(() => {
    setModalDateStart("")
    setModalDateEnd("")
  }, [modalProduct])

  // Fetch dynamic stock on mount and when returning to home
  useEffect(() => {
    fetch("/api/products/stock")
      .then((r) => r.json())
      .then((data) => setDynamicStock(data.stock || {}))
      .catch(() => {})
  }, [page])

  const getEffectiveStock = useCallback((id: number) => {
    const p = produits.find((prod) => prod.id === id)
    return dynamicStock[id] ?? p?.stock ?? 0
  }, [dynamicStock])

  const filtered = useMemo(
    () =>
      VISIBLE_PRODUCTS.filter((p) => {
        const pThemes = getThemes(p)
        const pCouleurs = getCouleurs(p)
        const pPrix = parsePrix(p.prix)

        const matchCategory = category === "Tous" || p.categorie === category
        const matchSearch =
          !search ||
          p.nom.toLowerCase().includes(search.toLowerCase()) ||
          p.categorie.toLowerCase().includes(search.toLowerCase())
        const matchPrice = pPrix <= priceMax
        const matchStock = !tagFilters.inStockOnly || getEffectiveStock(p.id) > 0

        const matchTheme =
          tagFilters.themes.length === 0 ||
          tagFilters.themes.some((t) => pThemes.includes(t))
        const matchCouleur =
          tagFilters.couleurs.length === 0 ||
          tagFilters.couleurs.some((c) => pCouleurs.includes(c))
        const matchBudget =
          pPrix >= tagFilters.budgetMin && pPrix <= tagFilters.budgetMax

        return (
          matchCategory &&
          matchSearch &&
          matchPrice &&
          matchStock &&
          matchTheme &&
          matchCouleur &&
          matchBudget
        )
      }),
    [category, search, priceMax, tagFilters],
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
      // Save to server if logged in
      if (customer) {
        fetch("/api/customer/favorites", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorites: Array.from(n) }),
        }).catch(() => {})
      }
      return n
    })
  }

  const addToCartWithToast = (productId: number, qty: number = 1, variantLabel?: string) => {
    const p = produits.find((x) => x.id === productId)
    const added = addCartItem({ productId, qty, dateStart: "", dateEnd: "", variantLabel })
    if (added && p) {
      const label = variantLabel ? `${p.nom} — ${variantLabel}` : p.nom
      setCartToast(label)
      setTimeout(() => setCartToast(null), 3000)
    }
    return added
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
    setShowMenu(false)
    if (cat) setCategory(cat)
    window.scrollTo(0, 0)
  }
  const resetFilters = () => {
    setSearch("")
    setCategory("Tous")
    setPriceMax(200)
    setTagFilters({
      themes: [],
      couleurs: [],
      budgetMin: 0,
      budgetMax: Infinity,
      dateDebut: "",
      dateFin: "",
      inStockOnly: false,
    })
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans text-[#2E2E2E] overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16 md:h-20">
          <button onClick={() => navTo("home")} aria-label="Accueil Papillon Rose">
            <img
              src={LOGO || PLACEHOLDER}
              alt="Papillon Rose"
              className={`h-10 md:h-12 w-auto transition-all duration-500 ${scrolled ? "" : "brightness-0 invert"}`}
            />
          </button>

          <div className="hidden md:flex items-center gap-8 mr-8">
            {(["home", "catalogue", "panier", "favorites", "contact"] as Page[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => {
                      if (p === "panier") { window.location.href = "/reservation"; return }
                      p === "catalogue" ? goToCatalogue() : navTo(p)
                    }}
                    className={`text-sm transition-all duration-300 ${
                      page === p
                        ? "font-bold " + (scrolled ? "text-[#C8A97E]" : "text-white")
                        : scrolled
                          ? "text-[#2E2E2E]/60 hover:text-[#C8A97E]"
                          : "text-white/70 hover:text-white"
                    }`}
                  >
                    {p === "home"
                      ? "Accueil"
                      : p === "catalogue"
                        ? "Catalogue"
                        : p === "panier"
                          ? "Panier"
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
              className={`relative p-2 transition-colors ${scrolled ? "hover:text-[#C8A97E]" : "hover:text-white"}`}
            >
              <Heart
                size={19}
                fill={favorites.size > 0 ? GOLD : "none"}
                className={
                  favorites.size > 0
                    ? "text-[#C8A97E]"
                    : scrolled
                      ? "text-[#2E2E2E]/40"
                      : "text-white/80"
                }
              />
              {favorites.size > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C8A97E] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {favorites.size}
                </span>
              )}
            </button>
            <a
              href="/reservation"
              className="relative p-2 hover:text-[#C8A97E] transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag size={19} className={cartCount > 0 ? "text-[#C8A97E]" : scrolled ? "text-[#2E2E2E]/40" : "text-white/80"} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C8A97E] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </a>
            <a
              href="/compte"
              className={`relative p-2 transition-colors ${scrolled ? "hover:text-[#C8A97E]" : "hover:text-white"}`}
              aria-label={customer ? "Mon compte" : "Se connecter"}
            >
              <User
                size={19}
                className={
                  customer
                    ? "text-[#C8A97E]"
                    : scrolled
                      ? "text-[#2E2E2E]/40"
                      : "text-white/80"
                }
              />
            </a>
            <button
              onClick={() => setShowQuote(true)}
              className="relative flex items-center gap-2 bg-[#C8A97E] text-white px-4 py-2 rounded-full text-sm hover:bg-[#B8926E] transition-colors"
            >
              <FileText size={15} />
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
              className={`md:hidden p-2 ${scrolled ? "text-[#2E2E2E]/60" : "text-white/80"}`}
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
              {(["home", "catalogue", "panier", "favorites", "contact"] as Page[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => {
                      if (p === "panier") { window.location.href = "/reservation"; return }
                      p === "catalogue" ? goToCatalogue() : navTo(p)
                    }}
                    className={`text-left transition-colors text-lg ${page === p ? "font-bold text-[#C8A97E]" : "text-[#2E2E2E]/70 hover:text-[#C8A97E]"}`}
                    style={DP}
                  >
                    {p === "home"
                      ? "Accueil"
                      : p === "catalogue"
                        ? "Catalogue"
                        : p === "panier"
                          ? "Panier"
                          : p === "favorites"
                            ? "Favoris"
                            : "Contact"}
                  </button>
                ),
              )}
            </div>
            <div className="mt-auto text-sm text-[#2E2E2E]/35 space-y-1">
              <p>papillonrosebertha@gmail.com</p>
              <p className="text-xs italic">Tél. temporairement indisponible</p>
            </div>
          </div>
        </div>
      )}

      <div>
        {/* ─── HOME ─── */}
        {page === "home" && (
          <div>
            {/* Hero */}
            <section className="relative h-screen">
              <video
                src="/videos/hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </section>

            {/* Hero text + Stats */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 mt-6 md:mt-8">
              <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10 bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-lg">
                {/* Title */}
                <div className="flex-shrink-0">
                  <p className="text-[#C8A97E] text-xs tracking-[0.5em] uppercase mb-2 font-medium">
                    LOCATION DÉCORATION ÉVÉNEMENT
                  </p>
                  <h1 style={DP} className="text-[#2E2E2E] text-4xl md:text-6xl font-semibold leading-[1.1]">
                    Papillon
                    <br />
                    <em className="font-normal italic">Rose</em>
                  </h1>
                </div>

                {/* Gold vertical separator (desktop) */}
                <div className="hidden md:block w-px self-stretch bg-[#C8A97E]/40 flex-shrink-0" />

                {/* Stats 2×2 */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1">
                  {[
                    { val: `${getActiveProductsCount()}`, label: "références" },
                    { val: `${CATEGORIES.length - 1}`, label: "catégories" },
                    { val: "Stock", label: "mis à jour" },
                    { val: "Devis", label: "en 24h" },
                  ].map((s) => (
                    <div key={s.val}>
                      <p style={DP} className="text-xl md:text-2xl font-bold text-[#C8A97E]">
                        {s.val}
                      </p>
                      <p className="text-[10px] md:text-xs text-[#2E2E2E]/45 uppercase tracking-wider">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Category showcase */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-12 py-8">
              <div className="flex items-end justify-between mb-0">
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
              <OverflowCarousel
                cards={[
                  {
                    nom: "Mobilier",
                    categorie: "Mobilier",
                    image: "/images/PROD087.png",
                    bgColor: "#E8C4B8",
                    largeImage: true,
                  },
                  {
                    nom: "Figurines & Jeux",
                    categorie: "Figurines & Jeux",
                    image: "/images/PROD098.png",
                    bgColor: "#C9A96E",
                  },
                  {
                    nom: "Bougeoirs & Lustres",
                    categorie: "Bougeoirs & Lustres",
                    image: "/images/PROD095.png",
                    bgColor: "#E8C4B8",
                  },
                  {
                    nom: "Verreries",
                    categorie: "Verreries",
                    image: "/images/PROD088.png",
                    bgColor: "#C9A96E",
                  },
                  {
                    nom: "Cadres",
                    categorie: "Cadres",
                    image: "/images/PROD096.png",
                    bgColor: "#E8C4B8",
                  },
                  {
                    nom: "Présentoirs & Plateaux",
                    categorie: "Présentoirs & Plateaux",
                    image: "/images/PROD097.png",
                    bgColor: "#C9A96E",
                    largeImage: true,
                  },
                  {
                    nom: "Urnes & Accessoires",
                    categorie: "Urnes & Accessoires",
                    image: "/images/PROD093.png",
                    bgColor: "#E8C4B8",
                  },
                  {
                    nom: "Art de la Table",
                    categorie: "Art de la Table",
                    image: "/images/PROD090.png",
                    bgColor: "#C9A96E",
                  },
                  {
                    nom: "Vases & Pots",
                    categorie: "Vases & Pots",
                    image: "/images/PROD091.png",
                    bgColor: "#E8C4B8",
                  },
                  {
                    nom: "Décoration",
                    categorie: "Décoration",
                    image: "/images/PROD092.png",
                    bgColor: "#C9A96E",
                  },
                  {
                    nom: "Fleurs & Feuillages",
                    categorie: "Fleurs & Feuillages",
                    image: "/images/PROD089.png",
                    bgColor: "#E8C4B8",
                    largeImage: true,
                  },
                ]}
                onSelect={(cat) => goToCatalogue(cat)}
              />
            </section>

            {/* Featured products */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-10 md:mt-8">
              <div className="flex items-end justify-between mb-4 md:mb-5">
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

              <div className="mb-5 md:mb-6">
                <CategoryPills active={category} onChange={setCategory} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
                {FEATURED_IDS
                  .map((id) => VISIBLE_PRODUCTS.find((p) => p.id === id))
                  .filter((p): p is Produit => !!p)
                  .filter((p) => category === "Tous" || p.categorie === category)
                  .slice(0, 10)
                  .map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isFav={favorites.has(p.id)}
                      isInCart={cartItems.some((i) => i.productId === p.id)}
                      onFav={() => toggleFav(p.id)}
                      onView={() => { setModalProduct(p); setModalQty(1); setModalVariant(undefined) }}
                      onAddCart={() => addToCartWithToast(p.id)}
                      dynamicStock={dynamicStock}
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

            {/* Comment ça marche ? */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16">
              <div className="text-center mb-10">
                <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                  Simple et rapide
                </p>
                <h2
                  style={DP}
                  className="text-3xl md:text-4xl font-semibold text-[#2E2E2E]"
                >
                  Comment ça marche&nbsp;?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
                {[
                  {
                    step: 1,
                    Icon: Search,
                    title: "Explorez le catalogue",
                    text: `Parcourez nos ${getActiveProductsCount()} références et ajoutez vos coups de cœur à votre sélection.`,
                  },
                  {
                    step: 2,
                    Icon: FileText,
                    title: "Envoyez votre demande",
                    text: "Indiquez vos dates d'événement et soumettez votre demande de devis en quelques clics.",
                  },
                  {
                    step: 3,
                    Icon: Clock,
                    title: "Recevez votre devis sous 24h",
                    text: "Nous vous envoyons un devis personnalisé avec les disponibilités confirmées.",
                  },
                  {
                    step: 4,
                    Icon: Package,
                    title: "Retirez votre matériel",
                    text: "Retraite à Créteil (94) selon le calendrier convenu. Livraison disponible en Île-de-France.",
                  },
                  {
                    step: 5,
                    Icon: RotateCcw,
                    title: "Restituez après votre événement",
                    text: "Retournez le matériel dans les délais convenus. Tout retard est facturé selon le barème indiqué dans votre devis.",
                  },
                ].map(({ step, Icon, title, text }, idx) => (
                  <div key={step} className="relative flex flex-col items-center text-center group">
                    {/* Ligne de connexion (desktop, pas sur le dernier) */}
                    {idx < 4 && (
                      <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-[#C8A97E]/25" />
                    )}
                    {/* Numéro */}
                    <div className="relative z-10 w-14 h-14 rounded-full bg-[#C8A97E]/10 flex items-center justify-center mb-4 group-hover:bg-[#C8A97E]/20 transition-colors">
                      <span
                        style={DP}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8A97E] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                      >
                        {step}
                      </span>
                      <Icon size={22} className="text-[#C8A97E]" />
                    </div>
                    <h3
                      style={DP}
                      className="text-sm font-semibold text-[#2E2E2E] mb-1.5"
                    >
                      {title}
                    </h3>
                    <p className="text-[11px] text-[#2E2E2E]/55 leading-relaxed max-w-[200px]">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Témoignages */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16">
              <div className="text-center mb-10">
                <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                  Ils nous ont fait confiance
                </p>
                <h2
                  style={DP}
                  className="text-3xl md:text-4xl font-semibold text-[#2E2E2E]"
                >
                  Avis de nos clients
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Sophie M.",
                    event: "Mariage",
                    date: "Juin 2025",
                    text: "Un service impeccable du début à la fin. La sélection de mobilier était magnifique et a totalement sublimé notre salle de réception. Merci pour votre réactivité et votre professionnalisme !",
                  },
                  {
                    name: "Camille R.",
                    event: "Baptême",
                    date: "Mars 2025",
                    text: "Les photophores et les urnes étaient à couper le souffle. Nos invités n'arrêtaient pas de faire des compliments. Le retrait et la restitution se sont faits sans aucune problème. Je recommande à 100%.",
                  },
                  {
                    name: "Léa et Thomas D.",
                    event: "Anniversaire",
                    date: "Novembre 2024",
                    text: "Nous avions un budget serré et Papillon Rose a su nous proposer des options élégantes qui correspondaient parfaitement à notre vision. Le devis était prêt en moins de 24h. Bravo !",
                  },
                ].map((review) => (
                  <div
                    key={review.name}
                    className="bg-white rounded-2xl p-6 border border-black/[0.07] shadow-sm flex flex-col"
                  >
                    {/* Étoiles */}
                    <div className="flex gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className="text-[#C8A97E]"
                          fill="#C8A97E"
                        />
                      ))}
                    </div>
                    {/* Texte */}
                    <p className="text-sm text-[#2E2E2E]/70 leading-relaxed italic mb-4 flex-1">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    {/* Auteur */}
                    <div className="border-t border-black/[0.07] pt-3">
                      <p className="text-sm font-semibold text-[#2E2E2E]">
                        {review.name}
                      </p>
                      <p className="text-[11px] text-[#C8A97E]">
                        {review.event} — {review.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <a
                  href="https://www.instagram.com/papillonrose.g"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#C8A97E] font-medium hover:gap-2.5 transition-all"
                >
                  Voir nos réalisations <ArrowRight size={14} />
                </a>
              </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16">
              <div className="relative overflow-hidden rounded-3xl bg-[#2E2E2E] px-10 py-16 text-center">
                <div className="absolute inset-0">
                  <img
                    src={img("/images/PROD005.png")}
                    alt=""
                    aria-hidden
                    loading="lazy"
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

          </div>
        )}

        {/* ─── CATALOGUE ─── */}
        {page === "catalogue" && (
          <div className="max-w-7xl mx-auto px-5 md:px-10 pt-20 md:pt-24 pb-8">
            <Breadcrumb
              category={category !== "Tous" ? category : undefined}
              onNavigate={(p, cat) => {
                if (p === "home") navTo("home")
                else if (cat) goToCatalogue(cat)
                else goToCatalogue()
              }}
            />
            <div className="mb-5 md:mb-7">
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

            <div className="flex gap-3 mb-4 md:mb-5">
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
                    tagFilters.inStockOnly ||
                    tagFilters.themes.length > 0 ||
                    tagFilters.couleurs.length > 0 ||
                    tagFilters.budgetMin > 0 ||
                    tagFilters.dateDebut) && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-gray-400 hover:text-[#C8A97E] transition-colors underline"
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
                onFav={toggleFav}
                onAddCart={(id) => addToCartWithToast(id)}
                onAddQuote={addToQuote}
                onView={(p) => { setModalProduct(p); setModalQty(1); setModalVariant(undefined) }}
              />
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

          </div>
        </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
                {VISIBLE_PRODUCTS.filter((p) => favorites.has(p.id)).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFav
                    isInCart={cartItems.some((i) => i.productId === p.id)}
                    onFav={() => toggleFav(p.id)}
                    onView={() => setModalProduct(p)}
                    onAddCart={() => addToCartWithToast(p.id)}
                    dynamicStock={dynamicStock}
                  />
                ))}
              </div>
            )}
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
              <div className="grid sm:grid-cols-2 gap-12">
                <div>
                  <div className="space-y-7">
                    {[
                      {
                        Icon: Phone,
                        label: "Téléphone",
                        val: "Temporairement indisponible",
                        note: "Contactez-nous par email ou Instagram",
                      },
                      {
                        Icon: Mail,
                        label: "Email",
                        val: "papillonrosebertha@gmail.com",
                      },
                      {
                        Icon: MapPin,
                        label: "Zone",
                        val: "Île-de-France\nCréteil (94)",
                      },
                      {
                        Icon: Send,
                        label: "Telegram",
                        val: "@PapillonRose",
                      },
                      {
                        Icon: InstagramIcon,
                        label: "Instagram",
                        val: "papillonrose.g",
                        link: "https://www.instagram.com/papillonrose.g",
                      },
                    ].map(({ Icon, label, val, link, note }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-[#C8A97E]/12 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Icon size={17} className="text-[#C8A97E]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                            {label}
                          </p>
                          {link ? (
                            <a href={link} target="_blank" rel="noopener noreferrer" className="font-medium text-sm text-[#2E2E2E] hover:text-[#C8A97E] transition-colors">
                              {val}
                            </a>
                          ) : (
                            <p className="font-medium text-sm whitespace-pre-line text-[#2E2E2E]">
                              {val}
                            </p>
                          )}
                          {note && (
                            <p className="text-xs text-gray-400 mt-0.5">{note}</p>
                          )}
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
                        className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                      Date de l&apos;événement
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                      Votre message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Décrivez votre projet, nombre d'invités, lieu…"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] outline-none focus:border-[#C8A97E]/60 transition-colors resize-none shadow-sm"
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
          </div>
        )}
      </div>

      <Footer onNav={navTo} onCatalogue={goToCatalogue} />

      {/* ── Product Modal ── */}
      {modalProduct && (() => {
        const allImages = [modalProduct.image, ...(modalProduct.gallerie || [])]
        return (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModalProduct(null)}
        >
          <div
            className="bg-white w-full md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl rounded-t-3xl md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              <ProductImages
                images={allImages}
                nom={modalProduct.nom}
                onClose={() => setModalProduct(null)}
              />
              <div className="p-7 flex flex-col">
                <Breadcrumb
                  category={modalProduct.categorie}
                  productName={modalProduct.nom}
                  onNavigate={(p, cat) => {
                    setModalProduct(null)
                    if (p === "home") navTo("home")
                    else if (cat) goToCatalogue(cat)
                    else goToCatalogue()
                  }}
                />
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
                    {(() => {
                      const es = getEffectiveStock(modalProduct.id)
                      return (
                        <span
                          className={`font-semibold ${
                            es === 0
                              ? "text-red-400"
                              : es <= 2
                                ? "text-amber-500"
                                : "text-green-500"
                          }`}
                        >
                          {es === 0
                            ? "Indisponible"
                            : `${es} disponible${es > 1 ? "s" : ""}`}
                        </span>
                      )
                    })()}
                  </div>
                </div>

                <div className="mt-auto">
                  {modalVariants && modalVariants.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Taille</p>
                      <div className="flex gap-2">
                        {modalVariants.map((v) => (
                          <button
                            key={v.label}
                            onClick={() => setModalVariant(v.label)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              modalVariant === v.label
                                ? "bg-[#C8A97E] text-white shadow-sm"
                                : "bg-[#F0EBE3] text-[#2E2E2E]/60 hover:bg-[#C8A97E]/20"
                            }`}
                          >
                            {v.label} — {formatPrix(v.prix)} €/jour
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {(() => {
                    const dayPrix = parsePrix(
                      modalVariants && modalVariants.length > 0
                        ? modalVariant
                          ? modalVariants.find((v) => v.label === modalVariant)?.prix ?? modalProduct.prix
                          : getStartingPrix(modalProduct)
                        : modalProduct.prix
                    )
                    const effectiveEnd = modalDateEnd || modalDateStart
                    const hasDate = !!modalDateStart
                    const days = hasDate
                      ? Math.max(1, Math.ceil((new Date(effectiveEnd).getTime() - new Date(modalDateStart).getTime()) / (1000 * 60 * 60 * 24)))
                      : 0
                    const total = hasDate ? dayPrix * days * modalQty : 0
                    return (
                      <p style={DP} className="text-3xl font-bold text-[#2E2E2E] mb-1">
                        {hasDate
                          ? <>{formatPrix(total)} €</>
                          : <>
                              <span className="text-[10px] font-normal text-gray-400 mr-0.5">à partir de</span>
                              {formatPrix(dayPrix)} €
                            </>
                        }
                        <span className="text-sm font-normal text-gray-400 ml-1">
                          {hasDate ? `total · ${days} jour${days > 1 ? "s" : ""} × ${modalQty}` : "/ jour"}
                        </span>
                      </p>
                    )
                  })()}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500">Quantité</span>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const cartQty = cartItems.filter((i) => i.productId === modalProduct.id).reduce((s, i) => s + i.qty, 0)
                        const effectiveStock = Math.max(0, getEffectiveStock(modalProduct.id) - cartQty)
                        return (
                          <>
                            <button
                              onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                              className="w-8 h-8 rounded-full bg-[#F0EBE3] flex items-center justify-center hover:bg-[#C8A97E]/20 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-6 text-center">{modalQty}</span>
                            <button
                              onClick={() => setModalQty((q) => Math.min(effectiveStock, q + 1))}
                              disabled={modalQty >= effectiveStock}
                              className="w-8 h-8 rounded-full bg-[#F0EBE3] flex items-center justify-center hover:bg-[#C8A97E]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                            </button>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Début</label>
                      <input
                        type="date"
                        value={modalDateStart}
                        onChange={(e) => { setModalDateStart(e.target.value); setModalDateEnd("") }}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#C8A97E]"
                        style={{ WebkitTextFillColor: "#1a1a1a" } as React.CSSProperties}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Fin</label>
                      <input
                        type="date"
                        value={modalDateEnd}
                        min={modalDateStart || undefined}
                        onChange={(e) => setModalDateEnd(e.target.value)}
                        disabled={!modalDateStart}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#C8A97E] disabled:opacity-40"
                        style={{ WebkitTextFillColor: "#1a1a1a" } as React.CSSProperties}
                      />
                    </div>
                  </div>
                  {(() => {
                    const cartQty = cartItems.filter((i) => i.productId === modalProduct.id).reduce((s, i) => s + i.qty, 0)
                    const effectiveStock = Math.max(0, getEffectiveStock(modalProduct.id) - cartQty)
                    return effectiveStock > 0 ? (
                      <p className={`text-xs mb-4 ${effectiveStock <= 2 ? "text-amber-500 font-medium" : "text-green-500"}`}>
                        Plus que {effectiveStock} disponible{effectiveStock > 1 ? "s" : ""}
                      </p>
                    ) : null
                  })()}
                  <div className="flex flex-col gap-2">
                    <button
            onClick={() => {
              const added = addToCartWithToast(modalProduct.id, modalQty, modalVariant)
              if (added) {
                setModalProduct(null)
                setModalQty(1)
                setModalVariant(undefined)
              }
            }}
                      disabled={(() => { const cartQty = cartItems.filter((i) => i.productId === modalProduct.id).reduce((s, i) => s + i.qty, 0); return getEffectiveStock(modalProduct.id) - cartQty <= 0 || (modalVariants && modalVariants.length > 0 && !modalVariant) })()}
                      className="w-full bg-[#C8A97E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {modalVariants && modalVariants.length > 0 && !modalVariant
                        ? "Sélectionnez une taille"
                        : (() => {
                            if (!modalDateStart) return "Ajouter au panier"
                            const effectiveEnd = modalDateEnd || modalDateStart
                            const dayPrix = parsePrix(
                              modalVariants && modalVariants.length > 0
                                ? modalVariant
                                  ? modalVariants.find((v) => v.label === modalVariant)?.prix ?? modalProduct.prix
                                  : getStartingPrix(modalProduct)
                                : modalProduct.prix
                            )
                            const days = Math.max(1, Math.ceil((new Date(effectiveEnd).getTime() - new Date(modalDateStart).getTime()) / (1000 * 60 * 60 * 24)))
                            return `Ajouter au panier · ${formatPrix(dayPrix * days * modalQty)} €`
                          })()}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center -mt-1">
                      Sélectionnez 2 dates dans le panier pour valider la disponibilité
                    </p>
                    <button
                      onClick={() => {
                        addToQuote(modalProduct)
                        setModalProduct(null)
                        setModalQty(1)
                        setModalVariant(undefined)
                      }}
                      disabled={(() => { const cartQty = cartItems.filter((i) => i.productId === modalProduct.id).reduce((s, i) => s + i.qty, 0); return getEffectiveStock(modalProduct.id) - cartQty <= 0 })()}
                      className="w-full bg-[#F0EBE3] text-[#2E2E2E]/60 py-3.5 rounded-2xl text-sm font-medium hover:bg-[#E8E0D5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
      )
      })()}

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
                            onClick={() => { if (qty < getEffectiveStock(p.id)) updateQty(p.id, 1) }}
                            disabled={qty >= getEffectiveStock(p.id)}
                            aria-label="Augmenter"
                            className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-[#C8A97E] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={11} />
                          </button>
                          {qty >= getEffectiveStock(p.id) && getEffectiveStock(p.id) > 0 && (
                            <span className="text-[9px] text-amber-500 font-medium">Stock max</span>
                          )}
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

      {cartToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#2E2E2E] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-[fade-in-up_0.3s_ease-out]">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm font-medium">{cartToast} ajouté au panier</span>
        </div>
      )}

      <Chatbot />
      <WhatsAppButton />
    </div>
  )
}
