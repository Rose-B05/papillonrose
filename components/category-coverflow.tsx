"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path

interface Category {
  name: string
  count: number
  image: string
}

export default function CategoryCoverflow({
  categories,
  onSelect,
}: {
  categories: Category[]
  onSelect: (name: string) => void
}) {
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [showArrows, setShowArrows] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const touchStartX = useRef(0)
  const dragCurrentX = useRef(0)
  const isDragging = useRef(false)

  const total = categories.length

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setIsMobile(w < 640)
      setIsTablet(w >= 640 && w < 1024)
      setShowArrows(w >= 640)
    }
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
    dragCurrentX.current = e.clientX
    clearInterval(intervalRef.current)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    dragCurrentX.current = e.clientX
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const diff = touchStartX.current - e.clientX
    if (diff > 40) goNext()
    else if (diff < -40) goPrev()
    resetAuto()
  }

  const getOffset = (index: number) => {
    let offset = index - active
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total
    return offset
  }

  const getCardStyle = (offset: number) => {
    const cw = isMobile ? 55 : isTablet ? 32 : 22
    const gap = isMobile ? 1.5 : 3
    const step = cw + gap
    const left = 50 - cw / 2 + offset * step
    const abs = Math.abs(offset)

    let scale = offset === 0 ? 1 : abs === 1 ? 0.85 : abs === 2 ? 0.7 : 0.5
    let opacity = offset === 0 ? 1 : abs === 1 ? 0.9 : abs === 2 ? 0.7 : 0
    let rotateY = offset * -10

    const maxVis = isMobile ? 1.5 : isTablet ? 1 : 2
    const visible = abs <= maxVis + 0.5

    return {
      left: `${left}%`,
      width: `${cw}%`,
      transform: `translateY(-50%) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity: visible ? opacity : 0,
      zIndex: 20 - abs,
      pointerEvents: visible ? ("auto" as const) : ("none" as const),
    }
  }

  return (
    <div className="relative w-full select-none overflow-hidden" style={{ touchAction: "pan-y" }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={img(categories[active]?.image || "/placeholder.svg")}
          alt=""
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] object-cover opacity-[0.12] blur-[80px] scale-[2]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E2E2E]/70 via-transparent to-[#2E2E2E]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2E2E2E]/40 to-transparent" />
      </div>

      {/* Navigation arrows */}
      {showArrows && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
              resetAuto()
            }}
            className="absolute left-3 md:left-[max(80px,5%)] top-[45%] -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goNext()
              resetAuto()
            }}
            className="absolute right-3 md:right-[max(80px,5%)] top-[45%] -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
            aria-label="Suivant"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Cards */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{
          height: "clamp(280px, 48vw, 480px)",
          perspective: "1400px",
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerCancel={handlePointerUp}
      >
        {categories.map((cat, i) => {
          const offset = getOffset(i)
          const s = getCardStyle(offset)
          const center = offset === 0

          return (
            <div
              key={cat.name}
              onClick={() => {
                if (center) onSelect(cat.name)
                else {
                  goTo(i)
                  resetAuto()
                }
              }}
              className="absolute top-1/2 cursor-pointer"
              style={{ ...s, transition: "all 0.4s ease-in-out" }}
            >
              <div
                className="overflow-hidden mx-auto"
                style={{
                  borderRadius: "16px",
                  aspectRatio: "1/1",
                  boxShadow: center
                    ? "0 25px 70px rgba(0,0,0,0.5)"
                    : "0 8px 30px rgba(0,0,0,0.25)",
                }}
              >
                <img
                  src={img(cat.image || "/placeholder.svg")}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Label */}
              <div
                className="text-center"
                style={{
                  marginTop: center ? "16px" : "10px",
                  opacity: center ? 1 : offset === -1 || offset === 1 ? 0.5 : 0,
                  transition: "all 0.4s ease-in-out",
                }}
              >
                {center && (
                  <>
                    <p
                      className="text-white text-sm md:text-base font-semibold leading-tight drop-shadow-lg"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {cat.name}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-[#C8A97E] text-[11px] md:text-xs">
                        {cat.count} article{cat.count > 1 ? "s" : ""}
                      </span>
                      <ArrowRight size={11} className="text-[#C8A97E]" />
                    </div>
                  </>
                )}
                {!center && (offset === -1 || offset === 1) && (
                  <p
                    className="text-white/70 text-[10px] font-medium truncate max-w-[100px] mx-auto drop-shadow-md"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {cat.name}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
