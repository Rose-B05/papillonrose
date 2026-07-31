import sharp from "sharp"

const pairs = [
  { name: "PROD050", comp: "public/images/PROD050.png", orig: ".images-backup/PROD050.png" },
  { name: "PROD041", comp: "public/images/PROD041.png", orig: ".images-backup/PROD041.png" },
  { name: "femme-papillon-rose", comp: "public/images/femme-papillon-rose.png", orig: ".images-backup/femme-papillon-rose.png" },
  { name: "ChatGPT Image 28 juin", comp: "public/images/ChatGPT Image 28 juin 2026, 21_33_23.png", orig: ".images-backup/ChatGPT Image 28 juin 2026, 21_33_23.png" },
]

const W = 350, H = 350, PAD = 10, LABEL_H = 25
const COLS = 2
const ROWS = Math.ceil(pairs.length / COLS)
const IMG_W = COLS * (W * 2 + PAD * 3) + PAD
const IMG_H = ROWS * (LABEL_H + H + PAD) + PAD

async function main() {
  const canvas = sharp({
    create: { width: IMG_W, height: IMG_H, channels: 3, background: { r: 245, g: 245, b: 245 } }
  })

  const composites = []

  for (let i = 0; i < pairs.length; i++) {
    const p = pairs[i]
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = PAD + col * (W * 2 + PAD * 3)
    const y = PAD + row * (LABEL_H + H + PAD)

    const origBuf = await sharp(p.orig)
      .resize(W, H, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
      .removeAlpha().ensureAlpha().toColorspace("srgb").raw().toBuffer()

    const compBuf = await sharp(p.comp)
      .resize(W, H, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
      .removeAlpha().ensureAlpha().toColorspace("srgb").raw().toBuffer()

    const origLabel = Buffer.from(`<svg width="${W}" height="${LABEL_H}"><rect width="${W}" height="${LABEL_H}" fill="#2d2d2d"/><text x="${W/2}" y="${17}" text-anchor="middle" fill="#aaa" font-size="12" font-family="monospace">ORIGINAL</text></svg>`)
    const compLabel = Buffer.from(`<svg width="${W}" height="${LABEL_H}"><rect width="${W}" height="${LABEL_H}" fill="#2d2d2d"/><text x="${W/2}" y="${17}" text-anchor="middle" fill="#4ade80" font-size="12" font-family="monospace">COMPRESSÉ</text></svg>`)

    const origImg = await sharp(origBuf, { raw: { width: W, height: H, channels: 4 } })
      .composite([{ input: origLabel, top: 0, left: 0 }]).toFormat("png").toBuffer()
    const compImg = await sharp(compBuf, { raw: { width: W, height: H, channels: 4 } })
      .composite([{ input: compLabel, top: 0, left: 0 }]).toFormat("png").toBuffer()

    const nameLabel = Buffer.from(`<svg width="${W*2+PAD}" height="${LABEL_H}"><text x="0" y="17" fill="#333" font-size="13" font-family="monospace" font-weight="bold">${p.name}</text></svg>`)

    composites.push({ input: nameLabel, top: y, left: x })
    composites.push({ input: origImg, top: y + LABEL_H, left: x })
    composites.push({ input: compImg, top: y + LABEL_H, left: x + W + PAD })
  }

  await canvas.composite(composites).png().toFile("scripts/visual-comparison-2.png")
  console.log("Montage 2 sauvegardé: scripts/visual-comparison-2.png")
}

main().catch(console.error)
