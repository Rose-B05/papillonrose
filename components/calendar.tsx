"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AvailabilityCalendarProps {
  productId: number
  stock: number
  dateStart: string | null
  dateEnd: string | null
  onDateStartChange: (d: string) => void
  onDateEndChange: (d: string) => void
}

const DAYS = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"]
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

export default function AvailabilityCalendar({
  productId,
  stock,
  dateStart,
  dateEnd,
  onDateStartChange,
  onDateEndChange,
}: AvailabilityCalendarProps) {
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/availability?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => setBlockedDates(data.blockedDates || []))
      .catch(() => {})
  }, [productId])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const isBlocked = (day: number) => {
    const d = formatDate(viewYear, viewMonth, day)
    return blockedDates.includes(d)
  }

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    return d < today
  }

  const isInRange = (day: number) => {
    if (!dateStart || !dateEnd) return false
    const d = formatDate(viewYear, viewMonth, day)
    return d >= dateStart && d <= dateEnd
  }

  const isStart = (day: number) => formatDate(viewYear, viewMonth, day) === dateStart
  const isEnd = (day: number) => formatDate(viewYear, viewMonth, day) === dateEnd

  const handleDayClick = (day: number) => {
    const d = formatDate(viewYear, viewMonth, day)
    if (isPast(day) || isBlocked(day)) return

    setError("")

    if (!dateStart || (dateStart && dateEnd)) {
      onDateStartChange(d)
      onDateEndChange("")
    } else {
      if (d <= dateStart) {
        onDateStartChange(d)
        onDateEndChange("")
      } else {
        // Check if range is available
        const range = getDatesBetween(dateStart, d)
        const conflict = range.some((r) => blockedDates.includes(r))
        if (conflict) {
          setError("Ces dates contiennent des jours déjà réservés")
        } else {
          onDateEndChange(d)
        }
      }
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.07]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-[#F0EBE3] flex items-center justify-center transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-[#2E2E2E]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-[#F0EBE3] flex items-center justify-center transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />
          const blocked = isBlocked(day)
          const past = isPast(day)
          const inRange = isInRange(day)
          const start = isStart(day)
          const end = isEnd(day)
          const disabled = blocked || past
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={disabled}
              className={`
                relative w-full text-center text-xs py-2 rounded-lg transition-all
                ${disabled ? "text-gray-300 line-through cursor-not-allowed bg-red-50" : "hover:bg-[#F0EBE3] cursor-pointer"}
                ${start || end ? "bg-[#C8A97E] text-white font-bold hover:bg-[#B8926E]" : ""}
                ${inRange && !start && !end ? "bg-[#C8A97E]/15 text-[#2E2E2E]" : ""}
                ${!disabled && !start && !end && !inRange ? "text-[#2E2E2E]" : ""}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>

      {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-black/[0.05] text-[10px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#C8A97E]" />
          <span>Sélectionné</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-50 border border-red-200" />
          <span>Réservé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#C8A97E]/15" />
          <span>Dans la période</span>
        </div>
      </div>

      {stock > 0 && stock <= 3 && (
        <p className="text-amber-500 text-xs mt-3 text-center font-medium">
          Plus que {stock} disponible{stock > 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start)
  const endDate = new Date(end)
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}
