"use client"

import { useState } from "react"
import { useCart } from "@/components/cart-context"
import { prixTtc } from "@/lib/pricing"
import { isNouveauProduit } from "@/lib/utils"
import type { ProductVariant } from "@/lib/types"
import { ShoppingCart, Check } from "lucide-react"
import FavoriteButton from "./FavoriteButton"

interface Props {
  product: {
    id: number
    nom: string
    categorie: string
    stock: number
    dimension?: string
    prix: number | string
    image: string
    badge?: string
    dateAjout?: string
    variants?: ProductVariant[]
  }
  isBlocked: boolean
}

export default function ProductInfo({ product, isBlocked }: Props) {
  const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>([])
  const { addItem } = useCart()
  const [showToast, setShowToast] = useState(false)

  const hasVariants = !!(product.variants && product.variants.length > 0)
  const disabled = product.stock <= 0 || product.badge === "epuise" || isBlocked || (hasVariants && selectedVariants.length === 0)

  const COLOR_WORDS = ["bleu", "jaune", "rose", "rouge", "vert", "noir", "blanc", "or", "argent", "bronze", "bordeaux", "beige", "gris", "marine", "corail", "lavande", "saumon", "taupe", "ecru", "ocre"]
  const isColor = hasVariants && product.variants!.some((v) => COLOR_WORDS.some((c) => v.label.toLowerCase().includes(c)))
  const variantLabel = isColor ? "Couleurs" : "Tailles"

  const toggleVariant = (v: ProductVariant) => {
    setSelectedVariants((prev) =>
      prev.some((s) => s.label === v.label)
        ? prev.filter((s) => s.label !== v.label)
        : [...prev, v]
    )
  }

  const totalTtc = selectedVariants.reduce((sum, v) => sum + Number(prixTtc(v.prix)), 0)

  const handleAddAll = () => {
    if (disabled) return
    const variantsToAdd = hasVariants ? selectedVariants : [null]
    let added = false
    for (const v of variantsToAdd) {
      const ok = addItem({
        productId: product.id,
        qty: 1,
        dateStart: "",
        dateEnd: "",
        variantLabel: v?.label,
        prix: v?.prix,
      })
      if (ok) added = true
    }
    if (added) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <div className="lg:w-[400px] flex flex-col">
      <p className="text-[#c27a72] dark:text-[#d4968e] text-xs tracking-[0.3em] uppercase font-medium mb-2">
        {product.categorie}
      </p>
      <h1 className="text-2xl md:text-3xl font-semibold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
        {product.nom}
      </h1>

      {product.dimension && (
        <p className="text-sm text-secondary-text dark:text-white/70 mt-2">
          {product.dimension}
        </p>
      )}

      {/* Multi-variant selector */}
      {hasVariants && (
        <div className="mt-4">
          <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-2">
            {variantLabel} : <span className="text-secondary-text dark:text-white/50 font-normal">(sélection multiple)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants!.map((v) => {
              const selected = selectedVariants.some((s) => s.label === v.label)
              return (
                <button
                  key={v.label}
                  onClick={() => toggleVariant(v)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selected
                      ? "border-[#c27a72] bg-[#c27a72]/10 text-[#c27a72]"
                      : "border-gray-200 dark:border-neutral-700 text-secondary-text dark:text-white/70 hover:border-[#c27a72]/50"
                  }`}
                >
                  {selected && <Check size={14} className="inline mr-1 -mt-0.5" />}
                  {v.label} — {prixTtc(v.prix).toFixed(2)} € TTC
                </button>
              )
            })}
          </div>
          {selectedVariants.length > 0 && (
            <p className="text-sm font-semibold text-[#c27a72] dark:text-[#d4968e] mt-2">
              Total : {totalTtc.toFixed(2)} € TTC / jour ({selectedVariants.length} {variantLabel.toLowerCase().replace(/s$/, "")}{selectedVariants.length > 1 ? "s" : ""})
            </p>
          )}
        </div>
      )}

      {/* Single price display (no variants) */}
      {!hasVariants && (
        <p className="text-2xl font-bold text-[#2E2E2E] dark:text-neutral-100 mt-4">
          {prixTtc(product.prix).toFixed(2)} €
          <span className="text-sm font-normal text-secondary-text dark:text-white/60 ml-1">TTC / jour</span>
        </p>
      )}

      {/* Stock */}
      <div className="mt-4 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${product.stock > 0 && !isBlocked ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm text-secondary-text dark:text-white/70">
          {isBlocked ? "Indisponible (réservé)" : product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
        </span>
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        {isNouveauProduit(product.dateAjout) && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">
            Nouveau
          </span>
        )}
        {product.badge && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            product.badge === "stock-limite" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
          }`}>
            {product.badge === "stock-limite" ? "Stock limité" : "Épuisé"}
          </span>
        )}
      </div>

      {/* Add to cart */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={handleAddAll}
          disabled={disabled}
          className="flex items-center justify-center gap-2 bg-[#c27a72] text-[#1C1A17] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#c27a72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          {hasVariants && selectedVariants.length === 0
            ? `Choisissez une ou plusieurs ${variantLabel.toLowerCase()}`
            : hasVariants
              ? `Ajouter ${selectedVariants.length} ${variantLabel.toLowerCase().replace(/s$/, "")}${selectedVariants.length > 1 ? "s" : ""} au panier`
              : disabled ? "Indisponible" : "Ajouter au panier"}
        </button>
        <FavoriteButton productId={product.id} />
      </div>

      {/* Toast */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-white dark:bg-neutral-800 border border-[#c27a72]/30 px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2.5 animate-[fade-in-up_0.3s_ease-out]"
        >
          <span className="w-6 h-6 rounded-full bg-[#c27a72]/15 flex items-center justify-center flex-shrink-0">
            <Check size={14} className="text-[#c27a72]" />
          </span>
          <span className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">
            {selectedVariants.length} {variantLabel.toLowerCase().replace(/s$/, "")}{selectedVariants.length > 1 ? "s" : ""} ajoutée{selectedVariants.length > 1 ? "s" : ""} au panier ✓
          </span>
        </div>
      )}

      {/* Description */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
        <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">Détails</h2>
        <ul className="text-sm text-secondary-text dark:text-white/70 space-y-1.5">
          <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Catégorie :</span> {product.categorie}</li>
          {product.dimension && <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Dimensions :</span> {product.dimension}</li>}
          <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Tarif :</span> {hasVariants ? "à partir de" : ""} {prixTtc(hasVariants ? product.variants![0].prix : product.prix).toFixed(2)} € TTC / jour</li>
          <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Disponibilité :</span> {isBlocked ? "Indisponible (réservé)" : product.stock > 0 ? "Disponible" : "Indisponible"}</li>
        </ul>
      </div>
    </div>
  )
}
