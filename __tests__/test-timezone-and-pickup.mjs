/**
 * Tests : Correction timezone calendrier + règle retrait week-end
 *
 * PROBLÈME 1 : En UTC+2 (France été), toISOString().split("T")[0] recule
 *   d'un jour car toISOString() convertit en UTC.
 *
 *   Pourquoi TZ env var et pas l'offset ISO :
 *   - new Date("2026-07-30T00:30:00+02:00") crée un objet Date représentant
 *     2026-07-30T00:30:00+02:00, soit 2026-07-29T22:30:00Z en UTC.
 *   - MAIS .getDate()/.getMonth()/.getFullYear() renvoient les composantes
 *     dans le fuseau horaire SYSTÈME du process Node.js, pas dans le fuseau
 *     de la chaîne ISO.
 *   - Si la machine est en UTC, .getDate() sur cette date renvoie 29 (la veille).
 *   - La seule façon de contrôler le fuseau de .getDate() est la variable
 *     d'environnement TZ, respectée nativement par Node.js AVANT démarrage.
 *   - On ne peut PAS changer TZ au sein d'un process en cours : il faut
 *     relancer un sous-processus node avec TZ=xxx pour chaque cas testé.
 *
 * PROBLÈME 2 : Règle 3 (week-end) — retrait = veille sauf dimanche → vendredi.
 */

import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"

// Helper : lance un script node avec TZ forcé
function runWithTZ(tz, code) {
  return execFileSync(process.execPath, ["-e", code], {
    env: { ...process.env, TZ: tz },
    encoding: "utf-8",
    timeout: 5000,
  }).trim()
}

// ─── PROBLÈME 1 : Timezone ───

describe("Timezone: toISOString bug", () => {
  it("toISOString().split('T')[0] recule d'un jour (TZ=UTC)", () => {
    const result = runWithTZ("UTC",
      `const d=new Date("2026-07-30T00:30:00+02:00");
       console.log(d.toISOString().split("T")[0]);`
    )
    assert.equal(result, "2026-07-29",
      "Le bug : toISOString recule d'un jour quand le fuseau est UTC")
  })

  it("toISOString().split('T')[0] recule d'un jour (TZ=Europe/Paris)", () => {
    const result = runWithTZ("Europe/Paris",
      `const d=new Date("2026-07-30T00:30:00+02:00");
       console.log(d.toISOString().split("T")[0]);`
    )
    assert.equal(result, "2026-07-29",
      "Le bug : toISOString recule d'un jour même en Europe/Paris")
  })
})

describe("Timezone: construction locale (getFullYear/getMonth/getDate)", () => {
  it("Produit la date système correcte en UTC", () => {
    const result = runWithTZ("UTC",
      `const n=new Date();
       const y=n.getFullYear(), m=String(n.getMonth()+1).padStart(2,"0"),
             d=String(n.getDate()).padStart(2,"0");
       const expected=new Date();
       const ey=expected.getFullYear(), em=String(expected.getMonth()+1).padStart(2,"0"),
             ed=String(expected.getDate()).padStart(2,"0");
       console.log(y+"-"+m+"-"+d === ey+"-"+em+"-"+ed ? "PASS" : "FAIL");`
    )
    assert.equal(result, "PASS")
  })

  it("Produit la date système correcte en Europe/Paris", () => {
    const result = runWithTZ("Europe/Paris",
      `const n=new Date();
       const y=n.getFullYear(), m=String(n.getMonth()+1).padStart(2,"0"),
             d=String(n.getDate()).padStart(2,"0");
       const expected=new Date();
       const ey=expected.getFullYear(), em=String(expected.getMonth()+1).padStart(2,"0"),
             ed=String(expected.getDate()).padStart(2,"0");
       console.log(y+"-"+m+"-"+d === ey+"-"+em+"-"+ed ? "PASS" : "FAIL");`
    )
    assert.equal(result, "PASS")
  })

  it("Produit un format YYYY-MM-DD valide en tout fuseau", () => {
    const re = /^\d{4}-\d{2}-\d{2}$/
    const utc = runWithTZ("UTC",
      `const n=new Date(); console.log(n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")+"-"+String(n.getDate()).padStart(2,"0"));`
    )
    const paris = runWithTZ("Europe/Paris",
      `const n=new Date(); console.log(n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")+"-"+String(n.getDate()).padStart(2,"0"));`
    )
    assert.match(utc, re, "Format YYYY-MM-DD valide en UTC")
    assert.match(paris, re, "Format YYYY-MM-DD valide en Europe/Paris")
  })
})

describe("Timezone: getDatesBetween corrigé", () => {
  const getDatesCode = `
    function getDatesBetweenFixed(start, end) {
      const dates = [];
      const current = new Date(start + "T00:00:00");
      const endDate = new Date(end + "T00:00:00");
      while (current <= endDate) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, "0");
        const d = String(current.getDate()).padStart(2, "0");
        dates.push(y + "-" + m + "-" + d);
        current.setDate(current.getDate() + 1);
      }
      return JSON.stringify(dates);
    }
    console.log(getDatesBetweenFixed("2026-07-28", "2026-07-30"));
  `

  it("Pas de décalage en UTC", () => {
    const result = JSON.parse(runWithTZ("UTC", getDatesCode))
    assert.deepEqual(result, ["2026-07-28", "2026-07-29", "2026-07-30"])
  })

  it("Pas de décalage en Europe/Paris", () => {
    const result = JSON.parse(runWithTZ("Europe/Paris", getDatesCode))
    assert.deepEqual(result, ["2026-07-28", "2026-07-29", "2026-07-30"])
  })
})

// ─── PROBLÈME 2 : Règle retrait week-end ───

describe("Règle 3 — Pickup date pour location week-end", () => {
  function calcPickupDay(startDateStr) {
    const [y, m, d] = startDateStr.split("-").map(Number)
    const startDate = new Date(y, m - 1, d)
    const dayOfWeek = startDate.getDay()
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

  it("Début vendredi → retrait jeudi", () => {
    assert.equal(toStr(calcPickupDay("2026-07-31")), "2026-07-30")
  })

  it("Début samedi → retrait vendredi", () => {
    assert.equal(toStr(calcPickupDay("2026-08-01")), "2026-07-31")
  })

  it("Début dimanche → retrait vendredi", () => {
    assert.equal(toStr(calcPickupDay("2026-08-02")), "2026-07-31")
  })

  it("Autre vendredi → retrait jeudi", () => {
    assert.equal(toStr(calcPickupDay("2026-08-07")), "2026-08-06")
  })

  it("Autre samedi → retrait vendredi", () => {
    assert.equal(toStr(calcPickupDay("2026-08-08")), "2026-08-07")
  })

  it("Autre dimanche → retrait vendredi", () => {
    assert.equal(toStr(calcPickupDay("2026-08-09")), "2026-08-07")
  })
})
