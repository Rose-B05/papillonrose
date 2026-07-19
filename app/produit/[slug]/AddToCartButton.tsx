"use client"

import { useCart } from "@/components/cart-context"
import { ShoppingCart } from "lucide-react"

export default function AddToCartButton({ productId, stock }: { productId: number; stock: number }) {
  const { addItem } = useCart()
  const disabled = stock <= 0

  return (
    <button
      onClick={() => !disabled && addItem({ productId, qty: 1, dateStart: "", dateEnd: "" })}
      disabled={disabled}
      className="flex items-center justify-center gap-2 bg-[#C9948E] text-[#1C1A17] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#D4A09A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingCart className="w-4 h-4" />
      {disabled ? "Indisponible" : "Ajouter au panier"}
    </button>
  )
}
