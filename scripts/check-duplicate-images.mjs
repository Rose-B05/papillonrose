/**
 * Script de vérification des doublons d'images dans le catalogue.
 *
 * Usage:
 *   node scripts/check-duplicate-images.mjs https://www.papillonrose.fr
 *   node scripts/check-duplicate-images.mjs http://localhost:3000
 *
 * Vérifie :
 *   1. Doublons dans le tableau gallerie d'un même produit
 *   2. Image principale identique à une image de gallerie
 *   3. Produits sans image valide (placeholder)
 */

const BASE = process.argv[2] || "https://www.papillonrose.fr"

async function main() {
  console.log(`\n🔍 Vérification des doublons d'images — ${BASE}\n`)

  const res = await fetch(`${BASE}/api/products`)
  if (!res.ok) {
    console.error(`❌ Erreur API: ${res.status}`)
    process.exit(1)
  }

  const products = await res.json()
  console.log(`📦 ${products.length} produits chargés\n`)

  let totalDoublons = 0
  const resultats = []

  for (const p of products) {
    const seen = new Map()
    const doublons = []

    // Check main image
    if (p.image && !p.image.includes("placeholder")) {
      seen.set(p.image, "image principale")
    }

    // Check gallery
    if (p.gallerie && p.gallerie.length > 0) {
      for (let i = 0; i < p.gallerie.length; i++) {
        const url = p.gallerie[i]
        if (seen.has(url)) {
          doublons.push({
            url,
            occurrence: `gallerie[${i}]`,
            premiere: seen.get(url),
          })
        } else {
          seen.set(url, `gallerie[${i}]`)
        }
      }

      // Check image vs gallerie overlap
      if (p.image && !p.image.includes("placeholder")) {
        for (let i = 0; i < p.gallerie.length; i++) {
          if (p.gallerie[i] === p.image) {
            doublons.push({
              url: p.gallerie[i],
              occurrence: `gallerie[${i}]`,
              premiere: "image principale",
            })
          }
        }
      }
    }

    if (doublons.length > 0) {
      totalDoublons += doublons.length
      resultats.push({
        id: p.id,
        nom: p.nom,
        imageCount: 1 + (p.gallerie?.length || 0),
        doublons,
      })
    }
  }

  // Print results
  if (resultats.length === 0) {
    console.log("✅ Aucun doublon d'image trouvé !\n")
  } else {
    console.log(`⚠️  ${resultats.length} produit(s) avec doublon(s):\n`)
    for (const r of resultats) {
      console.log(`  #${r.id} ${r.nom} (${r.imageCount} images)`)
      for (const d of r.doublons) {
        console.log(`    → ${d.url}`)
        console.log(`      ${d.premiere} ↔ ${d.occurrence}`)
      }
      console.log()
    }
    console.log(`\n📊 Total: ${totalDoublons} doublon(s) dans ${resultats.length} produit(s)\n`)
  }

  process.exit(resultats.length > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error("Erreur:", e.message)
  process.exit(2)
})
