const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const SRC = path.resolve("C:/Users/Utilisateur/Desktop/photos final")
const DST = path.resolve("C:/Users/Utilisateur/Downloads/site papillon rose/public/images")
const PROD_DIR = path.join(DST, "prod")
if (!fs.existsSync(PROD_DIR)) fs.mkdirSync(PROD_DIR, { recursive: true })

const SIZE = 800
const BG = { r: 0xf5, g: 0xef, b: 0xe8 }

async function processFile(file) {
  const name = file.replace(/\.png$/i, "")
  const isVariant = /\(\d+\)$/.test(name)

  let outputName
  if (isVariant) {
    const base = name.replace(/\s*\(\d+\)$/, "")
    const suffix = name.match(/\((\d+)\)$/)[1]
    outputName = `${base}_${suffix}.webp`
  } else {
    outputName = `${name}.webp`
  }

  const outPath = isVariant ? path.join(PROD_DIR, outputName) : path.join(DST, outputName)
  const srcPath = path.join(SRC, file)

  try {
    const meta = await sharp(srcPath).metadata()
    const w = meta.width
    const h = meta.height

    let pipeline = sharp(srcPath)

    if (w !== h) {
      const size = Math.max(w, h)
      pipeline = pipeline.resize(SIZE, SIZE, {
        fit: "contain",
        background: BG,
        withoutEnlargement: false,
      })
    } else {
      pipeline = pipeline.resize(SIZE, SIZE, { fit: "cover" })
    }

    await pipeline.webp({ quality: 85, effort: 6 }).toFile(outPath)

    const outSize = fs.statSync(outPath).size
    console.log(`✓ ${file.padEnd(30)} → ${(outSize / 1024).toFixed(1)} KB`)
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`)
  }
}

async function main() {
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".png") && !f.startsWith("ChatGPT"))
  console.log(`Processing ${files.length} files...\n`)

  for (const f of files) {
    await processFile(f)
  }

  console.log("\nDone!")
}

main()
