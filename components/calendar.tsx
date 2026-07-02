"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getRentalRuleForDate, validateStartDate, validateDuration } from "@/lib/rental-rules"

interface AvailabilityCalendarProps {
  productId: number
  stock: number
  dateStart: string | null
  dateEnd: string | null
  onDateStartChange: (d: string) => void
  onDateEndChange: (d: string) => void
  availableStock?: number
}

const DAYS = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"]
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

function getMonthData(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  return { daysInMonth, firstDayOfWeek }
}

function getNextMonth(year: number, month: number) {
  if (month === 11) return { year: year + 1, month: 0 }
  return { year, month: month + 1 }
}

export default function AvailabilityCalendar({
  productId,
  stock,
  dateStart,
  dateEnd,
  onDateStartChange,
  onDateEndChange,
  availableStock,
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

  const next = getNextMonth(viewYear, viewMonth)

  const isBlocked = (y: number, m: number, day: number) => {
    const d = formatDate(y, m, day)
    return blockedDates.includes(d)
  }

  const isPast = (y: number, m: number, day: number) => {
    const d = new Date(y, m, day)
    return d < today
  }

  const isInRange = (y: number, m: number, day: number) => {
    if (!dateStart || !dateEnd) return false
    const d = formatDate(y, m, day)
    return d >= dateStart && d <= dateEnd
  }

  const isStart = (y: number, m: number, day: number) => formatDate(y, m, day) === dateStart
  const isEnd = (y: number, m: number, day: number) => formatDate(y, m, day) === dateEnd

  const handleDayClick = (y: number, m: number, day: number) => {
    const d = formatDate(y, m, day)
    if (isPast(y, m, day) || isBlocked(y, m, day)) return

    setError("")

    if (!dateStart || (dateStart && dateEnd)) {
      // First click or reset: validate start date against rental rules
      const startDate = new Date(y, m, day)
      const startError = validateStartDate(startDate)
      if (startError) {
        setError(startError)
        return
      }
      onDateStartChange(d)
      onDateEndChange("")
    } else {
      if (d <= dateStart) {
        onDateStartChange(d)
        onDateEndChange("")
      } else {
        const range = getDatesBetween(dateStart, d)
        const conflict = range.some((r) => blockedDates.includes(r))
        if (conflict) {
          setError("Ces dates contiennent des jours déjà réservés")
        } else {
          // Validate duration against rental rules
          const startDate = new Date(dateStart)
          const endDate = new Date(y, m, day)
          const nights = Math.round(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          const durationError = validateDuration(nights, startDate)
          if (durationError) {
            setError(durationError)
            return
          }
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

  const renderMonth = (y: number, m: number) => {
    const { daysInMonth, firstDayOfWeek } = getMonthData(y, m)
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#2E2E2E]">
            {MONTHS[m]} {y}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[9px] text-gray-400 font-medium uppercase tracking-wider py-0.5">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, idx) => {
            if (day === null) return <div key={`e-${y}-${m}-${idx}`} />
            const blocked = isBlocked(y, m, day)
            const past = isPast(y, m, day)
            const inRange = isInRange(y, m, day)
            const start = isStart(y, m, day)
            const end = isEnd(y, m, day)
            const disabled = blocked || past
            return (
              <button
                key={`${y}-${m}-${day}`}
                onClick={() => handleDayClick(y, m, day)}
                disabled={disabled}
                className={`
                  relative w-full text-center text-[11px] py-1.5 rounded-md transition-all
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
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.07]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-[#F0EBE3] flex items-center justify-center transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-semibold text-[#2E2E2E]">
          {MONTHS[viewMonth]} {viewYear} — {MONTHS[next.month]} {next.year}
        </span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-[#F0EBE3] flex items-center justify-center transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex gap-4">
        {renderMonth(viewYear, viewMonth)}
        <div className="hidden md:block w-px bg-black/[0.05]" />
        {renderMonth(next.year, next.month)}
      </div>

      {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}

      {dateStart && !dateEnd && (
        <p className="text-[#C8A97E] text-[10px] mt-2 text-center font-medium">
          {getRentalRuleForDate(new Date(dateStart)).description}
        </p>
      )}

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

      {stock > 0 && (
        <p className={`text-xs mt-3 text-center font-medium ${
          (availableStock ?? stock) === 0
            ? "text-red-400"
            : (availableStock ?? stock) <= 2
              ? "text-amber-500"
              : "text-green-500"
        }`}>
          {(availableStock ?? stock) === 0
            ? "Indisponible sur cette période"
            : (availableStock ?? stock) < stock
              ? `Stock limité sur cette période — Plus que ${availableStock} disponible${(availableStock ?? 0) > 1 ? "s" : ""}`
              : `Plus que ${stock} disponible${stock > 1 ? "s" : ""}`}
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
