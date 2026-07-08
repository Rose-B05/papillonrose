/**
 * Règles de location centralisées pour Papillon Rose.
 *
 * Trois jeux de règles selon le jour de la semaine du DÉBUT de la location :
 *
 *  Règle 1 — Début lundi (location complète d'une semaine)
 *    · Retrait : vendredi précédent
 *    · Restitution : mardi suivant avant midi
 *
 *  Règle 2 — Début mardi → jeudi
 *    · Retrait : lundi de la même semaine
 *    · Restitution : vendredi de la même semaine avant midi
 *
 *  Règle 3 — Début vendredi → dimanche (week-end)
 *    · Retrait : jeudi de la même semaine
 *    · Restitution : lundi suivant avant midi
 */

export interface RentalRule {
  label: string
  description: string
  /** Jours de la semaine concernés (0=dimanche … 6=samedi) */
  startDays: number[]
  /** Délai minimum de réservation en jours (par rapport à aujourd'hui) */
  minAdvanceDays: number
  /** Durée minimum en nuits */
  minNights: number
  /** Durée maximum en nuits */
  maxNights: number
}

export const RENTAL_RULES: RentalRule[] = [
  {
    label: "Semaine complète",
    description:
      "Location du lundi au mardi suivant. Retrait la veille (vendredi).",
    startDays: [1], // lundi
    minAdvanceDays: 3,
    minNights: 7,
    maxNights: 7,
  },
  {
    label: "Mi-semaine",
    description:
      "Du mardi au jeudi inclus. Retrait le lundi, restitution le vendredi avant midi.",
    startDays: [2, 3, 4], // mardi, mercredi, jeudi
    minAdvanceDays: 2,
    minNights: 3,
    maxNights: 5,
  },
  {
    label: "Week-end",
    description:
      "Du vendredi au dimanche. Retrait le jeudi, restitution le lundi avant midi.",
    startDays: [5, 6, 0], // vendredi, samedi, dimanche
    minAdvanceDays: 2,
    minNights: 2,
    maxNights: 4,
  },
]

/**
 * Retourne la règle applicable pour une date de début donnée.
 */
export function getRentalRuleForDate(startDate: Date): RentalRule {
  const dayOfWeek = startDate.getDay()
  return RENTAL_RULES.find((r) => r.startDays.includes(dayOfWeek)) || RENTAL_RULES[0]
}

/**
 * Vérifie si une date de début est valide par rapport aux règles.
 * Retourne null si OK, ou un message d'erreur sinon.
 */
export function validateStartDate(startDate: Date): string | null {
  const rule = getRentalRuleForDate(startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.floor(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < rule.minAdvanceDays) {
    return `Délai minimum de ${rule.minAdvanceDays} jours avant la date de début pour une location ${rule.label.toLowerCase()}.`
  }

  return null
}

/**
 * Vérifie si la durée de location est valide.
 * Retourne null si OK, ou un message d'erreur sinon.
 */
export function validateDuration(nights: number, startDate: Date): string | null {
  const rule = getRentalRuleForDate(startDate)

  if (nights < rule.minNights) {
    return `Durée minimum de ${rule.minNights} nuit${rule.minNights > 1 ? "s" : ""} pour une location ${rule.label.toLowerCase()}.`
  }

  if (nights > rule.maxNights) {
    return `Durée maximum de ${rule.maxNights} nuit${rule.maxNights > 1 ? "s" : ""} pour une location ${rule.label.toLowerCase()}.`
  }

  return null
}
