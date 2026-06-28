"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { CartItem } from "@/lib/types"

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateItem: (productId: number, updates: Partial<CartItem>) => void
  removeItem: (productId: number) => void
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

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.productId === item.productId)
      if (ex) return prev.map((i) => (i.productId === item.productId ? item : i))
      return [...prev, item]
    })
  }, [])

  const updateItem = useCallback((productId: number, updates: Partial<CartItem>) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, ...updates } : i)))
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
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
