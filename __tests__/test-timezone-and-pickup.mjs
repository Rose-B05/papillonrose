/**
 * Tests : Correction timezone calendrier + nouvelle règle retrait week-end
 *
 * Problème 1 : En UTC+2 (France été), toISOString().split("T")[0] recule d'un jour.
 *              Vérifie que la construction locale produit la bonne date.
 *
 * Problème 2 : Règle 3 (week-end) — retrait = veille sauf dimanche → vendredi.
 */

import { describe, it } from "node:test"
import assert from "node:assert/strict"

// ─── PROBLÈME 1 : Timezone ───

describe("Timezone: construction locale vs toISOString", () => {
  it("toISOString().split('T')[0] produit une date décalée en UTC+2 simulé", () => {
    // Simuler midnight local en UTC+2 (heure réelle = 22:00 UTC la veille)
    const now = new Date("2026-07-30T00:30:00+02:00")
    // toISOString() convertit en UTC → 2026-07-29T22:30:00Z
    const buggy = now.toISOString().split("T")[0]
    assert.equal(buggy, "2026-07-29", "Le bug : toISOString recule d'un jour en UTC+2")
  })

  it("La construction locale produit la bonne date en UTC+2", () => {
    const now = new Date("2026-07-30T00:30:00+02:00")
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const fixed = `${y}-${m}-${d}`
    assert.equal(fixed, "2026-07-30", "La correction produit la bonne date")
  })

  it("La construction locale produit la bonne date en UTC+0", () => {
    const now = new Date("2026-07-30T00:30:00Z")
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const fixed = `${y}-${m}-${d}`
    assert.equal(fixed, "2026-07-30", "UTC+0 fonctionne aussi")
  })

  it("La construction locale produit la bonne date en UTC-5", () => {
    // 2026-07-30T01:00:00-05:00 = 2026-07-30T06:00:00Z
    const now = new Date("2026-07-30T01:00:00-05:00")
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const fixed = `${y}-${m}-${d}`
    assert.equal(fixed, "2026-07-30", "UTC-5 fonctionne aussi")
  })

  it("getDatesBetween avec construction locale ne décale pas les dates", () => {
    // Simuler getDatesBetween corrigé
    function getDatesBetweenFixed(start, end) {
      const dates = []
      const current = new Date(start + "T00:00:00")
      const endDate = new Date(end + "T00:00:00")
      while (current <= endDate) {
        const y = current.getFullYear()
        const m = String(current.getMonth() + 1).padStart(2, "0")
        const d = String(current.getDate()).padStart(2, "0")
        dates.push(`${y}-${m}-${d}`)
        current.setDate(current.getDate() + 1)
      }
      return dates
    }

    const dates = getDatesBetweenFixed("2026-07-28", "2026-07-30")
    assert.deepEqual(dates, ["2026-07-28", "2026-07-29", "2026-07-30"])
  })
})

// ─── PROBLÈME 2 : Règle retrait week-end ───

describe("Règle 3 — Pickup date pour location week-end", () => {
  // Helper: calcRentalDates simplifié pour tester la règle 3
  function calcPickupDay(startDateStr) {
    const [y, m, d] = startDateStr.split("-").map(Number)
    const startDate = new Date(y, m - 1, d)
    const dayOfWeek = startDate.getDay()

    // Règle 3 : veille sauf dimanche → vendredi (-2)
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      return dayOfWeek === 0
        ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 2)
        : new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 1)
    }
    return null
  }

  function toStr(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  it("Début vendredi → retrait jeudi (inchangé)", () => {
    // 31 juil 2026 = vendredi
    const pickup = calcPickupDay("2026-07-31")
    assert.equal(toStr(pickup), "2026-07-30", "Retrait jeudi 30 juillet")
  })

  it("Début samedi → retrait vendredi (CHANGEMENT)", () => {
    // 1 août 2026 = samedi
    const pickup = calcPickupDay("2026-08-01")
    assert.equal(toStr(pickup), "2026-07-31", "Retrait vendredi 31 juillet (pas jeudi 30)")
  })

  it("Début dimanche → retrait vendredi (CHANGEMENT)", () => {
    // 2 août 2026 = dimanche
    const pickup = calcPickupDay("2026-08-02")
    assert.equal(toStr(pickup), "2026-07-31", "Retrait vendredi 31 juillet (pas jeudi 30)")
  })

  it("Autre vendredi → retrait jeudi (vérification mois différent)", () => {
    // 7 août 2026 = vendredi
    const pickup = calcPickupDay("2026-08-07")
    assert.equal(toStr(pickup), "2026-08-06", "Retrait jeudi 6 août")
  })

  it("Autre samedi → retrait vendredi (vérification mois différent)", () => {
    // 8 août 2026 = samedi
    const pickup = calcPickupDay("2026-08-08")
    assert.equal(toStr(pickup), "2026-08-07", "Retrait vendredi 7 août")
  })

  it("Autre dimanche → retrait vendredi (vérification mois différent)", () => {
    // 9 août 2026 = dimanche
    const pickup = calcPickupDay("2026-08-09")
    assert.equal(toStr(pickup), "2026-08-07", "Retrait vendredi 7 août")
  })
})
