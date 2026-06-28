export function formatPrix(prix: number | string): string {
  if (typeof prix === "number") return `${prix}`
  return prix
}

export function parsePrix(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = prix.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

export function calcTotalHt(items: { prix: number | string; qty: number; dateStart: string; dateEnd: string }[]): number {
  return items.reduce((sum, item) => {
    const days = Math.max(1, Math.ceil((new Date(item.dateEnd).getTime() - new Date(item.dateStart).getTime()) / (1000 * 60 * 60 * 24)))
    return sum + parsePrix(item.prix) * item.qty * days
  }, 0)
}

export function calcTtc(ht: number): number {
  return Math.round(ht * 1.2 * 100) / 100
}

export function calcDeposit(ttc: number): number {
  return Math.round(ttc * 0.3 * 100) / 100
}

export function formatDateFr(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export const TVA_RATE = 0.2
export const DEPOSIT_RATE = 0.3

