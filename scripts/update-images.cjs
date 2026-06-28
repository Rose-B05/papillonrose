const fs = require("fs")
const path = require("path")

const SRC = "C:/Users/Utilisateur/Downloads/site papillon rose/src/data/produits.ts"
const IMG_DIR = "C:/Users/Utilisateur/Downloads/site papillon rose/public/images"
const PROD_DIR = path.join(IMG_DIR, "prod")

// Collect all available images
const mainImages = new Map() // "PROD001" → true
const variantImages = new Map() // "PROD030" → ["_2.webp", "_3.webp"]

fs.readdirSync(IMG_DIR)
  .filter((f) => f.endsWith(".webp"))
  .forEach((f) => {
    const base = f.replace(/\.webp$/, "")
    if (base.includes("_")) {
      const [prod] = base.split("_")
      if (!variantImages.has(prod)) variantImages.set(prod, [])
      variantImages.get(prod).push(f)
    } else {
      mainImages.set(base, true)
    }
  })

if (fs.existsSync(PROD_DIR)) {
  fs.readdirSync(PROD_DIR)
    .filter((f) => f.endsWith(".webp"))
    .forEach((f) => {
      const base = f.replace(/\.webp$/, "")
      if (base.includes("_")) {
        const [prod] = base.split("_")
        if (!variantImages.has(prod)) variantImages.set(prod, [])
        variantImages.get(prod).push(f)
      } else {
        mainImages.set(base, true)
      }
    })
}

// paddy numeric IDs
function padId(id) {
  // IDs 1-9 → "PROD001", 10-99 → "PROD010", 100+ → "PROD100"
  return `PROD${String(id).padStart(3, "0")}`
}

function padIdShort(id) {
  return `PROD${id}` // for matching PROD1, PROD39, etc
}

const lines = fs.readFileSync(SRC, "utf-8").split("\n")
const out = []
let changed = 0

// State machine
let inProduct = false
let braceDepth = 0
let currentId = null
let currentImageLine = -1
let currentLines = []
let hasGallerie = false

function flushProduct() {
  if (!currentId) {
    out.push(...currentLines)
    currentLines = []
    return
  }

  const prodName = padId(currentId)
  const prodShort = padIdShort(currentId)
  const hasMain = mainImages.has(prodName) || mainImages.has(prodShort)
  const hasVariants = variantImages.has(prodName) || variantImages.has(prodShort)

  // Check each line
  const processedLines = []
  let imageReplaced = false

  for (let i = 0; i < currentLines.length; i++) {
    let line = currentLines[i]

    // Update image field if we have a new photo
    if (/^\s+image:/.test(line)) {
      if (hasMain) {
        line = line.replace(
          /image:\s*"[^"]*"/,
          `image: "/images/${prodName}.webp"`
        )
        imageReplaced = true
      }
    }

    // Remove existing gallerie if present (we'll re-add)
    if (/^\s+gallerie:/.test(line)) {
      hasGallerie = false
      continue // skip existing gallerie
    }

    processedLines.push(line)
  }

  // Add gallerie after image line if variants exist
  if (hasVariants) {
    const varKey = variantImages.has(prodName) ? prodName : prodShort
    const galleryImages = variantImages
      .get(varKey)
      .map((f) => `"/images/prod/${f}"`)
    // Find the 'image:' line and insert gallerie after it
    const imgIdx = processedLines.findIndex((l) => /^\s+image:/.test(l))
    if (imgIdx >= 0) {
      processedLines.splice(
        imgIdx + 1,
        0,
        `    gallerie: [${galleryImages.join(", ")}],`
      )
      console.log(`  + gallerie for ${prodName}: ${galleryImages.length} images`)
    }
  }

  out.push(...processedLines)

  if (imageReplaced) {
    const line = processedLines.find((l) => l.includes("nom:"))
    const nom = line ? line.replace(/.*nom:\s*"([^"]+)".*/, "$1") : "?"
    console.log(`  ✓ PROD${currentId} (${nom})`)
    changed++
  }
}

for (const line of lines) {
  // Detect start of product block: { with nom or id property before it
  if (/^\s+\{/.test(line) && !inProduct) {
    braceDepth = 1
    inProduct = true
    currentId = null
    currentLines = [line]
    continue
  }

  if (inProduct) {
    currentLines.push(line)

    // Track brace depth
    if (/\{/.test(line)) braceDepth++
    if (/\}/.test(line)) braceDepth--

    // Extract id
    if (/^\s+id:\s*(\d+)/.test(line)) {
      currentId = parseInt(line.match(/^\s+id:\s*(\d+)/)[1])
    }

    // End of product block
    if (braceDepth <= 0 && /},?\s*$/.test(line)) {
      // Check if there's an export or array closing after
      flushProduct()
      inProduct = false
      currentLines = []
      currentId = null
    }
    continue
  }

  out.push(line)
}

// Flush any remaining
if (inProduct) {
  flushProduct()
}

fs.writeFileSync(SRC, out.join("\n"), "utf-8")
console.log(`\nUpdated ${changed} products`)
