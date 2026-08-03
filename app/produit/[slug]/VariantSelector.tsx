"use client"

import { useState } from "react"
import { prixTtc } from "@/lib/pricing"
import type { ProductVariant } from "@/lib/types"

interface Props {
  variants: ProductVariant[]
  defaultPrix: number | string
  onSelect: (variant: ProductVariant) => void
}

export default function VariantSelector({ variants, defaultPrix, onSelect }: Props) {
  const [selected, setSelected] = useState<ProductVariant | null>(null)

  const handleSelect = (v: ProductVariant) => {
    setSelected(v)
    onSelect(v)
  }

  const displayPrix = selected ? prixTtc(selected.prix) : prixTtc(defaultPrix)

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-2">
        Taille :
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.label}
            onClick={() => handleSelect(v)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              selected?.label === v.label
                ? "border-[#C9948E] bg-[#C9948E]/10 text-[#C9948E]"
                : "border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-white/70 hover:border-[#C9948E]/50"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="text-2xl font-bold text-[#2E2E2E] dark:text-neutral-100 mt-3">
        {displayPrix.toFixed(2)} €
        <span className="text-sm font-normal text-gray-400 dark:text-white/60 ml-1">TTC / jour</span>
      </p>
    </div>
  )
}
