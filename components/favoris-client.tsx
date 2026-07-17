"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { useFavorites } from "@/components/favorites-context"
import { useCart } from "@/components/cart-context"
import { produits, hasRealPhoto } from "@/data/produits"
import { getProductSlug } from "@/lib/product-helpers"
import { formatPrix } from "@/lib/utils"
import ProductImage from "@/components/product-image"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path

const STATIC_VISIBLE = produits.filter((p) => hasRealPhoto(p) && p.actif !== false)

export default function FavorisClient() {
  const { favorites, toggleFavorite } = useFavorites()
  const { items: cartItems, addItem } = useCart()
  const [maskedIds, setMaskedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch("/api/catalogue-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.maskedIds) setMaskedIds(new Set(data.maskedIds))
      })
      .catch(() => {})
  }, [])

  const VISIBLE_PRODUCTS = STATIC_VISIBLE.filter((p) => !maskedIds.has(p.id))
  const favProducts = VISIBLE_PRODUCTS.filter((p) => favorites.has(p.id))

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 pt-24 pb-8 min-h-[60vh]">
      <div className="mb-8">
        <p className="text-[#C8A97E] dark:text-amber-400 text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
          Mes préférences
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] dark:text-neutral-100">
          Favoris
        </h1>
      </div>

      {favProducts.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-[#C8A97E]/10 dark:bg-amber-600/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Heart size={32} className="text-[#C8A97E]/40" />
          </div>
          <p className="text-gray-400 dark:text-neutral-500 text-base mb-6">
            Vous n&apos;avez pas encore de favoris.
          </p>
          <Link
            href="/catalogue"
            className="inline-block bg-[#C8A97E] dark:bg-amber-600 text-white px-10 py-3.5 rounded-full text-sm font-medium hover:bg-[#B8926E] dark:hover:bg-amber-700 transition-colors"
          >
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
          {favProducts.map((p) => {
            const slug = getProductSlug(p)
            const isInCart = cartItems.some((i) => i.productId === p.id)
            const getSrc = () => {
              if (p.image && !p.image.includes("placeholder")) return p.image
              if (p.gallerie && p.gallerie.length > 0) return p.gallerie[0]
              return "/placeholder.svg"
            }
            return (
              <div
                key={p.id}
                className="group relative bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                <Link
                  href={`/produit/${slug}`}
                  className="relative overflow-hidden aspect-square bg-[#F8F5F0] dark:bg-neutral-900 block"
                >
                  <ProductImage
                    src={img(getSrc())}
                    alt={p.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {p.stock === 1 && (
                    <span className="absolute top-2.5 left-2.5 bg-amber-400 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide z-10">
                      Unique
                    </span>
                  )}
                </Link>
                <div className="p-3.5 flex flex-col flex-1">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-[#C8A97E] dark:text-amber-400 uppercase tracking-wider truncate">
                      {p.categorie}
                    </p>
                    <h3 className="text-[13px] font-semibold text-[#2E2E2E] dark:text-neutral-100 leading-snug truncate">
                      {p.nom}
                    </h3>
                    <p className="text-lg font-bold text-[#2E2E2E] dark:text-neutral-100 mt-0.5">
                      {formatPrix(p.prix)}€
                      <span className="text-xs font-normal text-gray-400 dark:text-neutral-500 ml-0.5">/jour</span>
                    </p>
                  </div>
                  <div className="mt-auto pt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => addItem({ productId: p.id, qty: 1, dateStart: "", dateEnd: "" })}
                      disabled={isInCart}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                        isInCart
                          ? "bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 cursor-not-allowed"
                          : "bg-[#C8A97E] dark:bg-amber-600 text-white hover:bg-[#B8926E] dark:hover:bg-amber-700"
                      }`}
                    >
                      <ShoppingBag size={13} />
                      <span className="hidden sm:inline">{isInCart ? "Déjà dans le panier" : "Ajouter"}</span>
                    </button>
                    <button
                      onClick={() => toggleFavorite(p.id)}
                      aria-label="Retirer des favoris"
                      className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                      <Heart size={14} fill="#C8A97E" className="text-[#C8A97E]" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
