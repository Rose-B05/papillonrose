"use client"

import { useState } from "react"
import type { Produit } from "@/data/produits"
import { SCENE_IMAGES, FEATURED_IDS } from "@/lib/scenes"
import GalleryLightbox from "./gallery-lightbox"
import BeforeAfterSlider from "./before-after"
import { Heart, ShoppingBag, Plus } from "lucide-react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path
const PLACEHOLDER = img("/placeholder.svg")

interface GalleryProps {
  produits: Produit[]
  favorites: Set<number>
  onFav: (id: number) => void
  onAddCart: (id: number) => void
  onAddQuote: (p: Produit) => void
}

export default function CatalogGallery({ produits, favorites, onFav, onAddCart, onAddQuote }: GalleryProps) {
  const [lightbox, setLightbox] = useState<{ product: Produit; index: number } | null>(null)

  const getImages = (p: Produit) => {
    const imgs: { src: string; alt: string }[] = []
    if (p.image && p.image !== "/placeholder.png") imgs.push({ src: p.image, alt: p.nom })
    if (p.gallerie) p.gallerie.forEach((g) => imgs.push({ src: g, alt: p.nom }))
    const scene = SCENE_IMAGES[p.id]
    if (scene) imgs.push({ src: scene, alt: `${p.nom} â€” mise en scÃ¨ne` })
    if (imgs.length === 0) imgs.push({ src: "/placeholder.svg", alt: p.nom })
    return imgs
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-auto">
        {produits.map((p, i) => {
          const isFeatured = FEATURED_IDS.includes(p.id)
          const scene = SCENE_IMAGES[p.id]
          const images = getImages(p)
          const hasScene = !!scene

          return (
            <div
              key={p.id}
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ${
                isFeatured ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              {/* Main click area â€” opens lightbox */}
              <div
                className="relative overflow-hidden cursor-pointer"
                style={{ aspectRatio: isFeatured ? "4/3" : "1/1" }}
                onClick={() => setLightbox({ product: p, index: 0 })}
              >
                <div className="absolute inset-0">
                  {hasScene && p.image !== "/placeholder.png" ? (
                    <BeforeAfterSlider
                      before={p.image}
                      after={scene!}
                      alt={p.nom}
                    />
                  ) : (
                    <img
                      src={img(p.image !== "/placeholder.png" ? p.image : "/placeholder.svg")}
                      alt={p.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badge */}
                {(p.badge === "stock-limite" || (p.stock <= 2 && p.stock > 0)) && (
                  <span className="absolute top-2.5 left-2.5 bg-amber-400 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide z-10">
                    {p.stock > 0 ? `DerniÃ¨re${p.stock > 1 ? "s" : ""}` : "Stock limitÃ©"}
                  </span>
                )}

                {/* Image count */}
                {images.length > 1 && (
                  <div className="absolute bottom-2.5 left-2.5 bg-black/50 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full z-10">
                    {images.length} photos
                  </div>
                )}
              </div>

              {/* Info bar */}
              <div className="p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-[#C8A97E] uppercase tracking-wider truncate">
                    {p.categorie}
                  </p>
                  <h3 className="text-[13px] font-semibold text-[#2E2E2E] leading-snug truncate">
                    {p.nom}
                  </h3>
                  {p.dimension && (
                    <p className="text-[10px] text-gray-400 truncate">{p.dimension}</p>
                  )}
                  <p className="text-sm font-bold text-[#2E2E2E] mt-0.5">
                    {typeof p.prix === "number" ? `${p.prix} â‚¬` : `${p.prix} â‚¬`}
                    <span className="text-[10px] font-normal text-gray-400 ml-0.5">/jour</span>
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onAddCart(p.id)}
                    aria-label="Ajouter au panier"
                    className="w-8 h-8 rounded-full bg-white border border-[#C8A97E]/30 text-[#C8A97E] flex items-center justify-center hover:bg-[#C8A97E] hover:text-white transition-all shadow-sm"
                  >
                    <ShoppingBag size={13} />
                  </button>
                  <button
                    onClick={() => onAddQuote(p)}
                    aria-label="Ajouter au devis"
                    className="w-8 h-8 rounded-full bg-[#C8A97E] text-white flex items-center justify-center hover:bg-[#B8926E] transition-all shadow-sm"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    onClick={() => onFav(p.id)}
                    aria-label="Favoris"
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-sm ${
                      favorites.has(p.id)
                        ? "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                        : "border-gray-200 text-gray-300 hover:text-[#C8A97E] hover:border-[#C8A97E]/30"
                    }`}
                  >
                    <Heart size={12} fill={favorites.has(p.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <GalleryLightbox
          images={getImages(lightbox.product)}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}

