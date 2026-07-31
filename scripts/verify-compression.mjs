import sharp from "sharp"
import { stat } from "node:fs/promises"

const pairs = [
  { name: "PROD070.png", comp: "public/images/PROD070.png", orig: ".images-backup/PROD070.png" },
  { name: "PROD050.png", comp: "public/images/PROD050.png", orig: ".images-backup/PROD050.png" },
  { name: "PROD041.png", comp: "public/images/PROD041.png", orig: ".images-backup/PROD041.png" },
  { name: "PROD056.png", comp: "public/images/PROD056.png", orig: ".images-backup/PROD056.png" },
  { name: "PROD048 (2).png", comp: "public/images/PROD048 (2).png", orig: ".images-backup/PROD048 (2).png" },
  { name: "femme-papillon-rose.png", comp: "public/images/femme-papillon-rose.png", orig: ".images-backup/femme-papillon-rose.png" },
  { name: "ChatGPT Image 28 juin 2026, 21_33_23.png", comp: "public/images/ChatGPT Image 28 juin 2026, 21_33_23.png", orig: ".images-backup/ChatGPT Image 28 juin 2026, 21_33_23.png" },
]

async function pixelDiff(origPath, compPath, size = 400) {
  const origRaw = await sharp(origPath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .removeAlpha()
    .ensureAlpha()
    .raw()
    .toBuffer()

  const compRaw = await sharp(compPath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .removeAlpha()
    .ensureAlpha()
    .raw()
    .toBuffer()

  let maxDiff = 0
  let totalDiff = 0
  let diffCount = 0
  const total = size * size

  for (let i = 0; i < total; i++) {
    const dr = Math.abs(origRaw[i * 4] - compRaw[i * 4])
    const dg = Math.abs(origRaw[i * 4 + 1] - compRaw[i * 4 + 1])
    const db = Math.abs(origRaw[i * 4 + 2] - compRaw[i * 4 + 2])
    const d = Math.max(dr, dg, db)
    if (d > maxDiff) maxDiff = d
    if (d > 2) { totalDiff += d; diffCount++ }
  }

  return {
    maxDiff,
    pixelsChanged: diffCount,
    totalPixels: total,
    pctChanged: ((diffCount / total) * 100).toFixed(2),
    avgDiff: diffCount > 0 ? (totalDiff / diffCount).toFixed(2) : 0,
  }
}

async function main() {
  for (const p of pairs) {
    const s1 = await stat(p.orig)
    const s2 = await stat(p.comp)
    const m1 = await sharp(p.orig).metadata()
    const m2 = await sharp(p.comp).metadata()
    const diff = await pixelDiff(p.orig, p.comp)

    const dimOk = m1.width === m2.width && m1.height === m2.height
    const pct = ((s1.size - s2.size) / s1.size * 100).toFixed(1)

    console.log(`\n${"=".repeat(60)}`)
    console.log(`  ${p.name}`)
    console.log(`${"=".repeat(60)}`)
    console.log(`  Taille:     ${(s1.size/1024).toFixed(0)} Ko → ${(s2.size/1024).toFixed(0)} Ko (-${pct}%)`)
    console.log(`  Dimensions: ${m1.width}x${m1.height} → ${m2.width}x${m2.height} ${dimOk ? "✓" : "✗ MISMATCH"}`)
    console.log(`  Format:     ${m1.format} → ${m2.format}`)
    console.log(`  Channels:   ${m1.channels} → ${m2.channels}`)
    console.log(`  Alpha:      ${m1.hasAlpha} → ${m2.hasAlpha}`)
    console.log(`  --- Pixel diff (resize 400x400) ---`)
    console.log(`  Max diff:       ${diff.maxDiff} / 255`)
    console.log(`  Pixels changed: ${diff.pixelsChanged} / ${diff.totalPixels} (${diff.pctChanged}%)`)
    console.log(`  Avg diff:       ${diff.avgDiff} / 255`)
    
    const verdict = diff.maxDiff <= 15 && parseFloat(diff.pctChanged) < 5
      ? "✓ QUALITÉ OK"
      : diff.maxDiff <= 30 && parseFloat(diff.pctChanged) < 10
        ? "⚠ LÉGERÉMENT DÉGRADÉ (vérifier visuellement)"
        : "✗ CORRUPTION POTENTIELLE"
    console.log(`  Verdict:        ${verdict}`)
  }
}

main().catch(console.error)
