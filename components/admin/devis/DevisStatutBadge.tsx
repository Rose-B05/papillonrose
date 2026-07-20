"use client"

const LABELS: Record<string, string> = {
  "pending-quote": "En attente",
  "quote-sent": "Devis envoyé",
  "deposit-pending": "Acompte en attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  returned: "Restituée",
}

const COLORS: Record<string, string> = {
  "pending-quote": "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-white/70",
  "quote-sent": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "deposit-pending": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  returned: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
}

interface BookingStatutBadgeProps {
  statut: string
  className?: string
}

export default function DevisStatutBadge({ statut, className = "" }: BookingStatutBadgeProps) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${COLORS[statut] || COLORS["pending-quote"]} ${className}`}>
      {LABELS[statut] || statut}
    </span>
  )
}
