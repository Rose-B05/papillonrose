"use client"

import { useState } from "react"
import { prixTtc } from "@/lib/pricing"
import { isNouveauProduit } from "@/lib/utils"
import type { ProductVariant } from "@/lib/types"
import AddToCartButton from "./AddToCartButton"
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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  const currentPrix = selectedVariant ? selectedVariant.prix : product.prix
  const priceTTC = prixTtc(currentPrix)

  return (
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

      {/* Variant selector */}
      {product.variants && product.variants.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-2">
            Taille :
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.label}
                onClick={() => setSelectedVariant(v)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedVariant?.label === v.label
                    ? "border-[#C9948E] bg-[#C9948E]/10 text-[#C9948E]"
                    : "border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-white/70 hover:border-[#C9948E]/50"
                }`}
              >
                {v.label} — {prixTtc(v.prix).toFixed(2)} € TTC
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-2xl font-bold text-[#2E2E2E] dark:text-neutral-100 mt-4">
        {priceTTC.toFixed(2)} €
        <span className="text-sm font-normal text-gray-400 dark:text-white/60 ml-1">TTC / jour</span>
      </p>

      {/* Stock */}
      <div className="mt-4 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${product.stock > 0 && !isBlocked ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm text-gray-500 dark:text-white/70">
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

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        <AddToCartButton
          productId={product.id}
          stock={product.stock}
          badge={product.badge}
          productName={product.nom}
          isBlocked={isBlocked}
          variantLabel={selectedVariant?.label}
          variantPrix={selectedVariant?.prix}
          needsVariant={!!(product.variants && product.variants.length > 0 && !selectedVariant)}
        />
        <FavoriteButton productId={product.id} />
      </div>

      {/* Description */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
        <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">Détails</h2>
        <ul className="text-sm text-gray-500 dark:text-white/70 space-y-1.5">
          <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Catégorie :</span> {product.categorie}</li>
          {product.dimension && <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Dimensions :</span> {product.dimension}</li>}
          <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Tarif :</span> {priceTTC.toFixed(2)} € TTC / jour</li>
          <li><span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Disponibilité :</span> {isBlocked ? "Indisponible (réservé)" : product.stock > 0 ? "Disponible" : "Indisponible"}</li>
        </ul>
      </div>
    </div>
  )
}
