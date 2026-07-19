"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { CartItem } from "@/lib/types"
import { produits } from "@/data/produits"

function matchItem(i: CartItem, productId: number, variantLabel?: string) {
  return i.productId === productId && (variantLabel === undefined || i.variantLabel === variantLabel)
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => boolean
  updateItem: (productId: number, updates: Partial<CartItem>, variantLabel?: string) => void
  removeItem: (productId: number, variantLabel?: string) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = "papillon-cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: CartItem): boolean => {
    const product = produits.find((p) => p.id === item.productId)
    if (!product) return false

    const ex = items.find((i) => matchItem(i, item.productId, item.variantLabel))
    const currentQty = ex ? ex.qty : 0
    if (currentQty + item.qty > product.stock) return false

    setItems((prev) => {
      const existing = prev.find((i) => matchItem(i, item.productId, item.variantLabel))
      if (existing) return prev.map((i) => matchItem(i, item.productId, item.variantLabel) ? item : i)
      return [...prev, item]
    })
    return true
  }, [items])

  const updateItem = useCallback((productId: number, updates: Partial<CartItem>, variantLabel?: string) => {
    setItems((prev) => prev.map((i) => matchItem(i, productId, variantLabel) ? { ...i, ...updates } : i))
  }, [])

  const removeItem = useCallback((productId: number, variantLabel?: string) => {
    setItems((prev) => prev.filter((i) => !matchItem(i, productId, variantLabel)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateItem, removeItem, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
