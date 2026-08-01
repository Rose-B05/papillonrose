"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import type { CartItem } from "@/lib/types"
import { produits } from "@/data/produits"

function matchItem(i: CartItem, productId: number, variantLabel?: string) {
  return i.productId === productId && (variantLabel === undefined || i.variantLabel === variantLabel)
}

function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start)
  const endDate = new Date(end)
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function getOrCreateSessionId(): string {
  try {
    let sid = localStorage.getItem("cart-session-id")
    if (!sid) {
      sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      localStorage.setItem("cart-session-id", sid)
    }
    return sid
  } catch {
    return "fallback-" + Math.random().toString(36).slice(2, 10)
  }
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
  const sessionIdRef = useRef<string>("")

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId()
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const blockOnServer = useCallback((item: CartItem, qty: number) => {
    if (!item.dateStart || !item.dateEnd) return
    const sid = sessionIdRef.current
    if (!sid) return
    const dates = getDatesBetween(item.dateStart, item.dateEnd)
    if (dates.length === 0) return
    fetch("/api/cart-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: item.productId, dates, qty, sessionId: sid }),
    }).catch(() => {})
  }, [])

  const unblockOnServer = useCallback((item: CartItem) => {
    if (!item.dateStart || !item.dateEnd) return
    const sid = sessionIdRef.current
    if (!sid) return
    const dates = getDatesBetween(item.dateStart, item.dateEnd)
    if (dates.length === 0) return
    fetch("/api/cart-blocks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: item.productId, dates, sessionId: sid }),
    }).catch(() => {})
  }, [])

  const unblockAllOnServer = useCallback(() => {
    const sid = sessionIdRef.current
    if (!sid) return
    fetch("/api/cart-blocks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid }),
    }).catch(() => {})
  }, [])

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

    blockOnServer(item, item.qty)
    return true
  }, [items, blockOnServer])

  const updateItem = useCallback((productId: number, updates: Partial<CartItem>, variantLabel?: string) => {
    setItems((prev) => {
      const old = prev.find((i) => matchItem(i, productId, variantLabel))
      const updated = prev.map((i) => matchItem(i, productId, variantLabel) ? { ...i, ...updates } : i)
      const newItem = updated.find((i) => matchItem(i, productId, variantLabel))
      if (old && newItem && old.qty !== newItem.qty && newItem.dateStart && newItem.dateEnd) {
        blockOnServer(newItem, newItem.qty)
      }
      return updated
    })
  }, [blockOnServer])

  const removeItem = useCallback((productId: number, variantLabel?: string) => {
    setItems((prev) => {
      const item = prev.find((i) => matchItem(i, productId, variantLabel))
      if (item) unblockOnServer(item)
      return prev.filter((i) => !matchItem(i, productId, variantLabel))
    })
  }, [unblockOnServer])

  const clearCart = useCallback(() => {
    unblockAllOnServer()
    setItems([])
  }, [unblockAllOnServer])

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
