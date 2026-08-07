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
                ? "border-[#c27a72] bg-[#c27a72]/10 text-[#c27a72]"
                : "border-gray-200 dark:border-neutral-700 text-secondary-text dark:text-white/70 hover:border-[#c27a72]/50"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="text-2xl font-bold text-[#2E2E2E] dark:text-neutral-100 mt-3">
        {displayPrix.toFixed(2)} €
        <span className="text-sm font-normal text-secondary-text dark:text-white/60 ml-1">TTC / jour</span>
      </p>
    </div>
  )
}
