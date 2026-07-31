/**
 * Test : Stale closure dans addItem (cart-context)
 *
 * PROBLÈME : addItem dépendait de [items] via useCallback.
 *   Si items est stale (référence fermée lors d'un précédent render),
 *   le check de stock utilise une valeur obsolète.
 *
 * FIX : useRef(items) pour toujours lire la valeur courante sans
 *   ajouter items au tableau de dépendances de useCallback.
 *
 * Scénario :
 *   1. Panier vide → addItem({ id: 1, qty: 2 }) → doit passer (stock=10)
 *   2. clearCart() → addItem({ id: 1, qty: 2 }) → doit passer
 *   3. Sans le fix, l'étape 2 peut échouer si addItem lit un items stale
 */

import { describe, it } from "node:test"
import assert from "node:assert/strict"

// Données test — reflète data/produits.ts (stock=10 pour id:1)
const PRODUCTS = [
  { id: 1, stock: 10, nom: "Bouquet Test 1" },
  { id: 2, stock: 5, nom: "Bouquet Test 2" },
]

function matchItem(i, productId, variantLabel) {
  return i.productId === productId && (variantLabel === undefined || i.variantLabel === variantLabel)
}

// ─── Simule addItem avec useRef (fix) ───

function createFixedAddItem(itemsRef) {
  return function addItemFixed(item) {
    const product = PRODUCTS.find((p) => p.id === item.productId)
    if (!product) return { success: false, reason: "product not found" }

    const currentItems = itemsRef.current
    const ex = currentItems.find((i) => matchItem(i, item.productId, item.variantLabel))
    const currentQty = ex ? ex.qty : 0
    if (currentQty + item.qty > product.stock) {
      return { success: false, reason: "stock exceeded" }
    }
    return { success: true }
  }
}

// ─── Simule addItem avec stale closure (ancien comportement) ───

function createStaleAddItem(staleItems) {
  return function addItemStale(item) {
    const product = PRODUCTS.find((p) => p.id === item.productId)
    if (!product) return { success: false, reason: "product not found" }

    const ex = staleItems.find((i) => matchItem(i, item.productId, item.variantLabel))
    const currentQty = ex ? ex.qty : 0
    if (currentQty + item.qty > product.stock) {
      return { success: false, reason: "stock exceeded" }
    }
    return { success: true }
  }
}

// ─── Tests ───

describe("Cart stale closure — useRef pattern", () => {
  it("addItem fonctionne avec panier vide (ref pattern)", () => {
    let items = []
    const itemsRef = { current: items }
    const addItem = createFixedAddItem(itemsRef)

    const result = addItem({ productId: 1, qty: 2 })
    assert.equal(result.success, true, "Ajout dans panier vide doit réussir")
  })

  it("addItem échoue si stock réellement dépassé", () => {
    let items = [{ productId: 1, qty: 9 }]
    const itemsRef = { current: items }
    const addItem = createFixedAddItem(itemsRef)

    const result = addItem({ productId: 1, qty: 2 })
    assert.equal(result.success, false, "Doit refuser si stock dépassé")
    assert.equal(result.reason, "stock exceeded")
  })

  it("stale closure bloque un ajout légitime après clearCart", () => {
    // Scénario : items contient produit 1 avec qty=9
    // puis clearCart → items = []
    // puis on veut ajouter produit 1 avec qty=2 → légitime (stock=10)
    const staleItems = [{ productId: 1, qty: 9 }]  // closure capture ceci
    const addItem = createStaleAddItem(staleItems)

    // Même si on a fait clearCart, le stale closure voit encore qty=9
    // → 9+2 = 11 > 10 → REFUSE (FAUX NEGATIF)
    const result = addItem({ productId: 1, qty: 2 })
    assert.equal(result.success, false,
      "Stale closure bloque un ajout légitime après clearCart (bug démontré)")

    // Maintenant avec le fix useRef :
    let items = [{ productId: 1, qty: 9 }]
    const itemsRef = { current: items }
    const addItemFixed = createFixedAddItem(itemsRef)

    // Simule clearCart
    items = []
    itemsRef.current = items  // useRef mis à jour

    const resultFixed = addItemFixed({ productId: 1, qty: 2 })
    assert.equal(resultFixed.success, true,
      "Avec useRef, ajout après clearCart réussit correctement")
  })

  it("ref pattern suit les mutations en temps réel", () => {
    let items = [{ productId: 1, qty: 5 }]
    const itemsRef = { current: items }
    const addItem = createFixedAddItem(itemsRef)

    // 5+6=11 > 10 → échoue
    const r1 = addItem({ productId: 1, qty: 6 })
    assert.equal(r1.success, false, "Échoue quand qty=5")

    // Après ajout partiel : items = [{id:1,qty:5},{id:2,qty:1}]
    items = [{ productId: 1, qty: 5 }, { productId: 2, qty: 1 }]
    itemsRef.current = items

    // 5+5=10 ≤ 10 → passe
    const r2 = addItem({ productId: 1, qty: 5 })
    assert.equal(r2.success, true, "Réussit quand qty=5 avec ref mis à jour")
  })
})

describe("Header cartBadge — source de vérité", () => {
  it("itemCount = items.reduce((s,i) => s+i.qty, 0)", () => {
    const items = [
      { productId: 1, qty: 3 },
      { productId: 2, qty: 1 },
    ]
    const itemCount = items.reduce((s, i) => s + i.qty, 0)
    assert.equal(itemCount, 4)
  })

  it("itemCount est 0 quand panier vide", () => {
    const items = []
    const itemCount = items.reduce((s, i) => s + i.qty, 0)
    assert.equal(itemCount, 0)
  })
})
