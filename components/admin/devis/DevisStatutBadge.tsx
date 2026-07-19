"use client"

import type { DevisStatut } from "@/lib/devis/types"

const LABELS: Record<DevisStatut, string> = {
  en_attente: "En attente",
  en_preparation: "En préparation",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
}

const COLORS: Record<DevisStatut, string> = {
  en_attente: "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-white/70",
  en_preparation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  envoye: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  accepte: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  refuse: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

interface DevisStatutBadgeProps {
  statut: DevisStatut
  className?: string
}

export default function DevisStatutBadge({ statut, className = "" }: DevisStatutBadgeProps) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${COLORS[statut] || COLORS.en_attente} ${className}`}>
      {LABELS[statut] || statut}
    </span>
  )
}
