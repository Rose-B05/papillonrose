"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path

interface LightboxImage {
  src: string
  alt: string
}

export default function GalleryLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: LightboxImage[]
  startIndex: number
  onClose: () => void
}) {
  const [idx, setIdx] = useState(startIndex)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const goNext = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length])
  const goPrev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    document.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose, goNext, goPrev])

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 60) diff > 0 ? goNext() : goPrev()
  }

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-5 right-5 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm"
      >
        <X size={20} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            aria-label="Image précédente"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            aria-label="Image suivante"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={img(images[idx].src)}
          alt={images[idx].alt}
          className="max-w-full max-h-[90vh] object-contain animate-[fade-in_0.3s_ease-out]"
          loading="lazy"
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i) }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === idx ? "bg-white w-5" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
        {idx + 1} / {images.length}
      </div>
    </div>
  )
}
