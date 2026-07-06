"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path

function isLight(bg: string): boolean {
  const hex = bg.replace("#", "")
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 > 160
}

interface OverflowCard {
  nom: string
  categorie: string
  image: string
  bgColor: string
  count?: number
  largeImage?: boolean
}

export default function OverflowCarousel({
  cards,
  onSelect,
}: {
  cards: OverflowCard[]
  onSelect: (categorie: string) => void
}) {
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const touchStartX = useRef(0)
  const isDragging = useRef(false)

  const total = cards.length

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const goTo = useCallback(
    (i: number) => setActive(((i % total) + total) % total),
    [total],
  )

  const goNext = useCallback(() => goTo(active + 1), [active, goTo])
  const goPrev = useCallback(() => goTo(active - 1), [active, goTo])

  useEffect(() => {
    intervalRef.current = setInterval(goNext, 3000)
    return () => clearInterval(intervalRef.current)
  }, [goNext])

  const resetAuto = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(goNext, 3000)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    touchStartX.current = e.clientX
    clearInterval(intervalRef.current)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const diff = touchStartX.current - e.clientX
    if (diff > 40) goNext()
    else if (diff < -40) goPrev()
    resetAuto()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    e.preventDefault()
  }

  const getOffset = (index: number) => {
    let offset = index - active
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total
    return offset
  }

  const getCardStyle = (offset: number) => {
    const cw = isMobile ? 55 : 28
    const gap = isMobile ? 2 : 3
    const step = cw + gap
    const left = 50 - cw / 2 + offset * step
    const abs = Math.abs(offset)

    const scale = offset === 0 ? 1 : abs === 1 ? 0.9 : 0.75
    const opacity = offset === 0 ? 1 : abs === 1 ? 0.85 : 0
    const translateY = offset === 0 ? "0%" : "12%"

    const maxVis = isMobile ? 1.5 : 1
    const visible = abs <= maxVis + 0.5

    return {
      left: `${left}%`,
      width: `${cw}%`,
      transform: `translateY(${translateY}) scale(${scale})`,
      opacity: visible ? opacity : 0,
      zIndex: 10 - abs,
      pointerEvents: visible ? ("auto" as const) : ("none" as const),
    }
  }

  return (
    <div className="relative w-full select-none mb-8 md:mb-[40px] px-5 md:px-0" style={{ touchAction: "pan-y" }}>
      {/* Arrows */}
      {!isMobile && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); resetAuto() }}
            className="absolute -left-1 md:left-0 top-[42%] -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-[#C8A97E] shadow-md transition-all"
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); resetAuto() }}
            className="absolute -right-1 md:right-0 top-[42%] -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-[#C8A97E] shadow-md transition-all"
            aria-label="Suivant"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Cards */}
      <div
        className="relative w-full h-[300px] md:h-[380px] lg:h-[540px]"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerCancel={handlePointerUp}
      >
        {cards.map((card, i) => {
          const offset = getOffset(i)
          const s = getCardStyle(offset)
          const center = offset === 0
          const light = isLight(card.bgColor)
          const textColor = light ? "#333" : "#fff"
          const imgHeight = isMobile ? 210 : 340
          const cardHeight = isMobile ? 210 : 310

          return (
            <div
              key={card.categorie}
              onClick={() => { onSelect(card.categorie) }}
              className="absolute top-[18%] md:top-[28%] cursor-pointer"
              style={{
                ...s,
                transition: "all 0.4s ease-in-out",
              }}
            >
              {/* Card */}
              <div
                style={{
                  background: card.bgColor,
                  borderRadius: "20px",
                  height: `${cardHeight}px`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: "0 20px 28px",
                  textAlign: "center",
                  overflow: "visible",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                }}
              >
                {/* Semi-transparent overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, ${card.bgColor}dd, ${card.bgColor}00 50%)`,
                    borderRadius: "20px",
                  }}
                />

                {/* Image container — fixed height to ensure consistent gap */}
                <div
                  style={{
                    height: isMobile ? "95px" : "160px",
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={img(card.image)}
                    alt={card.nom}
                    draggable={false}
                    style={{
                      height: `${imgHeight}px`,
                      objectFit: "contain",
                      transform: "translateY(40%)",
                      pointerEvents: "none",
                      filter: center ? "drop-shadow(0 12px 32px rgba(0,0,0,0.25))" : "none",
                    }}
                  />
                </div>

                {/* Spacer between image and text */}
                <div style={{ height: isMobile ? "12px" : "20px", flexShrink: 0 }} />

                <div className="relative z-10 w-full">
                  <p
                    className="text-sm md:text-base font-semibold leading-tight"
                    style={{ color: textColor, fontFamily: "var(--font-playfair), serif" }}
                  >
                    {card.categorie}
                  </p>
                  {card.count != null && (
                    <p className="text-xs mt-1 font-medium" style={{ color: "#C9A96E" }}>
                      {card.count} produit{card.count > 1 ? "s" : ""}
                    </p>
                  )}
                  <div className="mt-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-5 py-2 rounded-[50px] transition-all duration-300"
                      style={{
                        background: "#fff",
                        color: "#C9A96E",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#C9A96E"
                        e.currentTarget.style.color = "#fff"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff"
                        e.currentTarget.style.color = "#C9A96E"
                      }}
                    >
                      Découvrir <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
