"use client"

import { useState, useEffect } from "react"
import { getQuoteTimeRemaining, type QuoteTimeInput } from "@/lib/utils"

interface QuoteCountdownProps {
  booking: QuoteTimeInput
  variant?: "admin" | "client"
}

function formatTime(hours: number, minutes: number): string {
  if (hours === 0) return `${minutes}min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h${minutes.toString().padStart(2, "0")}`
}

export default function QuoteCountdown({ booking, variant = "admin" }: QuoteCountdownProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const result = getQuoteTimeRemaining(booking)
  if (!result) return null

  if (result.expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        Expiré
      </span>
    )
  }

  const { hoursRemaining, minutesRemaining } = result
  const totalMin = hoursRemaining * 60 + minutesRemaining

  let colorClass: string
  if (totalMin < 180) {
    colorClass = "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
  } else if (totalMin < 720) {
    colorClass = "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
  } else {
    colorClass = "bg-gray-100 text-secondary-text dark:bg-neutral-700 dark:text-white/70"
  }

  const timeStr = formatTime(hoursRemaining, minutesRemaining)

  if (variant === "client") {
    return (
      <p className={`text-sm font-medium mt-2 ${totalMin < 180 ? "text-red-600" : totalMin < 720 ? "text-orange-600" : "text-secondary-text"}`}>
        {totalMin < 180
          ? `Votre devis expire dans ${timeStr} — validez-le dès maintenant pour ne pas perdre votre réservation.`
          : `Votre devis expire dans ${timeStr}.`}
      </p>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
      Expire dans {timeStr}
    </span>
  )
}
