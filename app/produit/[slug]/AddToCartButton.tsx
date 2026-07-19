"use client"

import { useState } from "react"
import { useCart } from "@/components/cart-context"
import { ShoppingCart, Check } from "lucide-react"

export default function AddToCartButton({
  productId,
  stock,
  productName,
}: {
  productId: number
  stock: number
  productName: string
}) {
  const { addItem } = useCart()
  const [showToast, setShowToast] = useState(false)
  const disabled = stock <= 0

  const handleClick = () => {
    if (disabled) return
    const added = addItem({ productId, qty: 1, dateStart: "", dateEnd: "" })
    if (added) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        className="flex items-center justify-center gap-2 bg-[#C9948E] text-[#1C1A17] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#D4A09A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="w-4 h-4" />
        {disabled ? "Indisponible" : "Ajouter au panier"}
      </button>

      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-white dark:bg-neutral-800 border border-[#C9948E]/30 px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2.5 animate-[fade-in-up_0.3s_ease-out]"
        >
          <span className="w-6 h-6 rounded-full bg-[#C9948E]/15 flex items-center justify-center flex-shrink-0">
            <Check size={14} className="text-[#C9948E]" />
          </span>
          <span className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">
            {productName} ajouté au panier ✓
          </span>
        </div>
      )}
    </>
  )
}
