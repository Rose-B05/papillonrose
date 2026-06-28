"use client"

import { useRef, useState, useCallback } from "react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path

export default function BeforeAfterSlider({ before, after, alt }: { before: string; after: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const dragging = useRef(false)

  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPos((x / rect.width) * 100)
  }, [])

  const onMouseDown = () => { dragging.current = true }
  const onMouseUp = () => { dragging.current = false }
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePos(e.clientX) }
  const onTouchMove = (e: React.TouchEvent) => { if (e.touches[0]) updatePos(e.touches[0].clientX) }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-col-resize"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      {/* After image (full) */}
      <img src={img(after)} alt={`${alt} — après`} className="absolute inset-0 w-full h-full object-cover" />

      {/* Before image (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={img(before)} alt={`${alt} — avant`} className="absolute top-0 left-0 w-full h-full object-cover" style={{ width: `${100 / (pos / 100)}%` }} />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md z-10"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E2E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded font-medium uppercase tracking-wider z-10">
        Produit
      </div>
      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded font-medium uppercase tracking-wider z-10">
        Mise en scène
      </div>
    </div>
  )
}
