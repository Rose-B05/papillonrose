"use client"

import { useState, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""

interface Props {
  images: { src: string; alt: string }[]
  onImageClick: (index: number) => void
}

export default function ProductCarousel({ images, onImageClick }: Props) {
  const [idx, setIdx] = useState(0)
  const touchX = useRef(0)

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

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image */}
      <div
        className="w-full h-full cursor-pointer"
        onClick={() => onImageClick(idx)}
      >
        <img
          src={BASE + images[idx].src}
          alt={images[idx].alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goTo(idx - 1)
            }}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 md:w-7 md:h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Précédent"
          >
            <ChevronLeft size={12} className="text-[#2E2E2E]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goTo(idx + 1)
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 md:w-7 md:h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Suivant"
          >
            <ChevronRight size={12} className="text-[#2E2E2E]" />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                goTo(i)
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === idx ? "bg-white w-3" : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
