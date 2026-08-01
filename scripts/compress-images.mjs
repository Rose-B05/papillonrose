/**
 * Script de compression d'images — public/images/
 *
 * Routing intelligent :
 *   - PNG avec alpha (transparence) → pngquant (préserve la transparence)
 *   - PNG sans alpha → sharp compressionLevel 9
 *   - WebP → sharp quality 80
 *
 * Seules les compressions qui RÉDUISENT la taille sont appliquées.
 * Aucun commit automatique — rapport de validation requis avant tout git add.
 *
 * Usage : node scripts/compress-images.mjs [--dry-run]
 */

import sharp from "sharp"
import { execFile } from "node:child_process"
import { readdir, stat, mkdir, copyFile, readFile, writeFile } from "node:fs/promises"
import { join, relative, extname } from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

const IMAGES_DIR = join(process.cwd(), "public", "images")
const BACKUP_DIR = join(process.cwd(), ".images-backup")
const DRY_RUN = process.argv.includes("--dry-run")

const SKIP_EXTENSIONS = new Set([".svg", ".ico", ".gif"])

// pngquant binary path (installed via imagemin-pngquant)
const PNGQUANT_BIN = join(
  process.cwd(),
  "node_modules",
  "imagemin-pngquant",
  "node_modules",
  "pngquant-bin",
  "vendor",
  "pngquant.exe"
)

// Fallback: global install path
const PNGQUANT_BIN_GLOBAL =
  "C:\\Users\\Utilisateur\\AppData\\Roaming\\npm\\node_modules\\imagemin-pngquant\\node_modules\\pngquant-bin\\vendor\\pngquant.exe"

async function getPngquantPath() {
  const { access } = await import("node:fs/promises")
  try {
    await access(PNGQUANT_BIN)
    return PNGQUANT_BIN
  } catch {}
  try {
    await access(PNGQUANT_BIN_GLOBAL)
    return PNGQUANT_BIN_GLOBAL
  } catch {}
  throw new Error("pngquant binary not found")
}

async function getAllImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await getAllImages(full)))
    } else {
      const ext = extname(entry.name).toLowerCase()
      if (!SKIP_EXTENSIONS.has(ext)) {
        files.push(full)
      }
    }
  }
  return files
}

async function backupFile(filePath) {
  const rel = relative(IMAGES_DIR, filePath)
  const dest = join(BACKUP_DIR, rel)
  await mkdir(join(BACKUP_DIR, rel, ".."), { recursive: true })
  await copyFile(filePath, dest)
}

async function compressPNGAlpha(filePath, pngquantPath) {
  const input = await readFile(filePath)
  const before = input.length
  const metadata = await sharp(input).metadata()

  if (!metadata.hasAlpha) {
    return { before, after: before, saved: 0, kept: true, method: "none", hasAlpha: false }
  }

  // pngquant: quality 65-80, speed 1 (best compression), strip metadata
  const tmpOut = filePath + ".pngquant-tmp"
  try {
    await execFileAsync(pngquantPath, [
      "--quality=65-80",
      "--speed",
      "1",
      "--strip",
      "--force",
      "--output",
      tmpOut,
      filePath,
    ])

    const afterStat = await stat(tmpOut)
    const after = afterStat.size

    if (after < before) {
      if (!DRY_RUN) {
        // Replace original
        const { rename } = await import("node:fs/promises")
        await rename(tmpOut, filePath)
      } else {
        const { unlink } = await import("node:fs/promises")
        await unlink(tmpOut)
      }
      return { before, after, saved: before - after, kept: false, method: "pngquant", hasAlpha: true }
    } else {
      const { unlink } = await import("node:fs/promises")
      await unlink(tmpOut)
      return { before, after: before, saved: 0, kept: true, method: "pngquant-skip", hasAlpha: true }
    }
  } catch (err) {
    // pngquant failed (e.g. already palettized, too few colors) — try sharp fallback
    try {
      const { unlink } = await import("node:fs/promises")
      await unlink(tmpOut)
    } catch {}

    // Fallback: sharp c9 without palette
    try {
      const out = await sharp(input).png({ compressionLevel: 9, effort: 10 }).toBuffer()
      if (out.length < before) {
        if (!DRY_RUN) await writeFile(filePath, out)
        return { before, after: out.length, saved: before - out.length, kept: false, method: "sharp-fallback", hasAlpha: true }
      }
    } catch {}

    return { before, after: before, saved: 0, kept: true, method: "failed", hasAlpha: true }
  }
}

async function compressPNGNoAlpha(filePath) {
  const input = await readFile(filePath)
  const before = input.length

  // Essayer plusieurs strategies sharp
  const strategies = []

  try {
    const out = await sharp(input).png({ compressionLevel: 9, effort: 10 }).toBuffer()
    if (out.length < before) strategies.push({ buf: out, label: "c9-nopal" })
  } catch {}

  try {
    const out = await sharp(input).png({ compressionLevel: 9, palette: true, quality: 85, effort: 10 }).toBuffer()
    if (out.length < before) strategies.push({ buf: out, label: "c9-pal" })
  } catch {}

  try {
    const out = await sharp(input).png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 }).toBuffer()
    if (out.length < before) strategies.push({ buf: out, label: "c9-adapt" })
  } catch {}

  if (strategies.length === 0) {
    return { before, after: before, saved: 0, kept: true, method: "none", hasAlpha: false }
  }

  strategies.sort((a, b) => a.buf.length - b.buf.length)
  const best = strategies[0]

  if (!DRY_RUN) {
    await writeFile(filePath, best.buf)
  }

  return { before, after: best.buf.length, saved: before - best.buf.length, kept: false, method: best.label, hasAlpha: false }
}

async function compressWebP(filePath) {
  const input = await readFile(filePath)
  const before = input.length

  const output = await sharp(input).webp({ quality: 80, effort: 6 }).toBuffer()

  if (output.length >= before) {
    return { before, after: before, saved: 0, kept: true, method: "none" }
  }

  if (!DRY_RUN) {
    await writeFile(filePath, output)
  }

  return { before, after: output.length, saved: before - output.length, kept: false, method: "sharp-webp" }
}

async function main() {
  console.log(`\n${"=".repeat(60)}`)
  console.log(`  COMPRESSION D'IMAGES — ${DRY_RUN ? "MODE DRY-RUN (aucune modification)" : "MODE RÉEL"}`)
  console.log(`  Routing: pngquant (PNG alpha) | sharp (non-alpha + WebP)`)
  console.log(`${"=".repeat(60)}\n`)

  const pngquantPath = await getPngquantPath()
  console.log(`pngquant: ${pngquantPath}\n`)

  const files = await getAllImages(IMAGES_DIR)
  console.log(`Images trouvées : ${files.length}`)

  let totalBefore = 0
  for (const f of files) {
    const s = await stat(f)
    totalBefore += s.size
  }
  console.log(`Taille totale avant : ${(totalBefore / 1024 / 1024).toFixed(2)} Mo\n`)

  if (!DRY_RUN) {
    console.log(`Sauvegarde dans ${BACKUP_DIR} ...`)
    for (const f of files) {
      await backupFile(f)
    }
    console.log("Backup terminé.\n")
  }

  const results = []
  let processed = 0
  let totalAfter = 0
  let totalSaved = 0
  let compressed = 0
  let alphaCount = 0
  let alphaCompressed = 0
  let nonAlphaCount = 0
  let nonAlphaCompressed = 0
  let webpCount = 0
  let webpCompressed = 0

  for (const filePath of files) {
    const ext = extname(filePath).toLowerCase()
    const rel = relative(IMAGES_DIR, filePath)

    let result
    if (ext === ".png") {
      const meta = await sharp(await readFile(filePath)).metadata()
      if (meta.hasAlpha) {
        alphaCount++
        result = await compressPNGAlpha(filePath, pngquantPath)
        if (!result.kept) alphaCompressed++
      } else {
        nonAlphaCount++
        result = await compressPNGNoAlpha(filePath)
        if (!result.kept) nonAlphaCompressed++
      }
    } else if (ext === ".webp") {
      webpCount++
      result = await compressWebP(filePath)
      if (!result.kept) webpCompressed++
    } else {
      continue
    }

    const afterStat = DRY_RUN ? { size: result.after } : await stat(filePath)
    totalAfter += afterStat.size
    if (!result.kept) totalSaved += result.saved
    processed++
    if (!result.kept) compressed++

    const pct = result.before > 0 ? ((result.saved / result.before) * 100).toFixed(1) : "0"
    const savedKB = (result.saved / 1024).toFixed(1)
    const label = result.kept
      ? "conservé"
      : `- ${savedKB} Ko (-${pct}%) [${result.method}]`

    results.push({
      file: rel,
      beforeBytes: result.before,
      afterBytes: afterStat.size,
      beforeKB: (result.before / 1024).toFixed(1),
      afterKB: (afterStat.size / 1024).toFixed(1),
      savedKB,
      savedPct: `${pct}%`,
      kept: result.kept,
      method: result.method,
      hasAlpha: result.hasAlpha || false,
    })

    if (!result.kept) {
      console.log(`  ✓ ${rel} — ${label}`)
    }
  }

  const realSaved = totalBefore - totalAfter
  const realPct = totalBefore > 0 ? ((realSaved / totalBefore) * 100).toFixed(1) : "0"

  console.log(`\n${"─".repeat(60)}`)
  console.log(`  RÉSUMÉ`)
  console.log(`${"─".repeat(60)}\n`)
  console.log(`Fichiers traités        : ${processed}`)
  console.log(`  PNG alpha (pngquant)  : ${alphaCount} trouvés, ${alphaCompressed} compressés`)
  console.log(`  PNG non-alpha (sharp) : ${nonAlphaCount} trouvés, ${nonAlphaCompressed} compressés`)
  console.log(`  WebP (sharp)          : ${webpCount} trouvés, ${webpCompressed} compressés`)
  console.log(`Fichiers compressés     : ${compressed}`)
  console.log(`Fichiers conservés      : ${processed - compressed}`)
  console.log(`Taille avant            : ${(totalBefore / 1024 / 1024).toFixed(2)} Mo`)
  console.log(`Taille après            : ${(totalAfter / 1024 / 1024).toFixed(2)} Mo`)
  console.log(`Économie totale         : ${(realSaved / 1024 / 1024).toFixed(2)} Mo (${realPct}%)`)

  // Liste PNG alpha traités
  const alphaResults = results.filter((r) => r.hasAlpha && !r.kept)
  if (alphaResults.length > 0) {
    console.log(`\n${"─".repeat(60)}`)
    console.log(`  PNG ALPHA COMPRESSÉS (à vérifier en priorité)`)
    console.log(`${"─".repeat(60)}\n`)
    for (const r of alphaResults) {
      console.log(`  ${r.file.padEnd(45)} ${r.beforeKB} → ${r.afterKB} Ko  (-${r.savedKB} Ko, -${r.savedPct}) [${r.method}]`)
    }
  }

  // Top gains
  const sorted = [...results].filter((r) => !r.kept).sort((a, b) => parseFloat(b.savedKB) - parseFloat(a.savedKB))
  if (sorted.length > 0) {
    console.log(`\n${"─".repeat(60)}`)
    console.log(`  TOP 10 — PLUS GROS GAINS`)
    console.log(`${"─".repeat(60)}\n`)
    for (const r of sorted.slice(0, 10)) {
      console.log(`  ${r.file.padEnd(45)} ${r.beforeKB} → ${r.afterKB} Ko  (-${r.savedKB} Ko, -${r.savedPct})`)
    }
  }

  // Fichiers non compressés
  const kept = [...results].filter((r) => r.kept).sort((a, b) => parseFloat(b.beforeKB) - parseFloat(a.beforeKB))
  if (kept.length > 0) {
    console.log(`\n${"─".repeat(60)}`)
    console.log(`  TOP 10 — FICHIERS NON COMPRESSÉS (déjà optimaux)`)
    console.log(`${"─".repeat(60)}\n`)
    for (const r of kept.slice(0, 10)) {
      console.log(`  ${r.file.padEnd(45)} ${r.beforeKB} Ko`)
    }
  }

  // Rapport JSON
  const report = {
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    totalFiles: files.length,
    processed,
    compressed,
    kept: processed - compressed,
    alphaPNG: { total: alphaCount, compressed: alphaCompressed },
    nonAlphaPNG: { total: nonAlphaCount, compressed: nonAlphaCompressed },
    webp: { total: webpCount, compressed: webpCompressed },
    totalBeforeMB: parseFloat((totalBefore / 1024 / 1024).toFixed(2)),
    totalAfterMB: parseFloat((totalAfter / 1024 / 1024).toFixed(2)),
    totalSavedMB: parseFloat((realSaved / 1024 / 1024).toFixed(2)),
    totalSavedPct: `${realPct}%`,
    alphaResults: alphaResults.map((r) => ({
      file: r.file,
      beforeKB: r.beforeKB,
      afterKB: r.afterKB,
      savedPct: r.savedPct,
      method: r.method,
    })),
    allResults: sorted,
  }
  await writeFile(join(process.cwd(), "scripts", "compression-report.json"), JSON.stringify(report, null, 2))
  console.log(`\nRapport sauvegardé : scripts/compression-report.json`)
}

main().catch((err) => {
  console.error("Erreur:", err)
  process.exit(1)
})
