"use client"

import { useFavorites } from "@/components/favorites-context"
import { Heart } from "lucide-react"

export default function FavoriteButton({ productId }: { productId: number }) {
  const { favorites, toggleFavorite } = useFavorites()
  const isFavorite = favorites.has(productId)

  return (
    <button
      onClick={() => toggleFavorite(productId)}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors border ${
        isFavorite
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500" : ""}`} />
      {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    </button>
  )
}
