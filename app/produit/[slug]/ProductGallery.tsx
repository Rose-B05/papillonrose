"use client"

import { useState, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProductImage from "@/components/product-image"

interface Props {
  images: { src: string; alt: string }[]
}

export default function ProductGallery({ images }: Props) {
  const [idx, setIdx] = useState(0)
  const touchX = useRef(0)
  const hasMultiple = images.length > 1

  const goTo = useCallback(
    (i: number) => setIdx(((i % images.length) + images.length) % images.length),
    [images.length],
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) goTo(idx + (diff > 0 ? 1 : -1))
  }

  if (!hasMultiple) {
    return (
      <div className="relative aspect-square bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
        <ProductImage
          src={images[0]?.src || "/placeholder.svg"}
          alt={images[0]?.alt || ""}
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ProductImage
          src={images[idx].src}
          alt={images[idx].alt}
          className="w-full h-full object-contain transition-opacity duration-300"
        />

        {/* Arrows */}
        <button
          onClick={() => goTo(idx - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-neutral-900/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Image précédente"
        >
          <ChevronLeft size={18} className="text-[#2E2E2E] dark:text-neutral-100" />
        </button>
        <button
          onClick={() => goTo(idx + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-neutral-900/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Image suivante"
        >
          <ChevronRight size={18} className="text-[#2E2E2E] dark:text-neutral-100" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === idx
                  ? "bg-[#C9948E] dark:bg-[#E8B4AE] w-4"
                  : "bg-[#2E2E2E]/20 dark:bg-white/30 hover:bg-[#2E2E2E]/40 dark:hover:bg-white/50"
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
              i === idx
                ? "border-[#C9948E] dark:border-[#E8B4AE]"
                : "border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600"
            }`}
          >
            <ProductImage src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
