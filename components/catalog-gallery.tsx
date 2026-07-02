"use client"

import { useState } from "react"
import type { Produit } from "@/data/produits"
import type { CartItem } from "@/lib/types"
import GalleryLightbox from "./gallery-lightbox"
import { Heart, ShoppingBag } from "lucide-react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path

interface GalleryProps {
  produits: Produit[]
  favorites: Set<number>
  cartItems: CartItem[]
  onFav: (id: number) => void
  onAddCart: (id: number) => void
  onAddQuote: (p: Produit) => void
  onView?: (p: Produit) => void
}

export default function CatalogGallery({ produits, favorites, cartItems, onFav, onAddCart, onAddQuote, onView }: GalleryProps) {
  const [lightbox, setLightbox] = useState<{ product: Produit; index: number } | null>(null)

  const getSrc = (p: Produit) => {
    if (p.image && p.image !== "/placeholder.png") return p.image
    if (p.gallerie && p.gallerie.length > 0) return p.gallerie[0]
    return "/placeholder.svg"
  }

  const isInCart = (id: number) => cartItems.some((i) => i.productId === id)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
        {produits.map((p) => {
          const inCart = isInCart(p.id)
          return (
            <div
              key={p.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
            >
              <div
                className="relative overflow-hidden cursor-pointer aspect-square bg-[#F8F5F0]"
                onClick={() => onView ? onView(p) : setLightbox({ product: p, index: 0 })}
              >
                <img
                  src={img(getSrc(p))}
                  alt={p.nom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {p.stock === 1 && (
                  <span className="absolute top-2.5 left-2.5 bg-amber-400 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide z-10">
                    Unique
                  </span>
                )}
              </div>

              <div className="p-3.5 flex flex-col flex-1">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-[#C8A97E] uppercase tracking-wider truncate">
                    {p.categorie}
                  </p>
                  <h3 className="text-[13px] font-semibold text-[#2E2E2E] leading-snug truncate">
                    {p.nom}
                  </h3>
                  {p.dimension && (
                    <p className="text-[10px] text-gray-400 truncate">{p.dimension}</p>
                  )}
                  <p className="text-lg font-bold text-[#2E2E2E] mt-0.5">
                    {typeof p.prix === "number" ? `${p.prix} €` : `${p.prix} €`}
                    <span className="text-xs font-normal text-gray-400 ml-0.5">/jour</span>
                  </p>
                </div>

                <div className="mt-auto pt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => onAddCart(p.id)}
                    disabled={inCart}
                    aria-label={inCart ? "Déjà dans le panier" : "Ajouter au panier"}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                      inCart
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#C8A97E] text-white hover:bg-[#B8926E]"
                    }`}
                  >
                    <ShoppingBag size={13} />
                    <span className="hidden sm:inline">{inCart ? "Déjà dans le panier" : "Ajouter au panier"}</span>
                    <span className="sm:hidden">{inCart ? "Ajouté" : "Ajouter"}</span>
                  </button>
                  <button
                    onClick={() => onFav(p.id)}
                    aria-label="Favoris"
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-sm flex-shrink-0 ${
                      favorites.has(p.id)
                        ? "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                        : "border-gray-200 text-gray-300 hover:text-[#C8A97E] hover:border-[#C8A97E]/30"
                    }`}
                  >
                    <Heart size={14} fill={favorites.has(p.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {lightbox && (
        <GalleryLightbox
          images={[
            { src: getSrc(lightbox.product), alt: lightbox.product.nom },
            ...(lightbox.product.gallerie || []).map((g) => ({ src: g, alt: lightbox.product.nom })),
          ]}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
