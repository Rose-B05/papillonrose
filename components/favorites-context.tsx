"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

interface FavoritesContextType {
  favorites: Set<number>
  toggleFavorite: (productId: number) => void
  isFavorite: (productId: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

const STORAGE_KEY = "papillon-favorites"

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as number[]
        setFavorites(new Set(parsed))
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)))
    } catch {}
  }, [favorites])

  const toggleFavorite = useCallback((productId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }, [])

  const isFavorite = useCallback((productId: number) => {
    return favorites.has(productId)
  }, [favorites])

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider")
  return ctx
}
