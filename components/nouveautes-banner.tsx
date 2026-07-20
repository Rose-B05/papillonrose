"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, FileText, Volume2, VolumeX } from "lucide-react"
import type { Nouveaute } from "@/lib/types"

interface NouveautesBannerProps {
  className?: string
}

export default function NouveautesBanner({ className = "" }: NouveautesBannerProps) {
  const [items, setItems] = useState<Nouveaute[]>([])
  const [current, setCurrent] = useState(0)
  const [muted, setMuted] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/nouveautes")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % items.length)
  }, [items.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + items.length) % items.length)
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [items.length, next])

  if (loading || items.length === 0) return null

  const item = items[current]

  return (
    <section className={`max-w-7xl mx-auto px-5 md:px-10 mt-10 md:mt-8 ${className}`}>
      <div className="flex items-end justify-between mb-4 md:mb-5">
        <div>
          <p className="text-[#C9948E] dark:text-[#E8B4AE] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
            Dernières arrivals
          </p>
          <h2
            style={{ fontFamily: "var(--font-playfair), serif" }}
            className="text-2xl md:text-3xl font-semibold text-[#2E2E2E] dark:text-neutral-100"
          >
            Nouveautés
          </h2>
        </div>
        {items.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-[#C9948E]/30 dark:border-[#E8B4AE]/30 flex items-center justify-center text-[#C9948E] dark:text-[#E8B4AE] hover:bg-[#C9948E]/10 transition-colors"
              aria-label="Précédent"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-[#C9948E]/30 dark:border-[#E8B4AE]/30 flex items-center justify-center text-[#C9948E] dark:text-[#E8B4AE] hover:bg-[#C9948E]/10 transition-colors"
              aria-label="Suivant"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-[#F8F5F0] dark:bg-neutral-800 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
        {/* Image / Video background */}
        {item.type === "image" && (
          <div className="absolute inset-0">
            <img
              src={item.mediaUrl}
              alt={item.titre}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {item.type === "video" && (
          <div className="absolute inset-0 overflow-hidden">
            <video
              src={item.mediaUrl}
              className="w-full h-full object-cover object-[50%_67%]"
              autoPlay
              muted={muted}
              loop
              playsInline
            />
            <button
              onClick={() => setMuted(!muted)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
              aria-label={muted ? "Activer le son" : "Couper le son"}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        )}

        {item.type === "document" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C9948E]/20 via-[#E8C4BE]/30 to-[#C9948E]/10 dark:from-[#C9948E]/10 dark:via-neutral-800 dark:to-[#C9948E]/5">
            <div className="flex flex-col items-center gap-4 p-8">
              <div className="w-20 h-20 rounded-2xl bg-[#C9948E]/15 dark:bg-[#C9948E]/10 flex items-center justify-center">
                <FileText size={36} className="text-[#C9948E] dark:text-[#E8B4AE]" />
              </div>
            </div>
          </div>
        )}

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-end min-h-[420px] md:min-h-[560px] p-6 md:p-10">
          <div className="max-w-lg">
            <h3
              style={{ fontFamily: "var(--font-playfair), serif" }}
              className="text-xl md:text-2xl font-semibold text-white mb-2 drop-shadow-lg"
            >
              {item.titre}
            </h3>
            {item.description && (
              <p className="text-sm text-white/80 mb-4 leading-relaxed drop-shadow">
                {item.description}
              </p>
            )}
            {item.type === "document" && item.lienAction && (
              <a
                href={item.lienAction}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#C9948E] hover:bg-[#B8807A] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
              >
                {item.labelAction || "Découvrir"}
              </a>
            )}
          </div>
        </div>

        {/* Dots */}
        {items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? "bg-white w-5"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Nouveauté ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
