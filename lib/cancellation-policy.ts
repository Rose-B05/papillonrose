/**
 * Politique d'annulation de Papillon Rose.
 *
 * Grille de remboursement :
 *   - Plus de 30 jours avant l'événement : remboursement intégral
 *   - 15 à 30 jours avant : 50 % du montant payé
 *   - Moins de 15 jours : aucun remboursement
 *
 * Aucune annulation ni modification possible dans les 7 jours précédant l'événement.
 */

export interface CancellationResult {
  /** Taux de remboursement (0 à 1) */
  refundRate: number
  /** Label lisible du taux */
  label: string
  /** Jours avant l'événement */
  daysBeforeEvent: number
  /** Annulation autorisée */
  allowed: boolean
  /** Message d'information */
  message: string
}

/**
 * Calcule la politique d'annulation applicable.
 * @param eventDate  Date de l'événement (YYYY-MM-DD ou Date)
 * @param cancellationDate  Date d'annulation (YYYY-MM-DD ou Date)
 */
export function getCancellationPolicy(
  eventDate: string | Date,
  cancellationDate: string | Date,
): CancellationResult {
  const event = typeof eventDate === "string" ? new Date(eventDate) : eventDate
  const cancel = typeof cancellationDate === "string" ? new Date(cancellationDate) : cancellationDate

  event.setHours(0, 0, 0, 0)
  cancel.setHours(0, 0, 0, 0)

  const diffMs = event.getTime() - cancel.getTime()
  const daysBeforeEvent = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  // Annulation dans les 7 jours → interdite
  if (daysBeforeEvent <= 7) {
    return {
      refundRate: 0,
      label: "Aucun remboursement",
      daysBeforeEvent,
      allowed: false,
      message:
        "Aucune annulation ni modification n'est possible dans les 7 jours précédant l'événement.",
    }
  }

  // Moins de 15 jours → aucun remboursement
  if (daysBeforeEvent < 15) {
    return {
      refundRate: 0,
      label: "Aucun remboursement",
      daysBeforeEvent,
      allowed: true,
      message:
        "Annulation moins de 15 jours avant l'événement : aucun remboursement.",
    }
  }

  // 15 à 30 jours → 50 %
  if (daysBeforeEvent <= 30) {
    return {
      refundRate: 0.5,
      label: "Remboursement à 50 %",
      daysBeforeEvent,
      allowed: true,
      message:
        "Annulation entre 15 et 30 jours avant l'événement : remboursement de 50 % du montant payé.",
    }
  }

  // Plus de 30 jours → intégral
  return {
    refundRate: 1,
    label: "Remboursement intégral",
    daysBeforeEvent,
    allowed: true,
    message:
      "Annulation plus de 30 jours avant l'événement : remboursement intégral.",
  }
}
