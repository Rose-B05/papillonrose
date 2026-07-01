/**
 * lib/rental-dates.ts
 *
 * Logique métier pour le calcul automatique des dates de retrait et de restitution
 * en fonction du jour de début de location choisi par le client.
 *
 * JOURS DE LA SEMAINE (getDay()) :
 *   0 = Dimanche, 1 = Lundi, 2 = Mardi, 3 = Mercredi, 4 = Jeudi, 5 = Vendredi, 6 = Samedi
 *
 * RÈGLE 1 — Location à partir du LUNDI (semaine complète) :
 *   Retrait    : le vendredi précédent
 *   Restitution : à partir du mardi suivant, puis n'importe quel jour ouvré suivant avant 12h
 *
 * RÈGLE 2 — Location du MARDI au JEUDI inclus :
 *   Retrait    : le lundi de la même semaine
 *   Restitution : le vendredi de la même semaine avant 12h
 *
 * RÈGLE 3 — Location du VENDREDI au DIMANCHE :
 *   Retrait    : le jeudi de la même semaine (veille)
 *   Restitution : le lundi suivant avant 12h
 *
 * MAJORATION EN CAS DE RETARD (appliquée aux 3 cas) :
 *   Jour 1 de retard : +10% du montant total de la location
 *   Jour 2+ de retard : +30% supplémentaires par jour (cumulatif)
 *
 *   Formule cumulatif :
 *     penalite(j) = min( 10% + (j - 1) × 30% , 50% )
 *     soit :
 *       jour 1 → 10%
 *       jour 2 → 10% + 30% = 40%
 *       jour 3 → 10% + 30% + 30% = 70% → plafonné à 50%
 *       jour 4+ → 50% (plafond atteint)
 */

export interface RentalDates {
  /** Date de début de location choisie par le client (format YYYY-MM-DD) */
  dateStart: string
  /** Date de fin de location choisie par le client (format YYYY-MM-DD) */
  dateEnd: string
  /** Date de retrait du matériel (format YYYY-MM-DD) */
  pickupDate: string
  /** Date limite de restitution (format YYYY-MM-DD, avant 12h) */
  returnDeadline: string
  /** Jour de la semaine du début (0=Dim ... 6=Sam) */
  startDayOfWeek: number
  /** Règle appliquée (1, 2 ou 3) */
  rule: 1 | 2 | 3
  /** Libellé de la règle */
  ruleLabel: string
}

export interface LateFee {
  /** Nombre de jours de retard */
  joursRetard: number
  /** Taux de pénalité (ex: 0.10 = 10%) */
  taux: number
  /** Montant de la pénalité en euros */
  montant: number
  /** Montant total location + pénalité */
  montantTotal: number
}

// ─── Helpers ───

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function toStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Vérifie si une date est un jour ouvré (lundi à vendredi).
 */
function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

/**
 * Trouve le prochain jour ouvré à partir d'une date donnée (inclusif).
 */
function nextBusinessDay(date: Date): Date {
  const result = new Date(date)
  while (!isBusinessDay(result)) {
    result.setDate(result.getDate() + 1)
  }
  return result
}

/**
 * Calcule le jour de la semaine du vendredi précédent.
 */
function previousFriday(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  // Si on est lundi (1), vendredi = -4 jours
  // Si on est mardi (2), vendredi = -5 jours etc.
  const diff = day === 0 ? -2 : day === 6 ? -1 : day + 2
  result.setDate(result.getDate() - diff)
  return result
}

/**
 * Calcule le jeudi de la même semaine (pour la règle 3).
 */
function sameWeekThursday(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  // Jeudi = jour 4
  const diff = day - 4
  result.setDate(result.getDate() - diff)
  return result
}

// ─── Fonctions principales ───

/**
 * Calcule automatiquement les dates de retrait et de restitution
 * en fonction de la date de début de location choisie.
 *
 * @param dateStart - Date de début de location (YYYY-MM-DD)
 * @param dateEnd   - Date de fin de location (YYYY-MM-DD)
 * @returns RentalDates avec pickupDate, returnDeadline, rule, etc.
 */
export function calcRentalDates(dateStart: string, dateEnd: string): RentalDates {
  const startDate = parseDate(dateStart)
  const dayOfWeek = startDate.getDay() // 0=Dim, 1=Lu, 2=Ma, 3=Me, 4=Je, 5=Ve, 6=Sam

  let pickupDate: Date
  let returnDeadline: Date
  let rule: 1 | 2 | 3
  let ruleLabel: string

  if (dayOfWeek === 1) {
    // ─── RÈGLE 1 : Location à partir du LUNDI (semaine complète) ───
    rule = 1
    ruleLabel = "Location à partir du lundi — semaine complète"
    // Retrait : le vendredi précédent
    pickupDate = previousFriday(startDate)
    // Restitution : à partir du mardi suivant
    returnDeadline = addDays(startDate, 1) // Mardi
    // Si le mardi n'est pas un jour ouvré, on prend le prochain
    returnDeadline = nextBusinessDay(returnDeadline)

  } else if (dayOfWeek >= 2 && dayOfWeek <= 4) {
    // ─── RÈGLE 2 : Location du MARDI au JEUDI inclus ───
    rule = 2
    ruleLabel = "Location du mardi au jeudi — restitution le vendredi"
    // Retrait : le lundi de la même semaine
    pickupDate = addDays(startDate, -(dayOfWeek - 1))
    // Restitution : le vendredi de la même semaine
    returnDeadline = addDays(startDate, 5 - dayOfWeek) // Vendredi

  } else {
    // ─── RÈGLE 3 : Location du VENDREDI au DIMANCHE ───
    rule = 3
    ruleLabel = "Location du week-end — restitution le lundi"
    // Retrait : le jeudi de la même semaine
    pickupDate = sameWeekThursday(startDate)
    // Restitution : le lundi suivant
    const nextMonday = addDays(startDate, (8 - dayOfWeek) % 7 || 7)
    returnDeadline = nextBusinessDay(nextMonday)
  }

  return {
    dateStart,
    dateEnd,
    pickupDate: toStr(pickupDate),
    returnDeadline: toStr(returnDeadline),
    startDayOfWeek: dayOfWeek,
    rule,
    ruleLabel,
  }
}

/**
 * Calcule la pénalité en cas de retard de restitution.
 *
 * FORMULE CUMULATIVE :
 *   Taux(j) = min( 10% + (j - 1) × 30% , 50% )
 *
 *   Jour 1 → 10%
 *   Jour 2 → 10% + 30% = 40%
 *   Jour 3 → 10% + 30% + 30% = 70% → plafonné à 50%
 *   Jour 4+ → 50% (plafond)
 *
 * @param joursRetard - Nombre de jours de retard (≥ 0)
 * @param montantTotalLocation - Montant total TTC de la location en €
 * @returns LateFee avec taux, montant et montantTotal
 */
export function calculateLateFee(joursRetard: number, montantTotalLocation: number): LateFee {
  if (joursRetard <= 0) {
    return { joursRetard: 0, taux: 0, montant: 0, montantTotal: montantTotalLocation }
  }

  // Formule : taux = min( 10% + (joursRetard - 1) × 30% , 50% )
  const taux = Math.min(0.10 + (joursRetard - 1) * 0.30, 0.50)
  const montant = Math.round(taux * montantTotalLocation * 100) / 100
  const montantTotal = Math.round((montantTotalLocation + montant) * 100) / 100

  return { joursRetard, taux, montant, montantTotal }
}

/**
 * Retourne le libellé du jour de la semaine en français.
 */
export function getDayName(dayOfWeek: number): string {
  const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
  return days[dayOfWeek] || ""
}

/**
 * Retourne un résumé textuel de la règle appliquée.
 */
export function getRuleSummary(r: RentalDates): string {
  switch (r.rule) {
    case 1:
      return `Semaine complète — Retrait le ${getDayName(parseDate(r.pickupDate).getDay())} ${formatDateShort(r.pickupDate)}, restitution à partir du ${getDayName(parseDate(r.returnDeadline).getDay())} ${formatDateShort(r.returnDeadline)}`
    case 2:
      return `Mi-semaine — Retrait le ${getDayName(parseDate(r.pickupDate).getDay())} ${formatDateShort(r.pickupDate)}, restitution le ${getDayName(parseDate(r.returnDeadline).getDay())} ${formatDateShort(r.returnDeadline)} avant 12h`
    case 3:
      return `Week-end — Retrait le ${getDayName(parseDate(r.pickupDate).getDay())} ${formatDateShort(r.pickupDate)}, restitution le ${getDayName(parseDate(r.returnDeadline).getDay())} ${formatDateShort(r.returnDeadline)} avant 12h`
  }
}

/**
 * Formate une date YYYY-MM-DD en format court (ex: "15 juin").
 */
function formatDateShort(dateStr: string): string {
  const d = parseDate(dateStr)
  const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
  return `${d.getDate()} ${months[d.getMonth()]}`
}

/**
 * Formate une date YYYY-MM-DD en format long (ex: "lundi 15 juin 2026").
 */
export function formatDateLong(dateStr: string): string {
  const d = parseDate(dateStr)
  const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
